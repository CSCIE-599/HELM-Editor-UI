'use strict';

/**
 * @ngdoc service
 * @name webService
 * @description
 * # WebService
 * Factory in the helmeditor2App.
 */
angular.module('helmeditor2App.webService', [])
  .factory('webService', function ($http) {
      var wsConfig = {
        // The URL of a running HELM2Webservice
        baseUrl: 'http://104.236.250.11:8080/WebService/service/',
        
        // HELM2Webservice API specific URL extensions
        getMonomerImageUrl: 'Image/Monomer?',
        getHelmImageUrl: 'Image/HELM/',
        getHelmNotationPeptide: 'Sequence/PEPTIDE/',
        getHelmNotationRna: 'Sequence/RNA/',
        validateHelmNotation: 'Validation/',
        getMolecularWeight: 'Calculation/MolecularWeight/',
        getMolecularFormula: 'Calculation/MolecularFormula/',
        getExtinctionCoefficient: 'Calculation/ExtinctionCoefficient/',
        getConversionCanonical: 'Conversion/Canonical/',
        getConversionStandard: 'Conversion/Standard/',
        getConversionJson: 'Conversion/JSON/',
        getFastaProduce: 'Fasta/Produce/',
        getFastaConvertPeptide: 'Fasta/Convert/PEPTIDE/',
        getFastaConvertRna: 'Fasta/Convert/RNA/',
        getFastaReadPeptide: 'Fasta/Read?PEPTIDE=',
        getFastaReadRna: 'Fasta/Read?RNA=' 
      };
    return {
      getBaseUrl: function () {
        return wsConfig.baseUrl;
      }, 
      getFullUrl: function (api, inputSequence) {
        return wsConfig.baseUrl + api + inputSequence;
      }, 
      getMonomerImageUrl: function (monomerId, polymerType, showRgroups) {
        var fullUrl = wsConfig.baseUrl + wsConfig.getMonomerImageUrl + 
                      'monomerId=' + monomerId + '&polymerType=' + polymerType;
        if (angular.isDefined(showRgroups) && showRgroups !== '') {
          fullUrl = fullUrl + '&showRgroups=' + showRgroups;
        }
        return fullUrl;
      }, 
      getHelmImageUrl: function (inputSequence) {
        return this.getFullUrl(wsConfig.getHelmImageUrl, inputSequence);
      },   
      getHelmNotationPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getHelmNotationPeptide, inputSequence));
      },
      getHelmNotationRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getHelmNotationRna, inputSequence));
      },
      validateHelmNotation: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.validateHelmNotation, inputSequence));
      },
      getMolecularWeight: function (inputSequence) {
       return $http.get(this.getFullUrl(wsConfig.getMolecularWeight, inputSequence));
      },
      getMolecularFormula: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getMolecularFormula, inputSequence));
      },
      getExtinctionCoefficient: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getExtinctionCoefficient, inputSequence));
      },
      getConversionCanonical: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionCanonical, inputSequence));
      },
      getConversionStandard: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionStandard, inputSequence));
      },
      getConversionJson: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionJson, inputSequence));
      },
      getFastaProduce: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaProduce, inputSequence));
      },
      getFastaConvertPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaConvertPeptide, inputSequence));
      },
      getFastaConvertRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaConvertRna, inputSequence));
      },
      getFastaReadPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaReadPeptide, inputSequence));
      },
      getFastaReadRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaReadRna, inputSequence));
      }
    };
  });
