'use strict';

describe('Service: HelmConversionService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var HelmConversionService;
  beforeEach(inject(function (_HelmConversionService_) {
    HelmConversionService = _HelmConversionService_;
  }));

  it('should do something', function () {
    expect(!!HelmConversionService).toBe(true);
  });

});
