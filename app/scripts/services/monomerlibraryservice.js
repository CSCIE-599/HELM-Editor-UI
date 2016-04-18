'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.MonomerLibraryService
 * @description
 * # MonomerLibraryService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App.MonomerLibrary', ['cb.x2js'])
  .service('MonomerLibraryService', ['$http', 'x2js', function ($http, x2js) {
    // AngularJS will instantiate a singleton by calling 'new' on this function
    
    var self = this;
    // var init = false;

    // Hierarchy of monomer types, retrievable through the monomer library. See
    // milestone 1 documentation for reference
    var categorizedDB;
    $http.get('DefaultMonomerCategorizationTemplate.xml', {
      transformResponse: function (info) {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        return (x2js.xml_str2json(info));
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
    }).then(function (response) {
      categorizedDB = response.data;
    });

    var encodedDB;
    $http.get('MonomerDBGZEncoded.xml', {
      transformResponse: function (info) {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        return x2js.xml_str2json(info);
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
    }).then(function (response) {
      encodedDB = response.data;
    });

    // return the default encoded database
    var getEncodedDB = function () {
      return encodedDB;
    };

    // return the default categorization database
    var getCategorizedDB = function () {
      return categorizedDB;
    };

    // for each monomer in the parent group, it finds the corresponding monomer 
    // from the encoded database and adds the info there to the categorized 
    // database in order to help create one full database.
//    function dbLinker(parent, polymerId) {
//      var j;
//      if(parent.Monomer !== undefined){
//        var monomerList = parent.Monomer;
//        for(j = 0; j < monomerList.length; j++){
//          var encodedMonomer = getEncodedMonomer(monomerList[j]._name, polymerId);
//          if(encodedMonomer === null){
//            continue;
//          }
          /*
          for(var prop in encodedMonomer){
            monomerList[j].[prop] = encodedMonomer[prop];
          }
          */
//          monomerList[j].encodedInfo = encodedMonomer;
//          encodedMonomer.categorizedInfo = monomerList[j].encodedInfo;
//        }
//      }
//      if(parent.MonomerGroup !== undefined){
//        for(j = 0; j < parent.MonomerGroup.length; j++){
//          dbLinker(parent.MonomerGroup[j], polymerId);
//        }
//      }
//    }

//    function initLink(){
//      // 
//      var polymerList = categorizedDB.Template.Polymer;
//      for(var i = 0; i < polymerList.length; i++){
//        //
//        var polymerId = polymerList[i]._name;
//        for(var j = 0; j < polymerList[i].MonomerGroup.length; j++){
//          dbLinker(polymerList[i].MonomerGroup[j], polymerId);
//        }
//      }
//    }
    // searches the encoded database and returns a monomer matching the polymer 
    // type and monomer id
    function getEncodedById(polymerId, monomerId) {
      var output = '';
      var polymerList = encodedDB.MONOMER_DB.PolymerList.Polymer;
      for(var i=0; i < polymerList.length; i++){
        if(polymerList[i]._polymerType.toUpperCase().
            match(polymerId.toUpperCase())){
          var monomerList = polymerList[i].Monomer;
          for(var j=0; j < monomerList.length; j++){
            if(monomerList[j].MonomerID.toUpperCase().
                match(monomerId.toUpperCase())){
              output = monomerList[j];
              break;
            }
          }
          break;
        }
      }
      return output;
    }
/*
    // getPolymer, getMonomerGroup, and getMonomer all return
    // an object with a boolean returnSuccess property and optional
    // result property representing a type from the categorized database
    function getPolymer(id) {
      var list = categorizedDB.Template.Polymer;
      var output; 
      for(var i = 0; i < list.length; i++){
        if(list[i]._name.match(id)){
          output = { returnSuccess: true, result: list[i] };
          return output;
        }
      }
      output = { returnSuccess: false };
      return output;
    }
    // The monomer group must handle the case where a monomer group exists 
    // within another monomer group. In order to do so, the group info is 
    // pulled from the form such that sub-groups are appeneded to the group
    // as comma separated values of the form <group>,<sub-group>
    function getMonomerGroup(polymerId, id) {
      var pGetter = getPolymer(polymerId);
      var idList = id.split(',');
      var parent, i=0;
      var output = { returnSuccess: false };
      if(!pGetter.returnSuccess){
        return output;
      }
      parent = pGetter.result();
      while (i < idList.length) {
        output.returnSuccess = false;
        for (var group in parent.MonomerGroup) {
          if (group._name.match(idList[i])) {
            i++;
            output = { returnSuccess: true, result: group };
            break;
          }
        }
        if (!output.returnSuccess()) { return output; }
        if ( i < idList.length) { parent = output.result; }
      }
      return output;
    }
// /*
//     var infoGrabber = function(nameList){
//       //
//       var i, j;
//       var currentName = nameList[0];
//       var polymerList = encodedDB.MONOMER_DB.PolymerList.Polymer;
//       for(i=0; i < polymerList.length; i++){
//         if(polymerList[i]._polymerType.match(currentName)){
//           while(nameList.length > 1){
//             nameList.shift();
//             var monomerList = polymerList[i].Monomer;
//             for(j=0; j < monomerList.length; j++){
//               if(monomerList[i].MonomerID.match(nameList[]))
//             }
//           }
//         }
//       }
//     };
// */
/*    function getCategorizedMonomer(polymerId, groupId, name) {
      var groupGetter = getMonomerGroup(polymerId, groupId);
      var output = { returnSuccess: false };
      if(!groupGetter.returnSuccess){
        return output;
      }
      var group = groupGetter.result;
      for (var monomer in group.Monomer) {
        if (monomer._name.match(name)) {
          output = { returnSuccess: true, result: monomer };
          return output;
        }
      }
      return output;
    }

    // getPolymers - returns the list of polymers
    var getPolymers = function () {
      return categorizedDB.Polymer;
    };

    // returns the full categorized DB
//    var getCategorizedDB = function () {
//      if (!init) {
//        initLink();
//      }
//      return categorizedDB.Template;
//    };
     // returns the entire encoded db
//    var getEncodedDB = function(){
//      if (!init) {
//        initLink();
//      }
//      return encodedDB.MONOMER_DB;
//    };
*/
    self.getEncodedById = getEncodedById;
    self.getCategorizedDB = getCategorizedDB;
    self.getEncodedDB = getEncodedDB;
//     self.getPolymers = getPolymers;
//     self.getCategorizedMonomer = getCategorizedMonomer;
    self.sanityCheck = function () {
      return '5';
    };

  }]);
