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

	//space between 2 monomers, like A and G
	var monomerSpacing = 50;//100;


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

		var startXpos = 40;
		var startYpos = 20;
		var color;
		var riboseType;

		if(sequenceType === 'Nucleotide'){
            var pNode = '';
            var rNode = '';

			angular.forEach(sequence, function(value, key) {
				color = CanvasDisplayService.getNodeColor(value);

				 if(value.charAt(value.length-1) === 'R')
                	riboseType = value;
				
                if (value === 'P' || value === 'sP'){
                    pNode = $scope.addPhosphate(value, startXpos,startYpos,rNode);
                }               
               
                else if (value.charAt(value.length-1) !== 'R'){//exclude any element that ends in 'R', like dR, sR, R etc
                    rNode = $scope.addNucleicAcid(value, color, startXpos, startYpos, riboseType);

                    if (pNode){     //link previous P to R
                        rNode.horizSource = pNode.id;
                        $scope.addNewConnection(pNode, rNode);
                    }
                    pNode = '';
                }
				//increment the startPos for the next element in the sequence
				startXpos = startXpos + monomerSpacing;
			});
		}

		else if(sequenceType === 'Peptide'){
            var xPos = startXpos;
            var yPos = startYpos;
            var prevNode;

			angular.forEach(sequence, function(value, key) {

        	 	var newNode = $scope.addNewNode(value, 'lightblue', true, xPos, yPos, 'n');

                //connect 2 nodes horizontally
                if (prevNode){
                    newNode.horizSource = prevNode.id;
        	 	    $scope.addNewConnection(prevNode, newNode);
                }

                prevNode = newNode;
                xPos = xPos + monomerSpacing;
            });
		}
	};


	// create a new node and add to the chart.
	$scope.addNewNode = function (nodeName, nodeColor, isRotate, xpos, ypos, nodeType) {

		var node = CanvasDisplayService.createNode(nodeName, nodeColor, isRotate, xpos, ypos, nodeType);
		$scope.chartViewModel.addNode(node);
		return node;
	};


	//add a connection between 2 nodes
	$scope.addNewConnection = function(sourceNode, destNode){
		$scope.chartViewModel.addConnection(sourceNode, destNode);
	};



	//A simple nucleic acid has a ribose node, main monomer node and a connection
	$scope.addNucleicAcid = function (nodeName,  nodeColor, xPos, yPos, riboseType) {

		
		var nucleicAcidNodes =  CanvasDisplayService.createNucleicAcidNodes(nodeName,  nodeColor, xPos, yPos, riboseType);
		
		$scope.chartViewModel.addNode(nucleicAcidNodes.ribose);
		$scope.chartViewModel.addNode(nucleicAcidNodes.monomer);

		//create the connection between ribose and monomer
	 	$scope.addNewConnection(nucleicAcidNodes.ribose, nucleicAcidNodes.monomer);

	 	return nucleicAcidNodes.ribose; 
	 };


	$scope.addPhosphate = function (sPorP, sourceNodeXpos, sourceNodeYpos, previousRNode) {
		var pNode = $scope.addNewNode(sPorP,'lightgrey', false, sourceNodeXpos + monomerSpacing/2, sourceNodeYpos, 'p');
		//link R to P
        pNode.horizSource = previousRNode.id;
        console.log('Connect r to p: ' + previousRNode.name + '.' + previousRNode.id + ' to ' + pNode.name + '.' + pNode.id );
	 	$scope.addNewConnection(previousRNode, pNode);

        return pNode;
	};




	// Create the view-model for the chart and attach to the scope.
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);
