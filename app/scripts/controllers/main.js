'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', 'webService', 'HelmConversionService', 'CanvasDisplayService', 'MonomerSelectionService', 'HELMNotationService', 'FileSaver', 'Blob', '$uibModal', 
  function ($scope, webService, HelmConversionService, CanvasDisplayService, MonomerSelectionService, HELMNotationService, FileSaver, Blob, $uibModal) {
    var self = this;

    /* Toggle modal dialogue display */
    self.modalShown = false;
    self.toggleModal = function() {
      self.modalShown = !self.modalShown;
    };

    /* Variables for loadsequence view */
    self.polyTypes = [
      { value: 'HELM', label:'HELM' },
      { value: 'RNA', label:'RNA/DNA' },
      { value: 'PEPTIDE', label:'PEPTIDE' },
    ];
    // the selected one
    self.polymerType = self.polyTypes[0];

    // indicates whether to reset during loading a new sequence 
    self.shouldReset = true;
    self.result = '';

    /* Check if need to validate HELM input, or convert input to Helm */
    self.processInput = function (polymerType, inputSequence) {
      /* Check that input is not empty */
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
      }

      // clear the canvas if the reset check box is selected
      if (self.shouldReset) {
        // $scope.resetCanvas(); 
        CanvasDisplayService.resetCanvas();
      }
      
      /* TODO: Check that input is valid type? */
      if (self.polymerType.value === 'HELM') {
        self.validateHelmNotation(inputSequence);
      }
      else {
        self.getHelmNotation(self.polymerType, inputSequence);
      }
      self.toggleModal();
    };
    
    /* clear the modal dialog text area*/
    self.clear = function () {
      var modalInputField = document.getElementById('input');
      if (modalInputField) {
        modalInputField.value = '';  
      }  
    };

    /* Invoke factory function to get HELM notation */
    self.getHelmNotation = function (polymerType, inputSequence) {
      var successCallback = function (helmNotation) {
        self.helm = helmNotation;
        HELMNotationService.setHelm(helmNotation);
        $scope.displayOnCanvas(helmNotation);
        CanvasDisplayService.loadHelmTranslationData(HelmConversionService.convertHelmNotationToSequence(helmNotation));
        self.getCanonicalHelmNotation(self.helm);
      };
      var errorCallback = function(response) {
        self.result = response.data;
        HELMNotationService.setHelm('');
        console.log(response.data);
      };

      switch(polymerType.value) {
        case 'PEPTIDE':
          webService.getHelmNotationPeptide(inputSequence).then(successCallback, errorCallback);
          break;
        case 'RNA':
          webService.getHelmNotationRna(inputSequence).then(successCallback, errorCallback);
      }
    };

    /* Invoke factory function to validate the HELM notation */
    self.validateHelmNotation = function (inputSequence) {
      // make sure that we have a string to even pass
      console.log(inputSequence);
      if (inputSequence === null || inputSequence.length === 0) {
        self.helm = '';
        HELMNotationService.setHelm('');
        return;
      }

      var successCallback = function (valid) {
        if (valid) {
          self.helm = inputSequence;
          HELMNotationService.setHelm(inputSequence);
          // $scope.displayOnCanvas(inputSequence);
          CanvasDisplayService.loadHelmTranslationData(HelmConversionService.convertHelmNotationToSequence(inputSequence));
          self.getCanonicalHelmNotation(self.helm);
        }
        else {
          self.result = 'INVALID HELM SEQUENCE';
          HELMNotationService.setHelm('');
        }
      };
      var errorCallback = function (response) {
        self.result = response.data;
        console.log(response.data);
      };

      webService.validateHelmNotation(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get canonical helm notation */
    self.getCanonicalHelmNotation = function (inputSequence) {
      var successCallback = function (result) {
        self.chelm = result;
        console.log(result);
      };
      var errorCallback = function(response) {
        console.log(response.data);
        if(response.status === 400) {
           self.chelm = response.data;
        }
      };
      webService.getConversionCanonical(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get molecular weight */
    self.getMolecularWeight = function (inputSequence) {
      var successCallback = function (result) {
        self.molecularweight = result;
      };
      var errorCallback = function(response) {
        console.log(response.data);
      };
      webService.getMolecularWeight(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get molecular formula */
    self.getMolecularFormula = function (inputSequence) {
      var successCallback = function (result) {
        self.molecularformula = result;
      };
      var errorCallback = function(response) {
        console.log(response.data);
      };
      webService.getMolecularFormula(inputSequence).then(successCallback, errorCallback);
    };

     /* Invoke factory function to get the extinction coefficient */
    self.getExtinctionCoefficient = function (inputSequence) {
      var successCallback = function (result) {
        self.extcoefficient = result;
        console.log(result);
      };
      var errorCallback = function(response) {
        console.log(response.data);
      };
      webService.getExtinctionCoefficient(inputSequence).then(successCallback, errorCallback);
    };

    // link up the canvas that we are displaying
    self.getCanvasView = function () {
      return CanvasDisplayService.canvasView;
    };
    CanvasDisplayService.resetCanvas();
    self.logCanvasView = function () {
      console.log(self.getCanvasView());
    };



    // /*
    // * Begin code for Canvas
    // */
    // //space between 2 adjacent horizontal nodes
    // var monomerSpacing = 50;

    // //length of a connection, between A and attacher node R
    // var connectionLength = 70;

    // // Setup the data-model with nodes and connections
    // var helmDataModel = {
    //   nodes: [],
    //   connections: []
    // };
    // var zoomCount = 0;
    // //function which takes in a HELM notation, converts to sequence and draws graphical image on the canvas
    // $scope.displayOnCanvas = function (notation) {
    //   //from HELM Notation, get requested sequences and connections between sequences
    //   var helmTranslation = HelmConversionService.convertHelmNotationToSequence(notation);
    //   var sequenceArray = helmTranslation[0];   //each element has .name and .sequence (array of letters)
    //   var connectionArray = helmTranslation[1]; //each element has .source and .dest

    //   //make nodes and draw sequences
    //   var pos;
    //   var graphedNodes = [];

    //   CanvasDisplayService.setNodeID(0); // want node IDs to start at 0 for each new graph

    //   var prevSeqType;

    //   for (var i = 0; i < sequenceArray.length; i++) {
    //     var seqType = $scope.getType(sequenceArray[i].name); //PEPTIDE, NUCLEOTIDE, or CHEM
    //     self.seqtype = seqType;
    //     pos = CanvasDisplayService.getNewRowPos(pos, seqType, prevSeqType);     //add a new row for a every iteration
    //     prevSeqType = seqType;
    //     graphedNodes.push({
    //       name : sequenceArray[i].name,
    //       nodes : $scope.generateGraph(sequenceArray[i].sequence, sequenceArray[i].name, connectionArray, pos, seqType, sequenceArray)
    //     });

    //     CanvasDisplayService.setNodeNum(0); //reset node numbering
    //     CanvasDisplayService.setParamNum(0);
    //   }

    //   //draw any links between sequences
    //   if (connectionArray.length > 0) {
    //     $scope.makeRequestedConnections(connectionArray, graphedNodes);
    //   }
    
    //   //zoomin the default view by 20%
    //   if (zoomCount === 0) {
    //     $scope.zoom(0.8, null, document.getElementById('selfCanvas'));
    //     $scope.zoom(1.0, null, document.getElementById('lowerCanvas'));
    //   }
    // };

    // //Parse the sequence, and generate the graph
    // //returns all drawn nodes
    // //the nodes are used to make the connections explicitly specified in the HELM notation
    // $scope.generateGraph = function (sequence, seqName, connectionArray, pos, seqType, sequenceArray) {//(sequenceObj, pos) {
    //   var currSubGraph;
    //   var graphedNodes = [];  //all nodes created and graphed
    //   var dir = 'forward';    //'forward' places nodes left to right, 'reverse' places them right to left

    //   if (!$scope.isCyclical(seqName, connectionArray)){  //if sequence is linear, no cycle found
    //     currSubGraph = $scope.makeLinearGraph(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray);
    //     graphedNodes.push(currSubGraph.nodes);
    //   }
    //   else {
    //     var nodes = $scope.makeGraphWithCycles(sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray);
    //     graphedNodes.push(nodes);
    //   }
    //   return graphedNodes;
    // };

    // //makes a linear graph starting from the pos
    // //returns a Subgraph obj, thats already drawn on the canvas
    // //a subgraph has firstNode, lastNode and array of allnodes in the graph
    // $scope.makeLinearGraph = function (monomerArr, dir, seqType, pos, sequenceName, connectionArray, sequenceArray) {
    //   var subGraph;

    //   if (seqType === 'NUCLEOTIDE') {
    //     subGraph = $scope.processNucleoTides(monomerArr, pos, dir, sequenceName);
    //   }
    //   else if (seqType === 'PEPTIDE') {
    //     subGraph = $scope.processPeptides(monomerArr, pos, dir, sequenceName);
    //   }
    //   else if (seqType === 'CHEM') {//chemical modifiers
    //     subGraph = $scope.processChemicalModifiers(monomerArr, sequenceName, pos, connectionArray, sequenceArray);
    //   }
    //   return subGraph;
    // };

    // //helper function which draws nucleotide sequences
    // $scope.processNucleoTides = function (monomerArr, pos, dir, sequenceName) {

    //   var prevNode, currNode,firstNode, riboseNode, baseNode, color;
    //   var x = pos.x;
    //   var y = pos.y;
    //   var allNodes = [];

    //   angular.forEach(monomerArr, function(value, key) {
    //     color = CanvasDisplayService.getNodeColor(value);

    //     if (CanvasDisplayService.isPhosphateNode(value)) {//phosphate node, 'p' or 'sP'
    //       currNode = CanvasDisplayService.createPhosphate(value, color, x, y, sequenceName);
    //       if (key === 0) {//keep track of first node
    //         firstNode = currNode;
    //       }
    //       allNodes.push(currNode);
    //       $scope.canvasView.addNode(currNode);

    //       if (prevNode){
    //         $scope.addNewConnection(prevNode, currNode);
    //       }
    //     }
    //     else if (CanvasDisplayService.isRiboseNode(value)) {//ribose node
    //       if (prevNode) {
    //         currNode = CanvasDisplayService.createRibose(value, color, prevNode.x + monomerSpacing, y, sequenceName);
    //       }
    //       else {
    //         currNode = CanvasDisplayService.createRibose(value, color, x , y, sequenceName);
    //       }
    //       riboseNode = currNode;
    //       if (key === 0) {
    //         firstNode = currNode;
    //       }
    //       allNodes.push(currNode);
    //       $scope.canvasView.addNode(currNode);
    //       if (prevNode) {
    //         $scope.addNewConnection(prevNode, currNode);
    //       }
    //     }
    //     else {//base node

    //       if (riboseNode) {
    //         baseNode = CanvasDisplayService.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength, sequenceName);
    //         if (key === 0) {
    //           firstNode = currNode;
    //         }
    //         allNodes.push(baseNode);
    //         $scope.canvasView.addNode(baseNode);
    //       }
    //       if (riboseNode && baseNode) {
    //         $scope.addNewConnection(riboseNode, baseNode);
    //       }
    //     }
    //     if (currNode) {
    //       if (dir === 'reverse') {
    //         x = currNode.x - monomerSpacing;
    //       }
    //       else {
    //         x = currNode.x + monomerSpacing;
    //       }
    //       prevNode = currNode;
    //     }
    //   });

    //   return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);//return the subgraph which is already drawn
    // };

    // //helper function which draws peptide sequences
    // $scope.processPeptides = function (monomerArr, pos, dir, sequenceName) {

    //   var prevNode, currNode, firstNode;
    //   var x = pos.x;
    //   var y = pos.y;
    //   var allNodes = [];

    //   angular.forEach(monomerArr, function(value, key) {

    //     currNode = CanvasDisplayService.createNode(value, 'PEPTIDE', '#00C3FF', true, x , y, '',sequenceName);
    //     allNodes.push(currNode);
    //     $scope.canvasView.addNode(currNode);
    //     if (key === 0) {
    //       firstNode = currNode;
    //     }
    //     if (prevNode) {
    //       $scope.addNewConnection(prevNode, currNode);
    //     }
    //     prevNode = currNode;

    //     if (dir === 'reverse') {
    //       x = currNode.x - monomerSpacing;
    //     }
    //     else {
    //       x = currNode.x + monomerSpacing;
    //     }
    //   });

    //   return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
    // };

    // //helper function which draws CHEM sequences
    //   //TO-DO: verify that CHEM sequences always consist of only 1 element
    // $scope.processChemicalModifiers = function (monomerArr, chemSequenceName, pos, connectionArray, sequenceArray) {

    //   var chemColor;
    //   if (monomerArr[0] === 'sDBL') {
    //     chemColor =  '#FFFFFF';
    //   }
    //   else {
    //     chemColor = '#a020f0';
    //   }

    //   //get x position, whether to the far left or right side of canvas
    //   var x = $scope.getCHEMXPosition(connectionArray, chemSequenceName, sequenceArray);
    //   var y;
    //   if (!x) {
    //     x = pos.x;
    //     y = pos.y;
    //   }
    //   else {
    //     y = 190;  //TO-DO: this is hard coded to be slightly below the previous, first sequence
    //   }
    //   var allNodes = [];
    //   var currNode = CanvasDisplayService.createNode(monomerArr[0], 'CHEM', chemColor, false, x, y, '', chemSequenceName);
    //   allNodes.push(currNode);
    //   var firstNode = currNode;

    //   $scope.canvasView.addNode(currNode);
    //   return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
    // };

    // //Returns the x position for the param CHEM node
    // //
    // //@param  connectionArray    array of connections encoded in HELM Notation
    // //@param  chemSequenceName   name of CHEM node (eg, 'CHEM1')
    // $scope.getCHEMXPosition = function (connectionArray, chemSequenceName,sequenceArray) {
    //   var sequenceCHEMConnectsTo, nodeCHEMConnectsTo, length;

    //   //get the sequence name and number for node that CHEM connections to
    //   for (var i = 0; i < connectionArray.length; i++) {
    //     if (chemSequenceName ===connectionArray[i].source.name) { //if CHEM is the source node for connection
    //       sequenceCHEMConnectsTo = connectionArray[i].dest.name;
    //       nodeCHEMConnectsTo = connectionArray[i].dest.nodeID;
    //     }
    //     else if (chemSequenceName === connectionArray[i].dest.name) { //if CHEM is dest node for connection
    //       sequenceCHEMConnectsTo = connectionArray[i].source.name;
    //       nodeCHEMConnectsTo = connectionArray[i].source.nodeID;
    //     }
    //   }

    //   //get length of the sequence that CHEM connects to
    //   for (var j = 0; j < sequenceArray.length; j++) {
    //     if (sequenceCHEMConnectsTo === sequenceArray[j].name) {
    //       length = sequenceArray[j].sequence.length;
    //     }
    //   }

    //   //TO-DO: redo hard-coding with spacing
    //   if (nodeCHEMConnectsTo < length/2) {    //if CHEM node connects near the beginning of another sequence,
    //     return (100 - monomerSpacing);        //position CHEM node to left
    //   }
    //   else {                                  //if CHEM connects near the end of another sequence,
    //     return ((length-4) * monomerSpacing); //position CHEM node to right
    //   }
    // };
    // //makes a cyclic peptide, with two stems on the left and a circle on the right
    // $scope.separateSequences = function (sequence, seqName, connectionArray) {

    //   //get the start and end points of cycle
    //   var connectionPoints = $scope.getCyclicalSourceDest(seqName, connectionArray);
    //   var cycleStartId =  connectionPoints[1];
    //   var cycleEndId = connectionPoints[0];
    //   var slicedSeqArr  =  [];
    //   var beforeArr = [];
    //   var afterArr = [];
    //   var cycle = [];

    //   for (var i=0;i<sequence.length;i++) {
    //     if (i < cycleStartId) {
    //   beforeArr.push(sequence[i]);
    //     }
    //     else if (i>= cycleStartId && i<=cycleEndId) {
    //   cycle.push(sequence[i]);
    //     }
    //     else if (i>cycleEndId) {
    //       afterArr.push(sequence[i]);
    //     }
    //   }

    //   if (beforeArr.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', beforeArr));
    //   }
    //   if (cycle.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('cyclic',cycle));
    //   }
    //   if (afterArr.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', afterArr));
    //   }
    //   return slicedSeqArr;
    // };

    //   //makes a cyclic peptide after determining if there are any linear and cyclic combo
    // $scope.makeGraphWithCycles = function (sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray) {
    //   var graphedNodes = [];  //array of all nodes created and graphed
    //   var currSubGraph;
    //   var prevSubGraph;

    //   //separate the sequence into linear and cyclical slices
    //   var slicedSequenceArr =  $scope.separateSequences(sequence, seqName, connectionArray);

    //   for (var i=0;i<slicedSequenceArr.length;i++) {
    //     var slice = slicedSequenceArr[i];

    //     if (slice.flow === 'linear') {
    //       currSubGraph = $scope.makeLinearGraph(slice.monomers, dir, seqType, pos, seqName, connectionArray, sequenceArray);
    //       graphedNodes.push(currSubGraph.nodes);
    //     }
    //     else {
    //       currSubGraph = $scope.makeCyclicalGraph(slice.monomers, seqType, pos, dir);
    //       graphedNodes.push(currSubGraph.nodes);
    //       dir = 'reverse';
    //     }
    //     if (prevSubGraph && currSubGraph) {
    //       $scope.addNewConnection(prevSubGraph.last, currSubGraph.first);
    //     }
    //     prevSubGraph = currSubGraph;

    //     if (dir === 'reverse') {
    //       pos = {
    //         x: prevSubGraph.last.x - monomerSpacing,
    //         y: prevSubGraph.last.y
    //       };
    //     }
    //     else {
    //       pos = {
    //         x: prevSubGraph.last.x + monomerSpacing,
    //         y: prevSubGraph.last.y
    //       };
    //     }
    //   }
    //   return graphedNodes;
    // };

    // //slice the sequence into cycles and linear sub-sequences
    // $scope.separateSequences = function (sequence, seqName, connectionArray) {            
    //   //get the start and end points of cycle
    //   var connectionPoints = $scope.getCyclicalSourceDest(seqName, connectionArray);
    //   var cycleStartId =  connectionPoints[1];
    //   var cycleEndId = connectionPoints[0];
    //   var slicedSeqArr  =  [];
    //   var beforeArr = [];
    //   var afterArr = [];
    //   var cycle = [];

    //   for (var i=0;i<sequence.length;i++) {
    //     if (i < cycleStartId) {
    //   beforeArr.push(sequence[i]);
    //     }
    //     else if (i>= cycleStartId && i<=cycleEndId) {
    //   cycle.push(sequence[i]);
    //     }
    //     else if (i>cycleEndId) {
    //       afterArr.push(sequence[i]);
    //     }
    //   }

    //   if (beforeArr.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', beforeArr));
    //   }
    //   if (cycle.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('cyclic',cycle));
    //   }
    //   if (afterArr.length !== 0) {
    //     slicedSeqArr.push(new CanvasDisplayService.ChildSequence('linear', afterArr));
    //   }        
    //   return slicedSeqArr;               
    // };


    // //helper function for drawing the cycle portion of a cyclical graph
    // $scope.makeCyclicalGraph = function (monomerArr, seqType, pos, dir) {
    //   var firstNode, currNode, prevNode;
    //   var allNodes = [];

    //   var cyclicalNodes = CanvasDisplayService.makeCycle(monomerArr, seqType, pos, dir);

    //   angular.forEach(cyclicalNodes, function (value, key) {
    //     currNode = value;
    //     if (key === 0){
    //       firstNode = value;//keep track of firstNode
    //     }
    //     $scope.canvasView.addNode(value);
    //     allNodes.push(value);

    //     if (prevNode && currNode){
    //       $scope.addNewConnection(prevNode, currNode);
    //     }
    //     prevNode = currNode;
    //   });

    //   if (firstNode && currNode){
    //     $scope.addNewConnection(firstNode, currNode);
    //   }
    //   return new CanvasDisplayService.SubGraph(firstNode,currNode,allNodes);
    // };

    // //Makes the connections requested in HELM Notation.
    // //Each connectionArray element has the following items:
    // //      source.name     (eg, 'RNA1')
    // //      dest.name       (eg, 'CHEM1')
    // //      source.nodeID   (eg, '24')
    // //      dest.nodeID     (eg, '1')
    // //This example would link the 24th node in the 'RNA1' sequence to the 1st in the 'CHEM1' sequence.
    // //
    // //@param    connection     array of connections requested in HELM Notation
    // //@param    graphedNodes   array of all nodes graphed, each elem has '.name' and '.nodes'
    // $scope.makeRequestedConnections = function (connectionArray, graphedNodesArray) {

    //   var j, k;
    //   var nodes,source, dest = '';
    //   for (j = 0; j < connectionArray.length; j++) {
    //     if (connectionArray[j].source.name === connectionArray[j].dest.name) {
    //       continue; //skip cyclical connections, which are drawn in 'makeCyclicalGraph()'
    //     }
    //     for (k = 0; k < graphedNodesArray.length; k++) { //for each sequence of nodes graphed,
    //       nodes = graphedNodesArray[k].nodes[0];      //get the array of nodes

    //       //if found source sequence, get source node
    //       if (graphedNodesArray[k].name === connectionArray[j].source.name) {
    //         source = nodes[(connectionArray[j].source.nodeID) -1];
    //       }
    //       //if found destination sequence, get dest node
    //       else if (graphedNodesArray[k].name === connectionArray[j].dest.name) {
    //         dest = nodes[(connectionArray[j].dest.nodeID) -1];
    //       }
    //       //if found source and dest nodes, add link
    //       if (source !== '' && dest !== '') {
    //         $scope.addNewConnection(source, dest);
    //         source = '';
    //         dest = '';
    //       }
    //       nodes = '';
    //     }
    //   }
    // };

    // //helper function returns 'true' if sequence is partly, or completely, cyclical
    // $scope.isCyclical = function (sequenceName, connectionArray) {
    //     for (var j = 0; j < connectionArray.length; j++){
    //         if (connectionArray[j].source.name === connectionArray[j].dest.name){
    //             if (connectionArray[j].source.name === sequenceName) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // };

    // //helper function returns source node id and dest node id for cyclical connections
    // $scope.getCyclicalSourceDest = function (sequenceName, connectionArray) {
    //   var sourceNodeId, destNodeId;
    //   for (var j = 0; j < connectionArray.length; j++){
    //     if (connectionArray[j].source.name === connectionArray[j].dest.name){
    //       if (connectionArray[j].source.name === sequenceName) {
    //         sourceNodeId = connectionArray[j].source.nodeID-1;
    //         destNodeId = connectionArray[j].dest.nodeID-1;
    //       }
    //     }
    //   }

    //   return [sourceNodeId, destNodeId];
    // };

    // //helper function returns type of sequence
    // $scope.getType = function (sequenceName) {
    //   if (sequenceName.toUpperCase().indexOf('RNA') > -1){
    //     return 'NUCLEOTIDE';
    //   }
    //   if (sequenceName.toUpperCase().indexOf('PEPTIDE') > -1){
    //     return 'PEPTIDE';
    //   }
    //   if (sequenceName.toUpperCase().indexOf('CHEM') > -1){
    //     return 'CHEM';
    //   }
    // };

      
    // // create a new node and add to the view.
    // $scope.addNewNode = function (nodeName, seqType, nodeColor, isRotate, xpos, ypos, nodeType, sequenceName) {
    //   var node = CanvasDisplayService.createNode(nodeName, seqType, nodeColor,
    //                         isRotate, xpos, ypos, nodeType, sequenceName);
    //   $scope.canvasView.addNode(node);
    //   return node;
    // };

    // //add a connection between 2 nodes
    // $scope.addNewConnection = function (sourceNode, destNode) {
    //   var conn = CanvasDisplayService.createConnection(sourceNode, destNode);
    //   $scope.canvasView.addConnection(conn);
    //   return conn;
    // };

    // //reset the canvas display
    // $scope.resetCanvas = function () {
    //   var emptyData = {
    //     nodes: [],
    //     connections: []
    //   };
    //   CanvasDisplayService.setNodeNum(0);
    //   CanvasDisplayService.setParamNum(0);
    //   $scope.canvasView = new CanvasDisplayService.CanvasView(emptyData);
    //   $scope.updateLower(self.viewTypes[0]);
    //   self.result = '';
    //   self.seqtype = '';
    //   self.helm = '';

    //   HELMNotationService.setHelm('');

    //   self.chelm = '';
    //   self.molecularweight = '';
    //   self.molecularformula = '';
    //   self.extcoefficient = '';
    //   self.clear();

    //   self.helmImageLink = '';     
    // };

    /* zoom and pan functions */
    var zoomCount = 0;
    $scope.zoom = function (scale, evt, svgCanvas){
      CanvasDisplayService.zoom(scale, evt, svgCanvas);
      zoomCount++;
      if (evt) {
        evt.stopPropagation();
      }
    };

    $scope.pan = function (dx, dy, evt){
      CanvasDisplayService.pan(dx, dy, evt);
      if (evt) {
        evt.stopPropagation();
      }
    };

    /*
     * Begin code for lower pane
     */
       /* Variables for view types in lower pane */
    self.viewTypes = [
      { value: 'HELM', label:'HELM' },
      { value: 'Sequence', label:'Sequence' },
      { value: 'Molecule Properties', label:'Molecule Properties' }
    ];
    $scope.viewType = self.viewTypes[0];
    $scope.helm = true;
    $scope.sequence = false;
    $scope.moleculeprops = false;
    self.result = '';
    self.helm = '';
    HELMNotationService.setHelm('');
    self.chelm = '';
    self.componenttype = '';
    self.molecularweight = '';
    self.molecularformula = '';
    self.extcoefficient = '';
    self.helmImageLink = '';

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
          if(self.helm !== '' && self.molecularformula === '') {
            self.getMolecularWeight(self.helm);
            self.getMolecularFormula(self.helm);
            self.getExtinctionCoefficient(self.helm);
            self.helmImageLink = 'Show';
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
    * Begin code for showing Image Modal
    */
    /* Invoke factory function to get the HELM Image */
    $scope.showHelmImage = function () {
      $scope.requestedview = '';  
      $scope.imageMessage = '';
      var successCallback = function (result) {
        $scope.requestedview = result;
        $scope.imageMessage = '';
      };
      var errorCallback = function(response) {
        $scope.imageMessage = 'Image not available. See console for more information.';
        $scope.requestedview = '';
        console.log(response);
      };
      if (self.helm !== '') {
        webService.getHelmImageUrl(self.helm).then(successCallback, errorCallback);
      } else {
        $scope.imageMessage = 'Structure is empty!';
      }
      $scope.openImageView();
    };

    /* Invoke factory function to get the Monomer Image */
    $scope.showMonomerImage = function (monomerId, polymerType) {
      $scope.requestedview = '';  
      $scope.imageMessage = '';
      var successCallback = function (result) {
        $scope.requestedview = result;
        $scope.imageMessage = '';
      };
      var errorCallback = function(response) {
        $scope.imageMessage = 'Image not available. See console for more information.';
        $scope.requestedview = '';
        console.log(response);
      };
      if (monomerId !== '' && polymerType !== '') {
        webService.getMonomerImageUrl(monomerId, polymerType, '').then(successCallback, errorCallback);
      }
      $scope.openImageView();
    };

    // Create the view for the canvas and attach to the scope.
    // $scope.canvasView = new CanvasDisplayService.CanvasView(helmDataModel);

    // Methods used by the monomer library to add/drag elements to the 
    // sets the current selected monomer to be what was clicked
    self.toggleSelectedMonomer = function (monomer, evt) {
      MonomerSelectionService.toggleSelectedMonomer(monomer, evt);
    };

    // helper function to convert from titles to types
    var convertTitle = function (title) {
      switch (title) {
        case 'Nucleic Acid':
          return 'RNA';
        case 'Peptide':
          return 'PEPTIDE';
        case 'Chemical Modifier':
          return 'CHEM';
        default:
          return 'RNA';
      }
    };

    // // helper method just to clear the canvas
    // var clearCanvas = function () {
    //   var emptyData = {
    //     nodes: [],
    //     connections: []
    //   };
    //   CanvasDisplayService.setNodeNum(0);
    //   CanvasDisplayService.setParamNum(0);
    //   CanvasDisplayService.setNodeID(0);
    //   $scope.canvasView = new CanvasDisplayService.CanvasView(emptyData);
    // };

    // adds the monomer to what already exists
    var addMonomer = function (monomer) {
      // don't add it if it's a branch monomer
      if (monomer.encodedMonomer && monomer.encodedMonomer.MonomerType === 'Branch') {
        console.warn('Branch monomers cannot exist in their own sequence');
        return;
      }
      // if we have a monomer selected, we need to add it
      if (monomer._name) {
        var type = monomer.encodedMonomer ? monomer.encodedMonomer.PolymerType : convertTitle(monomer._title);
        var notation;
        if (monomer._notation) {
          notation = monomer._notation;
        }
        else {
          // make sure to encapsulate multi-character names with []
          notation = monomer._name.length > 1 ? '[' + monomer._name + ']' : monomer._name;
        }

        HELMNotationService.addNewSequence(type, notation);

        // and update (for now, until it's all linked together correctly)
        var out = HELMNotationService.getHelm();
        // clearCanvas();
        CanvasDisplayService.resetCanvas();
        self.helm = out;
        // $scope.displayOnCanvas(out);
        CanvasDisplayService.loadHelmTranslationData(HelmConversionService.convertHelmNotationToSequence(out));
      }
    };

    // handle the clicks on the SVG itself
    $scope.svgClicked = function () {
      var currentMonomer = MonomerSelectionService.getSelectedMonomer();
      addMonomer(currentMonomer);
      // and clear the selection so we don't keep adding over and over again
      MonomerSelectionService.clearSelectedMonomer();
    };

    // handle the dropping -- only supports dropping monomers right now
    $scope.elementDropped = function (evt, data) {
      addMonomer(data);
      MonomerSelectionService.clearSelectedMonomer();
    };

    /*****************/
    /*  right-click  */
    /*****************/

    //helper function - download file to user's browser
    $scope.downloadFile = function () {

      //make filename - eg, "HELM.04.21.2016.txt"
      var now = new Date();
      var date = (now.getMonth()+1) + '.' + now.getDate() + '.' + now.getFullYear();
      var filename = 'HELM.' + date + $scope.fileExtension;

      //Safari - can't add filename
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
    $scope.open = function () {
      $uibModal.open({
        templateUrl: '/templates/viewmodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //wider modal
    $scope.openWideModal = function () {
      $uibModal.open({
        templateUrl: '/templates/viewmodal.html',
        controller: 'modal',
        windowClass: 'wide-modal',
        scope: $scope,
      });
    };

    //helper function - show molecular properties table in modal
    //TODO - should show Mass
    $scope.openMolecularPropertiesModal = function () {
      $uibModal.open({
        templateUrl: '/templates/tablemodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //helper function - show image in modal
    $scope.openImageView = function () {
      $uibModal.open({
        templateUrl: '/templates/imagemodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //helper function - copy string to user's clipboard
    //source: http://stackoverflow.com/questions/25099409/copy-to-clipboard-as-plain-text
    $scope.copyToClipboard = function () {
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
        $scope.showHelmImage();
      }],
      null,
      ['View', function () {}, [
        ['HELM Notation', function () {
          $scope.requestedview = self.helm;
          if (self.helm.length > 100) {    //for long sequences,
            $scope.openWideModal();      //use wider modal
          }
          else {
            $scope.open();
          }
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestedview = self.chelm;
          if (self.helm.length > 100){
            $scope.openWideModal();
          }
          else {
            $scope.open();
          }
        }],
        /*,
        ['xHELM Notation', function (){
          $scope.requestedview = 'TO-DO: xHELM NOTATION';
          $scope.open();
        }],
        ['SMILES', function () {
          $scope.requestedview = 'TO-DO: SMILES NOTATION';
          $scope.open();
        }],
        ['MDL Molfile', function (){
          $scope.requestedview = 'TO-DO: MDL MOLFILE NOTATION';
          $scope.open();
        }],
        ['PDB Format', function (){
          $scope.requestedview = 'TO-DO: PDB FORMAT';
          $scope.open();
        }]*/
        ['Molecule Properties', function () {
          self.getMolecularWeight(self.helm);       //sets self.molecularweight
          self.getMolecularFormula(self.helm);      //sets self.molecularformula
          self.getExtinctionCoefficient(self.helm); //sets self.extcoefficient
          $scope.openMolecularPropertiesModal();
        }]
      ]],
      null,
      ['Copy', function () {}, [
        /*['Image', function ($itemScope) {
          $scope.requestednotation = webService.getHelmImageUrl(self.helm);
          $scope.copyToClipboard();
        }],*/
        ['HELM Notation', function () {
          $scope.requestednotation = self.helm;
          $scope.copyToClipboard();
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestednotation = self.chelm;
          $scope.copyToClipboard();
        }]
        /*,
        ['xHELM Notation', function () {
          $scope.requestednotation = 'TODO: GET xHELM';
          $scope.copyToClipboard();
        }],
        ['SMILES', function () {
          $scope.requestednotation = 'TODO: GET SMILES';
          $scope.copyToClipboard();
        }],
        ['MDL Molfile', function () {
          $scope.requestednotation = 'TODO: GET MDL MOLFILE';
          $scope.copyToClipboard();
        }]*/
      ]],
      null,
      ['Save', function () {}, [
        ['HELM Notation', function () {
          $scope.requestednotation = self.helm;
          $scope.fileExtension = '.helm';
          $scope.downloadFile();
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestednotation = self.chelm;
          $scope.fileExtension = '.chelm';
          $scope.downloadFile();
        }]
        /*,
        ['xHELM Notation', function (){
          $scope.requestednotation = 'TODO:_GET_xHELM';
          $scope.fileExtension = '.xhelm';
          $scope.downloadFile();
        }],
        ['SMILES', function () {
          $scope.requestednotation = 'TODO:_GET_SMILES';
          $scope.fileExtension = '.smi';
          $scope.downloadFile();
        }],
        ['MDL Molfile', function (){
          $scope.requestednotation = 'TODO:_MDL_Molfile';
          $scope.fileExtension = '.mol';
          $scope.downloadFile();
        }]*/
      ]]
    ];

    // listen for the delete key being released and try to delete the node if possible
    self.keyUp = function (evt) {
      // only do it on the delete key (fn+delete on Macs)
      if (evt.which === 46) {
        self.trashClicked();
      }
    };

    self.showTrash = function () {
      var currentNode = CanvasDisplayService.getSelectedNode();
      if (!currentNode || !currentNode.data) {
        return false;
      }
      return true;
    };

    // "remove" button is clicked -- should parse current HELM string, removing the HELM substring
    // associated with the selected node and generate new HELM string(s) and graph
    self.trashClicked = function () {

      var currentNode = CanvasDisplayService.getSelectedNode();
      if (!currentNode || !currentNode.data) {
        return;
      }
      else{
        var nodeID = currentNode.data.id;
        console.log(nodeID);

        // if node is part of a CHEM sequence, just delete the chem sequence
        if (currentNode.data.seqType === 'CHEM') {
          // nodeType for chem nodes is actually a sequence name like "CHEM1"
          // and seqName is "undefined" for chem nodes (TODO: check why / fix?)
          HELMNotationService.removeSequence(currentNode.data.nodeType);

          var updatedHelm = HELMNotationService.getHelm();
          // clearCanvas();
          CanvasDisplayService.resetCanvas();
          self.validateHelmNotation(updatedHelm);
          return;
        }

        var sequences = HELMNotationService.getSequences();

        var priorSeqNodes = 0;

        for (var i = 0; i < sequences.length; i++) {
          var sequenceName = sequences[i].name;
          var sequenceNotation = sequences[i].notation;

          var polymers = HelmConversionService.getPolymers(sequenceName, sequenceNotation);

          // found the sequence to modify (containing the node to be removed)
          if (sequenceName === currentNode.data.seqName) {
            nodeID -= priorSeqNodes;
            var updatedHELM = HELMNotationService.helmNodeRemoved(polymers, sequences[i], currentNode, nodeID);
            
            // clearCanvas();
            CanvasDisplayService.resetCanvas();
            self.validateHelmNotation(updatedHELM);
          }
          else{
            // track number of elements in sequences not containing the node-to-delete
            priorSeqNodes += (polymers.length);
          }
        }
      }
    };

    // remember the node that we started with
    self.dragStartNode = null;
    self.dragStartLocation = null;
    self.dragEndLocation = null;
    self.svgEl = null;
    self.svgPt = null;

    // handle the beginning of a drag
    self.mousedown = function (node, evt) {
      // set up the SVG stuff for transforms
      if (!self.svgEl) {
        self.svgEl = document.querySelector('svg');
        self.svgPt = self.svgEl.createSVGPoint();
      }

      self.dragStartNode = node;
      self.dragStartLocation = {
        x: node.x() + node.width()/2,
        y: node.y() + node.height()/2
      };

      evt.stopPropagation();
    };

    // on the move, make sure to update our destination
    self.mousemove = function (evt) {
      if (self.dragStartNode) {
        // transform the point correctly
        self.svgPt.x = evt.clientX;
        self.svgPt.y = evt.clientY;
        var pt = self.svgPt.matrixTransform(self.svgEl.getElementById('map-matrix').getScreenCTM().inverse());
        self.dragEndLocation = {
          x: pt.x,
          y: pt.y
        };

        // shift the dragged location back from the cursor so we don't click it
        if (self.dragEndLocation.x < self.dragStartLocation.x) {
          self.dragEndLocation.x += 2;
        }
        else {
          self.dragEndLocation.x -= 2;
        }
        if (self.dragEndLocation.y < self.dragStartLocation.y) {
          self.dragEndLocation.y += 2;
        }
        else {
          self.dragEndLocation.y -= 2;
        }
      }
    };

    // on the mouse up, try to connect the nodes
    self.mouseup = function (node, evt) { 
      // deal with this if we dropped onto a node
      if (self.dragStartNode && node && self.dragStartNode !== node) {
        var helmOut = HELMNotationService.connectNodes(self.dragStartNode, node);
        console.log(helmOut);
      }

      // clean up our stored information
      self.dragStartNode = null;
      self.dragStartLocation = null;
      self.dragEndLocation = null;
      evt.stopPropagation();
    };

  }]);