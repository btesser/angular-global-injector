(function(angular, window) {
  'use strict';

  var globalsModule = angular.module('globals', []),
    // Local registry of dependencies
    registered = {},
    // String of the lodash method for matching
    // because lodash is defined anonymously
    LO_DASH_METHOD = 'function () {\n      return _;\n    }';

  /**
   * Utility method to create a getter function
   * @param {*} value Value the getter should return
   * @returns {Function} The created getter function
   */
  function createGetter(value) {
    return function() {
      return value;
    };
  }

  /**
   * Iterates through a string based array of dependencies to get their values
   * @param {Array.<String>} dependencies Dependency names as an array
   * @param {Object} registered Collection of registered dependencies
   * @param {Window} window Browser window object
   * @returns {Array.<*>} Array of the dependency values
   */
  function resolveDependencies(dependencies, registered, window) {
    var resolved = [],
      depLength = dependencies.length,
      dependency,
      i = 0;

    for (; i < depLength; i += 1) {
      dependency = getDependency(dependencies[i], registered, window);

      if (dependency) {
        resolved.push(dependency);
      } else {
        throw new Error('Unable to find dependency');
      }
    }

    return resolved;
  }

  /**
   * Adds default requirejs parameters which some scripts look for (moment)
   * @param {Array.<*>} params Array of the resolved dependencies
   * @returns {Array.<*>} Passed in array with require parameters at end
   */
  function addRequireParameters(params) {
    var require = null,
      config = {
        config: createGetter({
          noGlobal: true
        })
      },
      exports = [],
      requireParams = [
        require,
        exports,
        config
      ];

    Array.prototype.push.apply(params, requireParams);

    return params;
  }

  /**
   * Parses arguments passed to the define method.  Necessary to handle the
   * complexities of having multiple optional values
   * @param {String|Array|Function} name Can also be dependencies or method
   * @param {Array|Function} [dependencies] Dependencies or Getter method
   * @param {Function} [value] Getter method for the dependency
   * @returns {{name: String, dependencies: Array|null, value: Function}}
   */
  function parseArgs(name, dependencies, value) {
    if (name instanceof Array) {
      value = dependencies;
      dependencies = name;
      name = undefined;
    } else if (typeof name === 'function') {
      // Super hacky check for lodash since it is using an anonymous define
      value = name;
      name = value.toString() === LO_DASH_METHOD ? '_' : undefined;
      dependencies = [];
    } else if (typeof name === 'object' && name.lab.name === 'd3_lab') {
      // Super hacky check for d3 since it is using an anonymous define
      value = createGetter(name);
      name = 'd3';
      dependencies = [];
    } else {
      value = dependencies;
      dependencies = [];
    }

    return {
      name: name,
      dependencies: dependencies,
      value: value
    };
  }

  /**
   * Attempts to locate a single dependency in the registry and on window
   * @param {String} dependency dependency name
   * @param {Object} registered Currently registered dependencies
   * @param {Window} window Browser window
   */
  function getDependency(dependency, registered, window) {
    return (dependency in registered ? registered : window)[dependency];
  }

  /**
   * Adds the dependency to registry and angular
   * @param  {String} name Dependency name
   * @param  {*} value Dependency value
   */
  function createWrappedDependency(name, value) {
    // If it is not an anonymous define
    if (name) {
      // Add dependency to angular global injector registry
      registered[name] = value;
      // Create angular injectable of dependency
      globalsModule.factory(name, createGetter(value));
    }
  }

  /**
   * Impersonates requirejs's define method to create an angular factory
   * for dependencies that support require so they don't become global variables
   * @param  {String|Array|Function} [name] Name of dependency or see below
   * @param  {Array.<String>|Function} dependencies Dependencies or see below
   * @param  {Function} value Getter function for dependency being defined
   */
  function define(name, dependencies, value) {
    var resolved = [],
      parsed = parseArgs(name, dependencies, value),
      defined;

    resolved = addRequireParameters(
      resolveDependencies(parsed.dependencies, registered, window)
    );

    // Run dependency getter method passing in the dependencies
    defined = parsed.value.apply(parsed.value, resolved);
    createWrappedDependency(parsed.name, defined);
    
    // Allow globals to be forcefully removed
    if (define.forceRemoveGlobals) {
      delete window[parsed.name];
      Object.defineProperty(window, parsed.name, {
        writable: false
      });
    }
  }

  // Amd is looked for by some scripts
  define.amd = {};

  define.type = 'Angular Global Injector';
  define.version = '0.0.2';
  define.forceRemoveGlobals = false;
  window.define = define;

  // As jQuery must be included before angular we add it to the registry
  // automatically
  if (window.jQuery) {
    createWrappedDependency('jquery', window.jQuery);
  }

}(angular, window));
