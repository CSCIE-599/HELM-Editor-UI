'use strict';

/**
 * @ngdoc overview
 * @name helmeditor2App
 * @description
 * # helmeditor2App
 *
 * Main module of the application.
 */

angular
  .module('helmeditor2App', [
    'ngAnimate', 
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'helmeditor2App.webService',
    'helmeditor2App.MonomerLibrary',
    'ngFileSaver',
    'ui.bootstrap',
    'ui.bootstrap.tpls'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/habe', {
        templateUrl: 'views/habe.html',
        controller: 'HabeCtrl',
        controllerAs: 'habe'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
