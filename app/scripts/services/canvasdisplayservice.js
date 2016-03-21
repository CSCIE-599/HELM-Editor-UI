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
		console.log('adding ribose node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName,'lightgrey', false, xPos, yPos, 'r');
	};

	self.createBase = function (nodeName,  nodeColor, xPos, yPos) {
		console.log('adding base node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, nodeColor, true, xPos, yPos, 'b');
	};

	self.createPhosphate = function (nodeName,  nodeColor, xPos, yPos) {
		console.log('adding phosphate node ' + nodeName +' at: (' + xPos + ',' +yPos +')');
	 	return self.createNode(nodeName, nodeColor, false, xPos, yPos, 'p');
	};



	// create a new node
	self.createNode = function (nodeName, nodeColor, isRotate, xpos, ypos, nodeType) {

		var rotateDegree = '0';
		var sequenceVisibility = 'hidden';

		var rx = radiusX;
		var ry = radiusX;

		if(isRotate){
			rotateDegree = '45';
		}

		if(nodeType === 'p'){//for phosphate, round the rectangle corners to look like circle
			rx = radiusX +10;
			ry = radiusY +10;
		}

		if(nodeType === 'b'){//base node, A, T, G
			sequenceVisibility = 'visible';
		}

		var newNode = {
			name: nodeName,
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
			seqVisible:	sequenceVisibility,
		};

		//increment nodeNum only for baseNode
        if (!self.isRiboseNode(nodeName)  && nodeName.indexOf('P') === -1){
            nodeNum++;
            newNode.num = nodeNum;
            console.log("Created node " + nodeName + ", num: " + newNode.num);
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

	 	if(riboseArr.indexOf(node) !== -1){
	 		return true;
	 	}
	 	return false;
	};

	self.getNodeColor = function(nodeName){

		if(nodeName === 'A'){
			return 'lightgreen';
		}
		else if(nodeName === 'C'){
			return 'red';
		}
		else if(nodeName === 'G'){
			return 'orange';
		}
		else if(nodeName === 'T' || nodeName === 'U'){
			return 'cyan';
		}
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

	
/*
	// Add a node to the view model.
	self.addNode = function (nodeDataModel) {
		if (!this.data.nodes) {
			this.data.nodes = [];
		}
		// Update the data model.
		this.data.nodes.push(nodeDataModel);

		// Update the view model.
		this.nodes.push(new helmnotation.NodeView(nodeDataModel));
	};

	*/

	/*this.testFunction = function(){
  		alert('in CanvasDisplayService');
  	};*/


  });
