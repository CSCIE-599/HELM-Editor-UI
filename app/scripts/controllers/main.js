'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', '$window', 'HelmConversionService', 'CanvasDisplayService', function ($scope, $window, HelmConversionService, CanvasDisplayService ) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    /* Variables related to the prototype code in HTML */
	$scope.polyTypes = [
	  {	value: '', label:'--Select--' },
	  { value: 'Nucleotide', label:'Nucleotide' },
	  { value: 'Peptide', label:'Peptide' },
      { value: 'HELMNotation', label:'HELM Notation'}

	];

	$scope.polymerType = $scope.polyTypes[0];

	//space between 2 base nodes, like A and G
	var monomerSpacing = 50;;

	//length of a connection, between A and attacher node R
	var connectionLength = 100;


	// Setup the data-model for the chart.
	var chartDataModel = {
		nodes: [],
		connections: []
	};

	 $scope.displayOnCanvas = function(notation){

    	var sequence = HelmConversionService.convertHelmNotationToSequence(notation);
    	$scope.generateGraph(sequence.sequenceType, sequence.sequenceArray);          	
    };


	//Parse the sequence, and generate the notation
	$scope.generateGraph= function (sequenceType, sequence) {

		var startXpos = 20;
		var startYpos = 40;
		var color;
		                     
        var riboseNode;
	    var baseNode;
	    var phosphateNode; 
	    var prevNode;
	   		
		angular.forEach(sequence, function(value, key) {	 		
			color = CanvasDisplayService.getNodeColor(value);	
			
			if(sequenceType === 'Nucleotide'){

				if (CanvasDisplayService.isRiboseNode(value)){//chck for Ribose node first
					riboseNode = CanvasDisplayService.createRibose(value, color, startXpos, startYpos);
					$scope.chartViewModel.addNode(riboseNode);

					if(phosphateNode  &&  riboseNode){//make horizontal connection
						$scope.addNewConnection(phosphateNode, riboseNode, 'h');
					}
				}
				else if(value !== 'P'){
			 		baseNode = CanvasDisplayService.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength);
			 		$scope.chartViewModel.addNode(baseNode);

			 		if(riboseNode && baseNode){//make vertical connection
						$scope.addNewConnection(riboseNode, baseNode, 'v');
					}
				}
				else {
					phosphateNode = CanvasDisplayService.createPhosphate(value, color, riboseNode.x  + monomerSpacing, riboseNode.y);
					$scope.chartViewModel.addNode(phosphateNode);

					if(riboseNode && phosphateNode){//make horizontal connection
						$scope.addNewConnection(riboseNode, phosphateNode, 'h');
					}
				}

				//increment the startPos for the next basenode in the sequence
				startXpos = riboseNode.x + monomerSpacing*2;
			}
			else {//Peptide

				baseNode = CanvasDisplayService.createBase(value, "lightblue", startXpos , startYpos);
				$scope.chartViewModel.addNode(baseNode);
				if (prevNode){                    
    	 	    	$scope.addNewConnection(prevNode, baseNode, 'h');//connect 2 nodes horizontally
            	}

            	prevNode = baseNode;
            	startXpos = baseNode.x + monomerSpacing;
			}		
		});		
	};


	// create a new node and add to the chart.
	$scope.addNewNode = function (nodeName, nodeColor, isRotate, xpos, ypos, nodeType) {

		var node = CanvasDisplayService.createNode(nodeName, nodeColor, isRotate, xpos, ypos, nodeType);
		$scope.chartViewModel.addNode(node);
		return node;
	};

	//add a connection between 2 nodes
	$scope.addNewConnection = function(sourceNode, destNode, type){
		$scope.chartViewModel.addConnection(sourceNode, destNode, type);
	};

	// Create the view-model for the chart and attach to the scope.
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);
