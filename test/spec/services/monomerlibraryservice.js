'use strict';

describe('Service: MonomerLibraryService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App.MonomerLibrary'));

  // instantiate service
  var MonomerLibraryService, $httpBackend;
  beforeEach(inject(function (_MonomerLibraryService_, _$httpBackend_) {
    MonomerLibraryService = _MonomerLibraryService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.expect('GET', 'DefaultMonomerCategorizationTemplate.xml').respond('<x></x>');
    $httpBackend.expect('GET', 'MonomerDBGZEncoded.xml').respond('<x></x>');
    $httpBackend.flush();
  }));

  // after each test, make sure to validate that there are no outstanding requests
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should do something', function () {
    //console.log(MonomerLibraryService.getCategorizedDB());
    expect(!!MonomerLibraryService).toBe(true);
  });

});
