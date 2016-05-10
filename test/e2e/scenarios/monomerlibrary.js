'use strict';

describe('monomer library', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  // idea was to catch the message while initializing, but seems like it's too slow
  // it('should display the placeholder immediately upon loading', function () {
  //   var monomerLibraryHolder = element(by.css('.library-column'));
  //   expect(monomerLibraryHolder.all(by.xpath('./div')).get(0).isDisplayed()).toBeTruthy();
  //   expect(monomerLibraryHolder.all(by.xpath('./div')).get(1).isDisplayed()).toBeTruthy();
  // });

  it('should display all three main types', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var libraryTypeHolder = monomerLibraryHolder.element(by.id('libraryTypeButtons'));
    var typeButtons = libraryTypeHolder.all(by.tagName('button'));
    expect(typeButtons.count()).toBe(3);
    expect(typeButtons.get(0).getText()).toBe('RNA');
    expect(typeButtons.get(0).getAttribute('class')).toContain('activetype');
    expect(typeButtons.get(1).getText()).toBe('PEPTIDE');
    expect(typeButtons.get(2).getText()).toBe('CHEM');
  });

  it('should be able to search for monomers by typing in some text', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    // make sure the right number are showing up for RNA
    var searchViewDisplay = element(by.id('searchViewDisplay'));
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);
    searchInput.sendKeys('a');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(51);
    searchInput.sendKeys('s');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(1);
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('nasP');
    searchInput.clear();
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);

    // make sure the right number are showing up for PEPTIDE
    var libraryTypeHolder = monomerLibraryHolder.element(by.id('libraryTypeButtons'));
    var typeButtons = libraryTypeHolder.all(by.tagName('button'));
    typeButtons.get(1).click();
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);
    searchInput.sendKeys('a');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(77);
    searchInput.sendKeys('s');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(7);
    searchInput.sendKeys('u');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(1);
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('Asu');
    searchInput.clear();
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);

    // make sure the right number are showing up for CHEM
    typeButtons.get(2).click();
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);
    searchInput.sendKeys('a');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(6);
    searchInput.sendKeys('lex');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(1);
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('Alexa');
    searchInput.clear();
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(0);
  });

  it('should be able to explore the RNA for a specific type of monomer', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var exploreViewDisplay = element(by.id('exploreViewDisplay'));
    
    // select the explore view
    expect(exploreViewDisplay.isDisplayed()).not.toBeTruthy();
    var viewSelector = monomerLibraryHolder.element(by.css('.view-selector'));
    viewSelector.all(by.tagName('button')).get(1).click();
    expect(exploreViewDisplay.isDisplayed()).toBeTruthy();

    // click on types until you reach one where there are elements displayed
    exploreViewDisplay.all(by.css('.category-holder')).get(0).element(by.tagName('button')).click();
    expect(exploreViewDisplay.all(by.css('.category-holder')).get(0).all(by.css('.monomer-directive')).count()).toBe(5);
    expect(exploreViewDisplay.all(by.css('.monomer-directive')).get(0).isDisplayed()).toBeTruthy();
    expect(exploreViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('A');   
  });

  it('should be able to explore the PEPTIDES for a specific type of monomer', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var exploreViewDisplay = element(by.id('exploreViewDisplay'));
    var libraryTypeHolder = monomerLibraryHolder.element(by.id('libraryTypeButtons'));
    var typeButtons = libraryTypeHolder.all(by.tagName('button'));
    
    // select the explore view
    expect(exploreViewDisplay.isDisplayed()).not.toBeTruthy();
    var viewSelector = monomerLibraryHolder.element(by.css('.view-selector'));
    viewSelector.all(by.tagName('button')).get(1).click();
    expect(exploreViewDisplay.isDisplayed()).toBeTruthy();

    // go to the peptides
    typeButtons.get(1).click();

    // click on types until you reach one where there are elements displayed
    exploreViewDisplay.all(by.css('.category-holder')).get(0).element(by.xpath('./button')).click();
    exploreViewDisplay.all(by.css('.sub-category-holder')).get(0).element(by.tagName('button')).click();
    expect(exploreViewDisplay.all(by.css('.sub-category-holder')).get(0).all(by.css('.monomer-directive')).count()).toBe(20);
    expect(exploreViewDisplay.all(by.css('.sub-category-holder')).get(0).all(by.css('.monomer-directive')).get(4).isDisplayed()).toBeTruthy();
    expect(exploreViewDisplay.all(by.css('.sub-category-holder')).get(0).all(by.css('.monomer-directive')).get(4).element(by.tagName('span')).getText()).toBe('F');
  });

  it('should be able to explore the CHEMs for a specific type of monomer', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var exploreViewDisplay = element(by.id('exploreViewDisplay'));
    var libraryTypeHolder = monomerLibraryHolder.element(by.id('libraryTypeButtons'));
    var typeButtons = libraryTypeHolder.all(by.tagName('button'));
    
    // select the explore view
    expect(exploreViewDisplay.isDisplayed()).not.toBeTruthy();
    var viewSelector = monomerLibraryHolder.element(by.css('.view-selector'));
    viewSelector.all(by.tagName('button')).get(1).click();
    expect(exploreViewDisplay.isDisplayed()).toBeTruthy();

    // go to the chems
    typeButtons.get(2).click();

    // click on types until you reach one where there are elements displayed
    expect(exploreViewDisplay.all(by.css('.category-holder')).get(4).all(by.css('.monomer-directive')).get(0).isDisplayed()).not.toBeTruthy();
    exploreViewDisplay.all(by.css('.category-holder')).get(4).element(by.tagName('button')).click();
    expect(exploreViewDisplay.all(by.css('.category-holder')).get(4).all(by.css('.monomer-directive')).count()).toBe(1);
    expect(exploreViewDisplay.all(by.css('.category-holder')).get(4).all(by.css('.monomer-directive')).get(0).isDisplayed()).toBeTruthy();
    expect(exploreViewDisplay.all(by.css('.category-holder')).get(4).all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('sDBL');
  });

  it('should be able to click on a monomer to select it', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    var searchViewDisplay = element(by.id('searchViewDisplay'));
    searchInput.sendKeys('as');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).count()).toBe(1);
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('nasP');
    searchViewDisplay.element(by.css('.monomer-directive')).click();
    
    // make sure it's selected
    expect(searchViewDisplay.element(by.css('.monomer-directive')).element(by.tagName('span')).getAttribute('class')).toContain('monomer-selected');

    // click it again to unselect it
    searchViewDisplay.element(by.css('.monomer-directive')).click();
    
    // make sure it's unselected
    expect(searchViewDisplay.element(by.css('.monomer-directive')).element(by.tagName('span')).getAttribute('class')).not.toContain('monomer-selected');    
  });
  
  it('should be able to double click on a monomer to get the details when it is not a fragment', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    var searchViewDisplay = element(by.id('searchViewDisplay'));
    searchInput.sendKeys('as');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('nasP');
    browser.actions().doubleClick(searchViewDisplay.element(by.css('.monomer-directive')).element(by.tagName('span'))).perform();
    browser.sleep(1500);
    
    // find the modal body
    var modalBody = element(by.css('.modal-body'));
    var table = modalBody.element(by.css('.table-full'));
    var rows = table.all(by.tagName('tr'));
    var idRow = rows.get(0);
    var typeRow = rows.get(5);
    expect(idRow.element(by.css('.table-label')).getText()).toBe('ID');
    expect(idRow.element(by.css('.table-data')).getText()).toBe('nasP');
    expect(typeRow.element(by.css('.table-label')).getText()).toBe('Monomer Type');
    expect(typeRow.element(by.css('.table-data')).getText()).toBe('Backbone');
  });

  it('should be able to double click on a monomer to get the details when it is a fragment', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    var searchViewDisplay = element(by.id('searchViewDisplay'));
    searchInput.sendKeys('a');
    expect(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span')).getText()).toBe('A');
    browser.actions().doubleClick(searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span'))).perform();
    browser.sleep(1500);
    
    // find the modal body
    var modalBody = element(by.css('.modal-body'));
    var table = modalBody.element(by.css('.table-full'));
    var rows = table.all(by.tagName('tr'));
    var idRow = rows.get(0);
    var notationRow = rows.get(2);
    expect(idRow.element(by.css('.table-label')).getText()).toBe('ID');
    expect(idRow.element(by.css('.table-data')).getText()).toBe('A');
    expect(notationRow.element(by.css('.table-label')).getText()).toBe('Fragment Notation');
    expect(notationRow.element(by.css('.table-data')).getText()).toBe('R(A)P');
  });

});
