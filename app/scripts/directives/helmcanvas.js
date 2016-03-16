'use strict';

/**
 * @ngdoc directive
 * @name helmeditor2App.directive:helmCanvas
 * @description
 * # helmCanvas
 */
angular.module('helmeditor2App')
  .directive('helmCanvas', function () {
    return {
      restrict: 'E',
       templateUrl: "templates/helmcanvas_template.html",
       replace: true,
       scope: {
         chart: "=chart",
       },
    };
  });
