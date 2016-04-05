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
      getMonomerImagePath: 'Image/Monomer?',
      getHelmImagePath: 'Image/HELM/',
      getHelmNotationPeptidePath: 'Sequence/PEPTIDE/',
      getHelmNotationRnaPath: 'Sequence/RNA/',
      validateHelmNotationPath: 'Validation/',
      getMolecularWeightPath: 'Calculation/MolecularWeight/',
      getMolecularFormulaPath: 'Calculation/MolecularFormula/',
      getExtinctionCoefficientPath: 'Calculation/ExtinctionCoefficient/',
      getConversionCanonicalPath: 'Conversion/Canonical/',
      getConversionStandardPath: 'Conversion/Standard/',
      getConversionJsonPath: 'Conversion/JSON/',
      getFastaProducePath: 'Fasta/Produce/',
      getFastaConvertPeptidePath: 'Fasta/Convert/PEPTIDE/',
      getFastaConvertRnaPath: 'Fasta/Convert/RNA/',
      getFastaReadPeptidePath: 'Fasta/Read?PEPTIDE=',
      getFastaReadRnaPath: 'Fasta/Read?RNA=' 
    };
    return {
      getBaseUrl: function () {
        return wsConfig.baseUrl;
      }, 
      getFullUrl: function (api, inputSequence) {
        return wsConfig.baseUrl + api + inputSequence;
      }, 
      getMonomerImageUrl: function (monomerId, polymerType, showRgroups) {
        var fullUrl = wsConfig.baseUrl + wsConfig.getMonomerImagePath + 
                      'monomerId=' + monomerId + '&polymerType=' + polymerType;
        if (angular.isDefined(showRgroups) && showRgroups !== '') {
          fullUrl = fullUrl + '&showRgroups=' + showRgroups;
        }
        return fullUrl;
      }, 
      getHelmImageUrl: function (inputSequence) {
        return this.getFullUrl(wsConfig.getHelmImagePath, inputSequence);
      },   
      // returns a promise that resolves with the HELMNotation as a string if valid, or null if unknown response
      getHelmNotationPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getHelmNotationPeptidePath, inputSequence))
          .then(function(response) {
            return response.data.HELMNotation ? response.data.HELMNotation : null;
          });
      },
      // returns a promise that resolves with the HELMNotation as a string if valid, or null if unknown response
      getHelmNotationRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getHelmNotationRnaPath, inputSequence))
          .then(function(response) {
            return response.data.HELMNotation ? response.data.HELMNotation : null;
          });
      },
      // returns a promise that resolves with a boolean true or false
      // true -> valid
      validateHelmNotation: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.validateHelmNotationPath, inputSequence))
          .then(function(response) {
            return (response.data.Validation === 'valid');
          });
      },
      // returns a promise that resolves with the molecular weight if valid, or null if unknown response
      getMolecularWeight: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getMolecularWeightPath, inputSequence))
          .then(function(response) {
            return response.data.MolecularWeight ? response.data.MolecularWeight : null;
          });
      },
      // returns a promise that resolves with the molecular formula if valid, or null if unknown response
      getMolecularFormula: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getMolecularFormulaPath, inputSequence))
          .then(function(response) {
            return response.data.MolecularFormula ? response.data.MolecularFormula : null;
          });
      },
      // returns a promise that resolves with the extinction coefficient if valid, or null if unknown response
      getExtinctionCoefficient: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getExtinctionCoefficientPath, inputSequence))
          .then(function(response) {
            return response.data.ExtinctionCoefficient ? response.data.ExtinctionCoefficient : null;
          });
      },
      // returns a promise that resolves with the canonical HELM notation if valid, or null if unknown response
      getConversionCanonical: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionCanonicalPath, inputSequence))
          .then(function(response) {
            return response.data.CanonicalHELM ? response.data.CanonicalHELM : null;
          });
      },
      // returns a promise that resolves with the standard HELM notation if valid, or null if unknown response
      getConversionStandard: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionStandardPath, inputSequence))
          .then(function(response) {
            return response.data.StandardHELM ? response.data.StandardHELM : null;
          });
      },
      // returns a promise that resolves with the JSON notation if valid, or null if unknown response
      // NOTE - this one does not work with the current hosted version
      getConversionJson: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getConversionJsonPath, inputSequence))
          .then(function(response) {
            return response.data.JSON ? response.data.JSON : null;
          });
      },
      // returns a promise that resolves with the FASTA output if valid, or null if unknown response
      getFastaProduce: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaProducePath, inputSequence)).
          then(function(response) {
            return response.data.FastaFile ? response.data.FastaFile : null;
          });
      },
      // returns a promise that resolves with the peptide natural analog sequence if valid, or null if unknown response
      getFastaConvertPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaConvertPeptidePath, inputSequence))
          .then(function(response) {
            return response.data.Sequence ? response.data.Sequence : null;
          });
      },
      // returns a promise that resolves with the RNA natural analog sequence if valid, or null if unknown response
      getFastaConvertRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaConvertRnaPath, inputSequence))
          .then(function(response) {
            return response.data.Sequence ? response.data.Sequence : null;
          });
      },
      // returns a promise that resolves with the HELM Notation if valid, or null if unknown response
      getFastaReadPeptide: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaReadPeptidePath, inputSequence))
          .then(function(response) {
            return response.data.HELMNotation ? response.data.HELMNotation : null;
          });
      },
      // returns a promise that resolves with the HELM Notation if valid, or null if unknown response
      getFastaReadRna: function (inputSequence) {
        return $http.get(this.getFullUrl(wsConfig.getFastaReadRnaPath, inputSequence))
          .then(function(response) {
            return response.data.HELMNotation ? response.data.HELMNotation : null;
          });
      }
    };
  });
