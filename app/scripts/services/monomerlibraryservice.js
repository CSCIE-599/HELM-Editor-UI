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
    var linkedDB;
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

        // go and reference the polymers by name
        linkedDB = {};
        for (var i = 0; i < categorizedDB.Template.Polymer.length; i++) {
          linkedDB[categorizedDB.Template.Polymer[i]._name] = categorizedDB.Template.Polymer[i];
        }
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
    // private helper function
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

    // returns the list of strings of polymers names from the categorized database
    var getPolymerIdList = function() {
      var list = [];
      var polymers = categorizedDB.Template.Polymer;
      for(var i = 0; i < polymers.length; i++){
        list.push(polymers[i]);
      }
      return list;
    };

    // the following functions and objects are used for creating and interfacing between the categorized database and a view 

    // the current parent group for the lowest depth selection so far
    var parent = null; 
    // the list of categorized groups selected via the drop downs
    // each entry consists of objects of type {name: <String>, subs: [<String>]}
    var selectedGroups = [];
    // recent selections holds recently chosen objects from the database with 
    // maxrRecents being a macro defined to limit the size of the list
    var maxRecents = 5, recentSelections = [];
    function selectPolymer(name){
      for(var i = 0; i < categorizedDB.Template.Polymer.length; i++){
        if(categorizedDB.Template.Polymer[i]._name === name){
          parent = categorizedDB.Template.Polymer[i];
          selectedGroups = [];
          break;
        }
      }
      return;
    }
    // Executes the selection of a group type member of the parent group
    function selectGroup(number, name) {
      //
      if(parent === null || 
        (parent.MonomerGroup === undefined && parent.FragmentGroup === undefined)){
        // alert('Error selecting monomer group ' + name + '. Clear all selections and try again');
        return;
      }
      for(var i = 0; i < parent.MonomerGroup.length; i++){
        if(parent.MonomerGroup[i]._name.toUpperCase() === name.toUpperCase()){
          if(number < (selectedGroups.length - 1)){
            selectedGroups.slice(0,number);
          }
          var newParent = parent.MonomerGroup[i];
          selectedGroups[number] = {name: name, subs: []};
          parent = newParent;
          storeSubGroupList();
          break;
        }
      }
      return;
    }
    // Adds a list of subgroups matching current parent to the last entry 
    // in the selectedGroups list
    function storeSubGroupList(){
      if(parent === null){
        // alert('Error selecting ' + name + '. Please clear all selections and try again');
        return;
      }
      var checks = 0;
      var nameList = [];
      while(checks < 2){
        var groupList = [];
        if(checks === 0 && parent.MonomerGroup !== undefined){
          groupList = parent.MonomerGroup;
        }
        else if(parent.FragmentGroup !== undefined){
          groupList = parent.FragmentGroup;
          checks++;
        }
        for(var i = 0; i < groupList.length; i++){
            nameList.push(groupList[i]._name);
        }
        checks++;
      }
      selectedGroups[selectedGroups.length - 1].subs = nameList;
    }

    // function showGroupSelectors(){
    //   var selects = [], i;
    //   for(i = 0; i < selectedGroups.length; i++){
    //     // for each one, create a selector list using the entry' subs property.
    //     // the indices of selectedGroups array should preferabley be used as 
    //     // the "key" to the select list
    //     // these select lists should be pushed onto the selects array
    //   }
    //   var actives = parent.Monomer.concat(parent.Fragment);
    //   for(i = 0; i < actives.length; i++){
    //     /***
    //      Make buttons that can be used to activate a selection 
    //      ***/
    //   }
    // }
    
    // Selects non-group type members of the parent group
    function selectGroupMember(name){
      if(parent === null){
        //alert('Error selecting ' + name + '. Please clear all selections and try again');
        return;
      }
      var found = false, checks = 0;
      while(found !== true && checks < 2){
        var list = [];
        if(checks === 0 && parent.Monomer !== undefined){
          list = parent.Monomer;
        }
        else if(parent.Fragment !== undefined){
          list = parent.Fragment;
          checks++;
        }
        for(var i = 0; i < list.length; i++){
          if(list[i]._name === name){
            // add to recents. 
            // recentSelections[0] should remain as the newest at all times.
            /*****
             I need to think about how this thing gets added to recents.
             Ideally we would add the same side of the linked db each time. Either it is better to expose the categorized side and have the encoded side documented as sub properties, or the encoded side exposed and the categorized properties listed as subs.
             ******/ 
            recentSelections.unshift(list[i]._name);
            recentSelections.slice(0, maxRecents);
            found = true; 
            break;
          }
        }
        checks++;
        /****************************************************
         right here should be a call to the action that sends the Monomer/Fragment to the canvas, or notifies the canvas that there is a new thing to be grabbed from the list of recents.
         ****************************************************/
      }
    }

    // returns the hierarchy of monomers by the given type (RNA, PEPTIDE, CHEM)
    // return an array of all sub-groupings, each grouping is an object with title, and any
    // sub-groupings under that
    var getMonomersByType = function (type) {
      return linkedDB[type];
    };

    // searches the encoded DB to match the given text on the monomer ID or monomer name
    // returns all monomers that match
    /***
     Encoded monomers have the following properties:
     MonomerId, MonomerSmiles, MonomerMolFile, MonomerType, PolymerType, MonomerName, and Attachments (has a property called Attachment which is a list of attachments)

     XXXXXEncoded monomers should have an additional field after linking that refers to the corresponding entry in the categorized db.XXXXXXXXXXXX

     Attachment objects have the following properties:
     AttachmentId, AttachmentLabel, CapGroupName, CapGroupSmiles
     ***/
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

    self.getCategorizedDB = getCategorizedDB;
    self.getEncodedDB = getEncodedDB;
    self.getMonomersByType = getMonomersByType;
    // self.searchEncodedDB = searchEncodedDB;
    self.getPolymerIdList = getPolymerIdList;
    self.selectPolymer = selectPolymer;
    self.selectGroup = selectGroup;
    self.selectGroupMember = selectGroupMember;
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

    self.sanityCheck = function () {
      return '5';
    };
  }]);
