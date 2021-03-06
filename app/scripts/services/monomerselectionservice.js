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

    // toggles the current selected monomer to be what was clicked
    self.toggleSelectedMonomer = function (monomer, evt) {
      // un-select if it was previously selected
      if (self.currentMonomer === monomer) {
        self.currentMonomer = {};
      }
      else {
        self.currentMonomer = monomer;
      }
      if(evt){
        evt.stopPropagation();
      }
    };

    // sets the current selected monomer to be what was clicked
    self.setSelectedMonomer = function (monomer, evt) {
      self.currentMonomer = monomer;
      evt.stopPropagation();
    };

    // retrieves the current selected monomer
    self.getSelectedMonomer = function () {
      return self.currentMonomer;
    };

    // clears the current selected monomer
    self.clearSelectedMonomer = function () {
      self.currentMonomer = {};
    };
  });
