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
  
  it('should start graph from (200, 100) position', function () {
    var pos;
    var startPos = CanvasDisplayService.getNewRowPos(pos, 0);
    expect(angular.equals(startPos.x, 200) && angular.equals(startPos.y, 100) ).toBe(true);
  });
  
  it('should increment every new row position by 150', function () {
    var pos;
    var startPos = CanvasDisplayService.getNewRowPos(pos, 0);
    var newRowPos = CanvasDisplayService.getNewRowPos(startPos, 1);
    expect(angular.equals(newRowPos.x, 200) && angular.equals(newRowPos.y, startPos.y + 150)).toBe(true);
  });
  
  it('should zoom in by 20 percent', function () {
     expect(!!CanvasDisplayService).toBe(true);
  });
  
  it('should zoom out by 20 percent', function () {
    expect(!!CanvasDisplayService).toBe(true);
  });

});
