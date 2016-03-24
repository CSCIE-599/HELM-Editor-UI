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

	//length of a connection, between A and attacher node R
	var connectionLength = 100;

	//space between 2 monomers, like A and G
	var monomerSpacing = 50;//100;

	//regular node radius
	var radiusX = '4';
	var radiusY = '4';


	self.createRibose = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding ribose node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'Nucleotide', 'lightgrey', false, xPos, yPos, 'r');
	};

	self.createBase = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding base node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'Nucleotide', nodeColor, true, xPos, yPos, 'b');
	};

	self.createPhosphate = function (nodeName,  nodeColor, xPos, yPos) {
		//console.log('adding phosphate node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, 'Nucleotide', nodeColor, false, xPos, yPos, 'p');
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

        if(sequenceType === 'Chem'){//CHEM nodes
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
        if ((sequenceType === "Peptide") || (sequenceType === "Nucleotide" && nodeType === 'b')){
        //if (!self.isRiboseNode(nodeName)  && nodeName.indexOf('P') === -1){
            nodeNum++;
            newNode.num = nodeNum;
            newNode.seqVisible = 'visible';
        }
        nodeId++;

		return newNode;
	};

	self.createConnection = function(sourceNode, destNode, type){

		var conn = {
			type: type,
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
        //TO-DO: remove 'else if' test, and return 'lightgrey' as default color (?)
        else if (nodeName === 'P' || nodeName === 'sP' || nodeName === 'R'){
            return 'lightgrey';
        }
	};

	self.getNodeNum = function(){
		return nodeNum;
	};


	self.setNodeNum = function(num){
		nodeNum = num;
	};

	self.makeCycle = function(sequenceArr, centreX, centreY){

		var color;
		var sequence = ['F','R','R','Y','R','R'];//remove hardcoding and take the sequencArr instead
		
		var cycleNodesArray = [];
		var r = 100;//radius
		var xc = centreX;//center x pos of circle
		var yc = centreY;//center y pos of circle

		var degree = 360/sequence.length; //divide the circle, to allow equal separation between the nodes

		var nodexpos;
		var nodeypos;
		
		var i = 0;
		angular.forEach(sequence, function(value, key) {
			color = self.getNodeColor(value);
			//debugger;
			if(i < (360)){//when i has reached 360, the circle is complete
				nodexpos = Math.sin(i * Math.PI / 180) * r + xc - 10;
				nodeypos = Math.cos(i * Math.PI / 180) * r + yc - 10;
				
				var node = self.createNode(value, "Peptide", "lightblue", "true", nodexpos, nodeypos);
				cycleNodesArray.push(node);				
				i = i+degree;				
			}
				
		});
		return cycleNodesArray;		
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
		
	};

	// View for a connection.
	self.ConnectionView= function (connectionDataModel) {

		this.data = connectionDataModel;
		this.source = connectionDataModel.source;
		this.dest = connectionDataModel.dest;

		this.type = connectionDataModel.type;//horizontal or vertical connection

		var connectionOffset = 0;

		this.sourceCoordX = function () {
			if (this.type === 'h'){ //if link is horizontal
				return this.source.width + this.source.x;
			}
			return (this.source.width/2 + this.source.x );
		};

		this.sourceCoordY = function () {
			if(this.type === 'h'){
				return (this.source.y + (this.source.height/2));
			}
			return this.source.y + this.source.height;
		};

		this.sourceCoord = function () {
			return {
				x: this.sourceCoordX(),
				y: this.sourceCoordY()
			};
		};

		this.destCoordX = function () {
			if (this.type === 'h'){
				return this.dest.x;
			}
			return this.dest.transformx;
		};

		this.destCoordY = function () {
			if (this.type === 'h'){
				return (this.dest.y + (this.dest.height/2));
			}
			return (this.dest.transformy-this.dest.height/2)-connectionOffset;
		};

		this.destCoord = function () {
			return {
				x: this.destCoordX(),
				y: this.destCoordY()
			};
		};
	};


	/*this.testFunction = function(){
  		alert('in CanvasDisplayService');
  	};*/


  });
