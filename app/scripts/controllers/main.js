'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */
 
angular.module('helmeditor2App')
  .controller('MainCtrl', function ($scope, $http) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.monomerTypes = [
          { value: 'PEPTIDE', label:'PEPTIDE' },
          { value: 'RNA', label:'RNA/DNA' }
    ];
    $scope.seletedOption = $scope.monomerTypes[0];

    var baseUrl = 'http://104.236.250.11:8080/WebService/service/Sequence/';
	
	$scope.getResult = function() {
	   	var functUrl = baseUrl + $scope.seletedOption.value + '/';
		var fullUrl = functUrl + $scope.input;
	  	console.log(fullUrl);

	  	$http.get(fullUrl)
	     .then(function(response) {
	     	console.log(response.data);
	        $scope.result = response.data;
	    });
  	}
  });
