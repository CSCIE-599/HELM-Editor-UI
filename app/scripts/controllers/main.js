'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', '$window', function ($scope, $window) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    /* Variables related to the prototype code in HTML */
	$scope.polyTypes = [
	  {	value: '', label:'--Select--' },
	  { value: 'Nucleotide', label:'Nucleotide' },
	  { value: 'Peptide', label:'Peptide' }

	];

	$scope.polymerType = $scope.polyTypes[0];

    // Selects the next node id.
	var nextNodeID = 0;

	//node height
	var nodeHeight = 25;

	//node width
	var nodeWidth = 25;

	//length of a connection, between A and attacher node R
	var connectionLength = 100;

	//space between 2 monomers, like A and G
	var monomerSpacing = 100;

	//regular node radius
	var radiusX = '4';
	var radiusY = '4';

	// Setup the data-model for the chart.
	var chartDataModel = {
		nodes: [],
		connections: []
	};

	// Add a new node to the chart.
	$scope.addNewNode = function (nodeName, nodeColor, isRotate, xpos, ypos, nodeType) {

		var rotateDegree = '0';
		var sequenceVisibility = 'hidden';

		var rx = radiusX;
		var ry = radiusX;

		if(isRotate){
			rotateDegree = '45';
		}

		if(nodeType === 'p'){//for phosphate, round the rectangle corners to look like circle
			rx = radiusX +10;
			ry = radiusY +10;
		}

		if(nodeType === 'n'){//nucleotide
			nextNodeID++;
			sequenceVisibility = 'visible';
		}

		var newNodeDataModel = {
			name: nodeName,
			id: nextNodeID,
			x: xpos,
			y: ypos,
			rx:rx,
			ry: ry,
			colour: nodeColor,
			height:nodeHeight,
			width:nodeWidth,
			transformx:xpos+nodeHeight/2,
			transformy:ypos+nodeWidth/2,
			transformDegree:rotateDegree,
			seqVisible:	sequenceVisibility,
		};

		$scope.chartViewModel.addNode(newNodeDataModel);

		return newNodeDataModel;
	};


	//add a connection between 2 nodes
	$scope.createConnection = function(sourceNode, destNode){
		$scope.chartViewModel.addConnection(sourceNode, destNode);
	};


	// Add a new node to the chart.
	//A simple nucleic acid has a ribose node, main monomer node and a connection
	$scope.addNucleicAcid = function (nodeName,  nodeColor, xPos, yPos) {

	 	var sourceNodeXpos = xPos;
		var sourceNodeYpos = yPos;

		var destNodeXpos = sourceNodeXpos;
		var destNodeYpos = sourceNodeYpos + connectionLength;

		//R ribose node
	 	var sourceNode = $scope.addNewNode('R','lightgrey', false, sourceNodeXpos, sourceNodeYpos, 'r');

	 	//A,C, G, T, U
	 	var destNode = $scope.addNewNode(nodeName, nodeColor, true, destNodeXpos, destNodeYpos, 'n');

	 	//create the connection between 2 nodes
	 	$scope.createConnection(sourceNode, destNode);

        return sourceNode;
	 };

	$scope.addPhosphate = function (sourceNodeXpos, sourceNodeYpos, sourceNode) {
		var destNode = $scope.addNewNode('P','lightgrey', false, sourceNodeXpos + monomerSpacing/2, sourceNodeYpos, 'p');
		//create the connection between 2 nodes
	 	$scope.createConnection(sourceNode, destNode);

        return destNode;
	};

	//Parse the sequence, and generate the notation
	$scope.generateNotationAndLoadCanvas= function (sequenceType, sequence) {
		var startXpos = 40;
		var startYpos = 20;
		var color;

		if(sequenceType.value === ''){
			$window.alert('Please select a Polymer Type');
		}
		if(sequenceType.value === 'Nucleotide'){
            var pNode ='';

			angular.forEach(sequence, function(value, key) {
				color = $scope.getNodeColor(value);
				var rNode = $scope.addNucleicAcid (value, color, startXpos, startYpos);

                if (pNode){ //if there is a 'P' Node before 'R', attach 'P' to 'R'
                    $scope.createConnection(pNode, rNode);
                }

				if(key!==sequence.length-1){//do not add phosphate for the last element in the sequence
                    pNode = $scope.addPhosphate(startXpos,startYpos,rNode);
				}
				//increment the startPos for the next element in the sequence
				startXpos = startXpos + monomerSpacing;
			});
		}

		else if(sequenceType.value === 'Peptide'){
			//TO-DO
		}
	};


	$scope.reset = function() {
	    $scope.inputSequence =' ';
	    $scope.polymerType = ' ';
	};

	// Delete selected nodes and connections.
	$scope.deleteSelected = function () {
		$scope.chartViewModel.deleteSelected();
	};


	$scope.getNodeColor = function(nodeName){

		if(nodeName === 'A'){
			return 'lightgreen';
		}
		else if(nodeName === 'C'){
			return 'red';
		}
		else if(nodeName === 'G'){
			return 'orange';
		}
		else if(nodeName === 'T' || nodeName === 'U'){
			return 'cyan';
		}		
	};

	// Create the view-model for the chart and attach to the scope.
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);