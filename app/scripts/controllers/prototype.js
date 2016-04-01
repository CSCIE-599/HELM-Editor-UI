'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:PrototypeCtrl
 * @description
 * # PrototypeCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('PrototypeCtrl', ['$scope', '$http', 'webService', function ($scope, $http, webService) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

  	/* Variables related to the prototype code in HTML */
  	$scope.polyTypes = [
      { value: 'PEPTIDE', label:'PEPTIDE' },
      { value: 'RNA', label:'RNA/DNA' }
  	];
  	$scope.polymerType = $scope.polyTypes[0];
  	$scope.result = '';
  	$scope.imageUrl = '';

  	/* Event processing prototype - invoke factory function to get HELM notation */   
  	$scope.getHelmNotation = function (polymerType, inputSequence) {
      // check to make sure we have a sequence
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
      }
      // make the webService calls appropriately
      if (polymerType.value === 'PEPTIDE') {
        webService.getHelmNotationPeptide(inputSequence).then(
          // on success, just update the model
          function (response) {
            $scope.result = response;
          },
          // on failure, update the model with an error message
          function (error) {
            console.log(error);
            $scope.result = 'Error retrieving HELM Notation - check the Helm2WebService';
          }
        );
      } else if (polymerType.value === 'RNA') {
        webService.getHelmNotationRna(inputSequence).then(
          // on success, just update the model
          function (response) {
            $scope.result = response;
          },
          // on failure, update the model with an error message
          function (error) {
            console.log(error);
            $scope.result = 'Error retrieving HELM Notation - check the Helm2WebService';
          }
        );
      }
    };  

  	/* Event processing prototype - invoke factory function to get HELM image */ 
  	$scope.getHelmImage = function (inputSequence) {
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
    	}
      $scope.imageUrl = webService.getHelmImageUrl(inputSequence);
      $http.get($scope.imageUrl)
        .error(function (response) {
          window.alert(response);
        });
    };
  }]);
