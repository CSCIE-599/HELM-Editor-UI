'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:PrototypeCtrl
 * @description
 * # PrototypeCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('PrototypeCtrl', ['$scope', '$http', 'webservice', function ($scope, $http, webservice) {
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
	$scope.result;
	$scope.imageUrl;

	/* Event processing prototype - invoke factory function to get HELM notation */   
	$scope.getHelmNotation = function (polymerType, inputSequence) {
		if (!angular.isDefined(inputSequence)) {
      		alert('Invalid input');
      		return;
    	}
		webservice.getHelmNotation(polymerType.value, inputSequence)
		.success(function (response) {
        	$scope.result = response.HELMNotation;
        })
        .error(function (response) {
        	scope.result = 'Invalid sequence';
        	console.log(response);
        });
    };

	/* Event processing prototype - invoke factory function to get HELM image */ 
	$scope.getHelmImage = function (inputSequence) {
	    if (!angular.isDefined(inputSequence)) {
      		alert('Invalid input');
      		return;
    	}
    	$scope.imageUrl = webservice.getHelmImage(inputSequence);
    	$http.get($scope.imageUrl)
			.error(function (response) {
	        	alert(response);
	       	});
	};
}]);
