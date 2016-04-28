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
    var addNewSequence = function (sequence) {
      console.log(sequence);
    };

    // make things global
    self.getHelm = getHelm;
    self.setHelm = setHelm;
    self.getSequences = getSequences;
    self.getConnections = getConnections;
    self.addNewSequence = addNewSequence;
  });
