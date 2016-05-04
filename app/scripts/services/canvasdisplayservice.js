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

  	// node id
		var nodeId = 0;

    //number printed by node
    var nodeNum = 0;

    //number to keep track of position of annotation
    var paramNum = 0;


		//node height
		var nodeHeight = 25;

		//node width
		var nodeWidth = 25;

		//regular node radius
		var radiusX = 3;
		var radiusY = 3;


		self.createRibose = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {

			//console.log('adding ribose node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
		 	//return self.createNode(nodeName, 'NUCLEOTIDE', 'lightgrey', false, xPos, yPos, 'r', sequenceName);
		 	return self.createNode(nodeName, 'NUCLEOTIDE', '#c6c3fe', false, xPos, yPos, 'r', sequenceName);
		};

		self.createBase = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {
			//console.log('adding base node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
		 	return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, true, xPos, yPos, 'b', sequenceName);
		};

		self.createPhosphate = function (nodeName,  nodeColor, xPos, yPos, sequenceName) {
			//console.log('adding phosphate node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
		 	return self.createNode(nodeName, 'NUCLEOTIDE', nodeColor, false, xPos, yPos, 'p', sequenceName);
		};


		// create a new node
		self.createNode = function (nodeName, sequenceType, nodeColor, isRotate, xpos, ypos, nodeType, sequenceName) {

			var rotateDegree = '0';
			var rx = radiusX;
			var ry = radiusX;
			var textColor;

			nodeWidth = self.getNodeWidth(sequenceType);

			if(isRotate){
				rotateDegree = '45';
			}
			if(nodeType === 'p'){//for phosphate, round the rectangle corners to look like circle
				rx = radiusX +10;
				ry = radiusY +10;			
			}
	        if(nodeColor === 'red' || nodeColor === '#a020f0'){
				textColor = '#FFFFFF';
			} else {
				 textColor = '#000000';
			}

			var newNode = {
				name: nodeName,
	            seqType : sequenceType,  //Nucleotide, Peptide, or Chem
	            seqName : sequenceName,
				id: nodeId,
				x: xpos,
				y: ypos,
				rx:rx,
				ry: ry,
				lowery: ypos,
				colour: nodeColor,
				height:nodeHeight,
				width:nodeWidth,
				transformx:xpos+nodeHeight/2,
				transformy:ypos+nodeWidth/2,
				transformDegree:rotateDegree,
				seqVisible:	'hidden',
				nodeVisible: 'hidden',
				annotationVisible: 'hidden',
				textColor: textColor,
				nodeType:nodeType,
				annotationText:''
			};

			if (sequenceType === 'PEPTIDE') {
				 newNode.annotationText = 'n';
			}
			else if (sequenceType === 'NUCLEOTIDE') {
				newNode.annotationText = '5\'' ;
			}

			//number nodes if Peptide, or if Nucleotide and a base node
	        if ((sequenceType === 'PEPTIDE') || (sequenceType === 'NUCLEOTIDE' && nodeType === 'b')){
	            nodeNum++;
	            newNode.num = nodeNum;
	            newNode.seqVisible = 'visible';
	            newNode.nodeVisible = 'visible';
	        }
	        // adjust the positioning and viisbility of base and chem nodes in lower pane
	    	if ((sequenceType === 'CHEM') || (sequenceType === 'NUCLEOTIDE' && nodeType === 'b')){
	        	newNode.lowery = newNode.lowery-120;
	        	newNode.nodeVisible = 'visible';
	        }
	        nodeId++;

	        if (sequenceType === 'PEPTIDE' || sequenceType === 'NUCLEOTIDE' ){
	 			paramNum++;
	            newNode.paramNum = paramNum;
	        }

	        if(newNode.paramNum === 1){
	        	newNode.annotationVisible = 'visible';
	        }
			return newNode;
		};

		self.createConnection = function(sourceNode, destNode){
			var conn = {
				source: sourceNode,
				dest: destNode
			};
			return conn;
		};

		/*Identify a ribose node*/
		self.isRiboseNode = function(node){
		 	var riboseArr = ['R', 'dR', 'sR', 'mR', 'fR', 'LR', 'MOE', 'FMOE',
		 					 'mph', 'PONA','qR', 'RGNA', 'SGNA'	,'12ddR', '25R',
		 					 '4sR' , 'aFR', 'aR', 'eR', 'FR', 'hx', 'lLR', 'tR',
		 					 'UNA', '3A6','3FAM', '3SS6', '5A6','5cGT','5FAM',
		 					 '5FBC6', 'am12', 'am6'];

	        //TO-DO: make test case insensitive
		 	if(riboseArr.indexOf(node) !== -1){
		 		return true;
		 	}
		 	return false;
		};

		/*Identify a phosphate node*/
		self.isPhosphateNode = function(node){
			if(node === 'P' || 
				 node === 'sP' || 
				 node === 'naP' || 
				 node === 'nasP' || 
				 node === 'bP' || 
				 node === 'dier'){
				return true;
	        }
			return false;
		};

		/*get color for a node*/
		self.getNodeColor = function(nodeName){

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
				color =	'lightgreen'; 
				break;

				case 'C':
				case 'prpC':
				case '5meC': 
				case 'cpC': 
				case 'cdaC':		
				color =	'red'; 
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
				color =	'cyan'; 
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

	    /*getter/setter for nodeNum*/
		self.getNodeNum = function(){
			return nodeNum;
		};

		self.getNodeID = function(){
			return nodeId;
		};

		self.setNodeNum = function(num){
			nodeNum = num;
		};

		self.setParamNum = function(num){
			paramNum = num;
		};

		self.setNodeID = function(id){
			nodeId = id;
		};

		/*helper method for creating cyclical nodes, only supports cyclical peptides now*/
		self.makeCycle = function(sequence, seqType, pos, dir){

			var cycleNodesArray = [];
			var r = (sequence.length * 10) + 10;//radius

	        //center of the circle
			var yc = pos.y + r/2;
	        var xc;

	        if(dir === 'reverse'){
				xc = pos.x - r; //center x pos of circle
			}
			else {
				xc = pos.x + r; //center x pos of circle
			}

			var degree = 360/sequence.length; //divide the circle, to allow equal separation between the nodes
			var nodexpos, nodeypos;

	        var startDegrees = degree *2; //TO-DO: start position is hard-coded for Cyclic Peptide
			var i = startDegrees;

			angular.forEach(sequence, function(value) {
				if(i <= 360+startDegrees){//when i has reached 360, the circle is complete

					nodexpos = Math.sin(-i * Math.PI / 180) * r + xc; //making 'i' negative creates clockwise placement
					nodeypos = Math.cos(-i * Math.PI / 180) * r + yc;

					var node = self.createNode(value, seqType, '#00C3FF', true, nodexpos, nodeypos);

					cycleNodesArray.push(node);
					i = i + degree;
				}
			});

			return cycleNodesArray;
		};

		
		/*helper function to get a new pos to create a new row, increments y*/
		self.getNewRowPos = function(pos,seqType,prevSeqType){
			if(!pos){//starting pos
				return {
					x: 200, //TO-DO make this relative to the length of sequence
					y: 75
				};
			}
			else {//for new row, increment y
				
				if(prevSeqType){			
					if(prevSeqType === 'CHEM' || prevSeqType === 'PEPTIDE' ){
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

		var transMatrix = [1,0,0,1,0,0];//identity matrix 
		var mapMatrix, newMatrix, width, height;	

		self.zoom = function (scale, evt, svgCanvas){
			var svgDoc;

			if(evt){
				svgDoc = evt.target.parentNode;//keep track of which canvas is being zoomed
			}
			else {
				svgDoc = svgCanvas;//for zoom onload
			}

			if(svgDoc){
				//get canvas width and height
				 width = svgDoc.clientWidth;
				 height = svgDoc.clientHeight;
				 mapMatrix = svgDoc.getElementById('map-matrix');

				 for (var i=0; i<transMatrix.length; i++){
				   transMatrix[i] *= scale;
				 }

				 transMatrix[4] += (1-scale)*width/2;
				 transMatrix[5] += (1-scale)*height/2;				        
				 newMatrix = 'matrix(' +  transMatrix.join(' ') + ')';
				 mapMatrix.setAttributeNS(null, 'transform', newMatrix);
			}
		};

		self.pan = function(dx, dy, evt){
		  var svgDoc = evt.target.parentNode;//keep track of which canvas is being panned  
		  if(svgDoc){   	
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

		/*data models for canvas, node and connection */

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
	      console.log(nodeDataModel.id());
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

			//each node has unique id
			this.id = function () {
				return this.data.id;
			};

			//used to display the sequence# next to the monomer
			this.num = function () {
				return this.data.num || '';
			};

			//keep track of the node to display the annotaion
			this.paramNum = function () {
				return this.data.paramNum || '';
			};

			// Name of the node.
			this.name = function () {
				return this.data.name || '';
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

			//visibility of the node
			this.nodeVisible = function () {
				return this.data.nodeVisible;
			};

			//text color of the node
			this.textColor = function () {
				return this.data.textColor;
			};

			//(x,y) position of a node 
			this.position = function(){
				return { x: this.x(),
						 y: this.y()
					   };
			};

			//visibility of the annotation
			this.annotationVisible = function () {
				return this.data.annotationVisible;
			};

			//visibility of the annotation
			this.annotationText = function () {
				return this.data.annotationText;
			};		
		};

		// View for a connection.
		self.ConnectionView= function (connectionDataModel) {

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

		//model for a sequence
		self.Sequence = function(seqType, childrenArr, dir){
			this.type = seqType;//PEPTIDE, NUCLEOTIDE, CHEM
			this.children = childrenArr;//array of ChildSequence
			this.dir = dir;//direction
		};

		//model for a sub-sequence, which renders a cyclical or linear shape,based on the 'flow'
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

		// remember the node that we started with
	  self.dragStartNode = null;
	  // handle the beginning of a drag
	  self.mousedown = function (node, evt) {
	    console.log(self.dragStartNode);
	    self.dragStartNode = node;
	    console.log(self.dragStartNode);
	    console.log(node);
	    console.log(node.position());
	    console.log(evt);
	  };

		self.mousemove = function (evt) {
	    console.log(self.dragStartNode);
	    if (self.dragStartNode) {
	      console.log(evt);
	    }
	  };

	  self.mouseup = function (node, evt) {
	    console.log(self.dragStartNode);  
	    self.dragStartNode = null;
	    console.log(self.dragStartNode);
	    console.log(node);
	    console.log(evt);
	  };


  });