'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:LibraryCtrl
 * @description
 * # LibraryCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('LibraryCtrl', ['MonomerLibraryService', function (MonomerLibraryService) {
    
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

    // search for the monomers as needed
    var searchMonomers = function () {
      if (!MonomerLibraryService.initComplete) {
        return [];
      }
      return MonomerLibraryService.searchMonomers(self.activeType, self.search);
    };

    // list the monomers by the selection
    var listMonomers = function () {
      return [];
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

    // retrieve the current active type
    var getActiveType = function () {
      return MonomerLibraryService.getMonomersByType(self.activeType);
    };

    // get the categories of the current group selected
    var getCategories = function (group) {
      return group.categories || [];
    };

    // get the monomers of the current group selected
    var getMonomers = function (group) {
      return group.monomers || [];
    };

    // return true if the given name is the active category
    var categoryActive = function (name) {
      return name === self.activeCategory;
    };

    // return true if the given name is the active sub category
    var subCategoryActive = function (name) {
      return name === self.activeSubCategory;
    };

    // expose the methods we want to 
    self.setViewVisible = setViewVisible;
    self.searchMonomers = searchMonomers;
    self.listMonomers = listMonomers;
    self.convertBackgroundColorClass = convertBackgroundColorClass;
    self.convertFontColorClass = convertFontColorClass;
    self.convertShapeClass = convertShapeClass;
    self.getActiveType = getActiveType;
    self.getMonomers = getMonomers;
    self.getCategories = getCategories;
    self.categoryActive = categoryActive;
    self.subCategoryActive = subCategoryActive;

    // // used by the list getters
    // var groupOptListBuilder = function(list, parent){
    //   var options = list;
    //   for(var i = 0; i < parent.MonomerGroup.length; i++){
    //     options += '<option value="' + parent.MonomerGroup[i]._name + 
    //                '">' + parent.MonomerGroup[i]._name + '\n';
    //   }
    //   return options;
    // };

    // // Grabs a Select List for the 3 polymer groups in the database
    // // Will be used as the basic entry into querying the database.
    // var getPolymerSelectList = function(){
    //   var list = 'Make a selection:\n' + '<select ng-model="polymer">\n';
    //   var polymers = MonomerLibraryService.getPolymers;
    //   for (var i = 0; i < polymers.length; i++){
    //     list += '<option value="' + polymers[i]._name + '">' + 
    //             polymers[i]._name + '\n';
    //   }
    //   list += '</select>\n';
    //   return list;
    // };

    // // Carries out the selection of the polymer group, displaying the select 
    // // list for the monomer groups
    // var getPolymerSelection = function(polymerId){
    //   var list = 'Select a ' + polymerId + ':\n' +
    //              '<select needg-model="polymerSelection">\n';

    //   var getter = MonomerLibraryService.getPolymer(polymerId);
    //   if(!getter.returnSuccess){
    //     return '';
    //   }
    //   var polymer = getter.result;
    //   list = groupOptListBuilder(list, polymer);
    //   list += '</select>\n';
    //   return list;
    // };

    // // XXX Need to figure out how to incorporate into the view.
    // // Option values may need to adjusted for data to be pulled in properly
    // // This function takes in values from the form and provides strings to 
    // // display in the view. 
    // var selectedInfo = function(polymerId,groupId){
    //   var getter = MonomerLibraryService.getMonomerGroup(polymerId,groupId);
    //   if(!getter.returnSuccess){
    //     return '';
    //   }
    //   var group = getter.result;
    //   var optionList = '';
    //   if(group.MonomerGroup !== undefined){
    //     //
    //     optionList = ['Select a group:\n',
    //                   '<select ng-model="'+group._name+'">\n'];
    //     optionList = groupOptListBuilder(optionList, group);
    //     optionList.push('</select>\n');
    //   }

    //   var nameList = '';
    //   if(group.Monomer !== undefined){
    //     for(var i = 0; i < group.Monomer.length; i++){
    //       nameList += '<p>'+group.Monomer[i]._name+'</p>\n';
    //     }
    //   }
      
    //   var result = { optionList: optionList, nameList: nameList };
    //   return result;
    // };

    // var getSearchBoxResult = function () {
    //   var polymer = $scope.search.polymer;
    //   var monomer = $scope.search.monomer;
    //   if(polymer === null || polymer.trim() === '' || monomer === null || monomer.trim() === ''){
    //     $scope.search.showResult = false;
    //     return ('');
    //   }
    //   var result = MonomerLibraryService.getEncodedById(polymer, monomer);
    //   if(result === null){
    //     $scope.search.showResult = false;
    //     return ('');
    //   }
    //   $scope.search.showResult = true;
    //   return ('name: ' + result.MonomerID + ' smiles: ' + result.MonomerSmiles);
    // };

    // self.getPolymerSelectList = getPolymerSelectList;
    // self.getPolymerSelection = getPolymerSelection;
    // self.selectedInfo = selectedInfo;
    // self.getSearchBoxResult = getSearchBoxResult;
    // self.logDB = logDB;

    // self.sanityCheck = function(){
    //   var result = MonomerLibraryService.sanityCheck();
    //   return result;
    // };

    // self.showCategorized = function(){
    //   var result = MonomerLibraryService.getCategorizedDB();
    //   if (result === {}){
    //     result = 'blank';
    //   }
    //   return result;
    // };

  }]);
