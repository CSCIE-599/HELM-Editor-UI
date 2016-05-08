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
      templateUrl: function(elem, attr) {
        if (attr.canvastype === 'lower') {
          return 'templates/helmcanvaslower.html';
        }
        else {
          return 'templates/helmcanvas.html';
        }
      },
      replace: true,
      scope: {
         graph: '=graph'
      },
      controller: 'MainCtrl as main',
    };
  });
