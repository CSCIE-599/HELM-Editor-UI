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
       templateUrl: 'templates/helmcanvas.html',
       replace: true,
       scope: {
           graph: '=graph',
       },
    };
  });
