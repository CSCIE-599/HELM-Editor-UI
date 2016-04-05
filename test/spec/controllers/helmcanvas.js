'use strict';

describe('Controller: HelmcanvasCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var HelmcanvasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HelmcanvasCtrl = $controller('HelmcanvasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(HelmcanvasCtrl.awesomeThings.length).toBe(3);
  });
});
