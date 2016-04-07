'use strict';

describe('Service: helmeditor2App.webService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App.webService'));

  // instantiate service and the backend
  var webService, $httpBackend;
  beforeEach(inject(function (_webService_, _$httpBackend_) {
    webService = _webService_;
    $httpBackend = _$httpBackend_;
  }));

  // after each test, make sure to validate that there are no outstanding requests
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
 
  var baseUrl = '';
  var result = '';
  var inputSequence = 'A';
  var helmSequence = 'RNA1{R(A)}$$$$V2.0';
    
  it('should return the base url', function () {
    baseUrl = webService.getBaseUrl();
    expect(baseUrl).not.toBe('');
  });

  it('should return the Monomer Image URL with no showRgroups', function () {
    result = webService.getMonomerImageUrl('A', 'RNA', '');
    expect(result).toBe(baseUrl + 'Image/Monomer?monomerId=A&polymerType=RNA');
  });

  it('should return the Monomer Image URL with showRgroups true', function () {
    result = webService.getMonomerImageUrl('A', 'RNA', true);
    expect(result).toBe(baseUrl + 'Image/Monomer?monomerId=A&polymerType=RNA&showRgroups=true');
  });

  it('should return the Monomer Image URL with showRgroups false', function () {
    result = webService.getMonomerImageUrl('A', 'RNA', false);
    expect(result).toBe(baseUrl + 'Image/Monomer?monomerId=A&polymerType=RNA&showRgroups=false');
  });

  it('should return the Helm Image URL', function () {
    result = webService.getHelmImageUrl(helmSequence);
    expect(result).toBe(baseUrl + 'Image/HELM/' + helmSequence);
  });

  it('should return a HELM string for getHelmNotationRna for a valid sequence', function() {
    $httpBackend.expect('GET', baseUrl + 'Sequence/RNA/' + inputSequence)
      .respond({HELMNotation: helmSequence});
    webService.getHelmNotationRna(inputSequence).then(function(response) {
      expect(response).toBe(helmSequence);
    });
    $httpBackend.flush();
  });

  it('should return a HELM string for getHelmNotationPeptide for a valid sequence', function() {
    $httpBackend.expect('GET', baseUrl + 'Sequence/PEPTIDE/' + inputSequence)
      .respond({HELMNotation: helmSequence});
    webService.getHelmNotationPeptide(inputSequence).then(function(response) {
      expect(response).toBe(helmSequence);
    });
    $httpBackend.flush();
  });

  it('should return true for validation of a valid HELM string', function() {
    $httpBackend.expect('GET', baseUrl + 'Validation/' + inputSequence)
      .respond({
        Validation: 'valid',
        HELMNotation: inputSequence
      });
    webService.validateHelmNotation(inputSequence).then(function(valid) {
      expect(valid).toBe(true);            
    });
    $httpBackend.flush();
  });

  it('should return false for validation of an invalid HELM string', function() {
    $httpBackend.expect('GET', baseUrl + 'Validation/' + inputSequence)
      .respond('HELMNotation is not valid');
    webService.validateHelmNotation(inputSequence).then(function(valid) {
      expect(valid).toBe(false);            
    });
    $httpBackend.flush();
  });
 
  it('should return a valid molecular weight for getMolecularWeight for a valid HELM String', function() {
    $httpBackend.expect('GET', baseUrl + 'Calculation/MolecularWeight/' + inputSequence)
      .respond({MolecularWeight: 267.2413});
    webService.getMolecularWeight(inputSequence).then(function(response) {
      expect(response).toEqual(267.2413);           
    });
    $httpBackend.flush();
  });
 
  it('should return a valid molecular formula for getMolecularFormula for a valid HELM string', function() {
    $httpBackend.expect('GET', baseUrl + 'Calculation/MolecularFormula/' + inputSequence)
      .respond({MolecularFormula: 'C10H13N5O4'});
    webService.getMolecularFormula(inputSequence).then(function(response) {
      expect(response).toBe('C10H13N5O4');
    });
    $httpBackend.flush();
  });

  it('should return an extinction coefficient for getExtinctionCoefficient for a valid HELM sequence', function() {
    $httpBackend.expect('GET', baseUrl + 'Calculation/ExtinctionCoefficient/' + inputSequence)
      .respond({ExtinctionCoefficient: 15.34});
    webService.getExtinctionCoefficient(inputSequence).then(function(response) {
      expect(response).toBe(15.34);
    });
    $httpBackend.flush();
  });

  it('should return a Canonical HELM string for getConversionCanonical for a valid HELM string', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/Canonical/' + inputSequence)
      .respond({CanonicalHELM: 'RNA1{R(A)}$$$$V2.0'});
    webService.getConversionCanonical(inputSequence).then(function(response) {
      expect(response).toBe('RNA1{R(A)}$$$$V2.0');
    });
    $httpBackend.flush();
  });

  it('should return a standard HELM string for getConversionStandard for a valid HELM input', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/Standard/' + inputSequence)
      .respond({StandardHELM: 'RNA1{R(A)}$$$$V2.0'});
    webService.getConversionStandard(inputSequence).then(function(response) {
      expect(response).toBe('RNA1{R(A)}$$$$V2.0');
    });
    $httpBackend.flush();
  });

  it('should return a JSON string for getConversionJson for a valid HELM input', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/JSON/' + inputSequence)
      .respond({JSON: '{\n \'string\': \'value\'}'});
    webService.getConversionJson(inputSequence).then(function(response) {
      expect(response).toBe('{\n \'string\': \'value\'}');
    });
    $httpBackend.flush();
  });

  it('should return FASTA string for getFastaProduce for a valid HELM input', function() {
    $httpBackend.expect('GET', baseUrl + 'Fasta/Produce/' + inputSequence)
      .respond({FastaFile: '>RNA1 A '});
    webService.getFastaProduce(inputSequence).then(function(response) {
      expect(response).toBe('>RNA1 A ');
    });
    $httpBackend.flush();
  });

  it('should return a FASTA string for getFastaConvertRna for a valid HELM input', function() {
    helmSequence = 'RNA1{R(A)}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Convert/RNA/' + helmSequence)
      .respond({Sequence: 'A'});
    webService.getFastaConvertRna(helmSequence).then(function(response) {
      expect(response).toBe('A');
    });
    $httpBackend.flush();
  });

  it('should return a FASTA sequence for getFastaConvertPeptide for a valid HELM input', function() {
    helmSequence = 'PEPTIDE1{A}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Convert/PEPTIDE/' + helmSequence)
      .respond({Sequence: 'A'});
    webService.getFastaConvertPeptide(helmSequence).then(function(response) {
      expect(response).toBe('A');
    });
    $httpBackend.flush();
  });

  it('should return a HELM string for getFastaReadRna for a valid input', function() {
    helmSequence = 'RNA1{R(A)}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Read?RNA=' + 'A')
      .respond({HELMNotation: helmSequence});
    webService.getFastaReadRna('A').then(function(response) {
      expect(response).toBe(helmSequence);
    });
    $httpBackend.flush();
  });

  it('should return a HELM string for getFastaReadPeptide for a valid input', function() {
    helmSequence = 'PEPTIDE1{A}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Read?PEPTIDE=' + 'A')
      .respond({HELMNotation: helmSequence});
    webService.getFastaReadPeptide('A').then(function(response) {
      expect(response).toBe(helmSequence);
    });
    $httpBackend.flush();
  });
});
