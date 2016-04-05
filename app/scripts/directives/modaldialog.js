'use strict';

/**
 * @ngdoc directive
 * @name helmeditor2App.directive:modalDialog
 * @description
 * # modalDialog
 */

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
	      if (attrs.width) {
	        scope.dialogStyle.width = attrs.width;
	      }
	      if (attrs.height) {
	        scope.dialogStyle.height = attrs.height;
	      }
	      scope.hideModal = function() {
	        scope.show = false;
	      };
	    },
	    templateUrl: 'templates/modaldialog.html'
	  };
	});