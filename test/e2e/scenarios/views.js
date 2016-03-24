'use strict';

describe('basic web views', function() {
  it('should get the name of the application', function() {
    browser.get('#');

    var appName = element(by.css('.navbar-brand')).getText();
    expect(appName).toEqual('HELM Editor 2.0');
  });

  /*
  describe('todo list', function() {
    // do something?
  });
  */
});
