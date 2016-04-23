'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', 'webService', 'HelmConversionService', 'CanvasDisplayService', 'FileSaver', 'Blob', '$uibModal',
	function ($scope, webService, HelmConversionService, CanvasDisplayService, FileSaver, Blob, $uibModal) {
		var main = this;

		/* Toggle modal dialogue display */
		main.modalShown = false;
		main.toggleModal = function() {
	    	main.modalShown = !main.modalShown;
		};

		/* Variables for loadsequence view */
		main.polyTypes = [
		{ value: 'HELM', label:'HELM' },
	    { value: 'RNA', label:'RNA/DNA' },
	    { value: 'PEPTIDE', label:'PEPTIDE' },
		];

		$scope.polymerType = main.polyTypes[0];
		main.result = '';

		/* Check if need to validate HELM input, or convert input to Helm */
		main.processInput = function (polymerType, inputSequence) {
		  /* Check that input is not empty */
	    if (!angular.isDefined(inputSequence)) {
	      window.alert('Invalid input');
	      return;
	    }
	    /* TODO: Check that input is valid type? */
	    if (polymerType.value === 'HELM') {
	    	main.validateHelmNotation(inputSequence);
	    }
	    else {
	    	main.getHelmNotation(polymerType, inputSequence);
	    }
	    main.toggleModal();
	};


	/* clear the modal dialog text area*/
	main.clear = function (){
		//TO-DO - change this to angular selector
		document.getElementById('input').value = '';
	};

	/* Invoke factory function to get HELM notation */

	main.getHelmNotation = function (polymerType, inputSequence) {
	    var successCallback = function (helmNotation) {
	      main.helm = helmNotation;
	      $scope.displayOnCanvas(helmNotation);
	    };
	    var errorCallback = function(response) {
	      main.result = response.data;
	      console.log(response.data);
	    };

	    $scope.resetCanvas();
	    switch(polymerType.value) {
	      case 'PEPTIDE':
	        webService.getHelmNotationPeptide(inputSequence).then(successCallback, errorCallback);
	        break;
	      case 'RNA':
	        webService.getHelmNotationRna(inputSequence).then(successCallback, errorCallback);
	    }
	};

	/* Invoke factory function to validate the HELM notation */
	main.validateHelmNotation = function (inputSequence) {
		var successCallback = function (valid) {
		  if (valid) {
		  	main.helm = inputSequence;
		  	$scope.displayOnCanvas(inputSequence);
		  }
		  else {
		  	main.result = 'INVALID HELM SEQUENCE';
		  }
		};
		var errorCallback = function (response) {
		  main.result = response.data;
		  console.log(response.data);
		};

		$scope.resetCanvas();
	    webService.validateHelmNotation(inputSequence).then(successCallback, errorCallback);
	};

	/* Invoke factory function to get molecular weight */
	main.getMolecularWeight = function (inputSequence) {
		var successCallback = function (result) {
	      main.molecularweight = result;
	    };
	    var errorCallback = function(response) {
	      console.log(response.data);
	    };
	    webService.getMolecularWeight(inputSequence).then(successCallback, errorCallback);
	 };

	 /* Invoke factory function to get milecular formula */
	main.getMolecularFormula = function (inputSequence) {
		var successCallback = function (result) {
	      main.molecularformula = result;
	    };
	    var errorCallback = function(response) {
	      console.log(response.data);
	    };
	    webService.getMolecularFormula(inputSequence).then(successCallback, errorCallback);
	 };

	 /* Invoke factory function to get the extinction coefficient */
	main.getExtinctionCoefficient = function (inputSequence) {
		var successCallback = function (result) {
	      main.extcoefficient = result;
	      console.log(result);
	    };
	    var errorCallback = function(response) {
	      console.log(response.data);
	    };
	    webService.getExtinctionCoefficient(inputSequence).then(successCallback, errorCallback);
	 };

	/* clear the modal dialog text area*/
	main.clear = function (){
		//TO-DO - change this to angular selector
		document.getElementById('input').value = '';
	};

	/*
	 * Begin code for lower pane
	 */
   	/* Variables for view types in lower pane */
	main.viewTypes = [
	    { value: 'HELM', label:'HELM' },
	    { value: 'Sequence', label:'Sequence' },
	    { value: 'Molecule Properties', label:'Molecule Properties' },
	];
	$scope.viewType = main.viewTypes[0];
	$scope.helm = true;
	$scope.sequence = false;
	$scope.moleculeprops = false;
	main.result = '';
	main.helm = '';
	main.componenttype = '';
	main.molecularweight = '';
	main.molecularformula = '';
	main.extcoefficient = '';
	/* view type selection event handler */
	$scope.updateLower = function(selectedView) {
		$scope.viewType = selectedView;
		switch(selectedView.value) {
	      case 'HELM':
	      	$scope.helm = true;
			$scope.sequence = false;
			$scope.moleculeprops = false;
			break;
	      case 'Molecule Properties':
	        $scope.helm =false;
	        $scope.sequence = false;
			$scope.moleculeprops = true;
			if(main.helm !== '' && main.molecularformula === '') {
				main.getMolecularWeight(main.helm);
				main.getMolecularFormula(main.helm);
				main.getExtinctionCoefficient(main.helm);
			}
	        break;
	      case 'Sequence':
	      	$scope.helm = false;
	      	$scope.moleculeprops = false;
			$scope.sequence = true;
	        break;
	    }
	};

	/*
	* Begin code for Canvas
	*/
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
	$scope.displayOnCanvas = function (notation) {
	    //from HELM Notation, get requested sequences and connections between sequences
      var helmTranslation = HelmConversionService.convertHelmNotationToSequence(notation);
      var sequenceArray = helmTranslation[0];   //each element has .name and .sequence (array of letters)
      var connectionArray = helmTranslation[1]; //each element has .source and .dest

      //make nodes and draw sequences
      var pos;
      var graphedNodes = [];
      for (var i = 0; i < sequenceArray.length; i++){
        var seqType = $scope.getType(sequenceArray[i].name); //PEPTIDE, NUCLEOTIDE, or CHEM
        main.seqtype = seqType;
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

      $scope.zoom(0.8);//zoomin the default view by 20%
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
        var nodes = $scope.makeCyclicPeptide(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray);
        graphedNodes.push(nodes);
      }
      return graphedNodes;
	};

	//makes a linear graph starting from the pos
	//returns a Subgraph obj, thats already drawn on the canvas
	//a subgraph has firstNode, lastNode and array of allnodes in the graph
	$scope.makeLinearGraph = function (monomerArr, dir, seqType, pos, sequenceName, connectionArray, sequenceArray) {
		var subGraph;

		if (seqType === 'NUCLEOTIDE') {
			subGraph = $scope.processNucleoTides(monomerArr, pos, dir);
		}
		else if (seqType === 'PEPTIDE') {
			subGraph = $scope.processPeptides(monomerArr, pos, dir);
		}
		else if (seqType === 'CHEM') {//chemical modifiers
			subGraph = $scope.processChemicalModifiers(monomerArr, sequenceName, pos, connectionArray, sequenceArray);
		}
		return subGraph;
	};

	//helper function which draws nucleotide sequences
	$scope.processNucleoTides = function (monomerArr, pos, dir) {

		var prevNode, currNode,firstNode, riboseNode, baseNode, color;
		var x = pos.x;
		var y = pos.y;
		var allNodes = [];

		angular.forEach(monomerArr, function(value, key) {
			color = CanvasDisplayService.getNodeColor(value);

			if (CanvasDisplayService.isPhosphateNode(value)) {//phosphate node, 'p' or 'sP'
				currNode = CanvasDisplayService.createPhosphate(value, color, x, y);
				if (key === 0){//keep track of first node
					firstNode = currNode;
				}
				allNodes.push(currNode);
				$scope.canvasView.addNode(currNode);

				if (prevNode){
					$scope.addNewConnection(prevNode, currNode);
				}
			}
			else if (CanvasDisplayService.isRiboseNode(value)) {//ribose node
				if (prevNode){
					currNode = CanvasDisplayService.createRibose(value, color, prevNode.x + monomerSpacing , y);
	          	}
	          	else {
					currNode = CanvasDisplayService.createRibose(value, color, x , y);
	          	}
				riboseNode = currNode;
				if (key === 0){
					firstNode = currNode;
				}
				allNodes.push(currNode);
				$scope.canvasView.addNode(currNode);
				if (prevNode){
					$scope.addNewConnection(prevNode, currNode);
				}
			}
			else {//base node

				if (riboseNode){
					baseNode = CanvasDisplayService.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength);
					if (key === 0){
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
				if (dir === 'reverse'){
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
	$scope.processPeptides = function (monomerArr, pos, dir) {

		var prevNode, currNode, firstNode;
		var x = pos.x;
		var y = pos.y;
		var allNodes = [];

		angular.forEach(monomerArr, function(value, key) {

			currNode = CanvasDisplayService.createNode(value, 'PEPTIDE', '#00C3FF', true, x , y);
			allNodes.push(currNode);
			$scope.canvasView.addNode(currNode);
			if (key === 0) {
				firstNode = currNode;
			}
			if (prevNode) {
				$scope.addNewConnection(prevNode, currNode);
			}
			prevNode = currNode;

			if (dir === 'reverse') {
				x = currNode.x - monomerSpacing;
			}
			else {
				x = currNode.x + monomerSpacing;
			}
		});

		return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
	};

	//helper function which draws CHEM sequences
    //TO-DO: verify that CHEM sequences always consist of only 1 element
	$scope.processChemicalModifiers = function (monomerArr, chemSequenceName, pos, connectionArray, sequenceArray) {

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
    $scope.getCHEMXPosition = function (connectionArray, chemSequenceName,sequenceArray) {
      var sequenceCHEMConnectsTo, nodeCHEMConnectsTo, length;

      //get the sequence name and number for node that CHEM connections to
      for (var i = 0; i < connectionArray.length; i++) {
        if (chemSequenceName ===connectionArray[i].source.name) { //if CHEM is the source node for connection
          sequenceCHEMConnectsTo = connectionArray[i].dest.name;
          nodeCHEMConnectsTo = connectionArray[i].dest.nodeID;
        }
        else if (chemSequenceName === connectionArray[i].dest.name) { //if CHEM is dest node for connection
          sequenceCHEMConnectsTo = connectionArray[i].source.name;
          nodeCHEMConnectsTo = connectionArray[i].source.nodeID;
        }
      }

      //get length of the sequence that CHEM connects to
      for (var j = 0; j < sequenceArray.length; j++) {
        if (sequenceCHEMConnectsTo === sequenceArray[j].name) {
          length = sequenceArray[j].sequence.length;
        }
      }

      //TO-DO: redo hard-coding with spacing
      if (nodeCHEMConnectsTo < length/2) {    //if CHEM node connects near the beginning of another sequence,
        return (100 - monomerSpacing);        //position CHEM node to left
      }
      else {                                  //if CHEM connects near the end of another sequence,
        return ((length-4) * monomerSpacing); //position CHEM node to right
      }
    };

	//makes a cyclic peptide, with two stems on the left and a circle on the right
    $scope.separateSequences = function (sequence, seqName, connectionArray) {

        //get the start and end points of cycle
        var connectionPoints = $scope.getCyclicalSourceDest(seqName, connectionArray);
        var cycleStartId =  connectionPoints[1];
        var cycleEndId = connectionPoints[0];
        var slicedSeqArr  =  [];
        var beforeArr = [];
        var afterArr = [];
        var cycle = [];

        for (var i=0;i<sequence.length;i++) {
        	if (i < cycleStartId) {
				beforeArr.push(sequence[i]);
        	}
        	else if (i>= cycleStartId && i<=cycleEndId) {
				cycle.push(sequence[i]);
        	}
        	else if (i>cycleEndId) {
        		afterArr.push(sequence[i]);
        	}
        }

        if (beforeArr.length !== 0) {
	        slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', beforeArr));
	  	}
   		if (cycle.length !== 0) {
  			slicedSeqArr.push(new CanvasDisplayService.ChildSequence('cyclic',cycle));
		}
		if (afterArr.length !== 0) {
        	slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', afterArr));
    	}
        return slicedSeqArr;
    };

  	//makes a cyclic peptide after determining if there are any linear and cyclic combo
	$scope.makeCyclicPeptide = function (sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray) {

		var graphedNodes = [];  //array of all nodes created and graphed
	    var currSubGraph;
	    var prevSubGraph;

		  //separate the sequence into linear and cyclical slices
			var slicedSequenceArr =  $scope.separateSequences(sequence, seqName, connectionArray);

			for (var i=0;i<slicedSequenceArr.length;i++) {
	    	var slice = slicedSequenceArr[i];

	    	if (slice.flow === 'linear') {
	    		currSubGraph = $scope.makeLinearGraph(slice.monomers, dir, seqType, pos, seqName, connectionArray, sequenceArray);
	    		graphedNodes.push(currSubGraph.nodes);
	    	}
	    	else {
	    		currSubGraph = $scope.makeCyclicalGraph(slice.monomers, seqType, pos, dir);
	    		graphedNodes.push(currSubGraph.nodes);
	    		dir = 'reverse';
			}
			if (prevSubGraph && currSubGraph) {
				$scope.addNewConnection(prevSubGraph.last, currSubGraph.first);
			}
			prevSubGraph = currSubGraph;

			if (dir === 'reverse') {
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
	$scope.makeCyclicalGraph = function (monomerArr, seqType, pos, dir) {
  		var firstNode, currNode, prevNode;
		var allNodes = [];

		var cyclicalNodes = CanvasDisplayService.makeCycle(monomerArr, seqType, pos, dir);

		angular.forEach(cyclicalNodes, function (value, key) {
			currNode = value;
			if (key === 0){
				firstNode = value;//keep track of firstNode
			}
			$scope.canvasView.addNode(value);
			allNodes.push(value);

			if (prevNode && currNode){
				$scope.addNewConnection(prevNode, currNode);
			}
			prevNode = currNode;
		});

		if (firstNode && currNode){
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
    $scope.makeRequestedConnections = function (connectionArray, graphedNodesArray) {

      var j, k;
      var nodes,source, dest = '';
      for (j = 0; j < connectionArray.length; j++){
        if (connectionArray[j].source.name === connectionArray[j].dest.name) {
          continue; //skip cyclical connections, which are drawn in 'makeCyclicalGraph()'
        }
        for (k = 0; k < graphedNodesArray.length; k++) { //for each sequence of nodes graphed,
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
    $scope.isCyclical = function (sequenceName, connectionArray) {
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
    $scope.getCyclicalSourceDest = function (sequenceName, connectionArray) {
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
    $scope.getType = function (sequenceName) {
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
		var node = CanvasDisplayService.createNode(nodeName, seqType, nodeColor,
													isRotate, xpos, ypos, nodeType);
		$scope.canvasView.addNode(node);
		return node;
	};

	//add a connection between 2 nodes
	$scope.addNewConnection = function (sourceNode, destNode) {
		var conn = CanvasDisplayService.createConnection(sourceNode, destNode);
		$scope.canvasView.addConnection(conn);
		return conn;
	};

	//reset the canvas display
	$scope.resetCanvas = function () {
		var emptyData = {
			nodes: [],
			connections: []
		};
		CanvasDisplayService.setNodeNum(0);
		$scope.canvasView = new CanvasDisplayService.CanvasView(emptyData);
		$scope.updateLower(main.viewTypes[0]);
		main.result = '';
		main.seqtype = '';
		main.helm = '';
		main.molecularweight = '';
		main.molecularformula = '';
		main.extcoefficient = '';
	};

	/* zoom and pan functions */
	$scope.zoom = function (scale, evt){
		CanvasDisplayService.zoom(scale, evt);
	};

	$scope.pan = function (dx, dy, evt){
		CanvasDisplayService.pan(dx, dy, evt);
	};

	/*
	 * Begin code for lower pane
	 */
   	/* Variables for view types in lower pane */
	main.viewTypes = [
	    { value: 'HELM', label:'HELM' },
	    { value: 'Sequence', label:'Sequence' },
	    { value: 'Molecule Properties', label:'Molecule Properties' },
	];
	$scope.viewType = main.viewTypes[0];
	$scope.helm = true;
	$scope.sequence = false;
	$scope.moleculeprops = false;
	main.result = '';
	main.helm = '';
	main.componenttype = '';
	main.molecularweight = '';
	main.molecularformula = '';
	main.extcoefficient = '';
	/* view type selection event handler */
	$scope.updateLower = function(selectedView) {
		$scope.viewType = selectedView;
		switch(selectedView.value) {
	      case 'HELM':
	      	$scope.helm = true;
			$scope.sequence = false;
			$scope.moleculeprops = false;
			break;
	      case 'Molecule Properties':
	        $scope.helm =false;
	        $scope.sequence = false;
			$scope.moleculeprops = true;
			if(main.helm !== '' && main.molecularformula === '') {
				main.getMolecularWeight(main.helm);
				main.getMolecularFormula(main.helm);
				main.getExtinctionCoefficient(main.helm);
			}
	        break;
	      case 'Sequence':
	      	$scope.helm = false;
	      	$scope.moleculeprops = false;
			$scope.sequence = true;
	        break;
	    }
	};

	// Create the view for the canvas and attach to the scope.
	$scope.canvasView = new CanvasDisplayService.CanvasView(helmDataModel);


	/*****************/
	/*  right-click  */
	/*****************/

	//helper function - download file to user's browser
	$scope.downloadFile = function(){

		//make filename - eg, "HELM.04.21.2016.txt"
		var now = new Date();
		var date = (now.getMonth()+1) + "." + now.getDate() + "." + now.getFullYear();
		var filename = "HELM."+ date + $scope.fileExtension;

		//Safari - can't name file
		//http://stackoverflow.com/questions/12802109/download-blobs-locally-using-safari
		if (typeof safari !== 'undefined'){
			//alert("When downloading from Safari, filenames are not provided.  Please rename the file.");
			window.open('data:attachment/csv;charset=utf-8,' + encodeURI($scope.requestednotation));
		}
		//Chrome, Firefox (should work in IE, but not tested)
		//FileSaver: https://github.com/alferov/angular-file-saver#filesaver
		//Supported browsers: https://github.com/eligrey/FileSaver.js/#supported-browsers
		else {
			var blob = new Blob([$scope.requestednotation], {type: 'text/plain;charset=utf-8'});
			FileSaver.saveAs(blob, filename);
		}
	};

	//helper function - show notation in modal
	//ui-bootstrap modal doc: https://angular-ui.github.io/bootstrap/
	$scope.open = function(){
      	$uibModal.open({
        	templateUrl: '/templates/viewmodal.html',
        	controller: 'modal',
			scope: $scope,
		});
    };

	//helper function - show molecular properties table in modal
	//TODO - should show Mass
	$scope.openMolecularPropertiesModal = function(){
		$uibModal.open({
			templateUrl: '/templates/tablemodal.html',
			controller: 'modal',
			scope: $scope,
		});
	};

	//helper function - show image in modal
	$scope.openImageView = function(){
		$uibModal.open({
			templateUrl: '/templates/imagemodal.html',
			controller: 'modal',
			scope: $scope,
		});
	};

	//helper function - copy string to user's clipboard
	//source: http://stackoverflow.com/questions/25099409/copy-to-clipboard-as-plain-text
	$scope.copyToClipboard = function(){
		var input = document.createElement('textarea');
		document.body.appendChild(input);
		input.value = $scope.requestednotation;
		input.focus();
		input.select();
		document.execCommand('Copy');
		input.remove();
	};

	//options for right-click context-menu
	//contextMenu doc: https://github.com/Templarian/ui.bootstrap.contextMenu
	$scope.menuOptions = [

		['Show Molecular Structure', function () {
			//TODO - this is only an example image
			$scope.requestedview = "/images/cyclicalpeptide.png";
			$scope.openImageView();
		}],
		null,
		['View', function (){
		},[
			['HELM Notation', function () {
				$scope.requestedview = main.helm;
				$scope.open();
			}],
			['Canonical HELM Notation', function (){
				$scope.requestedview = "TO-DO: CANONICAL HELM NOTATION";
				$scope.open();
			}],
			['xHELM Notation', function (){
				$scope.requestedview = "TO-DO: xHELM NOTATION";
				$scope.open();
			}],
			['SMILES', function () {
				$scope.requestedview = "TO-DO: SMILES NOTATION";
				$scope.open();
			}],
			['MDL Molfile', function (){
				$scope.requestedview = "TO-DO: MDL MOLFILE NOTATION";
				$scope.open();
			}],
			['PDB Format', function (){
				$scope.requestedview = "TO-DO: PDB FORMAT";
				$scope.open();
			}],
			['Molecule Properties', function (){
				$scope.updateLower(main.viewTypes[2]);
				$scope.openMolecularPropertiesModal();
			}]
		]],
		null,
		['Copy', function (){
		},[
			/*['Image', function ($itemScope){
				$scope.requestednotation = "/images/cyclicalpeptide.png";  //TO-DO: Enable copy image
				$scope.copyToClipboard();
			}],*/
			['HELM Notation', function () {
				$scope.requestednotation = main.helm;
				$scope.copyToClipboard();
			}],
			['Canonical HELM Notation', function (){
				$scope.requestednotation = "TO-DO: GET CANONICAL HELM";
				$scope.copyToClipboard();
			}],
			['xHELM Notation', function (){
				$scope.requestednotation = "TO-DO: GET xHELM";
				$scope.copyToClipboard();
			}],
			['SMILES', function () {
				$scope.requestednotation = "TO-DO: GET SMILES";
				$scope.copyToClipboard();
			}],
			['MDL Molfile', function (){
				$scope.requestednotation = "TO-DO: GET MDL MOLFILE";
				$scope.copyToClipboard();
			}]
		]],
		null,
		['Save', function (){
		},[
			['HELM Notation', function () {
				$scope.requestednotation = main.helm;
				$scope.fileExtension = '.helm';
				$scope.downloadFile();
			}],
			['Canonical HELM Notation', function (){
				$scope.requestednotation = "TO-DO:_GET_CANONICAL_HELM";
				$scope.fileExtension = '.chelm';
				$scope.downloadFile();
			}],
			['xHELM Notation', function (){
				$scope.requestednotation = "TO-DO:_GET_xHELM";
				$scope.fileExtension = '.xhelm';
				$scope.downloadFile();
			}],
			['SMILES', function () {
				$scope.requestednotation = "TO-DO:_GET_SMILES";
				$scope.fileExtension = '.smi';
				$scope.downloadFile();
			}],
			['MDL Molfile', function (){
				$scope.requestednotation = "TO-DO:_MDL_Molfile";
				$scope.fileExtension = '.mol';
				$scope.downloadFile();
			}]
		]]

	];

	//TODO- remove the below - notes for clicking on specific nodes
	//http://stackoverflow.com/questions/15731634/how-do-i-handle-right-click-events-in-angular-js
	//https://pterkildsen.com/2013/06/28/create-a-html5-canvas-element-with-clickable-elements/

}]);
