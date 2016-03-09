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

  var baseUrl = 'http://104.236.250.11:8080/WebService/service/Sequence/';
	var functUrl = baseUrl + $("#type").val() + '/';

	$scope.getResult = function() {
	   	var fullUrl = functUrl + $scope.input;
	  	console.log(fullUrl);

	  	$http.get(fullUrl)
	     .then(function(response) {
	     	console.log(response.data);
	        $scope.result = response.data;
	    });
  	}
  });
