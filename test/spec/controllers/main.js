'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var MainCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of polymerTypes to the scope', function () {
    expect(MainCtrl.polyTypes.length).toBe(3);
  });

 it('should validate the polytypes dropdown', function () {
    expect(MainCtrl.polyTypes[0].value).toBe('HELM');
    expect(MainCtrl.polyTypes[1].value).toBe('RNA');
    expect(MainCtrl.polyTypes[2].value).toBe('PEPTIDE');
  });

});
