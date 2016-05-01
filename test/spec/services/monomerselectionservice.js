'use strict';

describe('Service: MonomerSelectionService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var MonomerSelectionService;
  beforeEach(inject(function (_MonomerSelectionService_) {
    MonomerSelectionService = _MonomerSelectionService_;
  }));

  it('should start out with an empty monomer selected', function () {
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual({});
  });

  it('should set the monomer to be the one provided', function () {
    MonomerSelectionService.toggleSelectedMonomer({_name: 'atg'}, {stopPropagation: function () {}});
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual({_name: 'atg'});
  });

  it('should switch monomers if a new one is passed in to toggleSelectedMonomer', function () {
    var evt = {
      stopPropagation: function () {}
    };
    var monomerA = {
      _name: 'mA'
    };
    var monomerB = {
      _name: 'mB'
    };
    MonomerSelectionService.toggleSelectedMonomer(monomerA, evt);
    MonomerSelectionService.toggleSelectedMonomer(monomerB, evt);
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual(monomerB);
    MonomerSelectionService.toggleSelectedMonomer(monomerA, evt);
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual(monomerA);
  });

  it('should deselect any monomers if the same one is passed in to toggleSelectedMonomer', function () {
    var evt = {
      stopPropagation: function () {}
    };
    var monomerA = {
      _name: 'mA'
    };
    MonomerSelectionService.toggleSelectedMonomer(monomerA, evt);
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual(monomerA);
    MonomerSelectionService.toggleSelectedMonomer(monomerA, evt);
    expect(MonomerSelectionService.getSelectedMonomer()).toEqual({});
  });

});
