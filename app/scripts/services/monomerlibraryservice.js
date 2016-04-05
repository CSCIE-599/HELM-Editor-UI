'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.MonomerLIbraryService
 * @description
 * # MonomerLibraryService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('MonomerLibraryService', ['$http', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    var self = this;

    // Hierarchy of monomer types, retrievable through the monomer library. See
    // milestone 1 documentation for reference
    var categorizedDB = $http.get("DefaultMonomerCategorizationTemplate.xml", {
        transformResponse: function (info) {
            var x2js = new X2JS();
            var jsonInfo = x2js.xml_str2json(info);
            var returnObj = JSON.parse();
            return returnObj;
        }
    });

    var encodedDB = $http.get("MonomerDBGZEncoded.xml", {
        transformResponse: function (info) {
            var x2js = new X2JS();
            var jsonInfo = x2js.xml_str2json(info);
            var returnObj = JSON.parse();
            return returnObj;
        }
    });

    self.getCategorizedDB = function(){
        return categorizedDB.Template();
    };

    self.getEncodedDB = function(){
        return encodedDB.MONOMER_DB();
    }

  }]);
