'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.HELMNotationService
 * @description
 * # HELMNotationService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('HELMNotationService', function () {
    var self = this;

    // store the current HELM string
    var helm = '';

    // retrieve the current HELM string
    var getHelm = function () {
      return helm;
    };

    // set the current helm string
    var setHelm = function (helmString) {
      helm = helmString;
    };

    // make things global
    self.getHelm = getHelm;
    self.setHelm = setHelm;
  });
