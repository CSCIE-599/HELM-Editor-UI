'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.CanvasDisplayService
 * @description
 * # CanvasDisplayService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('CanvasDisplayService', function () {
    // AngularJS will instantiate a singleton by calling 'new' on this function

    var self = this;
    // node ID within the entire polymer
    var nodeId = 0;
    // number printed by node
    var nodeNum = 0;
    // number to keep track of position of annotation
    var paramNum = 0;
    // node height
    var nodeHeight = 25;
    // node width
    var nodeWidth = 25;
    // regular node radius
    var radiusX = 3;
    var radiusY = 3;

    // helper functions to create each type of node
    self.createRibose = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {
      return self.createNode(nodeName, 'NUCLEOTIDE', '#c6c3fe', false, xPos, yPos, 'r', sequenceName);
    };
    self.createBase = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {
      return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, true, xPos, yPos, 'b', sequenceName);
    };
    self.createPhosphate = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {
      return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, false, xPos, yPos, 'p', sequenceName);
    };

    // create a new node
    self.createNode = function (nodeName, sequenceType, nodeColor, isRotate, xpos, ypos, nodeType, sequenceName) {
      var rotateDegree = '0';
      var rx = radiusX;
      var ry = radiusX;
      var textColor;

      nodeWidth = self.getNodeWidth(sequenceType);

      // rotate the node if necessary
      if(isRotate){
        rotateDegree = '45';
      }

      //for phosphate, round the rectangle corners to look like circle
      if (nodeType === 'p') {
        rx = radiusX + 10;
        ry = radiusY + 10;      
      }
      
      if (nodeColor === 'red' || nodeColor === '#a020f0') {
        textColor = '#FFFFFF';
      } else {
        textColor = '#000000';
      }

      // create the actual node
      var newNode = {
        name: nodeName,
        seqType: sequenceType,  //Nucleotide, Peptide, or Chem
        seqName: sequenceName,
        id: nodeId,
        x: xpos,
        y: ypos,
        rx: rx,
        ry: ry,
        lowery: ypos,
        colour: nodeColor,
        height: nodeHeight,
        width: nodeWidth,
        transformx: xpos + nodeHeight/2,
        transformy: ypos + nodeWidth/2,
        transformDegree: rotateDegree,
        seqVisible: 'hidden',
        nodeVisible: 'hidden',
        annotationVisible: 'hidden',
        textColor: textColor,
        nodeType: nodeType,
        annotationText: ''
      };

      // set up the annotation text based on the sequence type
      if (sequenceType === 'PEPTIDE') {
        newNode.annotationText = 'n';
      }
      else if (sequenceType === 'NUCLEOTIDE') {
        newNode.annotationText = '5\'' ;
      }

      //number nodes if Peptide, or if Nucleotide and a base node
      if ((sequenceType === 'PEPTIDE') || (sequenceType === 'NUCLEOTIDE' && nodeType === 'b')) {
        nodeNum++;
        newNode.num = nodeNum;
        newNode.seqVisible = 'visible';
        newNode.nodeVisible = 'visible';
      }

      // adjust the positioning and viisbility of base and chem nodes in lower pane
      if ((sequenceType === 'CHEM') || (sequenceType === 'NUCLEOTIDE' && nodeType === 'b')) {
        newNode.lowery = newNode.lowery-120;
        newNode.nodeVisible = 'visible';
      }
      nodeId++;

      // move to the next paramNum if appropriate
      if (sequenceType === 'PEPTIDE' || sequenceType === 'NUCLEOTIDE' ){
        paramNum++;
        newNode.paramNum = paramNum;
      }

      if(newNode.paramNum === 1){
        newNode.annotationVisible = 'visible';
      }

      // handle CHEM to make sure they get a paramNum
      if (sequenceType === 'CHEM') {
        newNode.paramNum = 1;
      }

      // and done
      return newNode;
    };

    self.createConnection = function (sourceNode, destNode) {
      var conn = {
        source: sourceNode,
        dest: destNode
      };
      return conn;
    };

    /* Identify a ribose node */
    self.isRiboseNode = function (node) {
      var riboseArr = ['R', 'dR', 'sR', 'mR', 'fR', 'LR', 'MOE', 'FMOE',
                       'mph', 'PONA','qR', 'RGNA', 'SGNA'  ,'12ddR', '25R',
                       '4sR' , 'aFR', 'aR', 'eR', 'FR', 'hx', 'lLR', 'tR',
                       'UNA', '3A6','3FAM', '3SS6', '5A6','5cGT','5FAM',
                       '5FBC6', 'am12', 'am6'];

      //TO-DO: make test case insensitive
      if(riboseArr.indexOf(node) !== -1) {
        return true;
      }
      return false;
    };

    /* Identify a phosphate node */
    self.isPhosphateNode = function (node) {
      if(node === 'P' || 
         node === 'sP' || 
         node === 'naP' || 
         node === 'nasP' || 
         node === 'bP' || 
         node === 'dier') {
        return true;
      }
      return false;
    };

    /* get color for a node */
    self.getNodeColor = function (nodeName) {
      var color;
      switch(nodeName){    
        case 'A':
        case 'cpmA': 
        case 'eaA': 
        case 'daA':
        case 'dabA':
        case 'meA':
        case 'baA':  
        case 'clA':  
        color =  'lightgreen'; 
        break;

        case 'C':
        case 'prpC':
        case '5meC': 
        case 'cpC': 
        case 'cdaC':    
        color =  'red'; 
        break;
        
        case 'G':
        color = 'orange'; 
        break;
        
        case 'T':
        case 'U': 
        case '5eU': 
        case '5fU':
        case 'prpU':
        case 'cpU':
        case '5tpU':
        case 'tfU':
        case '5iU':
        color =  'cyan'; 
        break;

        default: 
        color = '#c6c3fe';
      }
      return color;    
    };

    /* helper method to calculate width of a node*/
    self.getNodeWidth = function(seqType){
      if(seqType === 'CHEM'){
        return 55;
      }
      return 25;
    };

    /* getter/setter for nodeNum */
    self.getNodeNum = function () {
      return nodeNum;
    };
    self.getNodeID = function () {
      return nodeId;
    };
    self.setNodeNum = function (num) {
      nodeNum = num;
    };
    self.setParamNum = function (num) {
      paramNum = num;
    };
    self.setNodeID = function (id) {
      nodeId = id;
    };

    /* helper method for creating cyclical nodes, only supports cyclical peptides now */
    self.makeCycle = function (sequence, seqType, pos, dir, seqName) {
      var cycleNodesArray = [];
      var r = (sequence.length * 10) + 10;//radius

      //center of the circle
      var yc = pos.y + r/2;
      var xc;

      if (dir === 'reverse') {
        xc = pos.x - r; //center x pos of circle
      }
      else {
        xc = pos.x + r; //center x pos of circle
      }

      var degree = 360/sequence.length; //divide the circle, to allow equal separation between the nodes
      var nodexpos, nodeypos;

      var startDegrees = degree *2; //TO-DO: start position is hard-coded for Cyclic Peptide
      var i = startDegrees;

      angular.forEach(sequence, function (value) {
        if (i <= 360+startDegrees) {//when i has reached 360, the circle is complete
          nodexpos = Math.sin(-i * Math.PI / 180) * r + xc; //making 'i' negative creates clockwise placement
          nodeypos = Math.cos(-i * Math.PI / 180) * r + yc;

          var node = self.createNode(value, seqType, '#00C3FF', true, nodexpos, nodeypos, '', seqName);
          cycleNodesArray.push(node);
          i = i + degree;
        }
      });

      return cycleNodesArray;
    };
    
    /* helper function to get a new pos to create a new row, increments y */
    self.getNewRowPos = function(pos, seqType, prevSeqType){
      if (!pos) { //starting pos
        return {
          x: 200, //TO-DO make this relative to the length of sequence
          y: 75
        };
      }
      else { //for new row, increment y  
        if (prevSeqType) {      
          if (prevSeqType === 'CHEM' || prevSeqType === 'PEPTIDE') {
            return {
              x: pos.x,
              y: pos.y + 70
            };
          }
          else {
            return {
              x: pos.x,
              y: pos.y + 120
            };
          }
        }      
      }
    };

    /*zoom and pan related functions*/
    var transMatrix = [1,0,0,1,0,0]; //identity matrix 
    var mapMatrix, newMatrix, width, height;  

    self.zoom = function (scale, evt, svgCanvas){
      var svgDoc;
      if (evt) {
        svgDoc = evt.target.parentNode;//keep track of which canvas is being zoomed
      }
      else {
        svgDoc = svgCanvas; //for zoom onload
      }

      if (svgDoc) {
        //get canvas width and height
        width = svgDoc.clientWidth;
        height = svgDoc.clientHeight;
        mapMatrix = svgDoc.getElementById('map-matrix');

        for (var i=0; i<transMatrix.length; i++) {
          transMatrix[i] *= scale;
        }

        transMatrix[4] += (1-scale)*width/2;
        transMatrix[5] += (1-scale)*height/2;                
        newMatrix = 'matrix(' +  transMatrix.join(' ') + ')';
        mapMatrix.setAttributeNS(null, 'transform', newMatrix);
      }
    };

    self.pan = function(dx, dy, evt){
      var svgDoc = evt.target.parentNode; //keep track of which canvas is being panned  
      if (svgDoc) {     
        transMatrix[4] += dx;
        transMatrix[5] += dy;
        mapMatrix = svgDoc.getElementById('map-matrix');                 
        newMatrix = 'matrix(' +  transMatrix.join(' ') + ')';
        mapMatrix.setAttributeNS(null, 'transform', newMatrix);
      }
    };

    var selectedNode = {};
    var selectedNodeID = {};
    self.getSelectedNode = function(){
      return selectedNode;
    };
    self.clearSelectedNode = function(){
      selectedNode = {};
      selectedNodeID = {};
    };

    /* data models for canvas, node and connection */
    
    // View for the canvas.
    self.CanvasView = function (dataModel) {

      // Reference to the underlying data.
      this.data = dataModel;
      this.nodes = [];
      this.connections = [];
      selectedNode = {};

      // Add a node to the canvas view.
      this.addNode = function (nodeDataModel) {
        if (!this.data.nodes) {
          this.data.nodes = [];
        }
        // Update the data model.
        this.data.nodes.push(nodeDataModel);
        // Update the view
        this.nodes.push(new self.NodeView(nodeDataModel));
      };

      // Add a connection to the canvas view.
      this.addConnection = function (connectionDataModel) {
        //push to connectionsdatamodel
        this.data.connections.push(connectionDataModel);

        // Update the view
        this.connections.push(new self.ConnectionView(connectionDataModel));
      };

      // sets the current selected node to be what was clicked
      this.toggleSelectedNode = function (nodeDataModel, evt) {
        // un-select if it was previously selected
        if (selectedNodeID === nodeDataModel.id()) {
          selectedNode = {};
          selectedNodeID = {};
        }
        else {
          selectedNode = nodeDataModel;
          selectedNodeID = nodeDataModel.id();
        }
        evt.stopPropagation();
      };

      this.getSelectedNode = function(){
        return selectedNode;
      };
    };

    // View for a node.
    self.NodeView = function (nodeDataModel) {

      this.data = nodeDataModel;

      // each node has unique id
      this.id = function () {
        return this.data.id;
      };

      // used to display the sequence# next to the monomer
      this.num = function () {
        return this.data.num || '';
      };

      // keep track of the node to display the annotaion
      this.paramNum = function () {
        return this.data.paramNum || '';
      };

      // Name of the node.
      this.name = function () {
        return this.data.name || '';
      };

      // color of the node
      this.colour = function () {
        return this.data.colour;
      };

      // type of the node
      // 'b' : base, 'p' : phosphate ,'r' : ribose
      this.nodeType = function () {
        return this.data.nodeType;
      };

      // X coordinate of the node.
      this.x = function () {
        return this.data.x;
      };

      // Y coordinate of the node.
      this.y = function () {
        return this.data.y;
      };

      // X radius of the node.
      this.rx = function () {
        return this.data.rx;
      };

      // Y radius of the node.
      this.ry = function () {
        return this.data.ry;
      };

      // Y coordinate of the lower node.
      this.lowery = function () {
        return this.data.lowery;
      };

      // Width of the node.
      this.width = function () {
        return this.data.width;
      };

      // Height of the node.
      this.height = function () {
        return this.data.height;
      };

      // xpos of the node after rotation
      this.transformx = function () {
        return this.data.transformx;
      };

      // ypos of the node after rotation
      this.transformy = function () {
        return this.data.transformy;
      };

      // rotation of the node
      this.transformDegree = function () {
        return this.data.transformDegree;
      };

      // visibility of the sequence#
      this.seqVisible = function () {
        return this.data.seqVisible;
      };

      // visibility of the node
      this.nodeVisible = function () {
        return this.data.nodeVisible;
      };

      // text color of the node
      this.textColor = function () {
        return this.data.textColor;
      };

      // (x,y) position of a node 
      this.position = function(){
        return { 
          x: this.x(),
          y: this.y()
        };
      };

      // visibility of the annotation
      this.annotationVisible = function () {
        return this.data.annotationVisible;
      };

      // visibility of the annotation
      this.annotationText = function () {
        return this.data.annotationText;
      };    
    };

    // View for a connection.
    self.ConnectionView = function (connectionDataModel) {

      this.source = connectionDataModel.source;
      this.dest = connectionDataModel.dest;

      this.sourceCoordX = function () {
        return this.source.x + this.source.width/2;
      };

      this.sourceCoordY = function () {
        return this.source.y + this.source.height/2;
      };

      this.destCoordX = function () {
        return this.dest.x + this.dest.width/2;
      };

      this.destCoordY = function () {
        return this.dest.y + this.dest.height/2;
      };    
    };

    // model for a sequence
    self.Sequence = function (seqType, childrenArr, dir) {
      this.type = seqType; //PEPTIDE, NUCLEOTIDE, CHEM
      this.children = childrenArr; //array of ChildSequence
      this.dir = dir; //direction
    };

    // model for a sub-sequence, which renders a cyclical or linear shape,based on the 'flow'
    self.ChildSequence = function (childFlow, monomerArr) {
      this.flow = childFlow; //linear, cyclical
      this.monomers = monomerArr; //array of monomers,e.g: [A,R]
    };

    // represents a mini graph, like a graph of linear nodes or cyclic nodes
    self.SubGraph = function (fir, las, nodesArr) {
      this.first = fir;
      this.last = las;
      this.nodes = nodesArr;
    };

    /* the following section controls the state of the current canvasView */
    self.canvasView = null;

    // reset the canvas to a blank slate
    self.resetCanvas = function () {
      var emptyData = {
        nodes: [],
        connections: []
      };
      self.canvasView = new self.CanvasView(emptyData);
      nodeNum = 0;
      paramNum = 0;
      nodeId = 0;
    };

    // loads a set of connections and nodes
    self.loadHelmTranslationData = function (helmTranslationData) {
      var sequenceArray = helmTranslationData[0]; //each element has .name and .sequence (array of letters)
      var connectionArray = helmTranslationData[1]; //each element has .source and .dest

      // reset node ID to start at 0
      nodeId = 0;

      // remember the previous sequence type
      var prevSeqType;

      // the nodes that we're graphing
      var graphedNodes = [];

      // go through all sequences and convert them to nodes
      for (var i = 0; i < sequenceArray.length; i++) {
        // retrieve the sequence type and the row position for the new node
        var seqType = getSequenceType(sequenceArray[i].name);
        var pos = self.getNewRowPos(pos, seqType, prevSeqType);
        prevSeqType = seqType;

        // push the sequence to our graph
        graphedNodes.push({
          name: sequenceArray[i].name,
          nodes: generateGraph(sequenceArray[i].sequence,
            sequenceArray[i].name,
            connectionArray,
            pos,
            seqType,
            sequenceArray)
        });

        // reset our numbering for the next sequence
        nodeNum = 0;
        paramNum = 0;
      }

      // now parse the connections
      if (connectionArray.length > 0) {
        makeRequestedConnections(connectionArray, graphedNodes);
      }

      // TODO - do we need to zoom here? Can we even? Probably not...
    };

    // spacing between monomers and connection length
    var monomerSpacing = 50;
    var connectionLength = 70;

    // helper method that generates a graph of the sequence
    // returns all drawn nodes
    // the nodes are used to make the connections explicitly specified in the HELM notation
    var generateGraph = function (sequence, sequenceName, connectionArray, pos, sequenceType, sequenceArray) {
      var graphedNodes = []; // all nodes created and graphed
      var dir = 'forward'; // 'forward' places nodes to the right, 'reverse' places nodes to the left.

      // handle linear sequences
      if (!isCyclical(sequenceName, connectionArray)) {
        var currentSubGraph = makeLinearGraph(sequence, 
          dir, 
          sequenceType, 
          pos, 
          sequenceName, 
          connectionArray, 
          sequenceArray);
        graphedNodes.push(currentSubGraph.nodes);
      }
      // and cyclical ones
      else {
        var nodes = makeGraphWithCycles(sequence, 
          dir, 
          sequenceType, 
          pos, 
          sequenceName, 
          connectionArray, 
          sequenceArray);
        graphedNodes.push(nodes);
      }

      return graphedNodes;
    };

    // makes a linear graph starting from the pos
    // returns a Subgraph obj, that's already drawn on the canvas
    // a subgraph has firstNode, lastNode and array of allnodes in the graph
    var makeLinearGraph = function (monomerArray, dir, seqType, pos, sequenceName, connectionArray, sequenceArray) {
      var subGraph;
      switch (seqType) {
        case 'NUCLEOTIDE':
          subGraph = processNucleotides(monomerArray, pos, dir, sequenceName);
          break;
        case 'PEPTIDE':
          subGraph = processPeptides(monomerArray, pos, dir, sequenceName);
          break;
        case 'CHEM':
          subGraph = processChemicalModifiers(monomerArray, sequenceName, pos, connectionArray, sequenceArray);
          break;
      }

      return subGraph;
    };

    // helper fucntion to draw out nucleotide sequences
    var processNucleotides = function (monomerArray, pos, dir, sequenceName) {
      var prevNode, currNode, firstNode, riboseNode, baseNode;
      var x = pos.x;
      var y = pos.y;
      var allNodes = [];

      // go through every element in the monomer array
      angular.forEach(monomerArray, function (value, key) {
        var color = self.getNodeColor(value);

        // handle Phosphate nodes
        if (self.isPhosphateNode(value)) {
          currNode = self.createPhosphate(value, color, x, y, sequenceName);
          // keep track of the first node
          if (key === 0) {
            firstNode = currNode;
          }
          // add the node to our list and the actual view
          allNodes.push(currNode);
          self.canvasView.addNode(currNode);

          // add a connection if this is not the first
          if (prevNode) {
            addNewConnection(prevNode, currNode);
          }
        }
        // ribose nodes
        else if (self.isRiboseNode(value)) {
          if (prevNode) {
            currNode = self.createRibose(value, color, prevNode.x + monomerSpacing, y, sequenceName);
          }
          else {
            currNode = self.createRibose(value, color, x , y, sequenceName);
          }
          riboseNode = currNode;
          if (key === 0) {
            firstNode = currNode;
          }
          allNodes.push(currNode);
          self.canvasView.addNode(currNode);
          if (prevNode) {
            addNewConnection(prevNode, currNode);
          }
        }
        // base nodes
        else {
          if (riboseNode) {
            baseNode = self.createBase(value, color, riboseNode.x , riboseNode.y + connectionLength, sequenceName);
            if (key === 0) {
              firstNode = currNode;
            }
            allNodes.push(baseNode);
            self.canvasView.addNode(baseNode);
          }
          if (riboseNode && baseNode) {
            addNewConnection(riboseNode, baseNode);
          }
        }

        // move spacing and remember the last node
        if (currNode) {
          if (dir === 'reverse') {
            x = currNode.x - monomerSpacing;
          }
          else {
            x = currNode.x + monomerSpacing;
          }
          prevNode = currNode;
        }
      });

      // and lastly return the new object
      return new self.SubGraph(firstNode, currNode, allNodes);
    };

    // helper function which draws peptide sequences
    var processPeptides = function (monomerArr, pos, dir, sequenceName) {
      var prevNode, currNode, firstNode;
      var x = pos.x;
      var y = pos.y;
      var allNodes = [];

      // go through all monomers to add them in
      angular.forEach(monomerArr, function(value, key) {

        currNode = self.createNode(value, 'PEPTIDE', '#00C3FF', true, x , y, '',sequenceName);
        allNodes.push(currNode);
        self.canvasView.addNode(currNode);
        if (key === 0) {
          firstNode = currNode;
        }
        if (prevNode) {
          addNewConnection(prevNode, currNode);
        }
        prevNode = currNode;

        if (dir === 'reverse') {
          x = currNode.x - monomerSpacing;
        }
        else {
          x = currNode.x + monomerSpacing;
        }
      });

      return new self.SubGraph(firstNode,currNode,allNodes);
    };

    //helper function which draws CHEM sequences
    //TO-DO: verify that CHEM sequences always consist of only 1 element
    var processChemicalModifiers = function (monomerArr, chemSequenceName, pos, connectionArray, sequenceArray) {
      var chemColor;
      if (monomerArr[0] === 'sDBL') {
        chemColor =  '#FFFFFF';
      }
      else {
        chemColor = '#a020f0';
      }

      //get x position, whether to the far left or right side of canvas
      var x = getCHEMXPosition(connectionArray, chemSequenceName, sequenceArray);
      var y;
      if (!x) {
        x = pos.x;
        y = pos.y;
      }
      else {
        y = 190;  // TO-DO: this is hard coded to be slightly below the previous, first sequence
      }
      var allNodes = [];
      var currNode = self.createNode(monomerArr[0], 'CHEM', chemColor, false, x, y, '', chemSequenceName);
      allNodes.push(currNode);
      var firstNode = currNode;

      self.canvasView.addNode(currNode);
      return new self.SubGraph(firstNode,currNode,allNodes);
    };

    //Returns the x position for the param CHEM node
    //
    //@param  connectionArray    array of connections encoded in HELM Notation
    //@param  chemSequenceName   name of CHEM node (eg, 'CHEM1')
    var getCHEMXPosition = function (connectionArray, chemSequenceName,sequenceArray) {
      var sequenceCHEMConnectsTo, nodeCHEMConnectsTo, length;

      //get the sequence name and number for node that CHEM connections to
      for (var i = 0; i < connectionArray.length; i++) {
        if (chemSequenceName === connectionArray[i].source.name) { //if CHEM is the source node for connection
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

    // makes a cyclic peptide, with two stems on the left and a circle on the right
    var separateSequences = function (sequence, seqName, connectionArray) {
      //get the start and end points of cycle
      var connectionPoints = getCyclicalSourceDest(seqName, connectionArray);
      var cycleStartId = connectionPoints[1] > connectionPoints[0] ? connectionPoints[0] : connectionPoints[1];
      var cycleEndId = connectionPoints[1] > connectionPoints[0] ? connectionPoints[1] : connectionPoints[0];
      var slicedSeqArr  =  [];
      var beforeArr = [];
      var afterArr = [];
      var cycle = [];

      for (var i = 0; i < sequence.length; i++) {
        if (i < cycleStartId) {
          beforeArr.push(sequence[i]);
        }
        else if (i >= cycleStartId && i <= cycleEndId) {
          cycle.push(sequence[i]);
        }
        else if (i > cycleEndId) {
          afterArr.push(sequence[i]);
        }
      }

      if (beforeArr.length !== 0) {
        slicedSeqArr.push(new self.ChildSequence('linear', beforeArr));
      }
      if (cycle.length !== 0) {
        slicedSeqArr.push(new self.ChildSequence('cyclic',cycle));
      }
      if (afterArr.length !== 0) {
        slicedSeqArr.push(new self.ChildSequence('linear', afterArr));
      }
      return slicedSeqArr;
    };

    //makes a cyclic peptide after determining if there are any linear and cyclic combo
    var makeGraphWithCycles = function (sequence, dir, seqType, pos, seqName, connectionArray, sequenceArray) {
      var graphedNodes = [];  //array of all nodes created and graphed
      var currSubGraph;
      var prevSubGraph;

      //separate the sequence into linear and cyclical slices
      var slicedSequenceArr =  separateSequences(sequence, seqName, connectionArray);

      for (var i = 0; i < slicedSequenceArr.length; i++) {
        var slice = slicedSequenceArr[i];

        if (slice.flow === 'linear') {
          currSubGraph = makeLinearGraph(slice.monomers, dir, seqType, pos, seqName, connectionArray, sequenceArray);
          graphedNodes.push(currSubGraph.nodes);
        }
        else {
          currSubGraph = makeCyclicalGraph(slice.monomers, seqType, pos, dir, seqName);
          graphedNodes.push(currSubGraph.nodes);
          dir = 'reverse';
        }
        if (prevSubGraph && currSubGraph) {
          addNewConnection(prevSubGraph.last, currSubGraph.first);
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
    var makeCyclicalGraph = function (monomerArr, seqType, pos, dir, seqName) {
      var firstNode, currNode, prevNode;
      var allNodes = [];

      var cyclicalNodes = self.makeCycle(monomerArr, seqType, pos, dir, seqName);

      angular.forEach(cyclicalNodes, function (value, key) {
        currNode = value;
        if (key === 0){
          firstNode = value;//keep track of firstNode
        }
        self.canvasView.addNode(value);
        allNodes.push(value);

        if (prevNode && currNode){
          addNewConnection(prevNode, currNode);
        }
        prevNode = currNode;
      });

      if (firstNode && currNode){
        addNewConnection(firstNode, currNode);
      }
      return new self.SubGraph(firstNode,currNode,allNodes);
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
    var makeRequestedConnections = function (connectionArray, graphedNodesArray) {

      var j, k;
      var nodes, source, dest = '';
      for (j = 0; j < connectionArray.length; j++) {
        if (connectionArray[j].source.name === connectionArray[j].dest.name) {
          continue; //skip cyclical connections, which are drawn in 'makeCyclicalGraph()'
        }
        for (k = 0; k < graphedNodesArray.length; k++) { //for each sequence of nodes graphed,
          nodes = graphedNodesArray[k].nodes[0];      //get the array of nodes

          //if found source sequence, get source node
          if (graphedNodesArray[k].name === connectionArray[j].source.name) {
            source = nodes[connectionArray[j].source.nodeID - 1];
          }
          //if found destination sequence, get dest node
          else if (graphedNodesArray[k].name === connectionArray[j].dest.name) {
            dest = nodes[connectionArray[j].dest.nodeID - 1];
          }
          //if found source and dest nodes, add link
          if (source !== '' && dest !== '') {
            addNewConnection(source, dest);
            source = '';
            dest = '';
          }
          nodes = '';
        }
      }
    };

    //add a connection between 2 nodes
    var addNewConnection = function (sourceNode, destNode) {
      var conn = self.createConnection(sourceNode, destNode);
      self.canvasView.addConnection(conn);
      return conn;
    };

    // retrieves the sequence type for a given sequence name
    var getSequenceType = function (sequenceName) {
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

    // helper function returns 'true' if sequence is partly, or completely, cyclical
    var isCyclical = function (sequenceName, connectionArray) {
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
    var getCyclicalSourceDest = function (sequenceName, connectionArray) {
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
  });
