'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.HELMNotationService
 * @description
 * # HELMNotationService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('HELMNotationService', function () {
    var self = this;

    // store the current HELM string
    var helm = '';
    var sequences = [];
    var connections = [];

    // parses a given helm string into the sequences and connections
    var parseHelm = function (helmString) {
      // store the whole string
      helm = helmString;
      sequences = [];
      connections = [];

      // if we have something, try to get everything out of it
      if (helm.length > 0) {
        // get the sequences
        var sequenceString = helmString.substring(0, helmString.indexOf('$'));
        while (sequenceString.indexOf('|') > -1) {
          var strSequence = sequenceString.substring(0, sequenceString.indexOf('|'));
          if (strSequence.length > 0) {
            sequences.push(parseSequenceString(strSequence));
          }
          sequenceString = sequenceString.substring(sequenceString.indexOf('|') + 1);
        }
        // and the last one
        if (sequenceString.length > 0) {
          sequences.push(parseSequenceString(sequenceString));
        }

        // and get the connections
        helmString = helmString.substring(helmString.indexOf('$') + 1);
        var connectionString = helmString.substring(0, helmString.indexOf('$'));
        while (connectionString.indexOf('|') > -1) {
          var strConnection = connectionString.substring(0, connectionString.indexOf('|'));
          if (strConnection.length > 0) {
            connections.push(parseConnectionString(strConnection));
          }
          connectionString = connectionString.substring(connectionString.indexOf('|') + 1);
        }
        // and the last one
        if (connectionString.length > 0) {
          connections.push(parseConnectionString(connectionString));
        }
      }
    };

    // parses a single sequence string into its parts
    var parseSequenceString = function (sequenceString) {
      var sequence = {};
      sequence.name = sequenceString.substring(0, sequenceString.indexOf('{'));
      sequence.notation = sequenceString.substring(sequenceString.indexOf('{') + 1 , sequenceString.indexOf('}'));
      return sequence;
    };

    // parses a single connection string into its parts
    var parseConnectionString = function (connectionString) {
      var connection = {};
      connection.source = {};
      connection.dest = {};
      connection.source.sequenceName = connectionString.substring(0, connectionString.indexOf(','));
      connectionString = connectionString.substring(connectionString.indexOf(',') + 1);
      connection.dest.sequenceName = connectionString.substring(0, connectionString.indexOf(','));
      connectionString = connectionString.substring(connectionString.indexOf(',') + 1);
      connection.source.attachment = {};
      connection.source.attachment.nodeNum = connectionString.substring(0, connectionString.indexOf(':'));
      connectionString = connectionString.substring(connectionString.indexOf(':') + 1);
      connection.source.attachment.point = connectionString.substring(0, connectionString.indexOf('-'));
      connectionString = connectionString.substring(connectionString.indexOf('-') + 1);
      connection.dest.attachment = {};
      connection.dest.attachment.nodeNum = connectionString.substring(0, connectionString.indexOf(':'));
      connectionString = connectionString.substring(connectionString.indexOf(':') + 1);
      connection.dest.attachment.point = connectionString;
      return connection;
    };

    // retrieve the current HELM string
    var getHelm = function () {
      return helm;
    };

    // set the current helm string
    var setHelm = function (helmString) {
      parseHelm(helmString);
    };

    // retrieve the sequences
    var getSequences = function () {
      return sequences;
    };

    // retrieve the connections
    var getConnections = function () {
      return connections;
    };

    // add the new sequence to the current HELM string
    // type - must be RNA, PEPTIDE, or CHEM
    // notation should be the sequence of characters
    var addNewSequence = function (type, notation) {
      console.log(sequences);
      // see what label we need to add to the type for the new sequence
      var postfix = 1; // start at 1
      for (var i = 0; i < sequences.length; i++) {
        if (sequences[i].name.indexOf(type) === 0) {
          var num = parseInt(sequences[i].name.substring(type.length));
          postfix = postfix > num ? postfix : num + 1;
        }
      }

      // create our new sequence
      var sequence = {
        name: type + postfix,
        notation: notation
      };

      sequences.push(sequence);

      // and generate the new HELM notation
      updateHelm();
    };

    // private helper function to update the HELM notation from any added sequences
    var updateHelm = function () {
      // go through the sequences and generate the first blob
      var res = '';
      for (var i = 0; i < sequences.length; i++) {
        res = res + sequences[i].name + '{' + sequences[i].notation + '}';
        // only apply the | if there are more
        if (i < (sequences.length - 1)) {
          res = res + '|';
        }
      }

      console.log(res);

      // and swap it in
      if (helm === '') {
        helm = res + '$$$$';
      }
      else {
        helm = res + helm.substring(helm.indexOf('$'));
      }

      console.log(helm);
      // make sure to parse connections
      parseHelm(helm);
    };

    // returns an updated HELM notation string, removing the currently selected graph node
    // elements: the array of polymers in the currently displayed helm
    // helmString: the current helm  notation string
    // nodeToRemove: the canvas node currently selected
    var helmNodeRemoved = function(elements, helmString, nodeToRemove){

      var helmSubString = helmString.substring(helmString.indexOf('{')+1, helmString.indexOf('}'));
      var workingHelmString = helmSubString;
      var updatedHelmString;

      var wrkHlmStart = 0;

      for (var elem in elements){

        var val = elements[elem];

        var re = new RegExp('[\\[\\(]*'+val+'[\\]\\)]*');
        var matchIndex = workingHelmString.search(re);
        var matchLength = workingHelmString.match(re)[0].length;

        if (elem != nodeToRemove.data.id){
          wrkHlmStart += matchIndex + matchLength;
          workingHelmString = helmSubString.substring(wrkHlmStart, helmSubString.length);
        }
        else {
          if (workingHelmString[matchIndex]=='('){
            // just remove the element from the sequence
            var updatedHelmSubString = helmSubString.substring(0, wrkHlmStart) 
            + helmSubString.substring((wrkHlmStart+matchIndex+matchLength), helmSubString.length);

            updatedHelmString = helmString.replace(helmSubString, updatedHelmSubString);
            console.log(updatedHelmString);
            return updatedHelmString;
          }
          //TODO
         // else {
            // need to split string into two helm sequences
         // }
        }

      }
    }

    // make things global
    self.getHelm = getHelm;
    self.setHelm = setHelm;
    self.getSequences = getSequences;
    self.getConnections = getConnections;
    self.addNewSequence = addNewSequence;
    self.helmNodeRemoved = helmNodeRemoved;
  });
