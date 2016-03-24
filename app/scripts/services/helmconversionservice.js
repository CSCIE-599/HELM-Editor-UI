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

    var self = this;

	//takes HELM notation,
    //returns arrays of sequences and connections
  	this.convertHelmNotationToSequence = function(helmNotation){

        var sequences = self.getSequences(helmNotation);
        var connections = self.getConnections(helmNotation);

        var processedSequences = [];
        for (var i = 0; i < sequences.length; i++){
            var monomerName = self.getName(sequences[i]);
            processedSequences.push ({
                name : monomerName,
                sequences : self.getPolymers(monomerName, sequences[i]),
            });
        }


        var processedConnections = [];
        for (i = 0; i < connections.length; i++){
            processedConnections.push ({
                source : self.getSource(connections[i]),
                dest : self.getDest(connections[i]),
            });
        }

      	/*this.testFunction = function(){
            alert('hello');
      	}*/

        return [ processedSequences, processedConnections ];
    };

    //return array of different sequences in HELM Notation
    //sequences are delimited with '|'
    self.getSequences = function(helmNotation){

        var sequences = [];

        while (helmNotation.indexOf('|') > -1){
            sequences.push(helmNotation.substring(0, helmNotation.indexOf('|')));
            helmNotation = helmNotation.substring(helmNotation.indexOf('|') + 1, helmNotation.length);
        }

        if (helmNotation.indexOf('|') === -1){
            sequences.push(helmNotation.substring(0, helmNotation.indexOf('$')));
        }

        return sequences;
    };

    self.getConnections = function(helmNotation){

        var connections = [];
        var dollarSignsOnly = true;

        helmNotation = helmNotation.substring(helmNotation.indexOf('$')+1, helmNotation.length);

        for (var i = 0; i < helmNotation.length; i++){
            if (helmNotation[i] !== '$'){
                dollarSignsOnly = false;
                break;
            }
        }

        if (dollarSignsOnly){
            return connections;
        }

        while (helmNotation.indexOf('|') > -1){
            connections.push(helmNotation.substring(0, helmNotation.indexOf('|')));
            helmNotation = helmNotation.substring(helmNotation.indexOf('|') + 1, helmNotation.length);
        }

        if (helmNotation.indexOf('|') === -1){
            connections.push(helmNotation.substring(0, helmNotation.indexOf('$')));
        }

        return connections;
    };


    self.getName = function(sequence){
        return sequence.substring(0, sequence.indexOf('{'));
    };

    self.getPolymers = function(monomerName, sequence){
        var sequenceArray = [];

        if (monomerName.toUpperCase().indexOf("CHEM") > -1){
            sequenceArray.push(sequence.substring((sequence.indexOf('{') + 1), sequence.indexOf('}')));
            return sequenceArray;
        }

        var sequencecopy = sequence;
        sequence = sequencecopy.substring(sequence.indexOf('{'), sequencecopy.length);


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
                    nonNaturalAminoAcid = '';
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

        return sequenceArray;
    };

    self.getSource = function(connection){

        var afterFirstComma = connection.substring((connection.indexOf(',') + 1), connection.length);
        var afterSecondComma = afterFirstComma.substring((afterFirstComma.indexOf(',') + 1), afterFirstComma.length);

        var sourcePoint = {
            name : connection.substring(0,connection.indexOf(',')),
            nodeID : +(afterSecondComma.substring(0, afterSecondComma.indexOf(':'))),
        };
        return sourcePoint;
    };

    self.getDest = function(connection){

        var afterFirstComma = connection.substring((connection.indexOf(',') + 1), connection.length);
        var afterDash = connection.substring((connection.indexOf('-') + 1), connection.length);

        var destPoint = {
            name : afterFirstComma.substring(0, afterFirstComma.indexOf(',')),
            nodeID : +(afterDash.substring(0, afterDash.indexOf(':'))),
        };

        return destPoint;
    };
});
