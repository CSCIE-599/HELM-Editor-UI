'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.webservice
 * @description
 * # webservice
 * Factory in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .factory('webservice', function ($http) {
    
    var baseUrl = 'http://104.236.250.11:8080/WebService/service/';
    
    return {
      getMonomerImage: function (monomerId, polymerType, showRgroups) {
        var fullUrl = baseUrl + 'Image/Monomer/' + 
          'monomerId=' + monomerId + 
          '/polymerType=' + polymerType + 
          '/showRgroups=' + showRgroups;
        return fullUrl;
      }, 
      getHelmImage: function (inputSequence) {
        return baseUrl + 'Image/HELM/' + inputSequence;
      },   
      getHelmNotation: function (polymerType, inputSequence) {
        return $http.get(baseUrl + 'Sequence/' + polymerType + '/' + inputSequence);
      },      
      getMolecularWeight: function (inputSequence) {
       return $http.get(baseUrl + 'Calculation/MolecularWeight/' + inputSequence);
      },
      getMolecularFormula: function (inputSequence) {
        return $http.get(baseUrl + 'Calculation/MolecularFormula/' + inputSequence);
      },
      getExtinctionCoefficient: function (inputSequence) {
        return $http.get(baseUrl + 'Calculation/ExtinctionCoefficient/' + inputSequence);
      },
      getConversionCanonical: function (inputSequence) {
        return $http.get(baseUrl + 'Conversion/Canonical/' + inputSequence);
      },
      getConversionStandard: function (inputSequence) {
        return $http.get(baseUrl + 'Conversion/Standard/' + inputSequence);
      },
      getConversionJson: function (inputSequence) {
        return $http.get(baseUrl + 'Conversion/JSON/' + inputSequence);
      },
      getFastaProduce: function (inputSequence) {
        return $http.get(baseUrl + 'Fasta/Produce/' + inputSequence);
      },
      getFastaRead: function (peptide, rna) {
        return $http.get(baseUrl + 'Fasta/Read/', {params:{'PEPTIDE': peptide, 'RNA': rna}});
      },     
      getFastaConvertRNA: function (inputSequence) {
        return $http.get(baseUrl + 'Fasta/Convert/RNA' + inputSequence);
      },
      getFastaConvertPETIDE: function (inputSequence) {
        return $http.get(baseUrl + 'Fasta/Convert/PEPTIDE/' + inputSequence);
      },
      validateHelmNotation: function (inputSequence) {
        return $http.get(baseUrl + 'Validation/' + inputSequence);
      }
    };
  });
