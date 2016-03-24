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

        //for each sequence, graph nodes and store nodes in array
        var graphedNodes = [];
        for (var i = 0; i < sequence.length; i++){
            graphedNodes.push({
                name : sequence[i].name,
                nodes : $scope.generateGraph(sequence[i].name, sequence[i].sequences, i),
            });

            CanvasDisplayService.setNodeNum(0); //reset node numbering
        }

        $scope.makeRequestedConnections(connection, graphedNodes);
    };


	//Parse the sequence, and generate the graph
	$scope.generateGraph = function (sequenceName, sequence, count) {

		var startXpos = 20;
		var startYpos = 40 + ((count * 1) * 150); //TO-DO: adjust positions of multiple sequences
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
            	startXpos = baseNode.x + monomerSpacing;
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
