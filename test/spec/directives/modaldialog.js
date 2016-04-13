'use strict';

describe('Directive: modalDialog', function () {
  var $compile;
  var directiveEl;
  var scope;

  // set up the tests
  beforeEach(function () {
    // load the module and the templates
    module('helmeditor2App');
    module('testDirectives');

    inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      scope = $rootScope.$new();
    });

    // create our dummy element to test
    var element = angular.element('' + 
      '<div>' + 
        '<modal-dialog show="modalShown">' + 
          '<div class="container">' + 
            '<div class="header">Load Sequence</div>' + 
            '<span>Lorem ipsum dolor mit</span>' + 
          '</div>' + 
        '</modal-dialog>' +
      '</div>');
    directiveEl = $compile(element)(scope);
    scope.$digest();
  });

  it('should make a modal-dialog with the appropriate class', inject(function () {
    expect(directiveEl.children().length).toBe(1);
    var dialog = directiveEl.children().eq(0);
    expect(dialog).toBeDefined();
    expect(dialog.hasClass('ng-modal')).toBe(true);
  }));

  it('should make a modal-dialog with two children', inject(function () {
    var dialog = directiveEl.children().eq(0);
    expect(dialog.children().length).toBe(2);
  }));

  it('should make a modal-dialog where the first child is the overlay', inject(function () {
    var dialog = directiveEl.children().eq(0);
    var first = dialog.children().eq(0);
    expect(first).toBeDefined();
    expect(first.hasClass('ng-modal-overlay')).toBe(true);
  }));

  it('should make a modal-dialog where the second child is the actual dialog, with the first child being a close button', inject(function () {
    var dialog = directiveEl.children().eq(0);
    var second = dialog.children().eq(1);
    expect(second).toBeDefined();
    expect(second.hasClass('ng-modal-dialog')).toBe(true);
    expect(second.children().length).toBe(2);
    expect(second.children().eq(0).hasClass('ng-modal-close')).toBe(true);
  }));

  it('should make modal-dialog element with the entire transcluded content, in the right place', inject(function () {
    var dialog = directiveEl.children().eq(0);
    var second = dialog.children().eq(1);
    var transcluded = second.children().eq(1);
    expect(transcluded).toBeDefined();
    expect(transcluded.hasClass('ng-modal-dialog-content')).toBe(true);
    expect(transcluded.children().length).toBe(1);
    var content = transcluded.children().eq(0);
    expect(content.hasClass('container'));
    expect(content.children().length).toBe(2);
    expect(content.find('div').hasClass('header')).toBe(true);
    expect(content.find('div').html()).toEqual('Load Sequence');
    expect(content.find('span').html()).toEqual('Lorem ipsum dolor mit');
  }));

  it('should be able to switch whether it is shown or not', inject(function () {
    var dialog = directiveEl.children().eq(0);
    var isolatedScope = dialog.isolateScope();
    isolatedScope.show = true;
    expect(typeof isolatedScope.hideModal).toBe('function');
    expect(isolatedScope.show).toBe(true);
    isolatedScope.hideModal();
    expect(isolatedScope.show).toBe(false);
  }));
});
