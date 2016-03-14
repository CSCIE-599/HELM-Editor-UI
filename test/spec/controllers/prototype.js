'use strict';

describe('Controller: PrototypeCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var PrototypeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PrototypeCtrl = $controller('PrototypeCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PrototypeCtrl.awesomeThings.length).toBe(3);
  });
});
