'use strict';

describe('Controller: AboutCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var AboutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AboutCtrl = $controller('AboutCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should have the correct GitHub URL', function () {
    expect(AboutCtrl.githubUrl).toBe('https://github.com/CSCIE-599/HELM-Editor-UI');
  });

  it('should have the correct title', function () {
    expect(AboutCtrl.title).toBe('HELM Editor 2.0 Project');
  });

  it('should have the correct description', function () {
    expect(AboutCtrl.description).toBe('This project is an undertaking by students in CSCI-E 599 to port the HELM Editor UI, which is currently written in Java Swing to HTML5 and Javascript.');
  });

  it('should have at least one team member, with a name and a github property', function () {
    expect(AboutCtrl.team.length).toBeGreaterThan(0);
    var member = AboutCtrl.team[0];
    expect(member.name).not.toBeNull();
    expect(member.github).not.toBeNull();
  });

  it('should have at least one resource, with a name and a link', function () {
    expect(AboutCtrl.resources.length).toBeGreaterThan(0);
    var resource = AboutCtrl.resources[0];
    expect(resource.name).not.toBeNull();
    expect(resource.link).not.toBeNull();
  });
});
