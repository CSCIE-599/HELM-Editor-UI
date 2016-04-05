'use strict';

describe('Controller: HeaderCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var HeaderCtrl,
    scope,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    location = $location;
    HeaderCtrl = $controller('HeaderCtrl', {
      $scope: scope
    });
  }));

  it('should match a valid path', function () {
    location.path('/');
    expect(HeaderCtrl.isActive('/')).toBe(true);
  });

  it('should match a complete path', function () {
    location.path('/about');
    expect(HeaderCtrl.isActive('/about')).toBe(true);
  });

  it('should not match if location is not complete', function () {
    location.path('/startend');
    expect(HeaderCtrl.isActive('/start')).toBe(false);
  });

  it('should not match if path is not complete', function () {
    location.path('/start');
    expect(HeaderCtrl.isActive('/startend')).toBe(false);
  });
});
