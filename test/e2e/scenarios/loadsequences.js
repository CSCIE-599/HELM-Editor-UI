'use strict';

describe('loading sequences', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  it('should be able load the load sequence modal dialog and hide it', function () {
    // find the modal dialog (it always exists)
    var modalDialog = element(by.css('.ng-modal'));
    expect(modalDialog.isDisplayed()).not.toBeTruthy();
    
    // and the overlay that we'll click to hide it again
    var modalOverlay = element(by.css('.ng-modal > .ng-modal-overlay'));
    expect(modalOverlay.isDisplayed()).not.toBeTruthy();

    // and the close button
    var modalCloseButton = element(by.css('.ng-modal > .ng-modal-dialog > .ng-modal-close'));
    // using width and height to check visibility, rather than isDisplayed() to work around firefox issue
    // with the div under another div
    modalCloseButton.getAttribute('clientWidth').then(function (val) {
      expect(parseInt(val)).toBe(0);
    });
    modalCloseButton.getAttribute('clientHeight').then(function (val) {
      expect(parseInt(val)).toBe(0);
    });
    modalCloseButton.getCssValue('visibility').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getCssValue('display').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getAttribute('class').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getAttribute('hidden').then(function (val) {
      console.log(val);
    });

    // load it by pressing the Load button
    var loadButton = element(by.css('.left-controls')).all(by.css('button')).first();
    loadButton.click();
    // using width and height to check visibility, rather than isDisplayed() to work around firefox issue
    // with the div under another div
    modalCloseButton.getAttribute('clientWidth').then(function (val) {
      expect(parseInt(val)).toBeGreaterThan(0);
    });
    modalCloseButton.getAttribute('clientHeight').then(function (val) {
      expect(parseInt(val)).toBeGreaterThan(0);
    });
    modalCloseButton.getCssValue('visibility').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getCssValue('display').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getAttribute('class').then(function (val) {
      console.log(val);
    });
    modalCloseButton.getAttribute('hidden').then(function (val) {
      console.log(val);
    });
    expect(modalDialog.isDisplayed()).toBeTruthy();
    expect(modalOverlay.isDisplayed()).toBeTruthy();

    // close it by pressing the close button
    modalCloseButton.click();
    expect(modalDialog.isDisplayed()).not.toBeTruthy();
    expect(modalOverlay.isDisplayed()).not.toBeTruthy();
    expect(modalCloseButton.isDisplayed()).not.toBeTruthy();

    // load it again and close it by pressing the overlay
    loadButton.click();
    expect(modalDialog.isDisplayed()).toBeTruthy();
    expect(modalOverlay.isDisplayed()).toBeTruthy();
    expect(modalCloseButton.isDisplayed()).toBeTruthy();
    // have to explicitly click on 1/1 to make sure it's the overlay and not antyhing on top of it
    browser.actions().mouseMove(modalOverlay, {x: 1, y: 1}).click().perform();
    expect(modalDialog.isDisplayed()).not.toBeTruthy();
    expect(modalOverlay.isDisplayed()).not.toBeTruthy();
    expect(modalCloseButton.isDisplayed()).not.toBeTruthy();
  });

  /* Known wrong sequences loaded from web service */
  it('should show an error for a known incorrect PEPTIDE sequence', function () {
    // load the dialog and type in a known incorrect sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('dAA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.css('.message-span')).getText()).toContain('Not appropriate amino acid for HELM');
  });

  it('should show an error for a known incorrect RNA sequence', function () {
    // load the dialog and type in a known incorrect sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AZD');
    element(by.id('modalLoadButton')).click();
    expect(element(by.css('.message-span')).getText()).toContain('Sequence contains unknown nucleotide');
  });

  it('should show an error for a known incorrect HELM sequence', function () {
    // load the dialog and type in a known incorrect sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('RNA1{A}|RNA2{}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.css('.message-span')).getText()).toContain('HELMNotation is not valid');
  });

  /* Known correct sequences loaded from web service */
  it('should load a known correct PEPTIDE sequence and display the resulting HELM and SVG graph', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C}$$$$V2.0');

    // check the graph
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodesAndConnections = graphHolder.all(by.css('g'));
    // 8 overall - 2 connections, 3 nodes (and 3 starting locations)
    expect(nodesAndConnections.count()).toBe(8);
    var connections = graphHolder.all(by.css('path.path-style'));
    var nodes = graphHolder.all(by.css('rect.node-rect'));
    var startingLocations = graphHolder.all(by.css('path.path-draw'));
    expect(connections.count()).toBe(2);
    expect(nodes.count()).toBe(3);
    expect(startingLocations.count()).toBe(3);
  });

  it('should load a known correct RNA sequence and display the resulting HELM and SVG graph', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('mAATGdC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{[mR](A)P.R(A)P.R(T)P.R(G)P.[dR](C)}$$$$V2.0');

    // check the graph
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodesAndConnections = graphHolder.all(by.css('g'));
    // 41 overall - 13 connections, 14 nodes (and 14 starting locations)
    expect(nodesAndConnections.count()).toBe(41);
    var connections = graphHolder.all(by.css('path.path-style'));
    var nodes = graphHolder.all(by.css('rect.node-rect'));
    var startingLocations = graphHolder.all(by.css('path.path-draw'));
    expect(connections.count()).toBe(13);
    expect(nodes.count()).toBe(14);
    expect(startingLocations.count()).toBe(14);
  });

  it('should load a known correct single-sequence HELM display the resulting HELM and SVG graph', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('RNA1{[mR](A)P.R(C)}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{[mR](A)P.R(C)}$$$$');

    // check the graph
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodesAndConnections = graphHolder.all(by.css('g'));
    // 14 overall - 4 connections, 5 nodes (and 5 starting locations)
    expect(nodesAndConnections.count()).toBe(14);
    var connections = graphHolder.all(by.css('path.path-style'));
    var nodes = graphHolder.all(by.css('rect.node-rect'));
    var startingLocations = graphHolder.all(by.css('path.path-draw'));
    expect(connections.count()).toBe(4);
    expect(nodes.count()).toBe(5);
    expect(startingLocations.count()).toBe(5);
  });

  it('should load a known correct multi-sequence HELM display the resulting HELM and SVG graph', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('RNA1{[mR](A)P.R(C)}|PEPTIDE1{A.C.D.F.H}|CHEM1{[SMCC]}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{[mR](A)P.R(C)}|PEPTIDE1{A.C.D.F.H}|CHEM1{[SMCC]}$$$$');

    // check the graph
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodesAndConnections = graphHolder.all(by.css('g'));
    // 30 overall - 8 connections, 11 nodes (and 11 starting locations)
    expect(nodesAndConnections.count()).toBe(30);
    var connections = graphHolder.all(by.css('path.path-style'));
    var nodes = graphHolder.all(by.css('rect.node-rect'));
    var startingLocations = graphHolder.all(by.css('path.path-draw'));
    expect(connections.count()).toBe(8);
    expect(nodes.count()).toBe(11);
    expect(startingLocations.count()).toBe(11);
  });

  it('should load a known correct single-sequence HELM with cycle and display the resulting HELM and SVG graph', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('PEPTIDE1{A.C.D.F.H.I}$PEPTIDE1,PEPTIDE1,1:R1-6:R2$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.C.D.F.H.I}$PEPTIDE1,PEPTIDE1,1:R1-6:R2$$$');

    // check the graph
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodesAndConnections = graphHolder.all(by.css('g'));
    // 18 overall - 6 connections, 6 nodes (and 6 starting locations)
    expect(nodesAndConnections.count()).toBe(18);
    var connections = graphHolder.all(by.css('path.path-style'));
    var nodes = graphHolder.all(by.css('rect.node-rect'));
    var startingLocations = graphHolder.all(by.css('path.path-draw'));
    expect(connections.count()).toBe(6);
    expect(nodes.count()).toBe(6);
    expect(startingLocations.count()).toBe(6);
  });

  it('should warn the user when a sequence is loaded with two cycles', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('PEPTIDE1{A.C.A.C.A.C.A.C.A}$PEPTIDE1,PEPTIDE1,1:R2-4:R2|PEPTIDE1,PEPTIDE1,6:R2-9:R2$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.C.A.C.A.C.A.C.A}$PEPTIDE1,PEPTIDE1,1:R2-4:R2|PEPTIDE1,PEPTIDE1,6:R2-9:R2$$$');

    // check the warning
    expect(element(by.css('.message-span')).getText()).toContain('Warning. The HELM Editor does not support sequences with multiple cycles.');
  });
});
