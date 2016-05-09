'use strict';

describe('lower canvas functions', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  it('should be able to display the HELM notation of a known PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C}$$$$V2.0');
  });

  it('should be able to display the simplified sequence for a known PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C}$$$$V2.0');

    // select the Sequence option
    expect(element(by.css('.canvas-row-bottom .canvas-container')).isDisplayed()).not.toBeTruthy();
    element(by.css('.canvas-row-bottom select')).all(by.tagName('option')).get(1).click();
    expect(element(by.css('.canvas-row-bottom .canvas-container')).isDisplayed()).toBeTruthy();

    var graphHolder = element(by.css('.canvas-row-bottom .canvas-container svg > g'));
    expect(graphHolder.all(by.css('g')).count()).toBe(3);
  });

  it('should be able to display the simplified sequence for a known PEPTIDE cycle', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('PEPTIDE1{A.D.C.A}$PEPTIDE1,PEPTIDE1,1:R2-4:R2$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C.A}$PEPTIDE1,PEPTIDE1,1:R2-4:R2$$$');

    // select the Sequence option
    expect(element(by.css('.canvas-row-bottom .canvas-container')).isDisplayed()).not.toBeTruthy();
    element(by.css('.canvas-row-bottom select')).all(by.tagName('option')).get(1).click();
    expect(element(by.css('.canvas-row-bottom .canvas-container')).isDisplayed()).toBeTruthy();

    var graphHolder = element(by.css('.canvas-row-bottom .canvas-container svg > g'));
    expect(graphHolder.all(by.css('g')).count()).toBe(4);
  });

  it('should be able to display the molecular properties table for a known PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C}$$$$V2.0');

    // select the Molecular Properties option
    expect(element(by.css('.canvas-row-bottom .molecule-table')).isDisplayed()).not.toBeTruthy();
    element(by.css('.canvas-row-bottom select')).all(by.tagName('option')).get(2).click();
    expect(element(by.css('.canvas-row-bottom .molecule-table')).isDisplayed()).toBeTruthy();
  });
});