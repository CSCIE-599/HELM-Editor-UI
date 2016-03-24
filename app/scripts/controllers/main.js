'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', '$window', 'HelmConversionService', 'CanvasDisplayService', function ($scope, $window, HelmConversionService, CanvasDisplayService) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

   	//space between 2 base nodes, like A and G
	var monomerSpacing = 50;

	//length of a connection, between A and attacher node R
	var connectionLength = 100;

	// Setup the data-model with nodes and connections
	var helmDataModel = {
		nodes: [],
		connections: []
	};

	 $scope.displayOnCanvas = function(notation){


    	var helmTranslation = HelmConversionService.convertHelmNotationToSequence(notation);
        var sequence = helmTranslation[0];   //each array element has the sequence name and its array of letters
        var connection = helmTranslation[1]; //each array element has a source.name, source.nodeID, dest.name, dest.nodeID

        var graphedNodes = $scope.processSequences(sequence, connection);

        $scope.makeRequestedConnections(connection, graphedNodes);
    };

    //separate cyclical from noncyclical sequences, process separately,
    //return an array of all graphed nodes
    $scope.processSequences = function(sequence, connection){
        var startXpos = 20;
        var startYpos = 40; //TO-DO: adjust positions of multiple sequences

        var sequences = $scope.separateSequences(sequence, connection);

        var cyclicalSequences = sequences[0];
        var nonCyclicalSequences = sequences[1];

        var graphedNodes = $scope.processCyclicalSequences(cyclicalSequences, connection);

        //graph non-cyclical sequences
        for (var i = 0; i < nonCyclicalSequences.length; i++){
            graphedNodes.push({
                name : nonCyclicalSequences[i].seq.name,
                nodes : $scope.generateGraph(startXpos, startYpos, nonCyclicalSequences[i].seq.name, nonCyclicalSequences[i].seq.sequences, nonCyclicalSequences[i].num, false),
            });

            CanvasDisplayService.setNodeNum(0); //reset node numbering
        }

        return graphedNodes;
    };

    //returns array of cyclical sequences and array of non-cyclical sequences
    $scope.separateSequences = function(sequence, connection){
        var nonCyclicalSequences = [];
        var cyclicalSequences = [];
        var j, k;

        for (j = 0; j < connection.length; j++){
            if (connection[j].source.name === connection[j].dest.name){
                for (k = 0; k < sequence.length; k++){
                    if (sequence[k].name === connection[j].source.name) {
                        cyclicalSequences.push({
                            seq : sequence[k],
                            num : k,      //this sequence's index in multiple sequence input  - used for positioning on canvas
                        });
                    }
                    else {
                        nonCyclicalSequences.push({
                            seq : sequence[k],
                            num : k,
                        });
                    }
                }
            }
        }

        //if no cyclical sequences
        if (cyclicalSequences.length === 0){
            for (k = 0; k < sequence.length; k++){
                nonCyclicalSequences.push({
                    seq : sequence[k],
                    num : k,
                });
            }
        }


        return [ cyclicalSequences, nonCyclicalSequences];
    };

    //TO-DO for entire method: modularize, make readable, make simpler, remove unnecessary comments, etc.
    $scope.processCyclicalSequences = function(cyclicalSequences, connection){
        //TO-DO: fix positioning, and don't hard code any of the x/y positioning
        var startXpos = 20;
        var numLinearNodes = 0;  //num nodes going right -used to find starting point for reverse direction
        var numLinearParts = 0;  //num linear parts of this sequence - used to move second linear part down on y scale
        var startYpos = 150;
        var i, j, k, m, x;
        var cyclicalNodes = []; //array of cyclical nodes we pass to makeCycle();
        var graphedNodes = [];  //return this array, to use to make connections
        var cyclicalPortion = [];
        var nonCyclicalPortion = [];
        var centreX = 80 + 20;
        var centreY = 150;
        var name, sequence;

        for (i = 0; i < connection.length; i++){
            if (connection[i].source.name === connection[i].dest.name){   //find cyclical connection
                for (j = 0; j < cyclicalSequences.length; j++){
                    if (connection[i].source.name === cyclicalSequences[j].seq.name){ //find the cyclical connection/sequence pair

                        sequence = cyclicalSequences[j].seq.sequences;
                        name = cyclicalSequences[j].seq.name;

                        for (k = 0; k < sequence.length; k++){      //for each node in this sequence,

                            //if node is between connection source node and connection dest node
                            if (k >= connection[i].dest.nodeID - 1 && k <= connection[i].source.nodeID - 1){

                                //graph previous non-cyclical portion of sequence
                                if (nonCyclicalPortion.length > 0){
                                    console.log("graphing non cyclical part - 1");
                                    for (x = 0; x < nonCyclicalPortion.length; x++){
                                        console.log(nonCyclicalPortion[x]);
                                    }
                                    graphedNodes.push ({
                                        name : name,
                                        nodes : $scope.generateGraph(startXpos, startYpos, name, nonCyclicalPortion, cyclicalSequences[j].num, false),
                                    });
                                    numLinearNodes = nonCyclicalPortion.length; //TO-DO: rework method to figure out positioning on canvas
                                    numLinearParts++;
                                    nonCyclicalPortion = [];
                                }
                                cyclicalPortion.push(sequence[k]);
                            }
                            else { // if in non-cyclical portion of sequence
                                //graph previous cyclical portion
                                if (cyclicalPortion.length >0){
                                    console.log("graphing cyclical part - 2");
                                    for (x = 0; x < cyclicalPortion.length; x++){
                                        console.log(cyclicalPortion[x]);
                                    }
                                    cyclicalNodes = CanvasDisplayService.makeCycle(cyclicalPortion, centreX + (numLinearNodes * 40), centreY);

                                    for (m = 0; m < cyclicalNodes.length; m++){
                                        $scope.canvasView.addNode(cyclicalNodes[m]);
                                    }
                                    graphedNodes.push ({
                                        name : name,
                                        nodes : cyclicalNodes,
                                    });
                                    cyclicalPortion = [];
                                }
                                nonCyclicalPortion.push(sequence[k]);
                            }
                        }
                    }

                    //graph remaining non-cyclical portions
                    //TO-DO: work on positioning and whether or not in reverse direction
                    if (nonCyclicalPortion.length > 0){
                        console.log("graphing non cyclical part - 3 - nodes are: ");
                        for (x = 0; x < nonCyclicalPortion.length; x++){
                            console.log(nonCyclicalPortion[x]);
                        }
                        graphedNodes.push ({
                            name : name,
                            nodes : $scope.generateGraph(startXpos + (numLinearNodes * 10), startYpos + (numLinearParts * 40), name, nonCyclicalPortion, cyclicalSequences[j].num, true),
                        });
                        numLinearNodes = 0;
                        numLinearParts = 0;
                        nonCyclicalPortion = [];
                    }
                    //graph remaining cyclical portions
                    if (cyclicalPortion.length >0){
                        console.log("graphing cyclical part - 4");
                        for (x = 0; x < cyclicalPortion.length; x++){
                            console.log(cyclicalPortion[x]);
                        }
                        cyclicalNodes = CanvasDisplayService.makeCycle(cyclicalPortion, centreX + (numLinearNodes * 40), centreY);
                        for (m = 0; m < cyclicalNodes.length; m++){
                            $scope.canvasView.addNode(cyclicalNodes[m]);
                        }
                        graphedNodes.push ({
                            name : name,
                            nodes : cyclicalNodes,
                        });
                        cyclicalPortion = [];
                    }

                    CanvasDisplayService.setNodeNum(0); //reset node numbering
                }
            }
        }

        return graphedNodes;
    };


	//Parse the sequence, and generate the graph
	$scope.generateGraph = function (startX, startY, sequenceName, sequence, count, isReverseDirection) {

		var startXpos = startX;
		var startYpos = startY + ((count * 1) * 150); //TO-DO: adjust positions of multiple sequences
		var color;

        var allNodes = [];
        var riboseNode;
	    var baseNode;
	    var phosphateNode;
	    var prevNode;
        var chemNode;

/*
        var cyclicNodes = CanvasDisplayService.makeCycle(sequence, 250, 200);

			angular.forEach(cyclicNodes, function(value, key) {
				$scope.canvasView.addNode(value);
			});

*/
		angular.forEach(sequence, function(value, key) {
			color = CanvasDisplayService.getNodeColor(value);

			if(sequenceName.toUpperCase().indexOf('RNA') > -1) {//Nucleotide'){

				if (CanvasDisplayService.isRiboseNode(value)){//chck for Ribose node first
					riboseNode = CanvasDisplayService.createRibose(value, color, startXpos, startYpos);
                    allNodes.push(riboseNode);
					$scope.canvasView.addNode(riboseNode);

					if(phosphateNode  &&  riboseNode){//make horizontal connection
						$scope.addNewConnection(phosphateNode, riboseNode, 'h');
					}
				}
				else if(value !== 'P' && value !== 'sP'){
			 		baseNode = CanvasDisplayService.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength);
                    allNodes.push(baseNode);
                    $scope.canvasView.addNode(baseNode);

                    if (riboseNode && baseNode){//make vertical connection
						$scope.addNewConnection(riboseNode, baseNode, 'v');
					}

				}
				else {
                    if (riboseNode){
					    phosphateNode = CanvasDisplayService.createPhosphate(value, color, riboseNode.x  + monomerSpacing, riboseNode.y);
                    }
                    else {
                        phosphateNode = CanvasDisplayService.createRibose(value, color, startXpos, startYpos);
                    }
                    allNodes.push(phosphateNode);
                    $scope.canvasView.addNode(phosphateNode);

					if(riboseNode && phosphateNode){//make horizontal connection
						$scope.addNewConnection(riboseNode, phosphateNode, 'h');
					}

				}

				//increment the startPos for the next basenode in the sequence
                //TO-DO: Find a better way to do this
                if (riboseNode){
				    startXpos = riboseNode.x + monomerSpacing*2;
                }
                else {
                    startXpos = phosphateNode.x + monomerSpacing;
                }
			}
			else if (sequenceName.toUpperCase().indexOf("PEPTIDE") > -1) {//Peptide

				baseNode = CanvasDisplayService.createNode(value, "Peptide", "lightblue", "true", startXpos , startYpos);
                allNodes.push(baseNode);
				$scope.canvasView.addNode(baseNode);
				if (prevNode){
    	 	    	$scope.addNewConnection(prevNode, baseNode, 'h');//connect 2 nodes horizontally
            	}

            	prevNode = baseNode;
                if (isReverseDirection){
                    startXpos = baseNode.x + monomerSpacing;
                }
                else {
            	    startXpos = baseNode.x + monomerSpacing;
                }
			}
            else if (sequenceName.toUpperCase().indexOf("CHEM") > -1) {
                //TO-DO: figure out how to decipher where Chem node should be positioned on canvas
                chemNode = CanvasDisplayService.createNode(value, "Chem", "white", false, startXpos , startYpos);
                allNodes.push(chemNode);
                $scope.canvasView.addNode(chemNode);
            }
		});

        return allNodes;
	};

    //Make the connections requested in HELM Notation.
    //
    //connection   = each array element has source.name, source.nodeID, dest.name, dest.nodeID
    //graphedNodes = each array element has the sequence name and an array of graphed nodes
    $scope.makeRequestedConnections = function(connection, graphedNodes){

        var j, k;
        var nodes,source, dest = "";
        for (j = 0; j < connection.length; j++){

            for (k = 0; k < graphedNodes.length; k++){
                nodes = graphedNodes[k].nodes;

                //if source sequence, get source node
                if (graphedNodes[k].name === connection[j].source.name) {
                    source = nodes[(connection[j].source.nodeID) -1];
                }
                //if destination sequence, get dest node
                else if (graphedNodes[k].name === connection[j].dest.name) {
                    dest = nodes[(connection[j].dest.nodeID) -1];
                }
                //add link
                if (source !== "" && dest !== ""){
                    $scope.addNewConnection(source, dest, 'v');
                    source = "";
                    dest = "";
                }
                nodes = "";
            }
        }
    };

	// create a new node and add to the view.
	$scope.addNewNode = function (nodeName, seqType, nodeColor, isRotate, xpos, ypos, nodeType) {

		var node = CanvasDisplayService.createNode(nodeName, seqType, nodeColor, isRotate, xpos, ypos, nodeType);
		$scope.canvasView.addNode(node);
		return node;
	};

	//add a connection between 2 nodes
	$scope.addNewConnection = function(sourceNode, destNode, type){
		var conn = CanvasDisplayService.createConnection(sourceNode, destNode, type);
		$scope.canvasView.addConnection(conn);
	};

	$scope.resetCanvas = function(){

		console.log("RESETTING CANVAS DISPLAY");
		var emptyData = {
			nodes: [],
			connections: []
		};
		CanvasDisplayService.setNodeNum(0);
		$scope.canvasView = new CanvasDisplayService.CanvasView(emptyData);

	};

	// Create the view for the canvas and attach to the scope.
	$scope.canvasView = new CanvasDisplayService.CanvasView(helmDataModel);


}]);
