'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:LibraryCtrl
 * @description
 * # LibraryCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('LibraryCtrl', ['MonomerLibraryService', 'MonomerSelectionService',   
    function (MonomerLibraryService, MonomerSelectionService) {
      
      var self = this;
      // the serach box
      self.search = '';
      self.results = [];

      // the array of the polymer types in the database
      self.polymerTypes = MonomerLibraryService.polymerTypes;
      self.activeType = 'RNA';
      self.activeCategory = ''; // the top level category under type
      self.activeSubCategory = ''; // the lower-level category, if it exists

      // control which view is showing (search or exploring)
      self.searchViewVisible = true;
      self.exploreViewVisible = false;

      // expose the service directly so it can be used
      self.libraryService = MonomerLibraryService;

      // allow toggling
      var setViewVisible = function (view) {
        if (view === 'search') {
          self.searchViewVisible = true;
          self.exploreViewVisible = false;
        }
        else if (view === 'explore') {
          self.searchViewVisible = false;
          self.exploreViewVisible = true;
        }
      };

      // convert the class to the right class name for the background color
      var convertBackgroundColorClass = function (prop) {
        switch (prop) {
          case 'White':
            return 'monomer-background-color-white';
          case 'Light_Violet':
            return 'monomer-background-color-light-violet';
          case 'Green':
            return 'monomer-background-color-green';
          case 'Red':
            return 'monomer-background-color-red';
          case 'Orange':
            return 'monomer-background-color-orange';
          case 'Cyan':
            return 'monomer-background-color-cyan';
          case 'Light_Cyan':
            return 'monomer-background-color-light-cyan';
          case 'Purple':
            return 'monomer-background-color-purple';
          default:
            return 'monomer-background-color-white';
        }
      };

      // convert the class to the right class name for the color
      var convertFontColorClass = function (prop) {
        switch (prop) {
          case 'White':
            return 'monomer-font-color-white';
          case 'Green':
            return 'monomer-font-color-green';
          case 'Red':
            return 'monomer-font-color-red';
          case 'Orange':
            return 'monomer-font-color-orange';
          case 'Cyan':
            return 'monomer-font-color-cyan';
          case 'Black':
            return 'monomer-font-color-black';
          default:
            return 'monomer-font-color-black';
        }
      };

      // convert the class to the right class name for the shape
      var convertShapeClass = function (prop) {
        switch (prop) {
          case 'No':
            return 'monomer-shape-no';
          case 'Rectangle':
            return 'monomer-shape-rect';
          case 'Rhomb':
            return 'monomer-shape-rhomb';
          case 'Circle':
            return 'monomer-shape-circle';
          case 'Hexagon':
            return 'monomer-shape-hexagon';
        }
      };

      // search for the monomers as needed
      var searchMonomers = function () {
        if (!MonomerLibraryService.initComplete) {
          return [];
        }
        return MonomerLibraryService.searchMonomers(self.activeType, self.search);
      };

      // retrieve the current active type
      var getActiveType = function () {
        if (MonomerLibraryService.initComplete) {
          return MonomerLibraryService.getMonomersByType(self.activeType);
        }
      };

      // get the categories of the current group selected
      var getCategories = function (group) {
        if (group) {
          return group.categories || [];
        }
      };

      // get the monomers of the current group selected
      var getMonomers = function (group) {
        if (group) {
          return group.monomers || [];
        }
      };

      // return true if the given name is the active category
      var categoryActive = function (name) {
        return name === self.activeCategory;
      };

      // return true if the given name is the active sub category
      var subCategoryActive = function (name) {
        return name === self.activeSubCategory;
      };

      // handle when the user clicks on a monomer
      var monomerClicked = function (monomer, evt) {
        MonomerSelectionService.toggleSelectedMonomer(monomer, evt);
      };

      // retrieve the class appropriate to display if selected
      var monomerSelectedClass = function (monomer) {
        var currentMonomer = MonomerSelectionService.getSelectedMonomer();
        return (monomer._name === currentMonomer._name) ? 'monomer-selected' : '';
      };

      // expose the methods we want to 
      self.setViewVisible = setViewVisible;
      self.searchMonomers = searchMonomers;
      self.convertBackgroundColorClass = convertBackgroundColorClass;
      self.convertFontColorClass = convertFontColorClass;
      self.convertShapeClass = convertShapeClass;
      self.getActiveType = getActiveType;
      self.getMonomers = getMonomers;
      self.getCategories = getCategories;
      self.categoryActive = categoryActive;
      self.subCategoryActive = subCategoryActive;
      self.monomerClicked = monomerClicked;
      self.monomerSelectedClass = monomerSelectedClass;
  }]);
