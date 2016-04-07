'use strict';

describe('Controller: HabeCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var HabeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HabeCtrl = $controller('HabeCtrl', {
      $scope: scope
    });
  }));

  it('should have the correct title', function () {
    expect(HabeCtrl.title).toBe('HELM Antibody Editor');
  });

  it('should have the correct description', function () {
    expect(HabeCtrl.description).toBe('This editor is currently under development, sorry!');
  });
});
