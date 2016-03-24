'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:LoadsequenceCtrl
 * @description
 * # LoadsequenceCtrl
 * Controller of the helmeditor2App
 */

angular.module('helmeditor2App')
  .controller('LoadsequenceCtrl', ['$scope', '$http', 'webservice', 
  	function ($scope, $http, webservice) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'];
     /* Toggle modal dialogue display */
    $scope.modalShown = false;
  	$scope.toggleModal = function() {
       $scope.modalShown = !$scope.modalShown;
  	};
  	/* Variables for loadsequence view */
  	$scope.polyTypes = [
      { value: 'PEPTIDE', label:'PEPTIDE' },
      // WebService does not provide function for Nucleotide sequence, but WireFrames specify Nucleotide here
      { value: 'RNA', label:'RNA/DNA' },
      { value: 'HELM', label:'HELM' },
  	];
  	$scope.polymerType = $scope.polyTypes[0];
  	$scope.result = '';
  	/* Check if need to validate Helm input, or convert input to Helm */
  	$scope.processInput = function (polymerType, inputSequence) {
  	  /* Check that input is not empty */
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
      }
      /* TODO: Check that input is valid type? */
      if (polymerType.value == 'HELM')
      	$scope.validateHelmNotation(inputSequence);
      else
      	$scope.getHelmNotation(polymerType, inputSequence);
      $scope.toggleModal();
  	};
  	/* Invoke factory function to get HELM notation */   
  	$scope.getHelmNotation = function (polymerType, inputSequence) {

      webservice.getHelmNotation(polymerType.value, inputSequence)
        .success(function (response) {
          $scope.result = response.HELMNotation;
        })
        .error(function (response) {
          $scope.result = 'Invalid sequence';
          console.log(response);
        });
      };
    $scope.validateHelmNotation = function (inputSequence) {
       webservice.validateHelmNotation(inputSequence)
    	.success(function (response) {
          $scope.result = response.HELMNotation;
        })
        .error(function (response) {
          console.log(response);
        });
    }
}]);

/* Modal toggle - based on tutorial by Adam Albrecht 
(http://adamalbrecht.com/2013/12/12/creating-a-simple-modal-dialog-directive-in-angular-js/) */
angular.module('helmeditor2App')
.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});

