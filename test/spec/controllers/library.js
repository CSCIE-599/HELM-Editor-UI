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

  it('should be able to transform properties to background color classes', function () {
    expect(LibraryCtrl.convertBackgroundColorClass('White')).toBe('monomer-background-color-white');
    expect(LibraryCtrl.convertBackgroundColorClass('Light_Violet')).toBe('monomer-background-color-light-violet');
    expect(LibraryCtrl.convertBackgroundColorClass('Green')).toBe('monomer-background-color-green');
    expect(LibraryCtrl.convertBackgroundColorClass('Red')).toBe('monomer-background-color-red');
    expect(LibraryCtrl.convertBackgroundColorClass('Orange')).toBe('monomer-background-color-orange');
    expect(LibraryCtrl.convertBackgroundColorClass('Cyan')).toBe('monomer-background-color-cyan');
    expect(LibraryCtrl.convertBackgroundColorClass('Light_Cyan')).toBe('monomer-background-color-light-cyan');
    expect(LibraryCtrl.convertBackgroundColorClass('Purple')).toBe('monomer-background-color-purple');
  });

  it('should be able to transform properties to font color classes', function () {
    expect(LibraryCtrl.convertFontColorClass('White')).toBe('monomer-font-color-white');
    expect(LibraryCtrl.convertFontColorClass('Green')).toBe('monomer-font-color-green');
    expect(LibraryCtrl.convertFontColorClass('Red')).toBe('monomer-font-color-red');
    expect(LibraryCtrl.convertFontColorClass('Orange')).toBe('monomer-font-color-orange');
    expect(LibraryCtrl.convertFontColorClass('Cyan')).toBe('monomer-font-color-cyan');
    expect(LibraryCtrl.convertFontColorClass('Black')).toBe('monomer-font-color-black');
  });

  it('should be able to transform properties to shape classes', function () {
    expect(LibraryCtrl.convertShapeClass('No')).toBe('monomer-shape-no');
    expect(LibraryCtrl.convertShapeClass('Rectangle')).toBe('monomer-shape-rect');
    expect(LibraryCtrl.convertShapeClass('Rhomb')).toBe('monomer-shape-rhomb');
    expect(LibraryCtrl.convertShapeClass('Circle')).toBe('monomer-shape-circle');
    expect(LibraryCtrl.convertShapeClass('Hexagon')).toBe('monomer-shape-hexagon');
  });

  it('should set a default category to ""', function () {
    expect(LibraryCtrl.activeCategory).toBe('');
  });

  it('should set a default subCategory to ""', function () {
    expect(LibraryCtrl.activeSubCategory).toBe('');
  });

  // TODO - should probably test getCategories and getMonomers
});
