'use strict';

/**
 * @ngdoc directive
 * @name helmeditor2App.directive:monomer
 * @description
 * # monomer
 */
angular.module('helmeditor2App')
  .directive('monomer', function () {
    return {
      templateUrl: 'templates/monomer.html',
      restrict: 'E',
      replace: true,
      scope: {
        monomer: '=',
        library: '='
      }
    };
  });
