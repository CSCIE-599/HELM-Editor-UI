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
      if (sequence.name.toUpperCase().startsWith("RNA")){
        sequence.type = "RNA";
      }
      else if (sequence.name.toUpperCase().startsWith("CHEM")){
        sequence.type = "CHEM";
      }
      else if (sequence.name.toUpperCase().startsWith("PEPTIDE")){
        sequence.type = "PEPTIDE";
      }
      else { sequence.type = "UNKNOWN"; }
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
        notation: notation,
        type: type
      };

      sequences.push(sequence);

      // and generate the new HELM notation
      updateHelm();
    };

    // change the notation for a specified sequence 
    var replaceSequence = function(seqName, notation){
      for (var i = 0; i < sequences.length; i++){
        if (sequences[i].name === seqName){
          sequences[i].notation = notation;
        }
      }
      updateHelm();
    };

    // remove the specified sequence from the sequences array and update helm
    var removeSequence = function(seqName){

      var seqIndex = -1;
      for (var i = 0; i < sequences.length; i++){
        if (sequences[i].name === seqName){
          seqIndex = i;
        }
      }
      if (seqIndex > -1){
        sequences.splice(seqIndex, 1); // remove sequence
      // remove all connections to and from the sequence
        var conIndices = [];
        for (var j = 0; j < connections.length; j++){
          if ((connections[j].source.sequenceName === seqName) || (connections[j].dest.sequenceName === seqName)){
            connections.splice(j, 1);
            j--;
          }
        }
      }
      updateHelmFromStrings(); 
    };

// smaller functions that act similarly to the updateHelm function but include constructing connections string

    var updateHelmFromStrings = function(){
      var seqString = getUpdatedSequencesString();
      var conString = getUpdatedConnectionsString();
      helm = seqString + conString;
      console.log(helm);
      parseHelm(helm); // redundant?
    };

    // updates HELM notation to match what's in the connections array
    var getUpdatedConnectionsString = function(){
      var res = '';
      for (var i = 0; i < connections.length; i++){
        res = res + connections[i].source.sequenceName + ',' + connections[i].dest.sequenceName + ',' + 
        connections[i].source.attachment.nodeNum + ':' + connections[i].source.attachment.point + '-' + 
        connections[i].dest.attachment.nodeNum + ':'+ connections[i].dest.attachment.point;
        // only apply the | if there are more
        if (i < (connections.length - 1)) {
          res = res + '|';
        }
      }
      var connectionsString = '$' + res + '$$$$';
      console.log(connectionsString);
      return connectionsString;
    };

    var getUpdatedSequencesString = function(){
      // go through the sequences and generate the first blob
      var res = '';
      for (var i = 0; i < sequences.length; i++) {
        res = res + sequences[i].name + '{' + sequences[i].notation + '}';
        // only apply the | if there are more
        if (i < (sequences.length - 1)) {
          res = res + '|';
        }
      }
      return res;
    };

// 

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


      // and swap it in
      if (helm === '') {
        helm = res + '$$$$';
      }
      else {
        helm = res + helm.substring(helm.indexOf('$'));
      }

      // make sure to parse connections
      parseHelm(helm);
    };

    // returns an updated HELM notation string, removing the currently selected graph node
    var helmNodeRemoved = function(elements, sequence, nodeToRemove, nodeIndex){
      var seqNotation = sequence.notation; // the sequence characters contained within {}
      var tmpSeq = seqNotation; // copy of sequence notation to step through, chopping off start
      var tmpSeqStrt = 0; // index pointing to start of tmpSeq in the actual seqNotation string

      for (var elem in elements){
        var val = elements[elem]; // polymer name 
        var re = new RegExp('[\\[\\(]*'+val+'[\\]\\)]*');
        var matchIndex = tmpSeq.search(re); // index where the current polymer's notation begins
        var matchLength = tmpSeq.match(re)[0].length; // length of polymer notation

        if (elem !== nodeIndex){
          // chop the temp seq string to start after the current polymer's notation
          tmpSeqStrt += matchIndex + matchLength;
          tmpSeq = seqNotation.substring(tmpSeqStrt, seqNotation.length);
        }
        // found node to be removed
        else {
          // can just remove node from the sequence
          if ((nodeIndex === 0) || (nodeIndex === elements.length - 1) || (tmpSeq[matchIndex]==='(')){
            var updatedSeq = seqNotation.substring(0, tmpSeqStrt) + 
              seqNotation.substring((tmpSeqStrt+matchIndex+matchLength), seqNotation.length);

            console.log("Old sequence:" + seqNotation);
            console.log("Modified sequence: "+ updatedSeq);

            // if the first node is now an orphaned child e.g. '(P)' take it out
            if (updatedSeq[0] === '('){
              updatedSeq = updatedSeq.substring(updatedSeq.indexOf(')')+1, updatedSeq.length);
            }
            if (updatedSeq[0]==='.'){
              updatedSeq = updatedSeq.substring(1, rest.length);
            }
            replaceSequence(sequence.name, updatedSeq);
            var updatedHelm = getHelm();
            console.log("New HELM string: "+updatedHelm);
            return updatedHelm;
          }
          // need to split the sequence into two sequences
          else {
            console.log("Old sequence: "+ seqNotation);
            var firstSequence = seqNotation.substring(0, tmpSeqStrt);

            console.log("First sequence:" + firstSequence);
            replaceSequence(sequence.name, firstSequence);

            var secondSequence = seqNotation.substring((tmpSeqStrt+matchIndex+matchLength), seqNotation.length);
            if (secondSequence[0] === '('){
              secondSequence = secondSequence.substring(secondSequence.indexOf(')')+1,secondSequence.length);
            }
            if (secondSequence[0]==='.'){
              secondSequence = secondSequence.substring(1, secondSequence.length);
            }
            console.log("Second sequence: " + secondSequence);
            addNewSequence(sequence.type, secondSequence);
            var updatedHelm = getHelm();
            console.log("New HELM string: "+updatedHelm);
            return updatedHelm;
          }
        }
      }
      // for now, if can't process changes, just return original helm notation
      console.log("could not find node to remove");
      return updatedHelm;
    };

    // make things global
    self.getHelm = getHelm;
    self.setHelm = setHelm;
    self.getSequences = getSequences;
    self.getConnections = getConnections;
    self.addNewSequence = addNewSequence;
    self.helmNodeRemoved = helmNodeRemoved;
    self.removeSequence = removeSequence;
    self.parseHelm = parseHelm;
  });
