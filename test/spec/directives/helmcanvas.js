'use strict';

describe('Directive: helmCanvas', function () {

  // load the directive's module
  beforeEach(module('helmeditor2App'));

  // load the templates
  beforeEach(module('testDirectives'));

  var element,
    scope,
    $compile,
    $httpBackend;

  beforeEach(inject(function (_$compile_, $rootScope, _$httpBackend_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
  }));

  // helpers to create nodes and connections
  var createConnection = function (sx, sy, dx, dy) {
    return {
      sourceCoordX : function () {
        return sx;
      },
      sourceCoordY : function () {
        return sy;
      },
      destCoordX : function () {
        return dx;
      },
      destCoordY : function () {
        return dy;
      }
    };
  };

  var createNode = function (name, num, seqVisible, width, height, x, y, rx, ry, colour, transformDegree, transformx, transformy) {
    return {
      name : function () {
        return name;
      },
      num : function () {
        return num;
      },
      seqVisible : function () {
        return seqVisible;
      },
      width : function () {
        return width;
      },
      height : function () {
        return height;
      },
      x : function () {
        return x;
      },
      y : function () {
        return y;
      },
      rx : function () {
        return rx;
      },
      ry : function () {
        return ry;
      },
      colour : function () {
        return colour;
      },
      transformDegree : function () {
        return transformDegree;
      },
      transformx : function () {
        return transformx;
      },
      transformy : function () {
        return transformy;
      }
    };
  };

  it('should replace the helm-canvas element', inject(function () {
    element = angular.element('<div><helm-canvas></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // only one element in what is replaced
    expect(element.children().length).toBe(1);
    
    // ensure it's SVG with the right class
    var svg = element.find('svg');
    expect(svg.hasClass('draggable-container'));
  }));

  it('should have the zoom buttons, the pan buttons, and the graph', inject(function () {
    element = angular.element('<div><helm-canvas></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // check the children of the SVG element
    var svg = element.children().eq(0);
    var svgChildren = svg.children();
    expect(svgChildren.length).toBe(9);
    expect(svgChildren.eq(0).hasClass('zoombtn')).toBe(true);
    expect(svgChildren.eq(0).attr('cx')).toBeDefined();
    expect(svgChildren.eq(0).attr('cy')).toBeDefined();
    expect(svgChildren.eq(1).hasClass('zoombtn')).toBe(true);
    expect(svgChildren.eq(1).attr('cx')).toBeDefined();
    expect(svgChildren.eq(1).attr('cy')).toBeDefined();
    expect(svgChildren.eq(2).hasClass('plus-minus')).toBe(true);
    expect(svgChildren.eq(2).attr('x')).toBeDefined();
    expect(svgChildren.eq(2).attr('y')).toBeDefined();
    expect(svgChildren.eq(3).hasClass('plus-minus')).toBe(true);
    expect(svgChildren.eq(3).attr('x')).toBeDefined();
    expect(svgChildren.eq(3).attr('y')).toBeDefined();

    // check the pan buttons
    expect(svgChildren.eq(4).attr('xlink:href')).toContain('.png');
    expect(svgChildren.eq(5).attr('xlink:href')).toContain('.png');
    expect(svgChildren.eq(6).attr('xlink:href')).toContain('.png');
    expect(svgChildren.eq(7).attr('xlink:href')).toContain('.png');

    // check the actual graph (it should have no nodes)
    expect(svgChildren.eq(8).attr('id')).toBe('map-matrix');
    expect(svgChildren.eq(8).children().length).toBe(0);
  }));

  it('should list out the connections in the graph', inject(function () {
    // set up the connections in scope
    scope.graph = {};
    scope.graph.connections = [
      createConnection(10, 10, 20, 20),
      createConnection(30, 30, 40, 40)
    ];

    // create the element
    element = angular.element('<div><helm-canvas graph="graph"></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // check that two paths were created, with the right d value
    var helmCanvas = element.children().eq(0);
    // take into account the zoom buttons
    var g = helmCanvas.children().eq(8);
    expect(g.children().length).toBe(2);
    var paths = g.find('path');
    expect(paths.length).toBe(2);
    expect(paths.eq(0).attr('d')).toBe('M10, 10 L20, 20');
    expect(paths.eq(1).attr('d')).toBe('M30, 30 L40, 40');
  }));

  it('should list out the nodes in the graph', inject(function () {
    // set up the nodes
    scope.graph = {};
    var vals = [
      {
        name: 'node1',
        num: '1',
        seqVisible: 'visible',
        width: '10',
        height: '20',
        x: '30',
        y: '40',
        rx: '50',
        ry: '60',
        colour: 'red',
        transformDegree: '70',
        transformx: '80',
        transformy: '90'
      },
      {
        name: 'node2',
        num: '2',
        seqVisible: 'visible',
        width: '100',
        height: '200',
        x: '300',
        y: '400',
        rx: '500',
        ry: '600',
        colour: 'blue',
        transformDegree: '700',
        transformx: '800',
        transformy: '900'
      },
      {
        name: 'node3',
        num: '3',
        seqVisible: 'hidden',
        width: '2',
        height: '4',
        x: '6',
        y: '8',
        rx: '10',
        ry: '12',
        colour: 'green',
        transformDegree: '14',
        transformx: '16',
        transformy: '18'
      }
    ];
    scope.graph.nodes = [
      createNode(vals[0].name, 
        vals[0].num, 
        vals[0].seqVisible, 
        vals[0].width, 
        vals[0].height, 
        vals[0].x, 
        vals[0].y, 
        vals[0].rx, 
        vals[0].ry, 
        vals[0].colour, 
        vals[0].transformDegree, 
        vals[0].transformx, 
        vals[0].transformy),
      createNode(vals[1].name, 
        vals[1].num, 
        vals[1].seqVisible, 
        vals[1].width, 
        vals[1].height, 
        vals[1].x, 
        vals[1].y, 
        vals[1].rx, 
        vals[1].ry, 
        vals[1].colour, 
        vals[1].transformDegree, 
        vals[1].transformx, 
        vals[1].transformy),
      createNode(vals[2].name, 
        vals[2].num, 
        vals[2].seqVisible, 
        vals[2].width, 
        vals[2].height, 
        vals[2].x, 
        vals[2].y, 
        vals[2].rx, 
        vals[2].ry, 
        vals[2].colour, 
        vals[2].transformDegree, 
        vals[2].transformx, 
        vals[2].transformy),
    ];

    // create the element
    element = angular.element('<div><helm-canvas graph="graph"></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // check that there are elements within g, and they have the right structure
    var helmCanvas = element.children().eq(0);
    // grab the element where the nodes go
    var parentG = helmCanvas.children().eq(8);
    // all of the nodes themselves
    var children = parentG.children();
    expect(children.length).toBe(3);

    // go through each one
    for (var i = 0; i < children.length; i++) {
      var g = children.eq(i);
      expect(g.children().length).toBe(6);
      var rect = g.children().eq(0);
      var nameText = g.children().eq(1);
      var numText = g.children().eq(2);

      // test the rect
      expect(rect.attr('width')).toBe(vals[i].width);
      expect(rect.attr('height')).toBe(vals[i].height);
      expect(rect.attr('fill')).toBe(vals[i].colour);
      expect(rect.attr('x')).toBe(vals[i].x);
      expect(rect.attr('y')).toBe(vals[i].y);
      expect(rect.attr('rx')).toBe(vals[i].rx);
      expect(rect.attr('ry')).toBe(vals[i].ry);
      expect(rect.attr('transform')).toBe('rotate(' + 
                                          vals[i].transformDegree + 
                                          ', ' + 
                                          vals[i].transformx + 
                                          ', ' + 
                                          vals[i].transformy + 
                                          ')');

      // test the name text
      expect(nameText.attr('text-anchor')).toBe('middle');
      expect(nameText.attr('alignment-baseline')).toBe('middle');
      expect(nameText.attr('x')).toBe(vals[i].width / 2 + vals[i].x);
      expect(nameText.attr('y')).toBe(vals[i].height / 2 + vals[i].y);
      expect(nameText.text()).toContain(vals[i].name);

      // test the num text
      expect(numText.attr('text-anchor')).toBe('middle');
      expect(numText.attr('alignment-baseline')).toBe('middle');
      expect(numText.attr('visibility')).toBe(vals[i].seqVisible);
      expect(numText.attr('x')).toBe('' + (vals[i].x - 5));
      expect(numText.attr('y')).toBe('' + (vals[i].y - 5));
      expect(numText.text()).toContain(vals[i].num);
    }
  }));

  it('should list out node names in the lowercanvas variant', function () {
    // set up the nodes
    scope.graph = {};
    var vals = [
      {
        name: 'node1',
        num: '1',
        seqVisible: 'visible',
        width: '10',
        height: '20',
        x: '30',
        y: '40',
        rx: '50',
        ry: '60',
        colour: 'red',
        transformDegree: '70',
        transformx: '80',
        transformy: '90'
      },
      {
        name: 'node2',
        num: '2',
        seqVisible: 'visible',
        width: '100',
        height: '200',
        x: '300',
        y: '400',
        rx: '500',
        ry: '600',
        colour: 'blue',
        transformDegree: '700',
        transformx: '800',
        transformy: '900'
      },
      {
        name: 'node3',
        num: '3',
        seqVisible: 'hidden',
        width: '2',
        height: '4',
        x: '6',
        y: '8',
        rx: '10',
        ry: '12',
        colour: 'green',
        transformDegree: '14',
        transformx: '16',
        transformy: '18'
      }
    ];
    scope.graph.nodes = [
      createNode(vals[0].name, 
        vals[0].num, 
        vals[0].seqVisible, 
        vals[0].width, 
        vals[0].height, 
        vals[0].x, 
        vals[0].y, 
        vals[0].rx, 
        vals[0].ry, 
        vals[0].colour, 
        vals[0].transformDegree, 
        vals[0].transformx, 
        vals[0].transformy),
      createNode(vals[1].name, 
        vals[1].num, 
        vals[1].seqVisible, 
        vals[1].width, 
        vals[1].height, 
        vals[1].x, 
        vals[1].y, 
        vals[1].rx, 
        vals[1].ry, 
        vals[1].colour, 
        vals[1].transformDegree, 
        vals[1].transformx, 
        vals[1].transformy),
      createNode(vals[2].name, 
        vals[2].num, 
        vals[2].seqVisible, 
        vals[2].width, 
        vals[2].height, 
        vals[2].x, 
        vals[2].y, 
        vals[2].rx, 
        vals[2].ry, 
        vals[2].colour, 
        vals[2].transformDegree, 
        vals[2].transformx, 
        vals[2].transformy),
    ];

    // create the element
    element = angular.element('<div><helm-canvas graph="graph" canvastype="lower"></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // check that there are elements within g, and they have the right structure
    var helmCanvas = element.children().eq(0);

    // grab the element where the nodes go
    var parentG = helmCanvas.children().eq(8);
    // all of the nodes themselves
    var children = parentG.children();
    expect(children.length).toBe(3);

    // go through each one
    for (var i = 0; i < children.length; i++) {
      var g = children.eq(i);
      expect(g.children().length).toBe(4);
      var nameText = g.children().eq(0);
      var numText = g.children().eq(1);

      // test the name text
      expect(nameText.attr('text-anchor')).toBe('middle');
      expect(nameText.attr('alignment-baseline')).toBe('middle');
      expect(nameText.attr('x')).toBeDefined();
      expect(nameText.attr('y')).toBeDefined();
      expect(nameText.text()).toContain(vals[i].name);

      // test the num text
      expect(numText.attr('text-anchor')).toBe('middle');
      expect(numText.attr('alignment-baseline')).toBe('middle');
      expect(numText.attr('visibility')).toBe(vals[i].seqVisible);
      expect(numText.attr('x')).toBeDefined();
      expect(numText.attr('y')).toBeDefined();
      expect(numText.text()).toContain(vals[i].num);
    }
  });

  it('should call the zoom and pan methods with the correct parameters', function () {
    element = angular.element('<div><helm-canvas></helm-canvas></div>');
    element = $compile(element)(scope);
    scope.$digest();

    // make sure we deal with any requests to the view
    $httpBackend.whenGET('views/main.html').respond('');

    // find the zoom and pan buttons
    var svg = element.children().eq(0);
    var svgChildren = svg.children();
    var zoomOut = svgChildren.eq(0);
    var zoomIn = svgChildren.eq(1);
    var panUp = svgChildren.eq(4);
    var panDown = svgChildren.eq(5);
    var panRight = svgChildren.eq(6);
    var panLeft = svgChildren.eq(7);

    // set up the spies
    var spiedScope = zoomIn.scope();
    spyOn(spiedScope, 'zoom');
    spyOn(spiedScope, 'pan');

    // click the buttons and make sure they were called
    zoomIn.click();
    expect(spiedScope.zoom).toHaveBeenCalledWith(1.2, jasmine.anything());
    zoomOut.click();
    expect(spiedScope.zoom).toHaveBeenCalledWith(0.8, jasmine.anything());
    panUp.click();
    expect(spiedScope.pan).toHaveBeenCalledWith(0, 50, jasmine.anything());
    panDown.click();
    expect(spiedScope.pan).toHaveBeenCalledWith(0, -50, jasmine.anything());
    panLeft.click();
    expect(spiedScope.pan).toHaveBeenCalledWith(50, 0, jasmine.anything());
    panRight.click();
    expect(spiedScope.pan).toHaveBeenCalledWith(-50, 0, jasmine.anything());
  });
});
