'use strict';

describe('Service: HelmConversionService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App'));

  // instantiate service
  var HelmConversionService;
  beforeEach(inject(function (_HelmConversionService_) {
    HelmConversionService = _HelmConversionService_;
    }));


    it('identifies single monomers where there is only one', function () {

        //with a link
        var expected = ['PEPTIDE1{A.R.C.A.A.K.T.C.D.A}'];
        var actual = HelmConversionService.getSequences('PEPTIDE1{A.R.C.A.A.K.T.C.D.A}$PEPTIDE1,PEPTIDE1,8:R3-3:R3$$$');

        //without a link
        var expected2 = ['RNA1{R(A)P.[mR](U)[sP].R(G)P.R([5meC])P.[dR](T)P.[dR](T)}'];
        var actual2 = HelmConversionService.getSequences('RNA1{R(A)P.[mR](U)[sP].R(G)P.R([5meC])P.[dR](T)P.[dR](T)}$$$$');

        expect(angular.equals(expected, actual) && angular.equals(expected2, actual2)).toBe(true);
    });

    it('constructs arrays of monomers where there are multiple monomers', function () {

        var expected = ['RNA1{R(A)P.R(A)P.R(G)P.R(G)P.R(C)P.R(U)P.R(A)P.R(A)P}', 'RNA2{R(A)P.R(A)P.R(G)P.R(G)P.R(C)P.R(U)P.R(A)P.R(A)P}','CHEM1{sDBL}'];
        var actual = HelmConversionService.getSequences('RNA1{R(A)P.R(A)P.R(G)P.R(G)P.R(C)P.R(U)P.R(A)P.R(A)P}|RNA2{R(A)P.R(A)P.R(G)P.R(G)P.R(C)P.R(U)P.R(A)P.R(A)P}|CHEM1{sDBL}$');

        var expected2 = ['PEPTIDE1{T.R.L}', 'PEPTIDE2{R.Y.R}'];
        var actual2 = HelmConversionService.getSequences('PEPTIDE1{T.R.L}|PEPTIDE2{R.Y.R}$PEPTIDE1,PEPTIDE1,3:R2-1:R1|PEPTIDE2,PEPTIDE2,3:R2-1:R1$$$');

        expect(angular.equals(expected, actual) && angular.equals(expected2, actual2)).toBe(true);
    });


    it('processes monomers with one or with multiple letters', function () {

        //multiple letters
        var expected = ['SMCC'];
        var actual = HelmConversionService.getPolymers('CHEM1', '{SMCC}');

        //multiple (mR, 5meC, dR) and single letters
        var expected2 = ['R','A','P','mR','U','sP','R','G','P','R','5meC','P','dR','T','P','dR','T'];
        var actual2 = HelmConversionService.getPolymers('RNA1', '{R(A)P.[mR](U)[sP].R(G)P.R([5meC])P.[dR](T)P.[dR](T)}');

        expect(angular.equals(expected, actual) && angular.equals(expected2, actual2)).toBe(true);
    });

    it('identifies monomer names', function () {

        var expected = 'RNA1';
        var actual = HelmConversionService.getName('RNA1{R(A)P.[mR](U)[sP].R(G)P.R([5meC])P.[dR](T)P.[dR](T)}$$$$');

        var expected2 = 'PEPTIDE1';
        var actual2 = HelmConversionService.getName('PEPTIDE1{A.R.C.A.A.K.T.C.D.A}$PEPTIDE1,PEPTIDE1,8:R3-3:R3$$$');

        expect(angular.equals(expected, actual) && angular.equals(expected2, actual2)).toBe(true);
    });

    it('identifies a single link', function () {

        var expected = ['PEPTIDE1,PEPTIDE1,8:R3-3:R3'];
        var actual = HelmConversionService.getConnections('PEPTIDE1{A.R.C.A.A.K.T.C.D.A}$PEPTIDE1,PEPTIDE1,8:R3-3:R3$$$');

        expect(angular.equals(expected, actual)).toBe(true);
    });

    it('constructs arrays of links where there are multiple links', function () {

        //non-cyclical
        var expected = ['RNA2,CHEM1,24:R2-1:R3', 'RNA1,CHEM1,24:R2-1:R2'];
        var actual = HelmConversionService.getConnections('$RNA2,CHEM1,24:R2-1:R3|RNA1,CHEM1,24:R2-1:R2$$$');

        //cyclical
        var expected2 = ['PEPTIDE1,PEPTIDE1,3:R2-1:R1', 'PEPTIDE2,PEPTIDE2,3:R2-1:R1'];
        var actual2 = HelmConversionService.getConnections('$PEPTIDE1,PEPTIDE1,3:R2-1:R1|PEPTIDE2,PEPTIDE2,3:R2-1:R1$$$');

        expect(angular.equals(expected, actual) && angular.equals(expected2, actual2)).toBe(true);
    });


  it('identifies the source node for a non-cyclical monomer link', function () {

      var expected = {
          name: 'RNA1',
          nodeID: 1
      };

      var actual = HelmConversionService.getSource('RNA1,CHEM1,1:R1-2:R1');

      expect(angular.equals(expected.name, actual.name) && angular.equals(expected.nodeID, actual.nodeID)).toBe(true);
  });

  it('identifies the destination node for a non-cyclical monomer link', function () {

      var expected = {
          name: 'CHEM1',
          nodeID: 2
      };

      var actual = HelmConversionService.getDest('RNA1,CHEM1,1:R1-2:R1');

      expect(angular.equals(expected.name, actual.name) && angular.equals(expected.nodeID, actual.nodeID)).toBe(true);
  });

  it('identifies the source node for a cyclical monomer link', function () {

      var expected = {
          name: 'PEPTIDE1',
          nodeID: 9
      };

      var actual = HelmConversionService.getSource('PEPTIDE1,PEPTIDE1,9:R2-1:R1');

      expect(angular.equals(expected.name, actual.name) && angular.equals(expected.nodeID, actual.nodeID)).toBe(true);
  });

  it('identifies the destination node for a cyclical monomer link', function () {

      var expected = {
          name: 'PEPTIDE1',
          nodeID: 1
      };

      var actual = HelmConversionService.getDest('PEPTIDE1,PEPTIDE1,9:R2-1:R1');

      expect(angular.equals(expected.name, actual.name) && angular.equals(expected.nodeID, actual.nodeID)).toBe(true);
  });

});
