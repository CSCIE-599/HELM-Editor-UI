
// Global accessor
var helmnotation = {

};

(function () {


	// View model for a node.
	helmnotation.NodeViewModel = function (nodeDataModel) {

		this.data = nodeDataModel;

		// Set to true when the node is selected.
		this._selected = false;

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

		//rotation of the node
		this.transformx = function () {
			return this.data.transformx;
		};

		//rotation of the node
		this.transformy = function () {
			return this.data.transformy;
		};

		//rotation of the node
		this.transformDegree = function () {
			return this.data.transformDegree;
		};

		// Select the node.
		this.select = function () {
			this._selected = true;
		};

		// Deselect the node.
		this.deselect = function () {
			this._selected = false;
		};

		// Toggle the selection state of the node.
		this.toggleSelected = function () {
			this._selected = !this._selected;
		};

		// Returns true if the node is selected.
		this.selected = function () {
			return this._selected;
		};

		//visibility of the sequence#
		this.seqVisible = function () {
			return this.data.seqVisible;
		};

	};

	// Wrap the nodes data-model in a view-model.
	var createNodesViewModel = function (nodesDataModel) {
		var nodesViewModel = [];

		if (nodesDataModel) {
			for (var i = 0; i < nodesDataModel.length; ++i) {
				nodesViewModel.push(new helmnotation.NodeViewModel(nodesDataModel[i]));
			}
		}
		return nodesViewModel;
	};

	
	// View model for a connection.
	helmnotation.ConnectionViewModel= function (connectionDataModel, sourceNode, destNode) {

		this.data = connectionDataModel;
		this.source = sourceNode;
		this.dest = destNode;

		var connectionOffset = 0;

		// Set to true when the connection is selected.
		this._selected = false;

		this.sourceCoordX = function () {
			if (sourceNode.id === destNode.horizSource){ //if link is horizontal
				//console.log('source ' + sourceNode.name + ' has horiz link to ' + destNode.name);
				return sourceNode.width + sourceNode.x;
			}
			return ((sourceNode.width/2)+sourceNode.x);
		};

		this.sourceCoordY = function () {
			if(sourceNode.id === destNode.horizSource){
				return (sourceNode.y + (sourceNode.height/2));
			}
			return sourceNode.y + sourceNode.height;
		};

		this.sourceCoord = function () {
			return {
				x: this.sourceCoordX(),
				y: this.sourceCoordY()
			};
		}

		this.destCoordX = function () {
			if (sourceNode.id === destNode.horizSource){
				return destNode.x;
			}
			return destNode.transformx;
		};

		this.destCoordY = function () {
			if (sourceNode.id === destNode.horizSource){
				//console.log('for destCoordY, link from ' + sourceNode.name + ' to ' + destNode.name);
				return (destNode.y + (destNode.height/2));
			}
			return (destNode.transformy-destNode.height/2)-connectionOffset;
		};

		this.destCoord = function () {
			return {
				x: this.destCoordX(),
				y: this.destCoordY()
			};
		}

		// Select the connection.
		this.select = function () {
			this._selected = true;
		};

		// Deselect the connection.
		this.deselect = function () {
			this._selected = false;
		};

		// Toggle the selection state of the connection.
		this.toggleSelected = function () {
			this._selected = !this._selected;
		};

		// Returns true if the connection is selected.
		this.selected = function () {
			return this._selected;
		};
	};


	// View model for the chart.
	helmnotation.ChartViewModel = function (chartDataModel) {

		// Create a view model for connection from the data model.
		this._createConnectionViewModel = function(connectionDataModel) {
			return new helmnotation.ConnectionViewModel(connectionDataModel);
		};

		// Wrap the connections data-model in a view-model.
		this._createConnectionsViewModel = function (connectionsDataModel) {

			var connectionsViewModel = [];

			if (connectionsDataModel) {
				for (var i = 0; i < connectionsDataModel.length; ++i) {
					connectionsViewModel.push(this._createConnectionViewModel(connectionsDataModel[i]));
				}
			}
			return connectionsViewModel;
		};		

		// Reference to the underlying data.
		this.data = chartDataModel;

		// Create a view-model for nodes.
		this.nodes = createNodesViewModel(this.data.nodes);

		// Create a view-model for connections.
		this.connections = this._createConnectionsViewModel(this.data.connections);

		// Add a node to the view model.
		this.addNode = function (nodeDataModel) {
			if (!this.data.nodes) {
				this.data.nodes = [];
			}
			// Update the data model.
			this.data.nodes.push(nodeDataModel);

			// Update the view model.
			this.nodes.push(new helmnotation.NodeViewModel(nodeDataModel));
		};


		// Create a view model for a new connection.
		this.addConnection = function (sourceNode, destNode) {
			var connectionsDataModel = this.data.connections;
			var connectionsViewModel = this.connections;

			var connectionDataModel = {
				source: {
					nodeID: sourceNode.id,
				},
				dest: {
					nodeID: destNode.id,
				},
			};
			//push to connectionsdatamodel
			connectionsDataModel.push(connectionDataModel);

			//push to connectionsviewmodel
			var connectionViewModel = new helmnotation.ConnectionViewModel(connectionDataModel, sourceNode, destNode);
			connectionsViewModel.push(connectionViewModel);
		};

	};


})();
