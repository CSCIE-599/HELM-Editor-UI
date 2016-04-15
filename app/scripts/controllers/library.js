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
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    // the entire database
    var categorizedDBInfo = MonomerLibraryService.getCategorizedDB();
    var encodedDBInfo = MonomerLibraryService.getEncodedDB();
    
    var self = this;
    

    // used by the list getters
    var groupOptListBuilder = function(list, parent){
      var options = list;
      for(var i = 0; i < parent.MonomerGroup.length; i++){
        options += "<option value=\"" + parent.MonomerGroup[i]._name + 
                   "\">" + parent.MonomerGroup[i]._name + "\n";
      }
      return options;
    };

    // Grabs a Select List for the 3 polymer groups in the database
    // Will be used as the basic entry into querying the database.
    var getPolymerSelectList = function(){
      var list = "Make a selection:\n" + "<select ng-model=\"polymer\">\n";
      var polymers = categorizedDBInfo.Polymer;
      for (var i = 0; i < polymers.length; i++){
        list += "<option value=\"" + polymers[i]._name + "\">" + 
                polymers[i]._name + "\n";
      }
      list += "</select>\n";
      return list;
    };
    // Carries out the selection of the polymer group, displaying the select 
    // list for the monomer groups
    var getPolymerSelection = function(polymerId){
      var list = "Select a " + polymerId + ":\n" +
                 "<select ng-model=\"polymerSelection\">\n";

      var getter = MonomerLibraryService.getPolymer(polymerId);
      if(!getter.returnSuccess){
        return "";
      }
      var polymer = getter.result;
      list = groupOptListBuilder(list, polymer);
      list += "</select>\n";
      return list;
    };
    // XXX Need to figure out how to incorporate into the view.
    // Option values may need to adjusted for data to be pulled in properly
    // This function takes in values from the form and provides strings to 
    // display in the view. 
    var selectedInfo = function(polymerId,groupId){
      var getter = MonomerLibraryService.getMonomerGroup(polymerId,groupId);
      if(!getter.returnSuccess){
        return "";
      }
      var group = getter.result;
      var optionList = "";
      if(group.MonomerGroup != undefined){
        //
        optionList = ["Select a group:\n",
                      "<select ng-model=\""+group._name+"\">\n"];
        optionList = groupOptListBuilder(optionList, group);
        optionList.push("</select>\n");
      }

      var nameList = "";
      if(group.Monomer != undefined){
        for(var i = 0; i < group.Monomer.length; i++){
          nameList += "<p>"+group.Monomer[i]._name+"</p>\n";
        }
      }
      
      var result = { optionList: optionList, nameList: nameList };
      return result;
    };

    self.getPolymerSelectList = getPolymerSelectList;
    self.getPolymerSelection = getPolymerSelection;
    self.selectedInfo = selectedInfo;
  }]);
