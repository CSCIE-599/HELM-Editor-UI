'use strict';

describe('HELM editor', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  it('should be able to add a monomer by click-click', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    // find a monomer to add
    var searchViewDisplay = element(by.id('searchViewDisplay'));
    searchInput.sendKeys('a');
    var monomerA = searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span'));
    expect(monomerA.getText()).toBe('A');
    expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');

    // click it then click on the SVG
    monomerA.click();
    expect(monomerA.getAttribute('class')).toContain('monomer-selected');    
    element(by.id('mainCanvas')).click();

    // expect the monomer to be unselected
    expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');

    // and for the HELM to be updated
    expect(element(by.id('helmNotationSpan')).getText()).toContain('RNA1{R(A)P}$$$$');
  });

  // the drag and drop test should be added, but seem to be blocked
  // by a known issue: https://github.com/angular/protractor/issues/123
  // it('should be able to add a monomer by drag-drop', function () {
  //   var monomerLibraryHolder = element(by.css('.library-column'));
  //   var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

  //   // find a monomer to add
  //   var searchViewDisplay = element(by.id('searchViewDisplay'));
  //   searchInput.sendKeys('a');
  //   var monomerA = searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span'));
  //   expect(monomerA.getText()).toBe('A');
  //   expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');
  //   var svg = element(by.id('mainCanvas'));

  //   // drag and drop it
  //   browser.actions().
  //     mouseDown(monomerA).
  //     mouseMove(svg).
  //     mouseUp().
  //     perform();
  //   // browser.actions().dragAndDrop(monomerA, svg).mouseUp().perform();

  //   // expect the monomer to be unselected
  //   expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');

  //   // and for the HELM to be updated
  //   expect(element(by.id('helmNotationSpan')).getText()).toContain('RNA1{R(A)P}$$$$');
  // });

  it('should be able to add a monomer by click-click even if there is already a sequence there', function () {
    var monomerLibraryHolder = element(by.css('.library-column'));
    var searchInput = monomerLibraryHolder.element(by.css('.search-input'));

    // find a monomer to add
    var searchViewDisplay = element(by.id('searchViewDisplay'));
    searchInput.sendKeys('a');
    var monomerA = searchViewDisplay.all(by.css('.monomer-directive')).get(0).element(by.tagName('span'));
    expect(monomerA.getText()).toBe('A');
    expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');

    // click it then click on the SVG
    monomerA.click();
    expect(monomerA.getAttribute('class')).toContain('monomer-selected');    
    element(by.id('mainCanvas')).click();

    // expect the monomer to be unselected
    expect(monomerA.getAttribute('class')).not.toContain('monomer-selected');

    // and for the HELM to be updated
    expect(element(by.id('helmNotationSpan')).getText()).toContain('RNA1{R(A)P}$$$$');

    // do it all again (dA this time)
    var monomerdA = searchViewDisplay.all(by.css('.monomer-directive')).get(1).element(by.tagName('span'));
    expect(monomerdA.getText()).toBe('dA');
    expect(monomerdA.getAttribute('class')).not.toContain('monomer-selected');
    monomerdA.click();
    expect(monomerdA.getAttribute('class')).toContain('monomer-selected');    
    element(by.id('mainCanvas')).click();
    expect(monomerdA.getAttribute('class')).not.toContain('monomer-selected');
    expect(element(by.id('helmNotationSpan')).getText()).toContain('RNA1{R(A)P}|RNA2{[dR](A)P}$$$$');
  });

  it('should be able to delete a node from the middle of a PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADCADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C.A.D.C}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(6);
    expect(connections.count()).toBe(5);
    var node = nodes.get(2);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D}|PEPTIDE2{A.D.C}$$$$V2.0');
    expect(nodes.count()).toBe(5);
    expect(connections.count()).toBe(3);
  });

  it('should be able to delete a node from the beginning of a PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADCADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C.A.D.C}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(6);
    expect(connections.count()).toBe(5);
    var node = nodes.get(0);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{D.C.A.D.C}$$$$V2.0');
    expect(nodes.count()).toBe(5);
    expect(connections.count()).toBe(4);
  });
  
  it('should be able to delete a node from the end of a PEPTIDE sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(2).click();
    element(by.css('.ng-modal textarea')).sendKeys('ADCADC');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C.A.D.C}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(6);
    expect(connections.count()).toBe(5);
    var node = nodes.get(5);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.D.C.A.D}$$$$V2.0');
    expect(nodes.count()).toBe(5);
    expect(connections.count()).toBe(4);
  });

  it('should be able to delete a node from a CHEM sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('CHEM1{[SMCC]}|PEPTIDE1{A.C.A}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('CHEM1{[SMCC]}|PEPTIDE1{A.C.A}$$$$');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(4);
    expect(connections.count()).toBe(2);
    var node = nodes.get(0);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('PEPTIDE1{A.C.A}$$$$');
    expect(nodes.count()).toBe(3);
    expect(connections.count()).toBe(2);
  });

  it('should be able to delete a ribose node from the end of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AdTfCmUA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(14);
    expect(connections.count()).toBe(13);
    var node = nodes.get(12);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P}$$$$V2.0');
    expect(nodes.count()).toBe(12);
    expect(connections.count()).toBe(11);
  });

  it('should be able to delete a phosphate node from the end of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P}$$$$');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(12);
    expect(connections.count()).toBe(11);
    var node = nodes.get(11);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)}$$$$');
    expect(nodes.count()).toBe(11);
    expect(connections.count()).toBe(10);
  });

  it('should be able to delete a ribose node from the beginning of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AdTfCmUA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(14);
    expect(connections.count()).toBe(13);
    var node = nodes.get(0);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');
    expect(nodes.count()).toBe(12);
    expect(connections.count()).toBe(11);
  });

  it('should be able to delete a phosphate node from the beginning of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(0).click();
    element(by.css('.ng-modal textarea')).sendKeys('RNA1{P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(12);
    expect(connections.count()).toBe(11);
    var node = nodes.get(0);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$');
    expect(nodes.count()).toBe(11);
    expect(connections.count()).toBe(10);
  });

  it('should be able to delete a ribose node from the middle of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AdTfCmUA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(14);
    expect(connections.count()).toBe(13);
    var node = nodes.get(6);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P}|RNA2{P.[mR](U)P.R(A)}$$$$V2.0');
    expect(nodes.count()).toBe(12);
    expect(connections.count()).toBe(10);
  });

  it('should be able to delete a phosphate node from the middle of an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AdTfCmUA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(14);
    expect(connections.count()).toBe(13);
    var node = nodes.get(5);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)}|RNA2{[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');
    expect(nodes.count()).toBe(13);
    expect(connections.count()).toBe(11);
  });

  it('should be able to delete a branch node from an RNA sequence', function () {
    // load the dialog and type in a known correct sequence
    element(by.css('.left-controls')).all(by.css('button')).first().click();
    element(by.css('.ng-modal select')).all(by.tagName('option')).get(1).click();
    element(by.css('.ng-modal textarea')).sendKeys('AdTfCmUA');
    element(by.id('modalLoadButton')).click();
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR](C)P.[mR](U)P.R(A)}$$$$V2.0');

    // find the node we want to delete
    var graphHolder = element(by.css('#mainCanvas > g'));
    var nodes = graphHolder.all(by.css('rect.node-cover'));
    var connections = graphHolder.all(by.css('path.path-style'));
    expect(nodes.count()).toBe(14);
    expect(connections.count()).toBe(13);
    var node = nodes.get(7);

    // click it and delete it 
    node.click();
    element(by.id('canvas')).sendKeys(protractor.Key.DELETE);

    // make sure it updates the nodes and HELM
    expect(element(by.id('helmNotationSpan')).getText()).toBe('RNA1{R(A)P.[dR](T)P.[fR]P.[mR](U)P.R(A)}$$$$V2.0');
    expect(nodes.count()).toBe(13);
    expect(connections.count()).toBe(12);
  });

});
