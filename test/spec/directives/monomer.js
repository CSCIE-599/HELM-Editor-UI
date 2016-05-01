'use strict';

describe('Directive: monomer', function () {

  // load the directive's module
  beforeEach(module('helmeditor2App'));
  beforeEach(module('testDirectives'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();

    // set up what we need to test
    scope.monomer = {
      _name: 'ANewMonomer',
      _backgroundColor: 'White',
      _fontColor: 'Green',
      _shape: 'Rect'
    };
    scope.library = {
      convertBackgroundColorClass: function () {
        return 'monomer-background-color-white';
      },
      convertShapeClass: function () {
        return 'monomer-shape-rect';
      }
    };
  }));

  it('should create the monomer with the title as expected', inject(function ($compile) {
    element = angular.element('<div><monomer monomer="monomer" library="library"></monomer></div>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.children().find('span').text()).toContain('ANewMonomer');
  }));
});
