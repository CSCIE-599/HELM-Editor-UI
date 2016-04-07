'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('HabeCtrl', function () {
    var self = this;

    self.title = 'HELM Antibody Editor';
    self.description = 'This editor is currently under development, sorry!';
  });
