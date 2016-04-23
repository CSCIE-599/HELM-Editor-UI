'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # ModalCtrl
 * Modal for right-click on canvas
 */

//modal plunkr provided with ui bootstrap doc: http://plnkr.co/edit/?p=preview
angular.module('helmeditor2App')
	.controller('modal', function ($scope, $uibModalInstance) {
        $scope.close = function () {
            $uibModalInstance.close();
        };
    });
