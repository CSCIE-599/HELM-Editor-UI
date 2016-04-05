'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['webService', function (webService) {
	var main = this;
	/* Toggle modal dialogue display */
	main.modalShown = false;
	main.toggleModal = function() {
    this.modalShown = !main.modalShown;
	};

	/* Variables for loadsequence view */
	main.polyTypes = [
    { value: 'PEPTIDE', label:'PEPTIDE' },
    { value: 'RNA', label:'RNA/DNA' },
    { value: 'HELM', label:'HELM' },
	];
	main.polymerType = main.polyTypes[0];
	main.result = '';

	/* Check if need to validate HELM input, or convert input to Helm */
	main.processInput = function (polymerType, inputSequence) {
	  /* Check that input is not empty */
    if (!angular.isDefined(inputSequence)) {
      window.alert('Invalid input');
      return;
    }
    /* TODO: Check that input is valid type? */
    if (polymerType.value === 'HELM') {
    	main.validateHelmNotation(inputSequence);
    }
    else {
    	main.getHelmNotation(polymerType, inputSequence);
    }
    main.toggleModal();
	};

	/* Invoke factory function to get HELM notation */   
	main.getHelmNotation = function (polymerType, inputSequence) {
    var successCallback = function (helmNotation) {
      main.result = helmNotation;
    };
    var errorCallback = function(response) {
      main.result = response.data;
      console.log(response.data);
    };

    switch(polymerType.value) {
      case 'PEPTIDE':
        webService.getHelmNotationPeptide(inputSequence).then(successCallback, errorCallback);
        break;
      case 'RNA':
        webService.getHelmNotationRna(inputSequence).then(successCallback, errorCallback);
    }
  };

  main.validateHelmNotation = function (inputSequence) {
    var successCallback = function (helmNotation) {
      main.result = helmNotation;
    };
    var errorCallback = function(response) {
      main.result = response.data;
      console.log(response.data);
    };
    
    webService.validateHelmNotation(inputSequence).then(successCallback, errorCallback);
  };
}]);
