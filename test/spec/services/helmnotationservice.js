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

});
