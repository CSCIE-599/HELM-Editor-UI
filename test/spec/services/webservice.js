'use strict';

describe('Service: helmeditor2App.webService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App.webService'));

  // instantiate service
  var webService;
  beforeEach(inject(function (_webService_) {
    webService = _webService_;
  }));

  // Set up the httpbackend
  var $httpBackend;
  beforeEach(inject(function($injector) {
     $httpBackend = $injector.get('$httpBackend');
  }));

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

  it('should return a mock data for getHelmNotationRna', function() {
    $httpBackend.expect('GET', baseUrl + 'Sequence/RNA/' + inputSequence)
      .respond('mock data');
    webService.getHelmNotationRna(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getHelmNotationPeptide', function() {
    $httpBackend.expect('GET', baseUrl + 'Sequence/PEPTIDE/' + inputSequence)
      .respond('mock data');
    webService.getHelmNotationPeptide(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for validateHelmNotation', function() {
    $httpBackend.expect('GET', baseUrl + 'Validation/' + inputSequence)
      .respond('mock data');
    webService.validateHelmNotation(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });
 
  it('should return a mock data for getMolecularWeight', function() {
    $httpBackend.expect('GET', baseUrl + 'Calculation/MolecularWeight/' + inputSequence)
      .respond('mock data');
    webService.getMolecularWeight(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });
 
  it('should return a mock data for getMolecularFormula', function() {
    $httpBackend.expect('GET', baseUrl + 'Calculation/ExtinctionCoefficient/' + inputSequence)
      .respond('mock data');
    webService.getExtinctionCoefficient(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getConversionCanonical', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/Canonical/' + inputSequence)
      .respond('mock data');
    webService.getConversionCanonical(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getConversionStandard', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/Standard/' + inputSequence)
      .respond('mock data');
    webService.getConversionStandard(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getConversionJson', function() {
    $httpBackend.expect('GET', baseUrl + 'Conversion/JSON/' + inputSequence)
      .respond('mock data');
    webService.getConversionJson(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getFastaProduce', function() {
    $httpBackend.expect('GET', baseUrl + 'Fasta/Produce/' + inputSequence)
      .respond('mock data');
    webService.getFastaProduce(inputSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getFastaConvertRna', function() {
    helmSequence = 'RNA1{R(A)}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Convert/RNA/' + helmSequence)
      .respond('mock data');
    webService.getFastaConvertRna(helmSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getFastaConvertPeptide', function() {
    helmSequence = 'PEPTIDE1{A}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Convert/PEPTIDE/' + helmSequence)
      .respond('mock data');
    webService.getFastaConvertPeptide(helmSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getFastaReadRna', function() {
    helmSequence = 'RNA1{R(A)}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Read?RNA=' + helmSequence)
      .respond('mock data');
    webService.getFastaReadRna(helmSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
  });

  it('should return a mock data for getFastaReadPeptide', function() {
    helmSequence = 'PEPTIDE1{A}$$$$V2.0';
    $httpBackend.expect('GET', baseUrl + 'Fasta/Read?PEPTIDE=' + helmSequence)
      .respond('mock data');
    webService.getFastaReadPeptide(helmSequence).success(function(data) {
      result = data;            
    });
    $httpBackend.flush();
    expect(result).toContain('mock data'); 
   });
});
