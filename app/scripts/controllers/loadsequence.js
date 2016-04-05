'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:LoadsequenceCtrl
 * @description
 * # LoadsequenceCtrl
 * Controller of the helmeditor2App
 */

angular.module('helmeditor2App')
  .controller('LoadsequenceCtrl', ['$scope', '$http', 'webService', 
  	function ($scope, $http, webService) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'];
     /* Toggle modal dialogue display */
    $scope.modalShown = false;
  	$scope.toggleModal = function() {
       $scope.modalShown = !$scope.modalShown;
  	};
  	/* Variables for loadsequence view */
  	$scope.polyTypes = [
      { value: 'PEPTIDE', label:'PEPTIDE' },
      // WebService does not provide function for Nucleotide sequence, but WireFrames specify Nucleotide here
      { value: 'RNA', label:'RNA/DNA' },
      { value: 'HELM', label:'HELM' },
  	];
  	$scope.polymerType = $scope.polyTypes[0];
  	$scope.result = '';
  	/* Check if need to validate Helm input, or convert input to Helm */
  	$scope.processInput = function (polymerType, inputSequence) {
  	  /* Check that input is not empty */
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
      }
      /* TODO: Check that input is valid type? */
      if (polymerType.value === 'HELM') {
      	$scope.validateHelmNotation(inputSequence);
      }
      else {
      	$scope.getHelmNotation(polymerType, inputSequence);
      }
      $scope.toggleModal();
  	};
  	/* Invoke factory function to get HELM notation */   
  	$scope.getHelmNotation = function (polymerType, inputSequence) {
      var successCallback = function (helmNotation) {
        $scope.result = helmNotation;
      };
      var errorCallback = function(response) {
        $scope.result = response.data;
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

    $scope.validateHelmNotation = function (inputSequence) {
      var successCallback = function (helmNotation) {
        $scope.result = helmNotation;
      };
      var errorCallback = function(response) {
        $scope.result = response.data;
        console.log(response.data);
      };
      
      webService.validateHelmNotation(inputSequence).then(successCallback, errorCallback);
    };
}]);

