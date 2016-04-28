'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.MonomerSelectionService
 * @description
 * # MonomerSelectionService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('MonomerSelectionService', function () {
    var self = this;

    // Methods used by the monomer library to add/drag elements to the 
    self.currentMonomer = {};

    // sets the current selected monomer to be what was clicked
    self.toggleSelectedMonomer = function (monomer, evt) {
      // un-select if it was previously selected
      if (self.currentMonomer._name === monomer._name) {
        self.currentMonomer = {};
      }
      else {
        self.currentMonomer = monomer;
      }
      evt.stopPropagation();
    };

    // retrieves the current selected monomer
    self.getSelectedMonomer = function () {
      return self.currentMonomer;
    };
  });
