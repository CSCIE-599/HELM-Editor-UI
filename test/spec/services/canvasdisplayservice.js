'use strict';

describe('Service: CanvasDisplayService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var CanvasDisplayService;
  beforeEach(inject(function (_CanvasDisplayService_) {
    CanvasDisplayService = _CanvasDisplayService_;
  }));

  it('should do something', function () {
    expect(!!CanvasDisplayService).toBe(true);
  });

});
