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

    //
	// Code for the delete key.
	//
	var deleteKeyCode = 46;

	//
	// Code for control key.
	//
	var ctrlKeyCode = 65;

	//
	// Set to true when the ctrl key is down.
	//
	var ctrlDown = false;

	//
	// Code for A key.
	//
	var aKeyCode = 17;

	//
	// Code for esc key.
	//
	var escKeyCode = 27;

	//
	// Selects the next node id.
	//
	var nextNodeID = 10;

	//
	// Setup the data-model for the chart.
	//
	var chartDataModel = {

		nodes: [
			/*{
				name: "Example Node 1",
				id: 0,
				x: 0,
				y: 0,
				inputConnectors: [
					{
						name: "A",
					},
					{
						name: "B",
					},
					{
						name: "C",
					},
				],
				outputConnectors: [
					{
						name: "A",
					},
					{
						name: "B",
					},
					{
						name: "C",
					},
				],
			},

			{
				name: "Example Node 2",
				id: 1,
				x: 400,
				y: 200,
				inputConnectors: [
					{
						name: "A",
					},
					{
						name: "B",
					},
					{
						name: "C",
					},
				],
				outputConnectors: [
					{
						name: "A",
					},
					{
						name: "B",
					},
					{
						name: "C",
					},
				],
			},*/

		],

		connections: [
			/*{
				source: {
					nodeID: 0,
					connectorIndex: 1,
				},

				dest: {
					nodeID: 1,
					connectorIndex: 2,
				},
			},*/


		]
	};

	//
	// Event handler for key-down on the helmnotation.
	//
	$scope.keyDown = function (evt) {

		if (evt.keyCode === ctrlKeyCode) {

			ctrlDown = true;
			evt.stopPropagation();
			evt.preventDefault();
		}
	};

	//
	// Event handler for key-up on the helmnotation.
	//
	$scope.keyUp = function (evt) {

		if (evt.keyCode === deleteKeyCode) {
			//
			// Delete key.
			//
			$scope.chartViewModel.deleteSelected();
		}

		if (evt.keyCode == aKeyCode && ctrlDown) {
			// 
			// Ctrl + A
			//
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


	
	//
	// Add a new node to the chart.
	//
	$scope.addNewNode = function (nodeName, nodeColor, isRotate, xpos, ypos) {

		var transform = 'rotate(0 0 0)';
		
		if(isRotate){
			transform = 'rotate(45 50 50)';
		}
		//debugger;
		var newNodeDataModel = {
			name: nodeName,
			id: nextNodeID++,
			x: xpos,
			y: ypos,
			rx:'4',
			ry: '4',
			colour: nodeColor,
			transform: transform,
			/*inputConnectors: [ 
				{
                    name: "X"
                },
                {
                    name: "Y"
                },
                {
                    name: "Z"
                }			
			],
			outputConnectors: [ 
				{
                    name: "1"
                },
                {
                    name: "2"
                },
                {
                    name: "3"
                }			
			],*/
		};

		$scope.chartViewModel.addNode(newNodeDataModel);
	};


	// Add a new node to the chart.
	//Nucleic acid has an attacher node and the main monomer node
	$scope.addNucleicAcid = function (nodeName,  nodeColor) {
	 	
	 	$scope.addNewNode("R",'lightgrey', false, 40, 20);//attacher node

	 	$scope.addNewNode(nodeName,nodeColor, true, 110, 100);//A,C, G, T, U

	 	//TO-DO add connector
	};


	//
	// Add an input connector to selected nodes.
	//
	$scope.addNewInputConnector = function () {
		var connectorName = prompt("Enter a connector name:", "New connector");
		if (!connectorName) {
			return;
		}

		var selectedNodes = $scope.chartViewModel.getSelectedNodes();
		for (var i = 0; i < selectedNodes.length; ++i) {
			var node = selectedNodes[i];
			node.addInputConnector({
				name: connectorName,
			});
		}
	};

	//
	// Add an output connector to selected nodes.
	//
	$scope.addNewOutputConnector = function () {
		var connectorName = prompt("Enter a connector name:", "New connector");
		if (!connectorName) {
			return;
		}

		var selectedNodes = $scope.chartViewModel.getSelectedNodes();
		for (var i = 0; i < selectedNodes.length; ++i) {
			var node = selectedNodes[i];
			node.addOutputConnector({
				name: connectorName,
			});
		}
	};

	//
	// Delete selected nodes and connections.
	//
	$scope.deleteSelected = function () {

		$scope.chartViewModel.deleteSelected();
	};

	//
	// Create the view-model for the chart and attach to the scope.
	//
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);
 