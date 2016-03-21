
// Global accessor
var helmnotation = {

};

(function () {

	// View for a node.
	helmnotation.NodeView = function (nodeDataModel) {

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
		//'n' : main monomer, 'p' : phosphate ,'r' : ribose
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
		}

		// Height of the node.
		this.height = function () {
			return this.data.height;
		}

		// id of node from which this node links horizontally
		this.horizSource = function(){
			return this.data.horizDest || "";
		}

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
	helmnotation.ConnectionView= function (connectionDataModel) {
		
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
		}

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
		}		
	};


	// View model for the chart.
	helmnotation.CanvasView = function (dataModel) {
		
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
			this.nodes.push(new helmnotation.NodeView(nodeDataModel));
		};

		// Add a connection to the canvas view.
		this.addConnection = function (connectionDataModel) {
			//push to connectionsdatamodel
			this.data.connections.push(connectionDataModel);

			// Update the view
			this.connections.push(new helmnotation.ConnectionView(connectionDataModel));
		};

	};


})();
