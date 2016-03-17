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
	  { value: 'Peptide', label:'Peptide' },
      { value: 'HELMNotation', label:'HELM Notation'}

	];

	$scope.polymerType = $scope.polyTypes[0];

    // node id
	var nodeId = 0;

    //number printed by node
    var nodeNum = 0;

	//node height
	var nodeHeight = 25;

	//node width
	var nodeWidth = 25;

	//length of a connection, between A and attacher node R
	var connectionLength = 100;

	//space between 2 monomers, like A and G
	var monomerSpacing = 50;//100;

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
			sequenceVisibility = 'visible';
		}

		var newNodeDataModel = {
			name: nodeName,
			id: nodeId,
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

        if (nodeName !== 'R' && nodeName.indexOf('P') === -1){
            nodeNum++;
            newNodeDataModel.num = nodeNum;
            console.log("main line 102: made node " + nodeName + ", num: " + newNodeDataModel.num);
        }

        nodeId++;

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

	$scope.addPhosphate = function (sPorP, sourceNodeXpos, sourceNodeYpos, previousRNode) {
		var pNode = $scope.addNewNode(sPorP,'lightgrey', false, sourceNodeXpos + monomerSpacing/2, sourceNodeYpos, 'p');
		//link R to P
        pNode.horizSource = previousRNode.id;
        console.log('Connect r to p: ' + previousRNode.name + '.' + previousRNode.id + ' to ' + pNode.name + '.' + pNode.id );
	 	$scope.createConnection(previousRNode, pNode);

        return pNode;
	};

    //takes HELM notation,
    //finds sequence type (nucleotide or peptide) and node letters (R, P, sP, A, C, G, T, etc.)
    //
    //TO-DO: parse requested connection source/destinations (text after '$')
    //TO-DO: move this method to be a service
    $scope.translateHELMNotationToString = function(sequence){
        console.log('the unparsed sequence is: ' + sequence);
        var sequenceType;
        if (sequence.indexOf('RNA') > -1){
            sequenceType = 'Nucleotide';
        }
        else if (sequence.indexOf('PEPTIDE') > -1){
            sequenceType = 'Peptide';
        }
        else {
            //TO-DO: Handle this error in correct way.
			$window.alert('HELM Notation has no Polymer Type');
        }

        var curlyBrace = sequence.indexOf('{');
        sequence = sequence.substring(curlyBrace, sequence.length);

        var sequenceArray = [];
        var inNonNaturalAminoAcid = false;
        var nonNaturalAminoAcid = '';      //multi-letter codes - inside '[]' in HELM

        for (var i = 0; i < sequence.length-1; i++){
            if (sequence[i] === '}'){
                break;
            }

            //process multi-letter codes
            while (inNonNaturalAminoAcid === true){
                if (sequence[i] === ']'){
                    sequenceArray.push(nonNaturalAminoAcid);
                    inNonNaturalAminoAcid = false;
                }

                if (/[a-zA-Z0-9]/.test(sequence[i])){  //if char is alphanumeric
                    nonNaturalAminoAcid += sequence[i];
                }
                i += 1;
            }

            if (sequence[i] === '['){
                inNonNaturalAminoAcid = true;
            }

            if (/[a-zA-Z0-9]/.test(sequence[i])){
                //TO-DO: validate letters? but, we handle input validation in Issue 6
                sequenceArray.push(sequence[i]);
            }
        }

        $scope.generateNotationAndLoadCanvas(sequenceType, sequenceArray);
    };


	//Parse the sequence, and generate the notation
	$scope.generateNotationAndLoadCanvas= function (sequenceType, sequence) {

		var startXpos = 40;
		var startYpos = 20;
		var color;

		if(sequenceType === 'Nucleotide'){
            var pNode = '';
            var rNode = '';

			angular.forEach(sequence, function(value, key) {
				color = $scope.getNodeColor(value);

                if (value === 'P' || value === 'sP'){
                    pNode = $scope.addPhosphate(value, startXpos,startYpos,rNode);
                }
                else if (value !== 'R'){
				    rNode = $scope.addNucleicAcid(value, color, startXpos, startYpos);

                    if (pNode){     //link previous P to R
                        rNode.horizSource = pNode.id;
                        $scope.createConnection(pNode, rNode);
                    }
                    pNode = '';
                }
				//increment the startPos for the next element in the sequence
				startXpos = startXpos + monomerSpacing;
			});
		}

		else if(sequenceType === 'Peptide'){
            var xPos = 40;
            var yPos = 20;
            var prevNode;

			angular.forEach(sequence, function(value, key) {

        	 	var newNode = $scope.addNewNode(value, 'lightblue', true, xPos, yPos, 'n');

                //connect 2 nodes horizontally
                if (prevNode){
                    newNode.horizSource = prevNode.id;
        	 	    $scope.createConnection(prevNode, newNode);
                }

                prevNode = newNode;
                xPos = xPos + monomerSpacing;
            });

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
        else if (nodeName === 'R'){
            return 'lightgrey';
        }
        else if (nodeName === 'P' || nodeName === 'sP'){
            return 'lightgrey';
        }
	};

	// Create the view-model for the chart and attach to the scope.
	$scope.chartViewModel = new helmnotation.ChartViewModel(chartDataModel);

    }]);
