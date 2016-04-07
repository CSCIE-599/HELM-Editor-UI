'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:LibraryCtrl
 * @description
 * # LibraryCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('LibraryCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    // the entire database
    var categorizedDBInfo = MonomerLibraryService.getCategorizedDB();
    var encodedDBInfo = MonomerLibraryService.getEncodedDB();
    
    var self = this;
    // getPolymer, getMonomerGroup, and getMonomer all return
    // an object with a boolean returnSuccess property and optional
    // result property representing a type from the categorized database
    var getPolymer = function(id){
      for(pol in categorizedDBInfo.Polymer()){
        if (pol._name().matches(id)){
          var output = { returnSuccess: true, result: pol };
          return output;
        }
      }
      var output = { returnSuccess: false };
      return output;
    };
    // The monomer group must handle the case where a monomer group exists 
    // within another monomer group. In order to do so, the group info is 
    // pulled from the form such that sub-groups are appeneded to the group
    // as comma separated values of the form <group>,<sub-group>
    var getMonomerGroup = function(polymerId, id){
      var pGetter = getPolymer(polymerId);
      var idList = id.split(",");
      var parent, i=0;
      var output = { returnSuccess: false };
      if(!pGetter.returnSuccess()){
        return output;
      }
      var parent = pGetter.result();
      while(i < idList.length){
        output.returnSuccess = false;
        for(group in parent.MonomerGroup()){
          if(group._name().matches(idList[i])){
            i++;
            output = { returnSuccess: true, result: group };
            break;
          }
        }
        if(!output.returnSuccess()) { return output; }
        if( i < idList.length) { parent = output.result(); }
      }
      return output;
    };

    var getMonomer = function(polymerId, groupId, name){
      var groupGetter = getMonomerGroup(polymerId, groupId);
      var output = { returnSuccess: false };
      if(!groupGetter.returnSuccess()){
        return output;
      }
      var group = groupGetter.result();
      for(monomer in group.Monomer()){
        if(monomer._name().matches(name)){
          output = { returnSuccess: true, result: monomer };
          return output;
        }
      }
      return output;
    };

    // used by the list getters
    var groupOptListBuilder = function(list, parent){
      var options = list;
      for (monomer in parent.MonomerGroup()){
        options += "<option value=\"" + monomer._name() + "\">" + monomer._name() + "\n";
      }
      return options;
    };

    // Grabs a Select List for the 3 polymer groups in the database
    // Will be used as the basic entry into querying the database.
    var getPolymerSelectList = function(){
      var polymerOptionList = function(){
        var list = "Make a selection:\n" +
                   "<select ng-model=\"polymer\">\n";

        for (pol in categorizedDBInfo.Polymer()){
          list += "<option value=\"" + pol._name() + "\">" + pol._name() + "\n";
        }
        list += "</select>\n";
        return list;
      };
      return polymerOptionList;
    };
    // Carries out the selection of the polymer group, displaying the select 
    // list for the monomer groups
    var getPolymerSelection = function(polymer){
      var list = "Select a " + polymer + ":\n" +
                 "<select ng-model=\"polymerSelection\">\n";

      var getter = getPolymer(polymer);
      if(!getter.returnSuccess()){
        return "";
      }
      for (pol in categorizedDBInfo.Polymer()){
        if (pol._name().matches(polymer)){
          list = groupOptListBuilder(list, pol);
          break;
        }
      }
      list += "</select>\n";
      return list;
    };
    // XXX Need to figure out how to incorporate into the view.
    // Option values may need to adjusted for data to be pulled in properly
    // This function takes in values from the form and provides strings to 
    // display in the view. 
    var selectedInfo = function(polymerId,groupId){
      var getter = getMonomerGroup(polymerId,groupId);
      if(!getter.returnSuccess()){
        return "";
      }

      var group = getter.result();
      var optionList = "";
      if(group.hasOwnProperty("MonomerGroup")){
        //
        optionList = ["Select a group:\n",
                      "<select ng-model=\""+group._name()+"\">\n"];
        optionList = groupOptListBuilder(optionList, group);
        optionList.push("</select>\n");
      }

      var nameList = "";
      if(group.hasOwnProperty("Monomer")){
        for(monomer in group.Monomer()){
          nameList += "<p>"+monomer._name()+"</p>\n";
        }
      }
      
      var result = { optionList: optionList, nameList: nameList };
      return result;
    };

    self.getCategorizedDB = categorizedDBInfo;
    self.getEncodedDB = encodedDBInfo;
    self.getPolymer = getPolymer;
    self.getPolymerSelectList = getPolymerSelectList;
    self.getPolymerSelection = getPolymerSelection;
    self.getMonomerGroup = getMonomerGroup;
    self.getMonomer = getMonomer;
    self.selectedInfo = selectedInfo;
  });