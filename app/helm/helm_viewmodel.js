
//
// Global accessor.
//
var helmnotation = {

};

// Module.
(function () {


	// Width of a node.
	helmnotation.nodeWidth = 40;


	// View model for a node.
	helmnotation.NodeViewModel = function (nodeDataModel) {

		this.data = nodeDataModel;

		// Set to true when the node is selected.
		this._selected = false;

		this.id = function () {
			return this.data.id;
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

	// View model for a connector.
	helmnotation.ConnectorViewModel = function (connectorDataModel, x, y, parentNode) {

		this.data = connectorDataModel;
		this._parentNode = parentNode;
		this._x = x;
		this._y = y;

		// The name of the connector.
		this.name = function () {
			return this.data.name;
		}

		// X coordinate of the connector.
		this.x = function () {
			return this._x;
		};

		// Y coordinate of the connector.
		this.y = function () {
			return this._y;
		};

		// The parent node that the connector is attached to.
		this.parentNode = function () {
			return this._parentNode;
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

		var connectionOffset = 5;

		// Set to true when the connection is selected.
		this._selected = false;

		this.sourceCoordX = function () {
			if (destNode.name === 'P' || destNode.name === 'R'){
				return sourceNode.width + sourceNode.x;
			}
			return ((sourceNode.width/2)+sourceNode.x);
		};

		this.sourceCoordY = function () {
			if(destNode.name === 'P' || destNode.name === 'R'){
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
			if (destNode.name === 'P' || destNode.name === 'R'){
				return destNode.x;
			}
			return destNode.transformx;
		};

		this.destCoordY = function () {
			if (destNode.name === 'P' || destNode.name === 'R'){
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

		// Find a specific node within the chart.
		this.findNode = function (nodeID) {

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.data.id == nodeID) {
					return node;
				}
			}

			throw new Error("Failed to find node " + nodeID);
		};

		// Find a specific input connector within the chart.
		this.findInputConnector = function (nodeID, connectorIndex) {

			var node = this.findNode(nodeID);

			if (!node.inputConnectors || node.inputConnectors.length <= connectorIndex) {
				throw new Error("Node " + nodeID + " has invalid input connectors.");
			}

			return node.inputConnectors[connectorIndex];
		};

		//
		// Find a specific output connector within the chart.
		this.findOutputConnector = function (nodeID, connectorIndex) {

			var node = this.findNode(nodeID);

			if (!node.outputConnectors || node.outputConnectors.length <= connectorIndex) {
				throw new Error("Node " + nodeID + " has invalid output connectors.");
			}
			return node.outputConnectors[connectorIndex];
		};

		//
		// Create a view model for connection from the data model.
		this._createConnectionViewModel = function(connectionDataModel) {

			var sourceConnector = this.findOutputConnector(connectionDataModel.source.nodeID, connectionDataModel.source.connectorIndex);
			var destConnector = this.findInputConnector(connectionDataModel.dest.nodeID, connectionDataModel.dest.connectorIndex);
			return new helmnotation.ConnectionViewModel(connectionDataModel, sourceConnector, destConnector);
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