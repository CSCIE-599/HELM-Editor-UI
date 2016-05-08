'use strict';

describe('Service: CanvasDisplayService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var CanvasDisplayService;
  beforeEach(inject(function (_CanvasDisplayService_) {
    CanvasDisplayService = _CanvasDisplayService_;
  }));

  it('should create a new node', function () {
    var node =  CanvasDisplayService.createNode('SMCC', 'CHEM', 'purple', false, 40 , 40);  
    expect(node).toBeDefined();
    expect(angular.equals( node.x, 40)).toBe(true);
    expect(angular.equals( node.y, 40)).toBe(true);
    expect(angular.equals( node.colour, 'purple')).toBe(true);
    expect(angular.equals( node.name, 'SMCC')).toBe(true);
  });
  
  it('should create a new connection', function () {
    var node1 =  CanvasDisplayService.createNode('G', 'PEPTIDE', '#00C3FF', true, 40 , 40);
    var node2 =  CanvasDisplayService.createNode('R', 'PEPTIDE', '#00C3FF', true, 40 , 40);
    var conn = CanvasDisplayService.createConnection(node1, node2); 
    expect(conn).toBeDefined();
    expect(angular.equals(conn.source,node1) && angular.equals(conn.dest,node2)).toBe(true);
  });
  
  it('should create a Ribose node', function () {
    var node =  CanvasDisplayService.createRibose('R', 'lightgrey', 40 , 40);
    expect(angular.equals(node.nodeType, 'r')).toBe(true);
    expect(angular.equals(node.transformDegree, '0')).toBe(true);//ribose node should not be rotated
  });
  
  it('should create a Base node', function () {
    var node =  CanvasDisplayService.createBase('A', 'cyan', 40 , 40);
    expect(angular.equals(node.nodeType, 'b')).toBe(true);
    expect(angular.equals(node.transformDegree, '45')).toBe(true);//base node should be rotated
  });
  
  it('should create a Phosphate node', function () {
    var node =  CanvasDisplayService.createPhosphate('P', 'lightgrey', 40 , 40);
    expect(angular.equals(node.nodeType, 'p')).toBe(true);
    expect(angular.equals(node.transformDegree, '0')).toBe(true);//phosphate node should not be rotated
    expect(angular.equals(node.rx, 13) && angular.equals(node.ry, 13)).toBe(true);//phosphate node should have a higher corner radius
  });
  
  it('should identify a node as Ribose node', function () {
    var isRibose= CanvasDisplayService.isRiboseNode('RGNA') && CanvasDisplayService.isRiboseNode('R') && CanvasDisplayService.isRiboseNode('aR');
      expect(isRibose).toBe(true);
  });
  
  it('should identify a node as Phosphate node', function () {
     var isPhosphate = CanvasDisplayService.isPhosphateNode('P') && CanvasDisplayService.isPhosphateNode('sP') && CanvasDisplayService.isPhosphateNode('naP') && CanvasDisplayService.isPhosphateNode('nasP');   
      expect(isPhosphate).toBe(true);
  });
  
  it('should get the right color for a given node', function () {
    var color = CanvasDisplayService.getNodeColor('G');
    expect(angular.equals(color, 'orange')).toBe(true);
    color = CanvasDisplayService.getNodeColor('A');
    expect(angular.equals(color, 'lightgreen')).toBe(true);
    color = CanvasDisplayService.getNodeColor('cdaC');
    expect(angular.equals(color, 'red')).toBe(true);
  });
  
  it('should return an array of nodes placed in a cyclical fashion', function () {
    var pos = {x: 40, y:40};
    var cyclicalNodes = CanvasDisplayService.makeCycle(['A', 'G', 'T'], 'PEPTIDE', pos, 'forward');

    expect(cyclicalNodes).toBeDefined();

    expect(angular.equals(cyclicalNodes.length, 3)).toBe(true);
  });
  
  it('should start graph from (200, 75) position', function () {
    var pos;
    var startPos = CanvasDisplayService.getNewRowPos(pos, 0);
    expect(angular.equals(startPos.x, 200) && angular.equals(startPos.y, 75) ).toBe(true);
  });
  
  it('should increment every new row position by 70 if previous sequence is a peptide sequence', function () {
    var pos;
    var startPos = CanvasDisplayService.getNewRowPos(pos, 'PEPTIDE');
    var newRowPos = CanvasDisplayService.getNewRowPos(startPos, 'NUCLEOTIDE', 'PEPTIDE' );
    expect(angular.equals(newRowPos.x, 200) && angular.equals(newRowPos.y, startPos.y + 70)).toBe(true);
  });

   it('should increment every new row position by 120 if previous sequence is a Nucleotide sequence', function () {
    var pos;
    var startPos = CanvasDisplayService.getNewRowPos(pos, 'NUCLEOTIDE');
    var newRowPos = CanvasDisplayService.getNewRowPos(startPos, 'PEPTIDE', 'NUCLEOTIDE' );
    expect(angular.equals(newRowPos.x, 200) && angular.equals(newRowPos.y, startPos.y + 120)).toBe(true);
  });

// These were in main controller unit tests, but we need to put this elsewhere because we removed the functions from scope
// // It should draw graphical image on the canvas
// it('should parse the sequence, and generate the graph', function () {    
//   var notation = 'RNA1{R(A)P.[mR](U)[sP].R(G)P.R([5meC])P.[dR](T)P.[dR](T)}$$$$';
//   scope.displayOnCanvas(notation);
//   expect(angular.equals(scope.canvasView.connections.length, 16)).toBe(true);
//   expect(angular.equals(scope.canvasView.nodes.length, 17)).toBe(true);

// });

// it('should parse the sequence, and generate the graph', function () {    
//     var pos = {x:200, y:70};
//     var sequenceArr=[];
//     var sequenceObj = { name:'PEPTIDE1', sequence: ['A','E','E']};
//     sequenceArr.push(sequenceObj);
//     var destObj = {nodeID:0, name:''};
//     var sourceObj = destObj;
//     var connObj = {source: sourceObj, dest:destObj};
//     var graphedNodesArr = scope.generateGraph(sequenceObj.sequence, sequenceObj.name, [connObj], pos, 'PEPTIDE', sequenceArr)  ;               
//     expect(graphedNodesArr[0].length).toBe(3);
//     expect(angular.equals(graphedNodesArr[0][0].name, 'A')).toBe(true);
//     expect(angular.equals(graphedNodesArr[0][1].name, 'E')).toBe(true);
//     expect(angular.equals(graphedNodesArr[0][2].name, 'E')).toBe(true);
// });


// it('should draw Nucleotide sequences', function () {
//    var pos = {x:200, y:70};
//    var subGraph = scope.processNucleoTides(['R','A','P','R','T','P','R','G'], pos, 'forward');
//    expect(subGraph.nodes.length).toBe(8);
//    expect(scope.canvasView.nodes.length).toBe(8);
//    expect(angular.equals(subGraph.first.name, 'R')).toBe(true);
//    expect(angular.equals(subGraph.last.name, 'R')).toBe(true);
// });
  
// it('should draw Peptide sequences', function () {
//    var pos = {x:200, y:70};
//    var subGraph = scope.processPeptides(['A','D','E','F','Aca'], pos, 'forward');
//    expect(subGraph.nodes.length).toBe(5);
//    expect(scope.canvasView.nodes.length).toBe(5);
//    expect(angular.equals(subGraph.first.name, 'A')).toBe(true);
//    expect(angular.equals(subGraph.last.name, 'Aca')).toBe(true);
// });


// it('should draw a linear graph', function () {
//     var pos = {x:200, y:70};
//     var sequenceArr=[];
//     var sequenceObj = { name:'PEPTIDE1', sequence: ['A','E','E']};
//     sequenceArr.push(sequenceObj);
//     var destObj = {nodeID:0, name:''};
//     var sourceObj = destObj;
//     var connObj = {source: sourceObj, dest:destObj};
//     var subGraph = scope.makeLinearGraph(sequenceObj.sequence, 'forward', 'PEPTIDE', pos,  sequenceObj.name, [connObj], sequenceArr);
//     expect(angular.equals(subGraph.last.name, 'E')).toBe(true);
//     expect(angular.equals(subGraph.first.name, 'A')).toBe(true);
//     expect(angular.equals(subGraph.nodes.length, 3)).toBe(true);
// });

// it('should draw a cyclical graph', function () {
//     var pos = {x:200, y:70};
//     var subGraph = scope.makeCyclicalGraph(['R','Y','F','L','W','V','F','P','L'], 'PEPTIDE', pos,  'forward');
//     expect(angular.equals(subGraph.last.name, 'L')).toBe(true);
//     expect(angular.equals(subGraph.first.name, 'R')).toBe(true);
//     expect(angular.equals(subGraph.nodes.length, 9)).toBe(true);
// });


// it('should identify a cyclical sequence', function () {   
//    var sourceObj = {nodeID:1, name:'PEPTIDE1'};
//    var destObj = {nodeID:4, name:'PEPTIDE1'};   
//    var connObj = {source: sourceObj, dest:destObj};
//    expect(scope.isCyclical('PEPTIDE1', [connObj])).toBe(true);
// });

// it('should create a new connection and add to the view', function () {
//   var node1 =  scope.addNewNode('G', 'PEPTIDE', '#00C3FF', true, 40 , 40);
//   var node2 =  scope.addNewNode('R', 'PEPTIDE', '#00C3FF', true, 40 , 40);
//   var conn = scope.addNewConnection (node1, node2);
//   expect(conn).toBeDefined();
//   expect(angular.equals(conn.source, node1)).toBe(true);
//   expect(angular.equals(conn.dest, node2)).toBe(true);
//   expect(angular.equals(scope.canvasView.connections.length, 1)).toBe(true);
  
// });

// it('should reset canvas', function () {
//  var node1 =  scope.addNewNode('G', 'PEPTIDE', '#00C3FF', true, 40 , 40);
//  var node2 =  scope.addNewNode('R', 'PEPTIDE', '#00C3FF', true, 40 , 40);
//  scope.addNewConnection (node1, node2);
//  expect(angular.equals(scope.canvasView.connections.length, 1)).toBe(true);
//  expect(angular.equals(scope.canvasView.nodes.length, 2)).toBe(true);
//  scope.resetCanvas();
//  expect(angular.equals(scope.canvasView.connections.length, 0)).toBe(true);
//  expect(angular.equals(scope.canvasView.nodes.length, 0)).toBe(true);
  
// });
});
