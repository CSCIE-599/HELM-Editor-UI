'use strict';

describe('Directive: helmCanvas', function () {

  // load the directive's module
  beforeEach(module('helmeditor2App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<helm-canvas></helm-canvas>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the helmCanvas directive');
  }));
});
