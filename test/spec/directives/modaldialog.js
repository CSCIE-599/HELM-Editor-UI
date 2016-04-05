'use strict';

describe('Directive: modalDialog', function () {

  // load the directive's module
  beforeEach(module('helmeditor2App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make modaldialog element exist', inject(function ($compile) {
    element = angular.element('<modal-dialog show="modalShown"><div class="header">Load Sequence</div></modal-dialog>');
    element = $compile(element)(scope);
    expect(!!element).toBe(true);
  }));
});
