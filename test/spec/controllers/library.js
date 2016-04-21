'use strict';

describe('Controller: LibraryCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var LibraryCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LibraryCtrl = $controller('LibraryCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should have the default type to be RNA', function () {
    expect(LibraryCtrl.activeType).toBe('RNA');
  });

  it('should show the explore view by default', function () {
    expect(LibraryCtrl.exploreViewVisible).toBe(false);
    expect(LibraryCtrl.searchViewVisible).toBe(true);
  });

  it('should be able to toggle which view is visible', function () {
    // set search view visible
    LibraryCtrl.setViewVisible('search');
    expect(LibraryCtrl.searchViewVisible).toBe(true);
    expect(LibraryCtrl.exploreViewVisible).toBe(false);
    // set explore visible
    LibraryCtrl.setViewVisible('explore');
    expect(LibraryCtrl.searchViewVisible).toBe(false);
    expect(LibraryCtrl.exploreViewVisible).toBe(true);
  });

  it('should not change any view visible if unkown value passed', function () {
    var searchVisible = LibraryCtrl.searchViewVisible;
    var exploreVisible = LibraryCtrl.exploreViewVisible;
    LibraryCtrl.setViewVisible('foo');
    expect(LibraryCtrl.searchViewVisible).toBe(searchVisible);
    expect(LibraryCtrl.exploreViewVisible).toBe(exploreVisible);
  });
});
