'use strict';

describe('basic web views and routing', function () {
  // start at the main page
  beforeEach(function () {
    browser.get('/');
  });

  it('should see the name of the application', function () {
    var appName = element(by.css('.navbar-brand')).getText();
    expect(appName).toEqual('HELM Editor 2.0');
  });

  it('should be able to navigate to /about', function () {
    // find the element, and ensure we have the right one
    var navbarList = element(by.css('.nav.navbar-nav')).all(by.tagName('li'));
    var aboutNav = navbarList.get(2);
    expect(aboutNav.getText()).toEqual('About');

    // now click it
    aboutNav.click();

    // make sure we're on the page
    expect(element(by.tagName('h3')).getText()).toEqual('HELM Editor 2.0 Project');
  });

  it('should be able to navigate to /habe', function () {
    // find the element, and ensure we have the right one
    var navbarList = element(by.css('.nav.navbar-nav')).all(by.tagName('li'));
    var habeNav = navbarList.get(1);
    expect(habeNav.getText()).toEqual('Antibody Editor');

    // now click it
    habeNav.click();

    // make sure we're on the page
    expect(element(by.tagName('h3')).getText()).toEqual('HELM Antibody Editor');
  });

  it('should be able to find the href of a resource on the about page', function () {
    browser.get('/#/about');

    // go to the first resource
    var resource = element(by.css('.outer')).all(by.tagName('ul')).first().all(by.tagName('a')).first();

    // make sure we went somewhere (doesn't matter where)
    expect(resource.getAttribute('href')).not.toContain('/#/about');
  });

  it('should be able to find the href of a team member on the about page', function () {
    browser.get('/#/about');

    // go to the first resource
    var resource = element(by.css('.outer')).all(by.tagName('ul')).last().all(by.tagName('a')).first();

    // make sure we went somewhere (doesn't matter where)
    expect(resource.getAttribute('href')).not.toContain('/#/about');
  });
});
