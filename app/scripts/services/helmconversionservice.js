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

        var sequenceArray = self.getSequences(helmNotation);     //monomer names and letters
        var connectionArray = self.getConnections(helmNotation); //connections requested between sequences

        //make sequence array - each elem has a name (eg, 'RNA1') and a sequence (letters)
        var processedSequences = [];
        for (var i = 0; i < sequenceArray.length; i++){
            var monomerName = self.getName(sequenceArray[i]);
            processedSequences.push ({
                name : monomerName,
                sequence : self.getPolymers(monomerName, sequenceArray[i]),
            });
        }

        //make a connections array - each elem has a source and a dest, and
        //each source and dest has a name (eg, 'RNA1') and a nodeID (eg, '24')
        var processedConnections = [];
        for (i = 0; i < connectionArray.length; i++){
            processedConnections.push ({
                source : self.getSource(connectionArray[i]),
                dest : self.getDest(connectionArray[i]),
            });
        }

        /*this.testFunction = function(){
            alert('hello');
        }*/

        return [ processedSequences, processedConnections ];
    };

    //from HELM Notation, returns an array of sequences (monomer name and letters)
    //the list of sequences ends in '$', and sequences are delimited with '|'
    self.getSequences = function(helmNotation){

        var sequences = [];
        helmNotation = helmNotation.substring(0, helmNotation.indexOf('$'));

        while (helmNotation.indexOf('|') > -1){
            sequences.push(helmNotation.substring(0, helmNotation.indexOf('|')));
            helmNotation = helmNotation.substring(helmNotation.indexOf('|') + 1, helmNotation.length);
        }

        sequences.push(helmNotation);

        return sequences;
    };

    //from HELM Notation, returns the array of connections (after the first '$')
    self.getConnections = function(helmNotation){

        var connections = [];

        helmNotation = helmNotation.substring(helmNotation.indexOf('$')+1, helmNotation.length);

        while (helmNotation.indexOf('|') > -1){
            connections.push(helmNotation.substring(0, helmNotation.indexOf('|')));
            helmNotation = helmNotation.substring(helmNotation.indexOf('|') + 1, helmNotation.length);
        }

        if (helmNotation.indexOf('|') === -1){
            connections.push(helmNotation.substring(0, helmNotation.indexOf('$')));
        }

        return connections;
    };


    //from a HELM sequence, returns the sequence name (eg, 'RNA1')
    self.getName = function(sequence){
        return sequence.substring(0, sequence.indexOf('{'));
    };

    //from a HELM sequence, returns the monomer letters (all letters but the name)
    self.getPolymers = function(monomerName, sequence){
        var sequenceArray = [];

        if (monomerName.toUpperCase().indexOf('CHEM') > -1){
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

    //from a connection listed in HELM Notation, returns the source portion
    //the returned source object has a name and nodeID (number)
    self.getSource = function(connection){

        var afterFirstComma = connection.substring((connection.indexOf(',') + 1), connection.length);
        var afterSecondComma = afterFirstComma.substring((afterFirstComma.indexOf(',') + 1), afterFirstComma.length);

        var sourcePoint = {
            name : connection.substring(0,connection.indexOf(',')),
            nodeID : +(afterSecondComma.substring(0, afterSecondComma.indexOf(':'))),
        };
        return sourcePoint;
    };

    //from a connection listed in HELM Notation, returns the destination portion
    //the returned dest object has a name and nodeID (number)
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