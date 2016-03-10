'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */
 
var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', 'webServiceFactory', function ($scope, webServiceFactory) {
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
    $scope.status;
    $scope.result;
    
    /* Event processing prototype - invoke factory function to get HELM notation */   
    $scope.getHelmNotation = function (polymerType, inputSequence) {
      webServiceFactory.getHelmNotation(polymerType.value, inputSequence)
        .success(function (response) {
            $scope.status = 'Success';
            $scope.result = response;
            console.log(response);
        })
        .error(function (error) {
            $scope.status = 'Error: ' + error.message;
        });
    };

    /* Event processing prototype - invoke factory function to get HELM image */ 
    $scope.getHelmImage = function (inputSequence) {
        webServiceFactory.getHelmImage(inputSequence)
          .success(function (response) {
              $scope.status = 'Success';
              $scope.result = response; //TODO: Identify image processing logic 
          })
          .error(function (error) {
              $scope.status = 'Error: ' + error.message;
          });
    };
}]);

/*  Factory for webservice functionality */
app.factory('webServiceFactory', ['$http', function($http) {
    var baseUrl = 'http://104.236.250.11:8080/WebService/service/';
    var webServiceFactory = {};

    webServiceFactory.getHelmNotation = function (polymerType, inputSequence) {
      var fullUrl = baseUrl + 'Sequence/' + polymerType + '/' + inputSequence;
      console.log(fullUrl);
      return $http.get(fullUrl);
    };

    webServiceFactory.getMonomerImage = function (monomerId, polymerType, showRgroups) {
      var fullUrl = baseUrl + 'Image/Monomer/';
      return $http.get(fullUrl, 
        {params:{"monomerId": monomerId, "polymerType": polymerType, "showRgroups": showRgroups}});
    };

    webServiceFactory.getHelmImage = function (inputSequence) {
      var fullUrl = baseUrl + 'Image/HELM/' + inputSequence;
      return $http.get(fullUrl);
    };

    webServiceFactory.getMolecularWeight = function (inputSequence) {
      var fullUrl = baseUrl + 'Calculation/MolecularWeight/' + inputSequence;
      return $http.get(fullUrl);
    };

    webServiceFactory.getMolecularFormula = function (inputSequence) {
      var fullUrl = baseUrl + 'Calculation/MolecularFormula/' + inputSequence;
      return $http.get(fullUrl);
    };

    webServiceFactory.getExtinctionCoefficient= function (inputSequence) {
      var fullUrl = baseUrl + 'Calculation/ExtinctionCoefficient/' + inputSequence;
      return $http.get(fullUrl);
    };

    webServiceFactory.getConversionCanonical = function (inputSequence) {
      var fullUrl = baseUrl + 'Conversion/Canonical/' + inputSequence;
      return $http.get(fullUrl);
    };
    
    webServiceFactory.getConversionStandard = function (inputSequence) {
      var fullUrl = baseUrl + 'Conversion/Standard/' + inputSequence;
      return $http.get(fullUrl);
    };
    
    webServiceFactory.getConversionJson = function (inputSequence) {
      var fullUrl = baseUrl + 'Conversion/JSON/' + inputSequence;
      return $http.get(fullUrl);
    };
    
    webServiceFactory.getFastaProduce = function (inputSequence) {
      var fullUrl = baseUrl + 'Fasta/Produce/' + inputSequence;
      return $http.get(fullUrl);
    };
    
    return webServiceFactory;
}]);
