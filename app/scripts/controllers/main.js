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
        
        //not returning proper cyclical and noncyclical nodes now, so hardcoded.
		var seq = $scope.separateSequences(sequence, connection);
       
        var pos; 
       
        //for each sequence, graph nodes and store nodes in array
        var graphedNodes = [];
        for (var i = 0; i < sequence.length; i++){
			pos = CanvasDisplayService.getNewRowPos(pos, i);//add a new row for a every iteration
            	
            graphedNodes.push({
            	name : sequence[i].name,
                nodes : $scope.generateGraph(seq, pos),

            });
 			CanvasDisplayService.setNodeNum(0); //reset node numbering
        }
        
       $scope.makeRequestedConnections(connection, graphedNodes);
    };

    //Parse the sequence, and generate the graph
	$scope.generateGraph = function (sequenceObj, pos) {

		var seqType = sequenceObj.type;
		var childrenArr = sequenceObj.children;
		var childSeq;

		var allLinearGraphs = [];
		var allCyclicalGraphs = [];
		
		var currSubGraph;
		var prevSubGraph;

		var dir;

		var isPrevNodeCyclic;

		var allNodes = [];	
		for(var i=0;i<childrenArr.length;i++){
					
			childSeq = childrenArr[i];		

			if(childSeq.flow === 'linear'){
				alert(dir);
				isPrevNodeCyclic = 'false';
				currSubGraph = $scope.makeLinearGraph(childSeq.monomers, dir, seqType,  pos);
				allLinearGraphs.push(currSubGraph);

			}			
			else{
				currSubGraph = $scope.makeCyclicalGraph(childSeq.monomers, seqType, pos);	
				isPrevNodeCyclic = 'true';
				allCyclicalGraphs.push(currSubGraph);	
			}

			if(prevSubGraph && currSubGraph){
				$scope.addNewConnection(currSubGraph.first, prevSubGraph.last, 'h');//connect 2 nodes 
			}

			prevSubGraph = currSubGraph;
			allNodes.push(currSubGraph.nodes);

			
			if(isPrevNodeCyclic === 'true'){
				dir = 'reverse';
				pos = {
					x: prevSubGraph.last.x - monomerSpacing,
					y: prevSubGraph.last.y 
				};
			}
			else{
				pos = {
					x: prevSubGraph.last.x + monomerSpacing ,
					y: prevSubGraph.last.y
				};
			} 					
		}

		return $scope.collapseNodes(allNodes);
			
	}


	$scope.collapseNodes = function(allNodesArr){
		
		var nodes = [];

		for(var i=0; i<allNodesArr.length;i++){
			nodes = nodes.concat(allNodesArr[i]);

		}

		return nodes;

	};

	//makes a linear graph starting from the pos
	$scope.makeLinearGraph = function(monomerArr, dir, seqType, pos){

		var x = pos.x;
		var y = pos.y; 
		
		var color;

        var allNodes = [];
        var riboseNode;
	    var baseNode;
	    var prevNode;
	    var reverse;
		var currNode;
		var firstNode;

		angular.forEach(monomerArr, function(value, key) {

			color = CanvasDisplayService.getNodeColor(value);
		
			if(seqType.toUpperCase().indexOf('RNA') > -1) {//Nucleotide

				if(CanvasDisplayService.isPhosphateNode(value)){//phosphate node
					 currNode = CanvasDisplayService.createPhosphate(value, color, x, y);
					 if(key === 0){//keep track of first node
						firstNode = currNode;
					 }
					 allNodes.push(currNode);
					 $scope.canvasView.addNode(currNode);

					if(prevNode){
						$scope.addNewConnection(prevNode, currNode, 'h');
					}					
				}
				else if (CanvasDisplayService.isRiboseNode(value)){//ribose node
					if(prevNode)
						currNode = CanvasDisplayService.createRibose(value, color, prevNode.x + monomerSpacing , y);
					else 
						currNode = CanvasDisplayService.createRibose(value, color, x , y);

					riboseNode = currNode;
					if(key === 0){
						firstNode = currNode;
					 }
					allNodes.push(currNode);
					$scope.canvasView.addNode(currNode);

					if(prevNode){
						$scope.addNewConnection(prevNode, currNode, 'h');
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

					if (riboseNode && baseNode){//make vertical connection
						$scope.addNewConnection(riboseNode, baseNode, 'v');
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

			}
			else if (seqType.toUpperCase().indexOf("PEPTIDE") > -1) {//Peptide
				currNode = CanvasDisplayService.createNode(value, "PEPTIDE", "lightblue", "true", x , y);
                allNodes.push(currNode);
				$scope.canvasView.addNode(currNode);
				if(key === 0){
					firstNode = currNode;
				 }
				if (prevNode){
    	 	    	$scope.addNewConnection(prevNode, currNode, 'h');//connect 2 nodes horizontally
            	}
            	prevNode = currNode;

            	if(dir === 'reverse'){
            		x = currNode.x - monomerSpacing;
	            }
	            else{

					x = currNode.x + monomerSpacing;
	            }
			}
            else if (seqType.toUpperCase().indexOf("CHEM") > -1) {//chem nodes
                //TO-DO: figure out how to decipher where Chem node should be positioned on canvas
                currNode = CanvasDisplayService.createNode(value, "CHEM", "purple", false, x , y);
                allNodes.push(currNode);
                if(key === 0){
					firstNode = currNode;
				 }
                $scope.canvasView.addNode(currNode);
            }

		});

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);		
	};



	$scope.makeCyclicalGraph = function(monomerArr, seqType, pos){

		var currNode;
		var prevNode;


		console.log(pos);
		
		var firstNode;
		var cyclicalNodes = CanvasDisplayService.makeCycle(monomerArr, seqType, pos);
		var allNodes = [];
		
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

           
//hardcoding for now, remove when this method will return a SequenceObj

//*****hardcoding begins*****

        var child1 = new CanvasDisplayService.ChildSequence("linear", ['A','R']);
		var child2 = new CanvasDisplayService.ChildSequence("cyclical", ['C','A','A','K','T','C']);
		var child3 = new CanvasDisplayService.ChildSequence("linear", ['D','A']);
				
		var monomers = [child1, child2, child3]

		var seqObj = new CanvasDisplayService.Sequence("PEPTIDE", monomers);
//******hardcoding ends******

        return seqObj;
	
       // return [ cyclicalSequences, nonCyclicalSequences];
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

		return conn;
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
