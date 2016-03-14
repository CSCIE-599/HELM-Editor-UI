'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', function ($scope) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    
    // Code for the delete key.
	var deleteKeyCode = 46;

	// Code for control key.
	var ctrlKeyCode = 65;

	// Set to true when the ctrl key is down.
	var ctrlDown = false;

	// Code for A key.
	var aKeyCode = 17;

	// Code for esc key.
	var escKeyCode = 27;
	
	// Selects the next node id.
	var nextNodeID = 10;

	// Setup the data-model for the chart.
	var chartDataModel = {

		nodes: [],
		connections: []
	};

	// Event handler for key-down on the helmnotation.
	$scope.keyDown = function (evt) {

		if (evt.keyCode === ctrlKeyCode) {

			ctrlDown = true;
			evt.stopPropagation();
			evt.preventDefault();
		}
	};

	// Event handler for key-up on the helmnotation.
	$scope.keyUp = function (evt) {

		if (evt.keyCode === deleteKeyCode) {
			// Delete key.
			$scope.chartViewModel.deleteSelected();
		}

		if (evt.keyCode == aKeyCode && ctrlDown) {
			// Ctrl + A
			$scope.chartViewModel.selectAll();
		}

		if (evt.keyCode == escKeyCode) {
			// Escape.
			$scope.chartViewModel.deselectAll();
		}

		if (evt.keyCode === ctrlKeyCode) {
			ctrlDown = false;
			evt.stopPropagation();
			evt.preventDefault();
		}
	};


	// Add a new node to the chart.
	$scope.addNewNode = function (nodeName, nodeColor, isRotate, xpos, ypos) {

		var rotateDegree = '0';
		
		if(isRotate){
			rotateDegree = '45';
		}

		var nodeHeight = 30;
		var nodeWidth = 30;

		var newNodeDataModel = {
			name: nodeName,
			id: nextNodeID++,
			x: xpos,
			y: ypos,
			rx:'4',
			ry: '4',
			colour: nodeColor,
			height:nodeHeight,
			width:nodeWidth,
			transformx:xpos+nodeHeight/2,
			transformy:ypos+nodeWidth/2,
			transformDegree:rotateDegree,
		};

		$scope.chartViewModel.addNode(newNodeDataModel);
		return newNodeDataModel;
	};


	//add a connection between 2 nodes
	$scope.createConnection = function(sourceNode, destNode){
		$scope.chartViewModel.addConnection(sourceNode, destNode);
	};


	// Add a new node to the chart.
	//A simple nucleic acid has an attacher node, main monomer node and a connection
	$scope.addNucleicAcid = function (nodeName,  nodeColor) {
	 	
	 	//TO-DO Make the default position to be the middle of canvas, instead of hardcoding
		var sourceNodeXpos = 40;
		var sourceNodeYpos = 20;

		var destNodeXpos = sourceNodeXpos;
		var destNodeYpos = sourceNodeYpos + 140;

		//attacher node
	 	var sourceNode = $scope.addNewNode("R",'lightgrey', false, sourceNodeXpos, sourceNodeYpos);

	 	//A,C, G, T, U
	 	var destNode = $scope.addNewNode(nodeName, nodeColor, true, destNodeXpos, destNodeYpos);

	 	//create the connection between 2 nodes
	 	$scope.createConnection(sourceNode, destNode);

	};

	
	// Delete selected nodes and connections.
	$scope.deleteSelected = function () {

		$scope.chartViewModel.deleteSelected();
	};

	// Create the view-model for the chart and attach to the scope.
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);
 