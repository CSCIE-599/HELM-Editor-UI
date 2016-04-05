'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('HeaderCtrl', function ($location) {
    this.isActive = function (viewLocation) {
    	return viewLocation === $location.path();
    };
  });
