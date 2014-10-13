angular-define-wrapper
======================

Automatically wraps global dependencies into an Angular injectable.
Works for most libraries that support requirejs.  

Allows you to inject third party libraries which would normally be globals
(and prevent most from declaring themselvess globally).

    angular
      .module('app')
      .directive(function myDirective($q, _, d3) {

        // Method works and will output:
        // 1
        // 2
        // 3
        _.each([1, 2, 3], function (val) {
          console.log(val);
        })
        return {
          restrict: EAC
          ...
        }
      });

    // Will throw error because _ is not defined
    _.each([1, 2, 3], function (val) {
      console.log(val);
    })


# Why
I loved require.js because it finally freed me of global variables in my js.
During my first Angular.js project, however, it became clear that:

 __Angular.js + require.js = more trouble than its worth__

I spent some time trying to come up with a solution that accomplished
a few goals:
* No editing of third party code.
* No extra boilerplate angular code for each new dependency
* Support for bower
* Avoid requiring extra build steps


# Usage
1.  Add scripts to your page in the following order:

  [jQuery, Angular, Angular Define Wrapper, ...]

  For example:

      <script src="jquery.js"></script>
      <script src="angular.js"></script>
      <script src="angular-global-injector.js"></script>
      <script src="lodash.js"></script>

2.  Inject your globals as you would any other angular injectable.

# Help and Support
If you encounter any bugs or compatibility issues with any third party library
please submit an issue or pull request.  I plan on maintaining this tool, but I'd
appreciate any community support I can get.
