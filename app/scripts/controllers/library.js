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
    var dbInfo = MonomerLibraryService.getCategorizedDB();
    
    var self = this;

    // 
    var mGroupOptListBuilder = function(list, parent){
      //
      for (monomer in parent.MonomerGroup()){
        var option = "<option value=\"" + monomer._name() + "\">" + monomer._name() + "\n";
        list.push(option);
      }
      return list;
    };
    var getPolymers = function(){
      var polymerOptionList = function(){
        var list=["Make a selection:\n",
                  "<select ng-model=\"polymerSelection\">\n"];

        for (pol in dbInfo){
          //
          var option = "<option value=\"" + pol._name() + "\">" + pol._name() + "\n";
          list.push(option);
        }
        list.push("</select>\n");
        return list;
      };
      return polymerOptionList;
    };

    var getChems = function(){
      var list[] =["Select a Chem:\n",
                   "<select ng-model=\"chemSelection\">\n"];
      for (pol in dbInfo.Polymer){
        if (pol._name().matches("CHEM")){
          list = mGroupOptListBuilder(list, pol);
          list.push("</select>\n");
          return list;
        }
      }
    };

    var getPeptides = function(){
      var list[] = ["Select a Peptide Group:\n",
                    "<select ng-model=\"peptideSelection\">\n"];
      for (pol in dbInfo.Polymer){
        if (pol._name().matches("PEPTIDE")){
          list = mGroupOptListBuilder(list, pol);
          list.push("</select>\n");
          return list;
        }
      }
    };

    var getRNAs = function(){
      var list[] = ["Select an RNA Group:\n",
                    "<select ng-model=\"rnaSelection\">\n"];
      for (pol in dbInfo.Polymer){
        if (pol._name().matches("RNA")){
          list = mGroupOptListBuilder(list, pol);
          list.push("</select>\n");
          return list;
        }
      }
    };

    self.getPolymers = getPolymers;
    self.getRNAs = getRNAs;
    self.getPeptides = getPeptides;
    self.getChems = getChems;
  });