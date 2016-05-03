'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:Modal
 * @description
 * # ModalCtrl
 * Modal for right-click on canvas
 */

//for right-click modal views
//modal example provided with ui bootstrap doc: http://plnkr.co/edit/?p=preview
angular.module('helmeditor2App')
	.controller('modal', ['$scope', '$uibModalInstance', 'MonomerSelectionService', 'webService', function ($scope, $uibModalInstance, MonomerSelectionService, webService) {
    var self = this;
    $scope.close = function () {
      $uibModalInstance.close();
    };

    // expose the current monomer to the modal dialog
    self.currentMonomer = MonomerSelectionService.getSelectedMonomer();
    self.currentMonomerImageUrl = null;
    self.currentMonomerWeight = null;
    self.currentMonomerHELM = null;
    
    // retrieve the details from the web service
    var type;
    switch(self.currentMonomer._title) {
      case ('Nucleic Acid'):
        type = 'RNA';
        break;
      case ('Peptide'):
        type = 'PEPTIDE';
        break;
      default:
        type = 'CHEM';
        break;
    }

    // handle fragments
    if (self.currentMonomer._notation) {
      webService.getHelmImageUrl(type + '1{' + self.currentMonomer._notation + '}$$$$').then(function (url) {
        self.currentMonomerImageUrl = url;
      }, function () {
        self.currentMonomerImageUrl = null;
      });
    }
    else {
      webService.getMonomerImageUrl(self.currentMonomer._name, type, true).then(function (url) {
        self.currentMonomerImageUrl = url;
      }, function () {
        self.currentMonomerImageUrl = null;
      });
    }

    // retrieve the ID if it exists
    self.getMonomerID = function () {
      console.log(self.currentMonomer);
      return self.currentMonomer._name;
    };
  }]);
