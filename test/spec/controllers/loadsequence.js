'use strict';

describe('Controller: LoadsequenceCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var LoadsequenceCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LoadsequenceCtrl = $controller('LoadsequenceCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(LoadsequenceCtrl.awesomeThings.length).toBe(3);
  });
});
