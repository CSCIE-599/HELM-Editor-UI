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

		if(nodeType === 'n'){//nucleotide
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

		//debugger;

        if (nodeName !== 'R' && nodeName.indexOf('P') === -1){
            nodeNum++;
            newNode.num = nodeNum;
            console.log("main line 102: made node " + nodeName + ", num: " + newNode.num);
        }

        nodeId++;

		return newNode;
	};

	//A simple nucleic acid has a ribose node, main monomer node and a connection
	self.createNucleicAcidNodes = function (nodeName,  nodeColor, xPos, yPos) {

		var sourceNodeXpos = xPos;
		var sourceNodeYpos = yPos;

		var destNodeXpos = sourceNodeXpos;
		var destNodeYpos = sourceNodeYpos + connectionLength;

		//R ribose node
	 	var sourceNode = self.createNode('R','lightgrey', false, sourceNodeXpos, sourceNodeYpos, 'r');

	 	//A,C, G, T, U
	 	var destNode = self.createNode(nodeName, nodeColor, true, destNodeXpos, destNodeYpos, 'n');

	 	return {
       	ribose: sourceNode,
       	monomer: destNode
       };

	 };



	this.getNodeColor = function(nodeName){

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

	/*this.testFunction = function(){
  		alert('in CanvasDisplayService');
  	};*/


  });
