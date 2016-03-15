
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

		// Select all nodes and connections in the chart.
		this.selectAll = function () {

			var nodes = this.nodes;
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				node.select();
			}

			var connections = this.connections;
			for (var i = 0; i < connections.length; ++i) {
				var connection = connections[i];
				connection.select();
			}
		};

		// Deselect all nodes and connections in the chart.
		this.deselectAll = function () {

			var nodes = this.nodes;
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				node.deselect();
			}

			var connections = this.connections;
			for (var i = 0; i < connections.length; ++i) {
				var connection = connections[i];
				connection.deselect();
			}
		};

		// Update the location of the node and its connectors.
		this.updateSelectedNodesLocation = function (deltaX, deltaY) {

			var selectedNodes = this.getSelectedNodes();

			for (var i = 0; i < selectedNodes.length; ++i) {
				var node = selectedNodes[i];
				node.data.x += deltaX;
				node.data.y += deltaY;
			}
		};

		// Handle mouse click on a particular node.
		this.handleNodeClicked = function (node, ctrlKey) {

			if (ctrlKey) {
				node.toggleSelected();
			}
			else {
				this.deselectAll();
				node.select();
			}

			// Move node to the end of the list so it is rendered after all the other.
			// This is the way Z-order is done in SVG.

			var nodeIndex = this.nodes.indexOf(node);
			if (nodeIndex == -1) {
				throw new Error("Failed to find node in view model!");
			}
			this.nodes.splice(nodeIndex, 1);
			this.nodes.push(node);
		};

		// Handle mouse down on a connection.
		this.handleConnectionMouseDown = function (connection, ctrlKey) {

			if (ctrlKey) {
				connection.toggleSelected();
			}
			else {
				this.deselectAll();
				connection.select();
			}
		};

		// Delete all nodes and connections that are selected.
		this.deleteSelected = function () {

			var newNodeViewModels = [];
			var newNodeDataModels = [];

			var deletedNodeIds = [];

			//
			// Sort nodes into:
			//		nodes to keep and
			//		nodes to delete.
			//

			for (var nodeIndex = 0; nodeIndex < this.nodes.length; ++nodeIndex) {

				var node = this.nodes[nodeIndex];
				if (!node.selected()) {
					// Only retain non-selected nodes.
					newNodeViewModels.push(node);
					newNodeDataModels.push(node.data);
				}
				else {
					// Keep track of nodes that were deleted, so their connections can also
					// be deleted.
					deletedNodeIds.push(node.data.id);
				}
			}

			var newConnectionViewModels = [];
			var newConnectionDataModels = [];

			//
			// Remove connections that are selected.
			// Also remove connections for nodes that have been deleted.
			//
			for (var connectionIndex = 0; connectionIndex < this.connections.length; ++connectionIndex) {

				var connection = this.connections[connectionIndex];
				if (!connection.selected() &&
					deletedNodeIds.indexOf(connection.data.source.nodeID) === -1 &&
					deletedNodeIds.indexOf(connection.data.dest.nodeID) === -1)
				{
					//
					// The nodes this connection is attached to, where not deleted,
					// so keep the connection.
					//
					newConnectionViewModels.push(connection);
					newConnectionDataModels.push(connection.data);
				}
			}

			// Update nodes and connections.
			this.nodes = newNodeViewModels;
			this.data.nodes = newNodeDataModels;
			this.connections = newConnectionViewModels;
			this.data.connections = newConnectionDataModels;
		};

		// Select nodes and connections that fall within the selection rect.
		this.applySelectionRect = function (selectionRect) {

			this.deselectAll();

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.x() >= selectionRect.x &&
					node.y() >= selectionRect.y &&
					node.x() + node.width() <= selectionRect.x + selectionRect.width &&
					node.y() + node.height() <= selectionRect.y + selectionRect.height)
				{
					// Select nodes that are within the selection rect.
					node.select();
				}
			}

			for (var i = 0; i < this.connections.length; ++i) {
				var connection = this.connections[i];
				if (connection.source.parentNode().selected() &&
					connection.dest.parentNode().selected())
				{
					// Select the connection if both its parent nodes are selected.
					connection.select();
				}
			}

		};

		// Get the array of nodes that are currently selected.
		this.getSelectedNodes = function () {
			var selectedNodes = [];

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.selected()) {
					selectedNodes.push(node);
				}
			}

			return selectedNodes;
		};

		// Get the array of connections that are currently selected.
		this.getSelectedConnections = function () {
			var selectedConnections = [];

			for (var i = 0; i < this.connections.length; ++i) {
				var connection = this.connections[i];
				if (connection.selected()) {
					selectedConnections.push(connection);
				}
			}

			return selectedConnections;
		};
	};


})();
