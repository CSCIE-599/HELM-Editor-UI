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
    'ngTouch'
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
      .when('/prototype', {
        templateUrl: 'views/prototype.html',
        controller: 'PrototypeCtrl',
        controllerAs: 'prototype'
      })
      .when('/loadsequence', {
        templateUrl: 'views/loadsequence.html',
        controller: 'LoadsequenceCtrl',
        controllerAs: 'loadsequence'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
