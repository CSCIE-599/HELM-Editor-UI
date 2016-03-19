'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.HelmConversionService
 * @description
 * # HelmConversionService
 * Service in the helmeditor2App.
 */

angular.module('helmeditor2App')
  .service('HelmConversionService', function () {
  	
	//takes HELM notation,
    //finds sequence type (nucleotide or peptide) and node letters (R, P, sP, A, C, G, T, etc.)
    //
    //TO-DO: parse requested connection source/destinations (text after '$')
    //TO-DO: move this method to be a service
  	this.convertHelmNotationToSequence = function(sequence){

 		console.log('the unparsed sequence is: ' + sequence);
        var sequenceType;
        if (sequence.indexOf('RNA') > -1){
            sequenceType = 'Nucleotide';
        }
        else if (sequence.indexOf('PEPTIDE') > -1){
            sequenceType = 'Peptide';
        }
        else {
            //TO-DO: Handle this error in correct way.
			$window.alert('HELM Notation has no Polymer Type');
        }

        var curlyBrace = sequence.indexOf('{');
        sequence = sequence.substring(curlyBrace, sequence.length);

        var sequenceArray = [];
        var inNonNaturalAminoAcid = false;
        var nonNaturalAminoAcid = '';      //multi-letter codes - inside '[]' in HELM

        for (var i = 0; i < sequence.length-1; i++){
            if (sequence[i] === '}'){
                break;
            }

            //process multi-letter codes
            while (inNonNaturalAminoAcid === true){
                if (sequence[i] === ']'){
                    sequenceArray.push(nonNaturalAminoAcid);
                    inNonNaturalAminoAcid = false;
                }

                if (/[a-zA-Z0-9]/.test(sequence[i])){  //if char is alphanumeric
                    nonNaturalAminoAcid += sequence[i];
                }
                i += 1;
            }

            if (sequence[i] === '['){
                inNonNaturalAminoAcid = true;
            }

            if (/[a-zA-Z0-9]/.test(sequence[i])){
                //TO-DO: validate letters? but, we handle input validation in Issue 6
                sequenceArray.push(sequence[i]);
            }
        }

        console.log('SequenceArray generated succesfully: ' + sequenceArray);


        return {
        	sequenceType: sequenceType,
        	sequenceArray: sequenceArray
        };

      };


  	/*this.testFunction = function(){

  		alert('hello');
  	}*/    


  });
