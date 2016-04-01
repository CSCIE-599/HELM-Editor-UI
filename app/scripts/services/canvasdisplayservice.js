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
    // AngularJS will instantiate a singleton by calling "new" on this function

	var self = this;

   // node id
	var nodeId = 0;

    //number printed by node
    var nodeNum = 0;

	//node height
	var nodeHeight = 25;

	//node width
	var nodeWidth = 25;

	//regular node radius
	var radiusX = '3';
	var radiusY = '3';


	self.createRibose = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding ribose node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'NUCLEOTIDE', 'lightgrey', false, xPos, yPos, 'r');
	};

	self.createBase = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding base node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, true, xPos, yPos, 'b');
	};

	self.createPhosphate = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding phosphate node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, false, xPos, yPos, 'p');
	};




	// create a new node
	self.createNode = function (nodeName, sequenceType, nodeColor, isRotate, xpos, ypos, nodeType) {

		var rotateDegree = '0';

		var rx = radiusX;
		var ry = radiusX;

		if(isRotate){
			rotateDegree = '45';
		}

		if(nodeType === 'p'){//for phosphate, round the rectangle corners to look like circle
			rx = radiusX +10;
			ry = radiusY +10;
		}

        if(sequenceType === 'CHEM'){//CHEM nodes
            nodeWidth = 50;
        }
        else {
            nodeWidth = 25;
        }

		var newNode = {
			name: nodeName,
            seqType : sequenceType,  //Nucleotide, Peptide, or Chem
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
			seqVisible:	'hidden',
		};

		//number nodes if Peptide, or if Nucleotide and a base node
        if ((sequenceType === "PEPTIDE") || (sequenceType === "NUCLEOTIDE" && nodeType === 'b')){
        //if (!self.isRiboseNode(nodeName)  && nodeName.indexOf('P') === -1){
            nodeNum++;
            newNode.num = nodeNum;
            newNode.seqVisible = 'visible';
        }
        nodeId++;

		return newNode;
	};

	self.createConnection = function(sourceNode, destNode){

		var conn = {
			source: sourceNode,
			dest: destNode
		};

		return conn;
	};

	self.isRiboseNode = function(node){
	 	var riboseArr = ['R', 'dR', 'sR', 'mR', 'fR', 'LR', 'MOE', 'fMOE',
	 					 'mph', 'PONA','qR', 'RGNA', 'SGNA'	,'12ddR', '25R',
	 					 '4sR' , 'aFR', 'aR', 'eR', 'fR', 'hx', 'ILR', 'tR',
	 					 'UNA', '3A6','3FAM', '3ss6', '5A6','5cGT','5FAM',
	 					 '5FBC6', 'am12', 'am6'];

        //TO-DO: make test case insensitive
	 	if(riboseArr.indexOf(node) !== -1){
	 		return true;
	 	}
	 	return false;
	};


	self.isPhosphateNode = function(node){
		if(node === 'P' || node === 'sP'){
			return true;
        }
		return false;
	};

	self.getNodeColor = function(nodeName){
		if(nodeName === 'A'){
			return 'lightgreen';
		}
		else if(nodeName === 'C' || nodeName === '5meC'){
			return 'red';
		}
		else if(nodeName === 'G'){
			return 'orange';
		}
		else if(nodeName === 'T' || nodeName === 'U'){
			return 'cyan';
		}
        return 'lightgrey';
    };

	self.getNodeNum = function(){
		return nodeNum;
	};


	self.setNodeNum = function(num){
		nodeNum = num;
	};

	//helper function to combine arrays of nodes, into one big array
	self.collapseNodes = function(allNodesArr){

		var nodes = [];

		for(var i=0; i<allNodesArr.length;i++){
			nodes = nodes.concat(allNodesArr[i]);
		}
		return nodes;
	};

	self.makeCycle = function(sequence, seqType, pos, dir){

		var cycleNodesArray = [];
		var r = (sequence.length * 10) + 10;//radius

        //center points of the circle
		var yc = pos.y + r/2;
        var xc;

        if(dir === 'reverse'){
			xc = pos.x - r; //center x pos of circle
		}
		else {
			xc = pos.x + r; //center x pos of circle
		}

		var degree = 360/sequence.length; //divide the circle, to allow equal separation between the nodes

		var nodexpos;
		var nodeypos;

        var startDegrees = degree *2; //TO-DO: start position is hard-coded for Cyclic Peptide
		var i = startDegrees;
		angular.forEach(sequence, function(value, key) {

			if(i <= 360+startDegrees){//when i has reached 360, the circle is complete

				nodexpos = Math.sin(-i * Math.PI / 180) * r + xc; //making 'i' negative creates clockwise placement
				nodeypos = Math.cos(-i * Math.PI / 180) * r + yc;

				var node = self.createNode(value, seqType, "lightblue", true, nodexpos, nodeypos);

				cycleNodesArray.push(node);
				i = i + degree;

			}
		});

		return cycleNodesArray;

	};


	//helper function to get a new pos to create a new row, increments y
	self.getNewRowPos = function(pos, i){

		if(!pos){//starting pos
			return {
				x: 100, //TO-DO make this relatibe to the length of sequence
				y: 100
			};
		}
		else {//for new row, increment y
			return {
				x: pos.x,
				y: pos.y + (i * 150)
			};
		}
	};


	// View model for the chart.
	self.CanvasView = function (dataModel) {

		// Reference to the underlying data.
		this.data = dataModel;

		this.nodes = [];
		this.connections = [];

		// Add a node to the view model.
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
	};

	// View for a node.
	self.NodeView = function (nodeDataModel) {

		this.data = nodeDataModel;

		//each node has unique id
		this.id = function () {
			return this.data.id;
		};

		//used to display the sequence# next to the monomer
		this.num = function () {
			return this.data.num || "";
		};

		// Name of the node.
		this.name = function () {
			return this.data.name || "";
		};

		//color of the node
		this.colour = function () {
			return this.data.colour;
		};

		//type of the node
		//'b' : base, 'p' : phosphate ,'r' : ribose
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

		// Width of the node.
		this.width = function () {
			return this.data.width;
		};

		// Height of the node.
		this.height = function () {
			return this.data.height;
		};

		// id of node from which this node links horizontally
		this.horizSource = function(){
			return this.data.horizDest || "";
		};

		//xpos of the node after rotation
		this.transformx = function () {
			return this.data.transformx;
		};

		//ypos of the node after rotation
		this.transformy = function () {
			return this.data.transformy;
		};

		//rotation of the node
		this.transformDegree = function () {
			return this.data.transformDegree;
		};

		//visibility of the sequence#
		this.seqVisible = function () {
			return this.data.seqVisible;
		};

		this.position = function(){
			return { x: this.x(),
					 y: this.y()
				   };
		};

	};

	// View for a connection.
	self.ConnectionView= function (connectionDataModel) {

		this.data = connectionDataModel;
		this.source = connectionDataModel.source;
		this.dest = connectionDataModel.dest;

		this.type = connectionDataModel.type;//horizontal or vertical connection

		this.sourceCoordX = function () {
			return this.source.x + this.source.width/2;
		};

		this.sourceCoordY = function () {
			return this.source.y + this.source.height/2;
		};

		this.sourceCoord = function () {
			return {
				x: this.sourceCoordX(),
				y: this.sourceCoordY()
			};
		};

		this.destCoordX = function () {
			return this.dest.x + this.dest.width/2;
		};

		this.destCoordY = function () {
			return this.dest.y + this.dest.height/2;
		};

		this.destCoord = function () {
			return {
				x: this.destCoordX(),
				y: this.destCoordY()
			};
		};
	};


	self.Sequence = function(seqType, childrenArr, dir){
		this.type = seqType;//PEPTIDE, NUCLEOTIDE, CHEM
		this.children = childrenArr;//array of ChildSequence
	};

	self.ChildSequence = function(childFlow, monomerArr){
		this.flow = childFlow;//linear, cyclical
		this.monomers = monomerArr;//array of monomers,e.g: [A,R]
	};


	//represents a mini graph, like a graph of linear nodes or cyclic nodes
	self.SubGraph = function(fir, las, nodesArr){
		this.first = fir;
		this.last = las;
		this.nodes = nodesArr;
	};


  });
