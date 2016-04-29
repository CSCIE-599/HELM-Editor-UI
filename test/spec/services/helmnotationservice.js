'use strict';

describe('Service: HELMNotationService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var HELMNotationService;
  beforeEach(inject(function (_HELMNotationService_) {
    HELMNotationService = _HELMNotationService_;
  }));

  it('should initialize with an blank string', function () {
    expect(HELMNotationService.getHelm()).toBe('');
  });

  it('should be able to set the HELM notation', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}|CHEM1{SS3}$RNA1,CHEM1,1:R1-1:R1$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
  });

  it('should initialize with blank connections', function () {
    expect(HELMNotationService.getConnections()).toEqual([]);
  });

  it('should initialize with blank sequences', function () {
    expect(HELMNotationService.getSequences()).toEqual([]);
  });

  it('should be able to parse a single sequence with no connections', function () {
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}$$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(1);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
  });

  it('should clear the sequences and connections when you clear the helm notation', function () {
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}$$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(1);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
    HELMNotationService.setHelm('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    expect(HELMNotationService.getConnections().length).toBe(0);
  });

  it('should be able to parse a notation with multiple sequences in it', function () {
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}|CHEM1{SS3}|PEPTIDE1{A.R.C.A.A.K.T.C.D.A}$$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(3);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
    expect(sequences[1].name).toBe('CHEM1');
    expect(sequences[1].notation).toBe('SS3');
    expect(sequences[2].name).toBe('PEPTIDE1');
    expect(sequences[2].notation).toBe('A.R.C.A.A.K.T.C.D.A');
  });

  it('should be able to parse a notation with no connections', function () {  
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}$$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(1);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
    var connections = HELMNotationService.getConnections();
    expect(connections.length).toBe(0);
  });

  it('should be able to parse a notation with one connection', function () {
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}|CHEM2{SS3}$RNA1,CHEM2,5:R3-1:R1$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(2);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
    expect(sequences[1].name).toBe('CHEM2');
    expect(sequences[1].notation).toBe('SS3');
    var connections = HELMNotationService.getConnections();
    expect(connections.length).toBe(1);
    expect(connections[0]).toEqual({
      source: {
        sequenceName: 'RNA1',
        attachment: {
          nodeNum: '5',
          point: 'R3'
        }
      },
      dest: {
        sequenceName: 'CHEM2',
        attachment: {
          nodeNum: '1',
          point: 'R1'
        }
      }
    });
  });

  it('should be able to parse a notation with multiple connections', function () {
    var helmString = 'RNA1{P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)}|CHEM2{SS3}$RNA1,CHEM2,5:R3-1:R1|RNA1,CHEM2,2:R2-2:R3|CHEM2,CHEM2,1:R2-6:R3$$$';
    HELMNotationService.setHelm(helmString);
    expect(HELMNotationService.getHelm()).toBe(helmString);
    var sequences = HELMNotationService.getSequences();
    expect(sequences.length).toBe(2);
    expect(sequences[0].name).toBe('RNA1');
    expect(sequences[0].notation).toBe('P.R(A)P.R(G)P.R(C)P.R(U)P.R(T)P.R(T)P.R(T)P.R(T)');
    expect(sequences[1].name).toBe('CHEM2');
    expect(sequences[1].notation).toBe('SS3');
    var connections = HELMNotationService.getConnections();
    expect(connections.length).toBe(3);
    expect(connections[0]).toEqual({
      source: {
        sequenceName: 'RNA1',
        attachment: {
          nodeNum: '5',
          point: 'R3'
        }
      },
      dest: {
        sequenceName: 'CHEM2',
        attachment: {
          nodeNum: '1',
          point: 'R1'
        }
      }
    });

    expect(connections[1]).toEqual({
      source: {
        sequenceName: 'RNA1',
        attachment: {
          nodeNum: '2',
          point: 'R2'
        }
      },
      dest: {
        sequenceName: 'CHEM2',
        attachment: {
          nodeNum: '2',
          point: 'R3'
        }
      }
    });

    expect(connections[2]).toEqual({
      source: {
        sequenceName: 'CHEM2',
        attachment: {
          nodeNum: '1',
          point: 'R2'
        }
      },
      dest: {
        sequenceName: 'CHEM2',
        attachment: {
          nodeNum: '6',
          point: 'R3'
        }
      }
    });
  });

  it('should be able to add a new RNA sequence to a null sequence', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.addNewSequence('RNA', 'P.R(A)P.R(G)');
    expect(HELMNotationService.getSequences().length).toBe(1);
    expect(HELMNotationService.getSequences()[0].name).toBe('RNA1');
    expect(HELMNotationService.getSequences()[0].notation).toBe('P.R(A)P.R(G)');
    expect(HELMNotationService.getHelm()).toBe('RNA1{P.R(A)P.R(G)}$$$$');
  });

  it('should be able to add a new CHEM sequence to a null sequence', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.addNewSequence('CHEM', 'SS3');
    expect(HELMNotationService.getSequences().length).toBe(1);
    expect(HELMNotationService.getSequences()[0].name).toBe('CHEM1');
    expect(HELMNotationService.getSequences()[0].notation).toBe('SS3');
    expect(HELMNotationService.getHelm()).toBe('CHEM1{SS3}$$$$');
  });

  it('should be able to add a new PEPTIDE sequence to a null sequence', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.addNewSequence('PEPTIDE', 'A.R.C.A.A');
    expect(HELMNotationService.getSequences().length).toBe(1);
    expect(HELMNotationService.getSequences()[0].name).toBe('PEPTIDE1');
    expect(HELMNotationService.getSequences()[0].notation).toBe('A.R.C.A.A');
    expect(HELMNotationService.getHelm()).toBe('PEPTIDE1{A.R.C.A.A}$$$$');
  });

  it('should be able to add a new RNA sequence (RNA1) if there is no other RNA sequences', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.setHelm('CHEM1{SS3}|PEPTIDE1{A.R.C.A}$$$$');
    expect(HELMNotationService.getSequences().length).toBe(2);
    HELMNotationService.addNewSequence('RNA', 'P.R(A)P.R(G)');
    expect(HELMNotationService.getSequences().length).toBe(3);
    expect(HELMNotationService.getSequences()[0].name).toBe('CHEM1');
    expect(HELMNotationService.getSequences()[0].notation).toBe('SS3');
    expect(HELMNotationService.getSequences()[1].name).toBe('PEPTIDE1');
    expect(HELMNotationService.getSequences()[1].notation).toBe('A.R.C.A');
    expect(HELMNotationService.getSequences()[2].name).toBe('RNA1');
    expect(HELMNotationService.getSequences()[2].notation).toBe('P.R(A)P.R(G)');
    expect(HELMNotationService.getHelm()).toBe('CHEM1{SS3}|PEPTIDE1{A.R.C.A}|RNA1{P.R(A)P.R(G)}$$$$');
  });

  it('should be able to add a new sequence at the next logical number', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.setHelm('PEPTIDE3{A.R.C.A}$$$$');
    expect(HELMNotationService.getSequences().length).toBe(1);
    HELMNotationService.addNewSequence('PEPTIDE', 'A.R.C.A');
    expect(HELMNotationService.getSequences().length).toBe(2);
    expect(HELMNotationService.getSequences()[0].name).toBe('PEPTIDE3');
    expect(HELMNotationService.getSequences()[0].notation).toBe('A.R.C.A');
    expect(HELMNotationService.getSequences()[1].name).toBe('PEPTIDE4');
    expect(HELMNotationService.getSequences()[1].notation).toBe('A.R.C.A');
    expect(HELMNotationService.getHelm()).toBe('PEPTIDE3{A.R.C.A}|PEPTIDE4{A.R.C.A}$$$$');
  });

  it('should be able to add a new sequence and not mess with current connections', function () {
    expect(HELMNotationService.getHelm()).toBe('');
    expect(HELMNotationService.getSequences().length).toBe(0);
    HELMNotationService.setHelm('RNA1{P.R(A)P.R(G)}|CHEM1{SS3}$RNA1,CHEM1,1:R1-1:R1$$$');
    expect(HELMNotationService.getSequences().length).toBe(2);
    HELMNotationService.addNewSequence('CHEM', 'Alexa');
    expect(HELMNotationService.getSequences().length).toBe(3);
    expect(HELMNotationService.getSequences()[0].name).toBe('RNA1');
    expect(HELMNotationService.getSequences()[0].notation).toBe('P.R(A)P.R(G)');
    expect(HELMNotationService.getSequences()[1].name).toBe('CHEM1');
    expect(HELMNotationService.getSequences()[1].notation).toBe('SS3');
    expect(HELMNotationService.getSequences()[2].name).toBe('CHEM2');
    expect(HELMNotationService.getSequences()[2].notation).toBe('Alexa');
    expect(HELMNotationService.getHelm()).toBe('RNA1{P.R(A)P.R(G)}|CHEM1{SS3}|CHEM2{Alexa}$RNA1,CHEM1,1:R1-1:R1$$$');
  });

});
