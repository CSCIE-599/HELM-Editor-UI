'use strict';

describe('monomer library', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  it('should display the placeholder immediately upon loading', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    expect(monomerLibraryHolder.element(by.tagName('div')).last().isDisplayed()).toBeTruthy();
  });

  // it('should display all three main types', function () {
  //   var monomerLibraryHolder = element(by.css('.library-column'));

  // });

});