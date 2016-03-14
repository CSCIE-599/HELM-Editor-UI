'use strict';

describe('Service: webservice', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var webservice;
  beforeEach(inject(function (_webservice_) {
    webservice = _webservice_;
  }));

  it('should do something', function () {
      var result = webservice.getHelmImage('PEPTIDE1{A}$$$$V2.0');
      expect(result).not.toBe(null);
  });
});
