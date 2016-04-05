'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:HelmcanvasCtrl
 * @description
 * # HelmcanvasCtrl
 * Controller of the helmeditor2App
 */
angular.module('helmeditor2App')
  .controller('HelmcanvasCtrl', ['$scope', 'HelmConversionService', 'CanvasDisplayService', function ($scope, HelmConversionService, CanvasDisplayService) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

   	//space between 2 adjacent horizontal nodes
	var monomerSpacing = 50;

	//length of a connection, between A and attacher node R
	var connectionLength = 100;

	// Setup the data-model with nodes and connections
	var helmDataModel = {
		nodes: [],
		connections: []
	};

	//function which takes in a HELM notation, converts to sequence and draws graphical image on the canvas
	$scope.displayOnCanvas = function(notation){

        //from HELM Notation, get requested sequences and connections between sequences
    	var helmTranslation = HelmConversionService.convertHelmNotationToSequence(notation);
        var sequenceArray = helmTranslation[0];   //each element has .name and .sequence (array of letters)
        var connectionArray = helmTranslation[1]; //each element has .source and .dest

        //make nodes and draw sequences
        var pos;
        var graphedNodes = [];
        for (var i = 0; i < sequenceArray.length; i++){
            var seqType = $scope.getType(sequenceArray[i].name); //PEPTIDE, NUCLEOTIDE, or CHEM
            pos = CanvasDisplayService.getNewRowPos(pos, i);     //add a new row for a every iteration

            graphedNodes.push({
                name : sequenceArray[i].name,
                nodes : $scope.generateGraph(sequenceArray[i].sequence, sequenceArray[i].name, connectionArray, pos, seqType, sequenceArray)
            });
            CanvasDisplayService.setNodeNum(0); //reset node numbering
        }

        //draw any links between sequences
        if (connectionArray.length > 0){
            $scope.makeRequestedConnections(connectionArray, graphedNodes);
        }
    };

    //Parse the sequence, and generate the graph
	//returns all drawn nodes
	//the nodes are used to make the connections explicitly specified in the HELM notation
	$scope.generateGraph = function (sequence, seqName, connectionArray, pos, seqType, sequenceArray) {//(sequenceObj, pos) {

        var currSubGraph;
        var graphedNodes = [];  //all nodes created and graphed
        var dir = 'forward';    //'forward' places nodes left to right, 'reverse' places them right to left

        if (!$scope.isCyclical(seqName, connectionArray)){  //if the sequence is not cyclical,
            currSubGraph = $scope.makeLinearGraph(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray);
            graphedNodes.push(currSubGraph.nodes);
        }
        else {
            //TO-DO: Change 'makeCyclicPeptide()' to a new function that handles different cyclical shapes
            var nodes = $scope.makeCyclicPeptide(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray);
            graphedNodes.push(nodes);
        }
        return graphedNodes;
	};

	//makes a linear graph starting from the pos
	//returns a Subgraph obj, thats already drawn on the canvas
	//a subgraph has firstNode, lastNode and array of allnodes in the graph
	$scope.makeLinearGraph = function(monomerArr, dir, seqType, pos, sequenceName, connectionArray, sequenceArray){

		var subGraph;

		if(seqType === 'NUCLEOTIDE') {
			subGraph = $scope.processNucleoTides(monomerArr, pos, dir);
		}
		else if (seqType === 'PEPTIDE') {

			subGraph = $scope.processPeptides(monomerArr, pos, dir);

		} else if (seqType === 'CHEM') {//chemical modifiers

			subGraph = $scope.processChemicalModifiers(monomerArr, sequenceName, pos, connectionArray, sequenceArray);
		}
		return subGraph;
	};


	//helper function which draws nucleotide sequences
	$scope.processNucleoTides = function(monomerArr, pos, dir){

		var prevNode;
		var currNode;
		var firstNode;

		var riboseNode;
	    var baseNode;

		var x = pos.x;
		var y = pos.y;
		var allNodes = [];
		var color;

		angular.forEach(monomerArr, function(value, key) {

			color = CanvasDisplayService.getNodeColor(value);

			if(CanvasDisplayService.isPhosphateNode(value)){//phosphate node, 'p' or 'sP'
				 currNode = CanvasDisplayService.createPhosphate(value, color, x, y);
				 if(key === 0){//keep track of first node
					firstNode = currNode;
				 }
				 allNodes.push(currNode);
				 $scope.canvasView.addNode(currNode);

				if(prevNode){
					$scope.addNewConnection(prevNode, currNode);
				}
			}
			else if (CanvasDisplayService.isRiboseNode(value)){//ribose node
				if(prevNode){
					currNode = CanvasDisplayService.createRibose(value, color, prevNode.x + monomerSpacing , y);
                }
                else {
					currNode = CanvasDisplayService.createRibose(value, color, x , y);
                }

				riboseNode = currNode;
				if(key === 0){
					firstNode = currNode;
				 }
				allNodes.push(currNode);
				$scope.canvasView.addNode(currNode);

				if(prevNode){
					$scope.addNewConnection(prevNode, currNode);
				}
			}
			else {//base node

				if(riboseNode){
					baseNode = CanvasDisplayService.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength);
					if(key === 0){
						firstNode = currNode;
					 }
					allNodes.push(baseNode);
					$scope.canvasView.addNode(baseNode);
				}

				if (riboseNode && baseNode){
					$scope.addNewConnection(riboseNode, baseNode);
				}
			}

			if (currNode){
				if(dir === 'reverse'){
					x = currNode.x - monomerSpacing;
				}
				else {
					x = currNode.x + monomerSpacing;
				}
				prevNode = currNode;
			}
		});

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);//return the subgraph which is already drawn

	};

	//helper function which draws peptide sequences
	$scope.processPeptides = function(monomerArr, pos, dir){

		var prevNode;
		var currNode;
		var firstNode;

		var x = pos.x;
		var y = pos.y;
		var allNodes = [];

		angular.forEach(monomerArr, function(value, key) {

			currNode = CanvasDisplayService.createNode(value, 'PEPTIDE', 'lightblue', true, x , y);
			allNodes.push(currNode);
			$scope.canvasView.addNode(currNode);
			if(key === 0){
				firstNode = currNode;
			 }
			if (prevNode){
				$scope.addNewConnection(prevNode, currNode);
			}
			prevNode = currNode;

			if(dir === 'reverse'){
				x = currNode.x - monomerSpacing;
			}
			else{
				x = currNode.x + monomerSpacing;
			}
		});

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
	};

	//helper function which draws CHEM sequences
    //TO-DO: verify that CHEM sequences always consist of only 1 element
	$scope.processChemicalModifiers = function(monomerArr, chemSequenceName, pos, connectionArray, sequenceArray){

        //TO-DO: confirm accurate way to position CHEM node

        //get x position, whether to the far left or right side of canvas
        var x = $scope.getCHEMXPosition(connectionArray, chemSequenceName, sequenceArray);
        var y = 190;  //TO-DO: this is hard coded to be slightly below the previous, first sequence

		var allNodes = [];
        var currNode = CanvasDisplayService.createNode(monomerArr[0], 'CHEM', 'purple', false, x , y);
        allNodes.push(currNode);
        var firstNode = currNode;
        $scope.canvasView.addNode(currNode);

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
	};

    //Returns the x position for the param CHEM node
    //
    //@param  connectionArray    array of connections encoded in HELM Notation
    //@param  chemSequenceName   name of CHEM node (eg, 'CHEM1')
    $scope.getCHEMXPosition = function(connectionArray, chemSequenceName,sequenceArray){
        var sequenceCHEMConnectsTo;
        var nodeCHEMConnectsTo;
        var length;

        //get the sequence name and number for node that CHEM connections to
        for (var i = 0; i < connectionArray.length; i++){
            if (chemSequenceName ===connectionArray[i].source.name){ //if CHEM is the source node for connection
                sequenceCHEMConnectsTo = connectionArray[i].dest.name;
                nodeCHEMConnectsTo = connectionArray[i].dest.nodeID;
            }
            else if (chemSequenceName === connectionArray[i].dest.name){ //if CHEM is dest node for connection
                sequenceCHEMConnectsTo = connectionArray[i].source.name;
                nodeCHEMConnectsTo = connectionArray[i].source.nodeID;
            }
        }

        //get length of the sequence that CHEM connects to
        for (var j = 0; j < sequenceArray.length; j++){
            if (sequenceCHEMConnectsTo === sequenceArray[j].name){
                length = sequenceArray[j].sequence.length;
            }
        }

        //TO-DO: redo hard-coding with spacing
        if (nodeCHEMConnectsTo < length/2){       //if CHEM node connects near the beginning of another sequence,
            return (100 - monomerSpacing);        //position CHEM node to left
        }
        else {                                    //if CHEM connects near the end of another sequence,
            return ((length-4) * monomerSpacing); //position CHEM node to right
        }

    };


	//makes a cyclic peptide, with two stems on the left and a circle on the right
    $scope.separateSequences = function(sequence, seqName, connectionArray){
            
        //get the start and end points of cycle
        var connectionPoints = $scope.getCyclicalSourceDest(seqName, connectionArray);
        var cycleStartId =  connectionPoints[1];
        var cycleEndId = connectionPoints[0];
        var slicedSeqArr = [];
        var beforeArr = [];
        var afterArr = [];
        var cycle = [];

        for(var i=0;i<sequence.length;i++){
        	if(i < cycleStartId){
				beforeArr.push(sequence[i]);
        	}
        	else if(i>= cycleStartId && i<=cycleEndId ){
				cycle.push(sequence[i]);
        	}
        	else if(i>cycleEndId){
        		afterArr.push(sequence[i]);
        	}
        }

        if(beforeArr.length !== 0){
	        slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', beforeArr));
	    }

	    if(cycle.length !== 0){
        	slicedSeqArr.push(new CanvasDisplayService.ChildSequence('cyclic',cycle));
    	}

        if(afterArr.length !== 0){
        	slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', afterArr));
    	}
        return slicedSeqArr;
               
    };


   //makes a cyclic peptide after determining if there are any linear and cyclic combo
	$scope.makeCyclicPeptide = function(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray){

		var graphedNodes = [];  //array of all nodes created and graphed
	    var currSubGraph;
	    var prevSubGraph;
	  
	  //separate the sequence into linear and cyclical slices
		var slicedSequenceArr =  $scope.separateSequences(sequence, seqName, connectionArray);

		for(var i=0;i<slicedSequenceArr.length;i++){
	    	
	    	var slice = slicedSequenceArr[i];

	    	if(slice.flow === 'linear'){
	    		
	    		currSubGraph = $scope.makeLinearGraph(slice.monomers, dir, seqType, pos, seqName, connectionArray, sequenceArray);
	    		graphedNodes.push(currSubGraph.nodes); 
	    	}
	    	else  {
	    		currSubGraph = $scope.makeCyclicalGraph(slice.monomers, seqType, pos, dir);
	    		graphedNodes.push(currSubGraph.nodes);
	    		dir = 'reverse';
			}

			if(prevSubGraph && currSubGraph){
				$scope.addNewConnection(prevSubGraph.last, currSubGraph.first);
			}

			prevSubGraph = currSubGraph;
			
			if(dir === 'reverse'){
				pos = {
	        		x: prevSubGraph.last.x - monomerSpacing,
	        		y: prevSubGraph.last.y
	    		};
			}
			else {
				pos = {
	        		x: prevSubGraph.last.x + monomerSpacing,
	        		y: prevSubGraph.last.y
	    		};
			}    		
	    }
	        return graphedNodes;
	};

	//helper function for drawing the cycle portion of a cyclical graph
	$scope.makeCyclicalGraph = function(monomerArr, seqType, pos, dir){
        var firstNode;
		var currNode;
		var prevNode;
		var allNodes = [];

		var cyclicalNodes = CanvasDisplayService.makeCycle(monomerArr, seqType, pos, dir);

		angular.forEach(cyclicalNodes, function(value, key) {

			currNode = value;

			if(key === 0){
				firstNode = value;//keep track of firstNode
			}
			$scope.canvasView.addNode(value);
			allNodes.push(value);

			if(prevNode && currNode){
				$scope.addNewConnection(prevNode, currNode);
			}
			prevNode = currNode;
		});

		if(firstNode && currNode){
			$scope.addNewConnection(firstNode, currNode);
		}

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
	};


    //Makes the connections requested in HELM Notation.
    //Each connectionArray element has the following items:
    //      source.name     (eg, 'RNA1')
    //      dest.name       (eg, 'CHEM1')
    //      source.nodeID   (eg, '24')
    //      dest.nodeID     (eg, '1')
    //This example would link the 24th node in the 'RNA1' sequence to the 1st in the 'CHEM1' sequence.
    //
    //@param    connection     array of connections requested in HELM Notation
    //@param    graphedNodes   array of all nodes graphed, each elem has '.name' and '.nodes'
    $scope.makeRequestedConnections = function(connectionArray, graphedNodesArray){

        var j, k;
        var nodes,source, dest = '';
        for (j = 0; j < connectionArray.length; j++){
            if (connectionArray[j].source.name === connectionArray[j].dest.name){
                continue; //skip cyclical connections, which are drawn in 'makeCyclicalGraph()'
            }
            for (k = 0; k < graphedNodesArray.length; k++){ //for each sequence of nodes graphed,
                nodes = graphedNodesArray[k].nodes[0];      //get the array of nodes

                //if found source sequence, get source node
                if (graphedNodesArray[k].name === connectionArray[j].source.name) {
                    source = nodes[(connectionArray[j].source.nodeID) -1];
                }
                //if found destination sequence, get dest node
                else if (graphedNodesArray[k].name === connectionArray[j].dest.name) {
                    dest = nodes[(connectionArray[j].dest.nodeID) -1];
                }
                //if found source and dest nodes, add link
                if (source !== '' && dest !== ''){
                    $scope.addNewConnection(source, dest);
                    source = '';
                    dest = '';
                }
                nodes = '';
            }
        }
    };

    //helper function returns 'true' if sequence is partly, or completely, cyclical
    $scope.isCyclical = function(sequenceName, connectionArray){
        for (var j = 0; j < connectionArray.length; j++){
            if (connectionArray[j].source.name === connectionArray[j].dest.name){
                if (connectionArray[j].source.name === sequenceName) {
                    return true;
                }
            }
        }
        return false;
    };

    //helper function returns source node id and dest node id for cyclical connections
    $scope.getCyclicalSourceDest = function(sequenceName, connectionArray){

        var sourceNodeId, destNodeId;
        for (var j = 0; j < connectionArray.length; j++){
            if (connectionArray[j].source.name === connectionArray[j].dest.name){
                if (connectionArray[j].source.name === sequenceName) {
                    sourceNodeId = connectionArray[j].source.nodeID-1;
                    destNodeId = connectionArray[j].dest.nodeID-1;
                }
            }
        }

        return [sourceNodeId, destNodeId];
    };


    //helper function returns type of sequence
    $scope.getType = function(sequenceName){
        if (sequenceName.toUpperCase().indexOf('RNA') > -1){
            return 'NUCLEOTIDE';
        }
        if (sequenceName.toUpperCase().indexOf('PEPTIDE') > -1){
            return 'PEPTIDE';
        }
        if (sequenceName.toUpperCase().indexOf('CHEM') > -1){
            return 'CHEM';
        }
    };


	// create a new node and add to the view.
	$scope.addNewNode = function (nodeName, seqType, nodeColor, isRotate, xpos, ypos, nodeType) {

		var node = CanvasDisplayService.createNode(nodeName, seqType, nodeColor, isRotate, xpos, ypos, nodeType);
		$scope.canvasView.addNode(node);
		return node;
	};

	//add a connection between 2 nodes
	$scope.addNewConnection = function(sourceNode, destNode){
		var conn = CanvasDisplayService.createConnection(sourceNode, destNode);
		$scope.canvasView.addConnection(conn);

		return conn;
	};

	//reset the canvas display
	$scope.resetCanvas = function(){
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