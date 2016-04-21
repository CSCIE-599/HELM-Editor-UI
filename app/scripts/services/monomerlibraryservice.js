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
    var linkedDB; // 'categories' property is an array of sub-categories, 'monomers' is the array of monomers
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

        // create the new linked DB that reference the polymers by name
        // also flatten it, so that each level is an object with a label and an 
        // array of either more objects (sub-levels) or just monomers
        linkedDB = {};
        for (var i = 0; i < categorizedDB.Template.Polymer.length; i++) {
          // set up the properties (if they exist)
          linkedDB[categorizedDB.Template.Polymer[i]._name] = {
            _name: categorizedDB.Template.Polymer[i]._name,
            _shape: categorizedDB.Template.Polymer[i]._shape,
            _title: categorizedDB.Template.Polymer[i]._title,
            _fontColor: categorizedDB.Template.Polymer[i]._fontColor
          };

          // and handle the children;
          linkedDB[categorizedDB.Template.Polymer[i]._name].categories = flattenGroup(categorizedDB.Template.Polymer[i], categorizedDB.Template.Polymer[i]);
        }
        self.initComplete = true;
      });
    });

    // extends/overrides the properties of the first object with those in the second
    // private helper function
    var extend = function(a, b) {
      var ret = {};
      for (var keyA in a) {
        if (keyA !== 'Fragment' && keyA !== 'Monomer' && keyA !== 'FragmentGroup' && keyA !== 'MonomerGroup') {
          ret[keyA] = a[keyA];
        }
      }
      for (var keyB in b) {
        // don't add the actual monomers in, that's handled elsewhere
        if (keyB !== 'Fragment' && keyB !== 'Monomer' && keyB !== 'FragmentGroup' && keyB !== 'MonomerGroup') {
          ret[keyB] = b[keyB];
        }
      }
      return ret;
    };

    // given a group, used recursively to flatten the group appropriately
    // returns an array of nested objects with arrays, or of Monomers
    // also passed the object of attributes to be included, if not specified
    // private helper function
    var flattenGroup = function (group, attrs) {
      // the base case is that there is simply an array of Monomer or Fragments
      if (group.Monomer || group.Fragment) {
        var monomers = group.Monomer || group.Fragment;
        if (!(monomers instanceof Array)) {
          monomers = [monomers];
        }

        // add each monomer back, after extending the properties from the group
        var newMonomers = [];
        for (var i = 0; i < monomers.length; i++) {
          newMonomers.push(extend(attrs, monomers[i]));
        }
        return newMonomers;
      }

      // otherwise, we're dealing with a FragmentGroup or MonomerGroup
      else {
        // need to do this whole things for FragmentGroup and MonomerGroup
        var fragmentGroups = group.FragmentGroup;
        var monomerGroups = group.MonomerGroup;
        // make sure we have an array
        if (!fragmentGroups) {
          fragmentGroups = [];
        }
        else if (!(fragmentGroups instanceof Array)) {
          fragmentGroups = [fragmentGroups];
        }
        if (!monomerGroups) {
          monomerGroups = [];
        }
        else if (!(monomerGroups instanceof Array)) {
          monomerGroups = [monomerGroups];
        }

        // and flatten each of them
        var categories = [];
        var obj;
        for (var j = 0; j < fragmentGroups.length; j++) {
          obj = extend(attrs, fragmentGroups[j]);
          // recursively flatten into categories if groups
          if (fragmentGroups[j].MonomerGroup || fragmentGroups[j].FragmentGroup) {
            obj.categories = flattenGroup(fragmentGroups[j], obj);
          }
          // or monomers if not groups
          else {
            obj.monomers = flattenGroup(fragmentGroups[j], obj);
          }
          // add it
          categories.push(obj);
        }
        // repeat for the monomer groups
        for (var k = 0; k < monomerGroups.length; k++) {
          obj = extend(attrs, monomerGroups[k]);
          // recursively flatten into categories if groups
          if (monomerGroups[k].MonomerGroup || monomerGroups[k].FragmentGroup) {
            obj.categories = flattenGroup(monomerGroups[k], obj);
          }
          // or monomers if not groups
          else {
            obj.monomers = flattenGroup(monomerGroups[k], obj);
          }
          // add it
          categories.push(obj);
        }

        // return it
        return categories;
      }
    };

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

    // return the linked (flattened/normalized) database
    var getLinkedDB = function () {
      return linkedDB;
    };

    // returns the hierarchy of monomers by the given type (RNA, PEPTIDE, CHEM)
    // return an array of all sub-groupings, each grouping is an object with title, and any
    // sub-groupings under that
    var getMonomersByType = function (type) {
      return linkedDB[type];
    };

    // returns a list of monomers that match either the ID or the name
    // public function
    var searchMonomers = function (type, text) {
      // jump out if we don't have anything to search by
      if (text === null || text === '') {
        return [];
      }
      
      var results = [];
      var searchText = text.toLowerCase();

      // go through all of the monomers, and push them on if the contain the text
      var group = getMonomersByType(type);
      results = searchRecursive(group, searchText);
      return results;
    };

    // recursive method to either return the monomers that match, or 
    // concatenate results of recursive calls on all categories
    var searchRecursive = function (group, text) {
      var results = [];

      // hanlde the case that we have monomers
      if (group.monomers) {
        for (var i = 0; i < group.monomers.length; i++) {
          if (group.monomers[i]._name.toLowerCase().indexOf(text) >= 0 ||
              (group.monomers[i].encodedMonomer && group.monomers[i].encodedMonomer.MonomerName.toLowerCase().indexOf(text) >= 0)) {
            results.push(group.monomers[i]);
          }
        }
      }
      // otherwise need to concatenate the results from later calls
      else {
        for (var j = 0; j < group.categories.length; j++) {
          results = results.concat(searchRecursive(group.categories[j], text));
        }
      }

      // return it
      return results;
    };

    // and return the methods we actually want to expose
    self.getCategorizedDB = getCategorizedDB;
    self.getEncodedDB = getEncodedDB;
    self.getLinkedDB = getLinkedDB;
    self.getMonomersByType = getMonomersByType;
    self.searchMonomers = searchMonomers;
  }]);
