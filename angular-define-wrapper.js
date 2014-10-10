(function (angular, window) {
  'use strict';

  var globals = angular.module('globals', []),
      registered = {jquery: window.jQuery},
      lodashString = "function () {\n      return _;\n    }";
      define = window.define = function define(name, dependencies, value) {
        var resolvedDependencies = [],
            i,
            dependency,
            defined,
            resolved;
        if (name instanceof Array) {
          value = dependencies;
          dependencies = name;
          name = undefined;
        } else if (typeof name === 'function') {
          value = name;
          name = value.toString() === lodashString ? '_' : undefined;
          dependencies = [];
        }

        if (dependencies instanceof Array) {
            for (i = 0; i < dependencies.length; i++) {
            dependency = dependencies[i];
            if (dependency in registered) {
              resolvedDependencies.push(registered[dependency]);
            } else if (dependency in window) {
              resolvedDependencies.push(window[dependency]);
            }
          }
        } else {
          value = dependencies;
          dependencies = [];
        }
        resolvedDependencies.push(undefined, undefined, {config: function config() {
          return {
            noGlobal: true
          };
        }});
        defined = value.apply(value, resolvedDependencies);

        if (name) {
          registered[name] = defined;
          globals.factory(name, function() {return defined});
        }
        if (name === 'jquery') {
          window.jQuery = window.$ = defined;
        }


      };

  define.amd = {};

  define.type = 'Angular Wrapper';

}(angular, window));
