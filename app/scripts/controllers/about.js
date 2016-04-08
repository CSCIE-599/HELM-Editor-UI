'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('AboutCtrl', function () {
    var self = this;

    self.title = 'HELM Editor 2.0 Project';
    self.description = 'This project is an undertaking by students in CSCI-E 599 to port the HELM Editor UI, which is currently written in Java Swing to HTML5 and Javascript.';
    self.githubUrl = 'https://github.com/CSCIE-599/HELM-Editor-UI';
    self.team = [
      {
        name: 'Simili Abhilash',
        github: 'https://github.com/sabhilash'
      },
      {
        name: 'Stephanie Dube',
        github: 'https://github.com/stephdube'
      },
      {
        name: 'Thankam Girija',
        github: 'https://github.com/thankam'
      },
      {
        name: 'Sarah Leinicke',
        github: 'https://github.com/SarahL88'
      },
      {
        name: 'Chinedu Okongwu',
        github: 'https://github.com/cokongwu'
      },
      {
        name: 'Justin Sanford',
        github: 'https://github.com/jsanford8'
      }
    ];
    self.resources = [
      {
        name: 'Current HELM Editor Project',
        link: 'https://github.com/PistoiaHELM/HELMEditor'
      },
      {
        name: 'Pistoia Alliance\'s RFI for a HELM web-based editor 2.0',
        link: 'http://www.pistoiaalliance.org/rfi-published-helm-web-based-editor/'
      },
      {
        name: 'HELM Web-based Editor Conceptual Wireframes.pdf',
        link: 'https://drive.google.com/file/d/0BybDwk56P1wFd1UxcmlXVTdxa00/view?usp=sharing'
      },
      {
        name: 'HELM Wiki',
        link: 'https://pistoiaalliance.atlassian.net/wiki/display/PUB/HELM+Resources'
      },
      {
        name: 'HELM 2.0 Toolkit initial implementation',
        link: 'https://github.com/MarkusWeisser'
      }
    ];
  });
