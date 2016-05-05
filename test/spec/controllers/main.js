'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('helmeditor2App'));

  var MainCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of polymerTypes to the scope', function () {
    expect(MainCtrl.polyTypes.length).toBe(3);
  });

 it('should validate the polytypes dropdown', function () {
    expect(MainCtrl.polyTypes[0].value).toBe('HELM');
    expect(MainCtrl.polyTypes[1].value).toBe('RNA');
    expect(MainCtrl.polyTypes[2].value).toBe('PEPTIDE');
  });

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
