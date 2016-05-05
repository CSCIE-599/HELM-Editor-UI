'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.HELMNotationService
 * @description
 * # HELMNotationService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('HELMNotationService', ['HelmConversionService', 'CanvasDisplayService', 'MonomerLibraryService', function (HelmConversionService, CanvasDisplayService, MonomerLibraryService) {
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
      sequence.name = sequenceString.substring(0, sequenceString.indexOf('{')).toUpperCase();
      sequence.notation = sequenceString.substring(sequenceString.indexOf('{') + 1 , sequenceString.indexOf('}'));
      if (sequence.name.indexOf('RNA') >= 0) {
        sequence.type = 'RNA';
      }
      else if (sequence.name.indexOf('CHEM') >= 0) {
        sequence.type = 'CHEM';
      }
      else if (sequence.name.indexOf('PEPTIDE') >= 0) {
        sequence.type = 'PEPTIDE';
      }
      else { 
        sequence.type = 'UNKNOWN'; 
      }
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
    var updateHelmFromStrings = function () {
      // check if there are no sequences
      if (sequences.length === 0) {
        helm = '';
      }
      else {
        var seqString = getUpdatedSequencesString();
        var conString = getUpdatedConnectionsString();
        helm = seqString + conString;
      }
      parseHelm(helm); // redundant?
    };

    // doesn't affect helm in place, but retrieves the new string
    var getUpdatedHelmFromStrings = function () {
      var ret;
      // check if there are no sequences
      if (sequences.length === 0) {
        ret = '';
      }
      else {
        var seqString = getUpdatedSequencesString();
        var conString = getUpdatedConnectionsString();
        ret = seqString + conString;
      }
      return ret;
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
      var connectionsString = '$' + res + '$$$';
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

      for (var i = 0; i < elements.length; i++){
        var val = elements[i]; // polymer name 
        var re = new RegExp('[\\[\\(]*'+val+'[\\]\\)]*');
        var matchIndex = tmpSeq.search(re); // index where the current polymer's notation begins
        var matchLength = tmpSeq.match(re)[0].length; // length of polymer notation

        if (i !== nodeIndex){
          // chop the temp seq string to start after the current polymer's notation
          tmpSeqStrt += matchIndex + matchLength;
          tmpSeq = seqNotation.substring(tmpSeqStrt, seqNotation.length);
        }
        // found node to be removed
        else {
          // can just remove node from the sequence
          if ((nodeIndex === 0) || (nodeIndex === elements.length - 1) || (tmpSeq[matchIndex]==='(')){
            var updatedSeq = seqNotation.substring(0, tmpSeqStrt) + 
              seqNotation.substring((tmpSeqStrt + matchIndex + matchLength), seqNotation.length);

            // if the first node is now an orphaned child e.g. '(P)' take it out
            if (updatedSeq[0] === '('){
              updatedSeq = updatedSeq.substring(updatedSeq.indexOf(')') + 1, updatedSeq.length);
            }
            if (updatedSeq[0] === '.'){
              updatedSeq = updatedSeq.substring(1);
            }

            // if the sequence is gone, remove it
            if (updatedSeq.length === 0) {
              removeSequence(sequence.name);
            }
            // otherwise replace it
            else {
              replaceSequence(sequence.name, updatedSeq);
            }
            return getHelm();
          }
          // need to split the sequence into two sequences
          else {
            var firstSequence = seqNotation.substring(0, tmpSeqStrt);
            replaceSequence(sequence.name, firstSequence);

            var secondSequence = seqNotation.substring((tmpSeqStrt+matchIndex+matchLength), seqNotation.length);
            if (secondSequence[0] === '('){
              secondSequence = secondSequence.substring(secondSequence.indexOf(')')+1,secondSequence.length);
            }
            if (secondSequence[0]==='.'){
              secondSequence = secondSequence.substring(1, secondSequence.length);
            }
            // only add the new sequence if it actually exists
            if (secondSequence.length > 0) {
              addNewSequence(sequence.type, secondSequence);
            }
            return getHelm();
          }
        }
      }

      // for now, if can't process changes, just return original helm notation
      console.log('could not find node to remove');
      return getHelm();
    };

    // try to make a connection between the two nodes passed, if possible
    var connectNodes = function (node1, node2) {
      // first make sure we're not trying to connect the same node to itself
      if (node1 === node2) {
        return helm;
      }
      // are we connecting two nodes within the same sequence? -> make a cycle
      if (node1.data.seqName === node2.data.seqName) {
        return createCycle(node1, node2);
      }
      // are we connecting two nodes of the same type (not CHEM)? -> make one sequence only
      else if (node1.data.seqType === node2.data.seqType && node1.data.seqType !== 'CHEM') {
        return joinSequence(node1, node2);
      }
      // otherwise we are just trying to make a connection
      else {
        return createNewConnection(node1, node2);
      }
    };

    // given the two nodes, tries to create a cyclical connection if there are open connections on each node
    var createCycle = function (node1, node2) {
      // find the sequence we're dealing with
      var sequence = getSequenceByName(node1.data.seqName);

      // if we didn't find it, bail out now
      if (!sequence) {
        return helm;
      }

      // otherwise, decide if it's a peptide or nucleotide (chem can't be cycles)
      if (sequence.type === 'RNA') {
        return createNucleotideCycle(node1, node2, sequence);
      }
      else {
        return createPeptideCycle(node1, node2, sequence);
      }
    };

    // given the two nodes, tries to join the two sequences together into one if it's possible
    var joinSequence = function (node1, node2) {
      console.log('sequence');
      console.log(node1.data);
      console.log(node2.data);
      return helm;
    };

    // given the two nodes, tries to create a new connection between the two, if possible
    var createNewConnection = function (node1, node2) {
      console.log('connection');
      console.log(node1.data);
      console.log(node2.data);
      return helm;
    };

    // helper function to retrieve the sequence by name
    var getSequenceByName = function (name) {
      for (var i = 0; i < sequences.length; i++) {
        if (sequences[i].name === name) {
          return sequences[i];
        }
      }

      // we failed, return null
      return null;
    };

    // helper method to try to create a nucleotide cycle (NOT COMPLETE)
    var createNucleotideCycle = function (node1, node2, sequence) {
      // for RNA, the cycle must be between two backbone nodes (i.e. not nodeType b)
      if (node1.data.nodeType === 'b' || node2.data.nodeType === 'b') {
        console.warn('Invalid cycle in RNA sequence attempted - branch monomers cannot be part of a cyclic connection.');
        return helm;
      }

      // get the polymers from the sequence
      var polymers = HelmConversionService.getPolymers(sequence.name, sequence.notation);

      // now the tricky part - a valid cycle for RNAs can only ever be from the first and last backbone nodes
      var firstNode, secondNode;
      if (node1.data.paramNum < node2.data.paramNum) {
        firstNode = node1;
        secondNode = node2;
      }
      else {
        firstNode = node2;
        secondNode = node1;
      }

      // make sure we're on the first and last backbone
      if (!(firstNode.data.paramNum === 1 && // first is first
            (secondNode.data.paramNum === polymers.length || // last is actually last
             (secondNode.data.paramNum === polymers.length - 1 && !CanvasDisplayService.isPhosphateNode(polymers[polymers.length - 1]) && !CanvasDisplayService.isRiboseNode(polymers[polymers.length - 1]))))) {
        console.warn('Invalid cycle in RNA sequence attempted!');
        return helm;
      }

      // now make sure there are attachment points available (i.e not used up in other connections)
      for (var j = 0; j < connections.length; j++) {
        // can break out if the nodes in question are in any connections
        if ((connections[j].source.sequenceName === firstNode.data.seqName && connections[j].source.attachment.nodeNum === firstNode.data.paramNum) ||
            (connections[j].source.sequenceName === secondNode.data.seqName && connections[j].source.attachment.nodeNum === secondNode.data.paramNum) ||
            (connections[j].dest.sequenceName === firstNode.data.seqName && connections[j].dest.attachment.nodeNum === firstNode.data.paramNum) ||
            (connections[j].dest.sequenceName === secondNode.data.seqName && connections[j].dest.attachment.nodeNum === secondNode.data.paramNum)) {
          console.warn('Invalid cycle in RNA sequence attempted - no attachment point available!');
          return helm;
        }
      }

      // otherwise we just need to add a connection... but this isn't supported yet, so just log it
      console.warn('Nucloetide cycles are not supported currently in the editor.');
      return helm;
    };

    // helper function to create the cycle in a peptide sequence (after checking validity)
    var createPeptideCycle = function (node1, node2, sequence) {
      // retrieve the monomers from the library (so we can see the available attachments)
      var monomer1 = MonomerLibraryService.getMonomerById('PEPTIDE', node1.data.name);
      var monomer2 = MonomerLibraryService.getMonomerById('PEPTIDE', node2.data.name);
      var polymers = HelmConversionService.getPolymers(sequence.name, sequence.notation);
      
      // peptide cycles are valid as long as there's an open attachment
      var totalFirstConnections = monomer1.encodedMonomer.Attachments.Attachment.length; 
      var openFirstConnections = monomer1.encodedMonomer.Attachments.Attachment.length;
      var totalSecondConnections = monomer2.encodedMonomer.Attachments.Attachment.length; 
      var openSecondConnections = monomer2.encodedMonomer.Attachments.Attachment.length;

      // decrease open connections if there are any monomers before each or after each
      if (node1.data.paramNum > 1 && polymers.length > 1) {
        openFirstConnections--;
      }
      if (node2.data.paramNum > 1 && polymers.length > 1) {
        openSecondConnections--;
      }
      if (node1.data.paramNum < polymers.length && polymers.length > 1) {
        openFirstConnections--;
      }
      if (node2.data.paramNum < polymers.length && polymers.length > 1) {
        openSecondConnections--;
      }

      // check the connections for anything taking up attachments
      for (var i = 0; i < connections.length; i++) {
        // are either the source?
        if (connections[i].source.sequenceName === sequence.name && 
            connections[i].source.attachment.nodeNum === node1.data.paramNum) {
          openFirstConnections--;
        }
        if (connections[i].source.sequenceName === sequence.name && 
            connections[i].source.attachment.nodeNum === node2.data.paramNum) {
          openSecondConnections--;
        }
        // or the destination
        if (connections[i].dest.sequenceName === sequence.name && 
            connections[i].dest.attachment.nodeNum === node1.data.paramNum) {
          openFirstConnections--;
        }
        if (connections[i].dest.sequenceName === sequence.name && 
            connections[i].dest.attachment.nodeNum === node2.data.paramNum) {
          openSecondConnections--;
        }
      }

      // and lastly, if there are open connections for both, add the connection
      if (openFirstConnections > 0 && openSecondConnections > 0) {
        addConnection(sequence.name,
          node1.data.paramNum,
          'R' + (totalFirstConnections - openFirstConnections + 1),
          sequence.name,
          node2.data.paramNum,
          'R' + (totalSecondConnections - openSecondConnections + 1));

        // and update the HELM string
        return getUpdatedHelmFromStrings();
      }

      // if we got here, we didn't do anything
      console.warn('Invalid peptide cycle attempted, ignoring.');
      return helm;
    };

    // helper function to add a connection
    var addConnection = function (srcSeqName, srcAttNum, srcAttPt, dstSeqName, dstAttNum, dstAttPt) {
      var connection = {
        source: {
          sequenceName: srcSeqName,
          attachment: {
            nodeNum: srcAttNum,
            point: srcAttPt
          }
        },
        dest: {
          sequenceName: dstSeqName,
          attachment: {
            nodeNum: dstAttNum,
            point: dstAttPt
          }
        }
      };

      connections.push(connection);
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
    self.connectNodes = connectNodes;
  }]);
