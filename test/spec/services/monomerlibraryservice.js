'use strict';

describe('Service: MonomerLibraryService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var MonomerLibraryService;
  beforeEach(inject(function (_MonomerLibraryService_) {
    MonomerLibraryService = _MonomerLibraryService_;
  }));

  it('should do something', function () {
    expect(!!MonomerLibraryService).toBe(true);
  });

});
