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
    self.initComplete = false;
    // the array of the polymer types in the database
    self.polymerTypes = [];

    // Hierarchy of monomer types, retrievable through the monomer library. See
    // milestone 1 documentation for reference
    var categorizedDB;
    var encodedDB;
    $http.get('MonomerDBGZEncoded.xml', {
      transformResponse: function (info) {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        return x2js.xml_str2json(info);
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
    }).then(function (response) {
      encodedDB = response.data;
      // now get the categorization
      $http.get('DefaultMonomerCategorizationTemplate.xml', {
        transformResponse: function (info) {
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          return (x2js.xml_str2json(info));
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        }
      }).then(function (response) {
        categorizedDB = response.data;

        // now link the two
        linkDatabases();
      });
    });

    // links the two databases together, adding categorization detail to encoded database
    // private helper function
    var linkDatabases = function () {
      // first go through and create the 'Other' listing in each type
      createOtherCategories();

      // now we need to go through the encoded database and add the data to the right place
      var encodedTypes = encodedDB.MONOMER_DB.PolymerList.Polymer;
      for (var i = 0; i < encodedTypes.length; i++) {
        var polymerType = encodedTypes[i];
        // remember the type to be used later
        var type = polymerType._polymerType;
        var categorizedPolymerGroup;
        for (var j = 0; j < categorizedDB.Template.Polymer.length; j++) {
          var categorizedPolymer = categorizedDB.Template.Polymer[j];
          if (categorizedPolymer._name.match(type)) {
            categorizedPolymerGroup = categorizedPolymer;
            break;
          }
        }

        // now go through all of the monomers in the encoded database and try to add them
        // to the categorized database
        var monomers = polymerType.Monomer;
        for (var k = 0; k < monomers.length; k++) {
          var monomer = monomers[k];
          // if it wasn't added, we know we need to add it to the "other" group
          if (!addMonomerToGroup(monomer, categorizedPolymerGroup)) {
            addMonomerToOther(monomer, categorizedPolymerGroup);
          }
        }
      }

      // create the list of polymer types
      for (var l = 0; l < categorizedDB.Template.Polymer.length; l++) {
        self.polymerTypes.push(categorizedDB.Template.Polymer[l]._name);
      }

      // signal complete
      self.initComplete = true;
    };

    // goes through the categorized database and adds the 'Other' category
    // private helper function
    var createOtherCategories = function () {
      // start at the top, and go through each category (RNA, PEPTIDE, CHEM)
      var categorizedPolymers = categorizedDB.Template.Polymer;
      for (var i = 0; i < categorizedPolymers.length; i++) {
        var polymerList = categorizedPolymers[i];

        // prepare the categorized list to have an "Other" in the lowest level of MonomerGroup
        var current = polymerList.MonomerGroup;
        while (!(current instanceof Array)) {
          current = current.MonomerGroup;
        }
        // add it
        current.push({
          Monomer: [],
          _name: 'Other',
          _shape: 'Rectangle'
        });
      }
    };

    // adds the given monomer to the correct location in the given group
    // private helper function
    var addMonomerToGroup = function (monomer, group) {
      // search for the ID in the given group
      return recursiveSearchAndAdd(monomer, group);
    };

    // recursively searches down properties and indices to find the bottom 
    // (an array of Monomer or Fragment objects)
    // returns true if the element was added
    var recursiveSearchAndAdd = function (monomer, group) {
      // base case - array of Monomers or Fragment objects
      if (group.Monomer instanceof Array || group.Fragment instanceof Array) {
        var list = group.Monomer || group.Fragment;
        // go through all elements in the array and see if the ID matches
        for (var i = 0; i < list.length; i++) {
          // console.log(monomer.MonomerID);
          // it was found, so add the details and return true
          if (list[i]._name.match(monomer.MonomerID)) {
            list[i].encodedMonomer = monomer;
            return true;
          }
          // otherwise just go on to the next
        }
      }
      // also need to handle the case where there's a single element, not an array
      if ((group.Monomer && group.Monomer._name) || (group.Fragment && group.Fragment._name)) {
        var el = group.Monomer || group.Fragment;
        if (el._name.match(monomer.MonomerID)) {
          el.encodedMonomer = monomer;
          return true;
        }
      }
      // if we have more groups underneath, we need to go deeper
      else if (group instanceof Array || group.FragmentGroup || group.MonomerGroup) {
        for (var key in group) {
          // jump out if it was added somehow
          if (recursiveSearchAndAdd(monomer, group[key])) {
            return true;
          }
          // otherwise keep going
        }

        // if we got here, we never found it, so return false;
        return false;
      }

      // also here we failed, too, finally
      return false;
    };

    // adds the monomer to the "Other" group within the larger group provided
    // private helper function 
    var addMonomerToOther = function (monomer, group) {
      var current = group.MonomerGroup;
      while (!(current instanceof Array)) {
        current = current.MonomerGroup;
      }

      // the other should be the last one in the group, but search just to be safe
      for (var i = 0; i < current.length; i++) {
        if (current[i]._name.match('Other')) {
          current[i].Monomer.push({
            _backgroundColor: 'White',
            _fontColor: 'Black',
            _name: monomer.MonomerID,
            encodedMonomer: monomer
          });
        }
      }
    };

    // return the default encoded database
    var getEncodedDB = function () {
      return encodedDB;
    };

    // return the default categorization database
    var getCategorizedDB = function () {
      return categorizedDB;
    };

    // searches the encoded database and returns a monomer matching the polymer 
    // type and monomer id
    var getEncodedById = function (polymerId, monomerId) {
      var output = '';
      var polymerList = encodedDB.MONOMER_DB.PolymerList.Polymer;
      for (var i=0; i < polymerList.length; i++) {
        if (polymerList[i]._polymerType.toUpperCase().match(polymerId.toUpperCase())) {
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
    };

    // searches the encoded DB to match the given text on the monomer ID or monomer name
    // returns all monomers that match
    // var searchEncodedDB = function (text, exact) {
    //   var toSearch = text.toLowerCase();
    //   console.log(toSearch);
    //   return fullMonomerList.filter(function (el) {
    //     if (exact) {
    //       return ((el.MonomerID.toLowerCase() === toSearch) || 
    //               (el.MonomerName.toLowerCase() === toSearch));
    //     }
    //     else {
    //       return ((el.MonomerID.toLowerCase().indexOf(toSearch) >= 0) || 
    //             (el.MonomerName.toLowerCase().indexOf(toSearch) >= 0));
    //     }
    //   });
    // };

    self.getEncodedById = getEncodedById;
    self.getCategorizedDB = getCategorizedDB;
    self.getEncodedDB = getEncodedDB;

    // // getPolymer, getMonomerGroup, and getMonomer all return
    // // an object with a boolean returnSuccess property and optional
    // // result property representing a type from the categorized database
    // function getPolymer(id) {
    //   var list = categorizedDB.Template.Polymer;
    //   var output; 
    //   for(var i = 0; i < list.length; i++){
    //     if(list[i]._name.match(id)){
    //       output = { returnSuccess: true, result: list[i] };
    //       return output;
    //     }
    //   }
    //   output = { returnSuccess: false };
    //   return output;
    // }
    // // The monomer group must handle the case where a monomer group exists 
    // // within another monomer group. In order to do so, the group info is 
    // // pulled from the form such that sub-groups are appeneded to the group
    // // as comma separated values of the form <group>,<sub-group>
    // function getMonomerGroup(polymerId, id) {
    //   var pGetter = getPolymer(polymerId);
    //   var idList = id.split(',');
    //   var parent, i=0;
    //   var output = { returnSuccess: false };
    //   if(!pGetter.returnSuccess){
    //     return output;
    //   }
    //   parent = pGetter.result();
    //   while (i < idList.length) {
    //     output.returnSuccess = false;
    //     for (var group in parent.MonomerGroup) {
    //       if (group._name.match(idList[i])) {
    //         i++;
    //         output = { returnSuccess: true, result: group };
    //         break;
    //       }
    //     }
    //     if (!output.returnSuccess()) { return output; }
    //     if ( i < idList.length) { parent = output.result; }
    //   }
    //   return output;
    // }

    self.sanityCheck = function () {
      return '5';
    };
  }]);
