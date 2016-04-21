'use strict';

describe('Service: MonomerLibraryService', function () {

  // load the service's module
  beforeEach(module('helmeditor2App.MonomerLibrary'));

  // instantiate service
  var MonomerLibraryService, $httpBackend;
  beforeEach(inject(function (_MonomerLibraryService_, _$httpBackend_) {
    MonomerLibraryService = _MonomerLibraryService_;
    $httpBackend = _$httpBackend_;
    // mock the database of monomers
    $httpBackend.expect('GET', 'MonomerDBGZEncoded.xml')
      .respond(200, getDatabaseXML());
    // and mock the categorization databse
    $httpBackend.expect('GET', 'DefaultMonomerCategorizationTemplate.xml')
      .respond(200, getDefaultCategorizationXML());
    $httpBackend.flush();
  }));

  // after each test, make sure to validate that there are no outstanding requests
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // this test is provided to ensure that the library used to convert XML to json results in the correct object
  it('should be able to retrieve the categorization information object, complete with the correct structure', function () {  
    var categorizationInfo = MonomerLibraryService.getCategorizedDB();
    expect(categorizationInfo).not.toBeNull();

    // get the actual data
    categorizationInfo = categorizationInfo.Template;

    // get the list of Polymers that are defined
    var polymers = categorizationInfo.Polymer;

    // there should be three Polymer groupings
    expect(polymers.length).toBe(3);

    // split them up and make sure names match
    var rnaList = polymers[0];
    expect(rnaList._name).toBe('RNA');
    expect(rnaList._title).toBe('Nucleic Acid');
    expect(rnaList._fontColor).toBe('black');
    expect(rnaList._shape).toBe('Rectangle');

    var peptideList = polymers[1];
    expect(peptideList._name).toBe('PEPTIDE');
    var chemList = polymers[2];
    expect(chemList._name).toBe('CHEM');

    // ensure there are the right sub-groupings in the RNA info
    var rnaFragmentGroups = rnaList.FragmentGroup;
    var rnaMonomerGroups = rnaList.MonomerGroup;
    expect(rnaFragmentGroups.length).toBe(2);
    expect(rnaMonomerGroups.length).toBe(4); // including 'Other' that was added
    expect(rnaFragmentGroups[0]._name).toBe('Standard Nucleotide');
    expect(rnaFragmentGroups[0].Fragment.length).toBe(5);
    expect(rnaFragmentGroups[0].Fragment[0]._name).toBe('A');
    expect(rnaFragmentGroups[0].Fragment[0]._backgroundColor).toBe('White');
    expect(rnaFragmentGroups[0].Fragment[0]._fontColor).toBe('Green');
    expect(rnaFragmentGroups[1]._name).toBe('Modified Nucleotide');
    expect(rnaFragmentGroups[1].FragmentGroup.length).toBe(5);
    expect(rnaFragmentGroups[1].FragmentGroup[0]._name).toBe('dR');
    expect(rnaFragmentGroups[1].FragmentGroup[0].Fragment.length).toBe(10);
    expect(rnaFragmentGroups[1].FragmentGroup[0].Fragment[0]._name).toBe('dA');
    expect(rnaFragmentGroups[1].FragmentGroup[0].Fragment[0]._backgroundColor).toBe('White');
    expect(rnaFragmentGroups[1].FragmentGroup[0].Fragment[0]._fontColor).toBe('Green');
    expect(rnaMonomerGroups[0]._name).toBe('Sugar');
    expect(rnaMonomerGroups[0].MonomerGroup.length).toBe(6);
    expect(rnaMonomerGroups[0].MonomerGroup[0]._name).toBe('Standard');
    expect(rnaMonomerGroups[0].MonomerGroup[0].Monomer.length).toBe(6);
    expect(rnaMonomerGroups[0].MonomerGroup[0].Monomer[0]._name).toBe('dR');
    expect(rnaMonomerGroups[0].MonomerGroup[0].Monomer[0]._backgroundColor).toBe('Light_Violet');
    expect(rnaMonomerGroups[0].MonomerGroup[0].Monomer[0]._fontColor).toBe('Black');
    expect(rnaMonomerGroups[1]._name).toBe('Base');
    expect(rnaMonomerGroups[1].MonomerGroup[0]._name).toBe('Standard');
    expect(rnaMonomerGroups[1].MonomerGroup[0].Monomer.length).toBe(5);
    expect(rnaMonomerGroups[1].MonomerGroup[3].Monomer).toBeUndefined();

    // ensure there are the right sub-groupings in the CHEM info
    var chemFragmentGroups = chemList.FragmentGroup;
    var chemMonomerGroups = chemList.MonomerGroup;
    expect(chemFragmentGroups).not.toBeDefined();
    expect(chemMonomerGroups.length).toBe(5); // inluding 'Other' that was added
    expect(chemMonomerGroups[0]._name).toBe('Reactive');
    expect(chemMonomerGroups[0].Monomer.length).toBe(3);
    expect(chemMonomerGroups[0].Monomer[0]._name).toBe('Az');
    expect(chemMonomerGroups[0].Monomer[0]._backgroundColor).toBe('Purple');
    expect(chemMonomerGroups[0].Monomer[0]._fontColor).toBe('Black');
    expect(chemMonomerGroups[1]._name).toBe('Mono-Functional');
    expect(chemMonomerGroups[1].Monomer).toBeUndefined();
    expect(chemMonomerGroups[2]._name).toBe('Bi-Functional');
    expect(chemMonomerGroups[2].Monomer.length).toBe(6);
    expect(chemMonomerGroups[3]._name).toBe('No-Structure');
    expect(chemMonomerGroups[3].Monomer._name).toBe('Alexa');

    // no need to test PEPTIDES explicitly because it's the same as CHEM and RNA in structure
  });

  // very simple test, since the xml to json should be tested by the above test case
  it('should be able to retrieve the default encoded database', function () {  
    var encodedDatabase = MonomerLibraryService.getEncodedDB();
    expect(encodedDatabase).not.toBeNull();

    var monomerDatabase = encodedDatabase.MONOMER_DB;
    expect(monomerDatabase).not.toBeNull();
    var polymers = monomerDatabase.PolymerList;
    expect(polymers).not.toBeNull();

    // ensure we have CHEM, RNA, and PEPTIDE
    expect(polymers.Polymer.length).toBe(3);
    var chemList = polymers.Polymer[0];
    expect(chemList.Monomer.length).toBe(11);
    expect(chemList.Monomer[0].MonomerID).toBe('A6OH');
    var rnaList = polymers.Polymer[1];
    expect(rnaList.Monomer.length).toBe(63);
    var peptideList = polymers.Polymer[2];
    expect(peptideList.Monomer.length).toBe(119);
  });

  it('should link the two databases, added encodedMonomer to each monomer', function () {
    var categorizedDB = MonomerLibraryService.getCategorizedDB();

    var polymers = categorizedDB.Template.Polymer;
    expect(polymers.length).toBe(3);

    // check an RNA Fragment
    var fragment = polymers[0].FragmentGroup[0].Fragment[1];
    expect(fragment._name).toBe('C');
    expect(fragment.encodedMonomer).toBeDefined();
    expect(fragment.encodedMonomer.MonomerID).toBe('C');

    // check a deeper RNA Fragment
    fragment = polymers[0].FragmentGroup[1].FragmentGroup[0].Fragment[2];
    expect(fragment._name).toBe('dC');
    expect(fragment.encodedMonomer).toBeUndefined(); // these actually don't exist in the encoded database

    // check an RNA Monomer
    var monomer = polymers[0].MonomerGroup[0].MonomerGroup[1].Monomer[1];
    expect(monomer.encodedMonomer).toBeDefined();
    expect(monomer._name).toBe(monomer.encodedMonomer.MonomerID);

    // check a PEPTIDE Monomer
    monomer = polymers[1].MonomerGroup[0].MonomerGroup[0].Monomer[1];
    expect(monomer.encodedMonomer).toBeDefined();
    expect(monomer._name).toBe(monomer.encodedMonomer.MonomerID);

    // check a CHEM Monomer
    monomer = polymers[2].MonomerGroup[0].Monomer[1];
    expect(monomer.encodedMonomer).toBeDefined();
    expect(monomer._name).toBe(monomer.encodedMonomer.MonomerID);
  });

  it('should not add elements to monomer groups that have no elements', function () {
    var categorizedDB = MonomerLibraryService.getCategorizedDB();
    var group = categorizedDB.Template.Polymer[0].MonomerGroup[1].MonomerGroup[3];
    expect(group.Monomer).toBeUndefined();
  });

  it('should work correctly on monomer groups that have one element', function () {
    var categorizedDB = MonomerLibraryService.getCategorizedDB();
    var group = categorizedDB.Template.Polymer[2].MonomerGroup[3];
    expect(group.Monomer).toBeDefined();
    expect(group.Monomer._name).toBe(group.Monomer.encodedMonomer.MonomerID);
  });

  it('should add unknown elements to "Other"', function () {
    var categorizedDB = MonomerLibraryService.getCategorizedDB();
    // RNA - 4 elements
    var group = categorizedDB.Template.Polymer[0].MonomerGroup[3];
    expect(group._name).toBe('Other');
    expect(group.Monomer.length).toBe(4);

    // PEPTIDE - 0 elements
    group = categorizedDB.Template.Polymer[1].MonomerGroup[7];
    expect(group._name).toBe('Other');
    expect(group.Monomer.length).toBe(0);

    // CHEM - 1 elements
    group = categorizedDB.Template.Polymer[2].MonomerGroup[4];
    expect(group._name).toBe('Other');
    expect(group.Monomer.length).toBe(1);
  });

  it('should expose the three types of polymers', function () {
    expect(MonomerLibraryService.polymerTypes.length).toBe(3);
    expect(MonomerLibraryService.polymerTypes).toContain('RNA');
    expect(MonomerLibraryService.polymerTypes).toContain('PEPTIDE');
    expect(MonomerLibraryService.polymerTypes).toContain('CHEM');
  });

  it('should return a normalized linked database with the groupings', function () {
    var linkedDB = MonomerLibraryService.getLinkedDB();
    expect(linkedDB['RNA']).toBeDefined();
    expect(linkedDB['PEPTIDE']).toBeDefined();
    expect(linkedDB['CHEM']).toBeDefined();
  });

  it('should be able to return each type of polymer grouping', function () {
    var groupRNA = MonomerLibraryService.getMonomersByType('RNA');
    var groupPeptide = MonomerLibraryService.getMonomersByType('PEPTIDE');
    var groupChem = MonomerLibraryService.getMonomersByType('CHEM');

    expect(groupRNA._name).toBe('RNA');
    expect(groupRNA.categories.length).toBe(6);
    expect(groupPeptide._name).toBe('PEPTIDE');
    expect(groupPeptide.categories.length).toBe(8);
    expect(groupChem._name).toBe('CHEM');
    expect(groupChem.categories.length).toBe(5);
  });

  it('should have persisted properties from parents to children', function () {
    var groupPeptide = MonomerLibraryService.getMonomersByType('PEPTIDE');
    expect(groupPeptide.categories[0].categories.length).toBe(2);
    expect(groupPeptide.categories[0].categories[0]._shape).toBe('Rhomb');
    expect(groupPeptide.categories[0].categories[0]._title).toBe('Peptide');

    var groupChem = MonomerLibraryService.getMonomersByType('CHEM');
    expect(groupChem.categories[0]._name).toBe('Reactive');
    expect(groupChem.categories[0].monomers.length).toBe(3);
    expect(groupChem.categories[0].monomers[0]._name).toBe('Az');
    expect(groupChem.categories[0].monomers[0]._title).toBe('Chemical Modifier');
  })

  // functions to return our test databases (these are currently the full databases)
  var getDefaultCategorizationXML = function () {
    return '<?xml version="1.0" encoding="ISO-8859-1"?>' + 
'<Template xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + 
'    <Polymer name="RNA" title="Nucleic Acid" fontColor="black" shape="Rectangle">' + 
'        <FragmentGroup name="Standard Nucleotide" shape="No">' + 
'            <Fragment name="A" backgroundColor="White" fontColor="Green" notation="R(A)P"/>' + 
'            <Fragment name="C" backgroundColor="White" fontColor="Red" notation="R(C)P"/>' + 
'            <Fragment name="G" backgroundColor="White" fontColor="Orange" notation="R(G)P"/>' + 
'            <Fragment name="T" backgroundColor="White" fontColor="Cyan" notation="R(T)P"/>' + 
'            <Fragment name="U" backgroundColor="White" fontColor="Cyan" notation="R(U)P"/>' + 
'        </FragmentGroup>' + 
'        <FragmentGroup name="Modified Nucleotide" shape="No">' + 
'            <FragmentGroup name="dR" shape="No">' + 
'                <Fragment name="dA" backgroundColor="White" fontColor="Green" notation="[dR](A)P"/>' + 
'                <Fragment name="dsA" backgroundColor="White" fontColor="Green" notation="[dR](A)[sP]"/>' + 
'                <Fragment name="dC" backgroundColor="White" fontColor="Red" notation="[dR](C)P"/>' + 
'                <Fragment name="dsC" backgroundColor="White" fontColor="Red" notation="[dR](C)[sP]"/>' + 
'                <Fragment name="dG" backgroundColor="White" fontColor="Orange" notation="[dR](G)P"/>' + 
'                <Fragment name="dsG" backgroundColor="White" fontColor="Orange" notation="[dR](G)[sP]"/>' + 
'                <Fragment name="dT" backgroundColor="White" fontColor="Cyan" notation="[dR](T)P"/>' + 
'                <Fragment name="dsT" backgroundColor="White" fontColor="Cyan" notation="[dR](T)[sP]"/>' + 
'                <Fragment name="dU" backgroundColor="White" fontColor="Cyan" notation="[dR](U)P"/>' + 
'                <Fragment name="dsU" backgroundColor="White" fontColor="Cyan" notation="[dR](U)[sP]"/>' + 
'            </FragmentGroup>' + 
'            <FragmentGroup name="mR" shape="No">' + 
'                <Fragment name="mA" backgroundColor="White" fontColor="Green" notation="[mR](A)P"/>' + 
'                <Fragment name="msA" backgroundColor="White" fontColor="Green" notation="[mR](A)[sP]"/>' + 
'                <Fragment name="mC" backgroundColor="White" fontColor="Red" notation="[mR](C)P"/>' + 
'                <Fragment name="msC" backgroundColor="White" fontColor="Red" notation="[mR](C)[sP]"/>' + 
'                <Fragment name="mG" backgroundColor="White" fontColor="Orange" notation="[mR](G)P"/>' + 
'                <Fragment name="msG" backgroundColor="White" fontColor="Orange" notation="[mR](G)[sP]"/>' + 
'                <Fragment name="mT" backgroundColor="White" fontColor="Cyan" notation="[mR](T)P"/>' + 
'                <Fragment name="msT" backgroundColor="White" fontColor="Cyan" notation="[mR](T)[sP]"/>' + 
'                <Fragment name="mU" backgroundColor="White" fontColor="Cyan" notation="[mR](U)P"/>' + 
'                <Fragment name="msU" backgroundColor="White" fontColor="Cyan" notation="[mR](U)[sP]"/>' + 
'            </FragmentGroup>' + 
'            <FragmentGroup name="fR" shape="No">' + 
'                <Fragment name="fA" backgroundColor="White" fontColor="Green" notation="[fR](A)P"/>' + 
'                <Fragment name="fsA" backgroundColor="White" fontColor="Green" notation="[fR](A)[sP]"/>' + 
'                <Fragment name="fC" backgroundColor="White" fontColor="Red" notation="[fR](C)P"/>' + 
'                <Fragment name="fsC" backgroundColor="White" fontColor="Red" notation="[fR](C)[sP]"/>' + 
'                <Fragment name="fG" backgroundColor="White" fontColor="Orange" notation="[fR](G)P"/>' + 
'                <Fragment name="fsG" backgroundColor="White" fontColor="Orange" notation="[fR](G)[sP]"/>' + 
'                <Fragment name="fT" backgroundColor="White" fontColor="Cyan" notation="[fR](T)P"/>' + 
'                <Fragment name="fU" backgroundColor="White" fontColor="Cyan" notation="[fR](U)P"/>' + 
'                <Fragment name="fsU" backgroundColor="White" fontColor="Cyan" notation="[fR](U)[sP]"/>' + 
'            </FragmentGroup>' + 
'            <FragmentGroup name="LR + sP" shape="No">' + 
'                <Fragment name="lsA" backgroundColor="White" fontColor="Green" notation="[LR](A)[sP]"/>' + 
'                <Fragment name="lsC" backgroundColor="White" fontColor="Green" notation="[LR](C)[sP]"/>' + 
'                <Fragment name="ls5C" backgroundColor="White" fontColor="Green" notation="[LR]([5meC])[sP]"/>' + 
'                <Fragment name="lsG" backgroundColor="White" fontColor="Green" notation="[LR](G)[sP]"/>' + 
'                <Fragment name="lsT" backgroundColor="White" fontColor="Green" notation="[LR](T)[sP]"/>' + 
'            </FragmentGroup>' + 
'            <FragmentGroup name="R + sP" shape="No">' + 
'                <Fragment name="sA" backgroundColor="White" fontColor="Green" notation="R(A)[sP]"/>' + 
'                <Fragment name="sC" backgroundColor="White" fontColor="Green" notation="R(C)[sP]"/>' + 
'                <Fragment name="sG" backgroundColor="White" fontColor="Green" notation="R(G)[sP]"/>' + 
'                <Fragment name="sU" backgroundColor="White" fontColor="Green" notation="R(U)[sP]"/>' + 
'            </FragmentGroup>' + 
'        </FragmentGroup>' + 
'        <MonomerGroup name="Sugar" shape="Rectangle">' + 
'            <MonomerGroup name="Standard" shape="Rectangle">' + 
'                <Monomer name="dR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="fR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="LR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="MOE" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="mR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="R" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Special" shape="Rectangle">' + 
'                <Monomer name="12ddR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="25R" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="4sR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="aFR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="aR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="eR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="FR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="hx" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="lLR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="tR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="UNA" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Custom" shape="Rectangle">' + 
'                <Monomer name="FMOE" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="mph" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="PONA" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="qR" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="RGNA" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="SGNA" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Commericial" shape="Rectangle">' + 
'                <Monomer name="am12" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="am6" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="5\'-Modifier" shape="Rectangle">' + 
'                <Monomer name="5A6" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="5FAM" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="5FBC6" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="5cGT" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="3\'-Modifier" shape="Rectangle">' + 
'                <Monomer name="3A6" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="3FAM" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="3SS6" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Base" shape="Rhomb">' + 
'            <MonomerGroup name="Standard" shape="Rhomb">' + 
'                <Monomer name="A" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="C" backgroundColor="Red" fontColor="Black"/>' + 
'                <Monomer name="G" backgroundColor="Orange" fontColor="Black"/>' + 
'                <Monomer name="T" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="U" backgroundColor="Cyan" fontColor="White"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified A" shape="Rhomb">' + 
'                <Monomer name="cpmA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="eaA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="daA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="dabA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="meA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="baA" backgroundColor="Green" fontColor="Red"/>' + 
'                <Monomer name="clA" backgroundColor="Green" fontColor="Red"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified C" shape="Rhomb">' + 
'                <Monomer name="prpC" backgroundColor="Red" fontColor="Black"/>' + 
'                <Monomer name="5meC" backgroundColor="Red" fontColor="Black"/>' + 
'                <Monomer name="cpC" backgroundColor="Red" fontColor="Black"/>' + 
'                <Monomer name="cdaC" backgroundColor="Red" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified G" shape="Rhomb">' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified T" shape="Rhomb">' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified U" shape="Rhomb">' + 
'                <Monomer name="5eU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="5fU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="prpU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="cpU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="5tpU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="tfU" backgroundColor="Cyan" fontColor="White"/>' + 
'                <Monomer name="5iU" backgroundColor="Cyan" fontColor="White"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Synthetic" shape="Rhomb">' + 
'            </MonomerGroup>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Linker" shape="Circle">' + 
'            <MonomerGroup name="Common" shape="Circle">' + 
'                <Monomer name="P" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="sP" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Special" shape="Circle">' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Salt" shape="Circle">' + 
'                <Monomer name="naP" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'                <Monomer name="nasP" backgroundColor="Light_Violet" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'        </MonomerGroup>' + 
'    </Polymer>' + 
'    <Polymer name="PEPTIDE" title="Peptide" fontColor="black" shape="Rhomb">' + 
'        <MonomerGroup name="L Amino Acid" shape="Rhomb">' + 
'            <MonomerGroup name="Natural" shape="Rhomb">' + 
'                <Monomer name="A" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="C" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="D" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="E" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="F" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="G" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="H" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="I" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="K" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="L" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="M" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="N" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="P" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Q" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="R" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="S" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="T" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="V" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="W" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Y" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'            <MonomerGroup name="Modified" shape="Rhomb">' + 
'                <Monomer name="Aad" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Abu" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Aca" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Apm" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Asu" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Aze" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Bal" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Cha" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Cit" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Cya" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Dab" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Dpr" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Dsu" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Edc" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Glc" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Har" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Hcy" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Hhs" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Hse" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Hyl" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Hyp" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Iva" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Mhp" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Nal" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Nle" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Nty" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Nva" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Oic" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Orn" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Pen" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Phg" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="seC" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Thi" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Tle" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Tml" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Tza" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="Wil" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="D Amino Acid" shape="Rhomb">' + 
'            <Monomer name="dA" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dC" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dD" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dE" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dF" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dH" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dK" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dL" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dM" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dN" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dP" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dQ" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dR" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dS" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dV" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dW" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="dY" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="N-Methylated Amino Acid" shape="Rhomb">' + 
'            <Monomer name="meA" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meC" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meD" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meE" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meF" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meH" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meI" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meK" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meL" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meM" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meN" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meQ" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meR" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meS" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meT" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meV" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meW" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="meY" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Sar" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Synthetic Amino Acid" shape="Rhomb">' + 
'            <Monomer name="Aib" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="App" backgroundColor="Light_Cyan" fontColor="Black"/>' +
'            <Monomer name="Bux" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Cap" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Dpm" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Ggu" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Gla" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Pqa" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Spg" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Sta" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Tic" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Peptide Nucleic Acid (PNA)" shape="Rhomb">' + 
'            <MonomerGroup name="Standard" shape="Rhomb">' + 
'                <Monomer name="pnA" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="pnG" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="pnC" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'                <Monomer name="pnT" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            </MonomerGroup>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="N-Terminal" shape="Rhomb">' + 
'            <Monomer name="ac" backgroundColor="Light_Cyan" fontColor="Black"/>' +
'            <Monomer name="Bua" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="fmoc" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Glc" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Glp" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Hiv" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Hva" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Lac" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Maa" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Mba" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'            <Monomer name="Mpa" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="C-Terminal" shape="Rhomb">' + 
'            <Monomer name="am" backgroundColor="Light_Cyan" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'    </Polymer>' + 
'    <Polymer name="CHEM" title="Chemical Modifier" fontColor="black" shape="Hexagon">' + 
'        <MonomerGroup name="Reactive" shape="Hexagon">' + 
'            <Monomer name="Az" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="hxy" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="MCC" backgroundColor="Purple" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Mono-Functional" shape="Hexagon">' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="Bi-Functional" shape="Hexagon">' + 
'            <Monomer name="EG" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="A6OH" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="PEG2" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="SS3" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="SMCC" backgroundColor="Purple" fontColor="Black"/>' + 
'            <Monomer name="SMPEG2" backgroundColor="Purple" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'        <MonomerGroup name="No-Structure" shape="Hexagon">' + 
'            <Monomer name="Alexa" backgroundColor="Purple" fontColor="Black"/>' + 
'        </MonomerGroup>' + 
'    </Polymer>' + 
'</Template>';
  };

  var getDatabaseXML = function () {
    return '<?xml version="1.0" encoding="UTF-8"?>' + 
'<MONOMER_DB xmlns="lmr" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + 
'  <PolymerList>' + 
'    <Polymer polymerType="CHEM">' + 
'      <Monomer>' + 
'        <MonomerID>A6OH</MonomerID>' + 
'        <MonomerSmiles>[*]OCCCCCCN[*] |$_R1;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJZgt23nPFDFRUAd2RhYGBr4fJwNQkqGolhUlx8rVdR4G4Hh9PG93AGbJlIVslAHeYQwwAWQA+spP5JzhIkRkyiqhZap1wsRaqjOtEowwl+hnVYnos/dlxihW3JfKbrlKwJSYu17+UuEQwlovHp2X1V4cRhvjWi8OSTev9WLRUup7OS1XyerF9W962ixWEX0vrt/RYhW9HKnjjCqyLVXkWqrIt1RRaKmi2FJFqaVcf98vTfVbzukRYDqcq+uypTZE5WxLZT8Oxmw1zAvnCjXF9AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>6-amino-hexanol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>SS3</MonomerID>' + 
'        <MonomerSmiles>[*]OCCCSSCCCO[*] |$_R1;;;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Uu05DMQyG9zyFJVhP5EuSE88UMRVQkdgZWRgY+vzYiQqnDUMbK5Gc3/an3APA/uP7+PkFgIkSKpFk3sGvhQDEQGTxTfszVYV3RsRgg4UiV8muYxSp1D2LIhzuzhH/txNFaXUPY6oiG8oLXE3BmCul7ikKbigPt1HW3Ge1cp6jWAWxqFM4UuI6TaGydoqW5p0ob7dQKis7RaKszZuktN1YUmRMPLciilly7ZTCrNMUrsUpOaa0TlI42hHlTqmllKlb1yjsN3YpsShtKVe/ACuys6UL1bZYRtUS66iapKNq5WlUFQgH1SR/85e5Vp7HXPIvYsilNuVLNbflnat7gMPTa0v3iHcHAnvk8XkXwr1Z+AE3KfbnrAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Dipropanol-disulfide</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>EG</MonomerID>' + 
'        <MonomerSmiles>[*]OCC[*] |$_R1;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWRPQ/CQAiG9/sVb6KrF+A+LLM1TlXTwd3RxcHB39+7M9G23lAjIYS8wBMIBuiuj+ftDjCLJ2UXGmnxNmOAAHiARv4xVcVFiCj1YSNWXBOzTpY56CtLVcIJU0TdC4VtEM85Iysa44iyW04Rq8HVKf1qMYVsQ7qtXvTDLmlCg/y3SzpFSpyr7luV8rG56ssrp2oH9IdzmcigXM1NkFzZH1tj1snMALRUzqcoAgAA</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Ethylene Glycol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Alexa</MonomerID>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Alexa Fluor 488</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-X</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>X</CapGroupName>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>PEG2</MonomerID>' + 
'        <MonomerSmiles>[*]OCCOCCO[*] |$_R1;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTvQ4CIQyAd56iia6StvyVWY2TP3Fwd3RxcPD5LVyinjCc2hDu8hW+lBIMwPZ8u1+uABgpohBrrOAZxgBkANH823hFzhlOjIi6DhZsOYqUP7SRJJUVaDWLsIexoj+qhWwI3g0WxshvluV0C1pxuV/LVxbi0K9l+ol0R5BMf9YCZClxGCzogv/VIpJwsHif8m8nYhuRfLeW42xyd9lmcdzt7mSLtpXrPKKKXEsV+ZYqCi1VFFuqKLU01RfySak+nTHdAhw3h1pf2VK/5QqoZNa7lTFzDfMAXwmFTZgDAAA=</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Diethylene Glycol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>hxy</MonomerID>' + 
'        <MonomerSmiles>[*]OCCCCC#C |$_R1;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSOwsCMRCE+/yKAW0Nm908a0+sTuUKe0sbCwt/v7koeq9CybKE5cswzMIqoL3cH9cbQELJkAnOcoNPKQVEIOT/QX8rpYQzE1HWYWM0kZXXxMKuV1BmRDhibLHcb5dgYuwn0jF7D1y2v7uQ5piWXbrVzy6srcjyRn9kEW1sCLUbiY6euTaL1S746ixOczKVWQzA5Z1SmdMstHOakZvTjPyc+nLFUxrKecuItkC3PxVt/wPTk92hUWqdSz0BzdmnmjQDAAA=</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Hexynyl alcohol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Az</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)CCCN=[N+]=[N-] |$_R1;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTu27DMAxFd30FgXY1QVFPzkmQLnkgQ/eOXTp0yPeHVII0sTUIDcFBvsQ9urRhB7D7+j1//wB4YiIhScRruJdzAAJQAeih/0pE4FON5OzJoxLYThEzJ7EToU4JDvCM6PeMErBqpgfKapxCGEoqV0qoNf6LMilFzS9mmXSjFPjVLB5LLqWbZT9OYYyV+1lulDBACeglZ/MySkmdLGnoS1eKuZvl9Da4kdcIrZ9Ubmv4mapSXKqxhZ2rKuWlqlJZ3lbaH9LJIHPCDmD1sW0zc9nUrJO3yWl7vCr2Opuy2a+de9dyF/bggu2qAwAA</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Azide</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>MCC</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)C1CCC(CN2C(=O)C=CC2=O)CC1 |$_R1;;;;;;;;;;;;;;;;$,c:11|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2VsW4DIQyGd57CUrsW2RiDPTdVp6RVhu4du3To0OevOa7tJWRIQOjk+zh+/BvQBYD9+9f3xycAJTQ0QpS0g78WAlAFUgDc9P9mZvCWEDG0N4pEyj0SVWkRRh9FeIRTics99BmS87JKiqRYZ1VqsdpVrOY0p+I+immLOFKVSUfuI2fqkSjzbC5GmntU1ebq8oAxSaFVr1qeVVFGWR1V2ubycotKVtL15KjYRuV4d0N1Lff9TV6XPLlHHIV0dUSWtnt0uEWFa8XuiKtN5pIjs6yOGFVnVfzoyu8pVppVISzr7THjyduYYuGuQhGpbKt7/XnxXGoi7HVGPnF0tYpPSsvzhDrikTrKI3UkI3VURkoXqa9WR+pIl7FzapdWa3U4o46IRpouUgIaHTui0bEjkiGzpjvWodEyfsvtN3JG9wDH59dFoVkEauTpsAvh3lv4AdooTV6cBgAA</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>4-(N-maleimidomethyl)cyclohexane-1-carboxylate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>SMCC</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)C1CCC(CN2C(=O)CC([*])C2=O)CC1 |$_R1;;;;;;;;;;;;;_R2;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU/EMAyG9/4KS7AS2c6H45lDTHegG9gZWRgY+P3nJhXtNR1KGlX9eOM8eu3aA8D58+f36xsABZmQQkx8gr81DEAZSG1/cc1LVeGDEXGwjydyMUkedXKSSMY3dLaL8Az3iO2rUNDl6H2l+KDcS2FBrBT1nBaUy26KnSDJheIdaeX1eInIpS7shEMfxU7EGGTKCDX0UrKnWL2knFIvRZNw9UIalxm97a8LOVaV6kW9xC6KOUicw0RBpAXl+rDbCzvO7CeK9nbdeDZNGcWcOidgphyZozmjI3M0z/SRjLwTIj5a3ZniXeawpPyj64ILHLf/0e5+sSbjcr9TTfKtGjdVk1KrhhK+Vi1QNmM3VIvNxcnag7aqAGFDoFCkNZeAWmdkalsHk6jN2KQJvSZscI3QVsekcRa4VfM69gxwfX2vPwmhPscmpnHn5XIahkdbww27AUafAAcAAA==</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>SMCC linker from Pierce</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>sDBL</MonomerID>' + 
'        <MonomerSmiles>[*]OC(CNC(=O)CCCCO[*])CNC(=O)CCCCO[*] |$_R1;;;;;;;;;;;;_R2;;;;;;;;;;_R3$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWWsVLDMAyG9zyF7mCtT5Lt2Jopx9TCMbAzsjAw8PzIbo/aUYY0zuV67Zfkq/TLaTMBnD5/fr++AVA4EBLxzEf436YJ2AOzHm/22yYi8MGIOOmHg3fZYyicXcQQyzt0ehThCXrF+r6wkJuT7LYQRblYeE7YWM7bLewC0nAtem2e12u5w4JOEsfRWtBxzDiYi14R4jxaS2MZWS+3dNUXuO3odXst5CihXGoR2jmjxuJd6mu5y5JzrKsuOIo7c+ks0s9oey6H4GIIeTCXxjKQyyHq2hU/mEtn2Z1LM2lzH+1Kd8TCDkXC9e6+/kZcLe8Pd+QiyddaovPSzWi7pdzJ5U9hyEKqqa8dVeQtVRQsVRQtVTRbqihZqihbqkjWvISWChAZqohsb4rI9qaIVnpTg+1NEdneFJHtTRGt9kZSU16kXma4oNour/SW65PCkobyCLGgJ4D3l7c6vSKqE2eo31NOBl/OeD4fp+lRt+kPAuxM0KgIAAA=</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>Symmetric Doubler</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>SMPEG2</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)CCOCCOCCNC(=O)CCN1C(=O)CC([*])C1=O |$_R1;;;;;;;;;;;;;;;;;;;;;_R2;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu1IDMQxF+/0KzUAbjyQ/ZNWEoUpgUtBT0lBQ8P3I6x2yWbsgXo/zOmvfuVexPAGcPr5/Pr8AMLESotrnEf7GNAGHMgFX8zpUFd4ZESf7cWCnmnLh5CSRlG/o7CnCGW4l+nNR4cy+qvigvFJ5+r8KuZik7+UOFXQ5+t1e0LEgVhX1nIbqYjtI8qziHWnVG/ESkee6sBMOYyq2I8YgSyLUMKqSPcXqJeWURlU0CVcvpHGd6PWe88KqUr2olzikYg4S57CoINJK5fLwby/XDrA6c+CxRN4J0e6zG1zgKHv7KDoKyF0vdySK1o1ht5fkgq99RKWj/JiKOIocq0pUzGOJxGmo3WN1ERn0kl1KXpe6ZM1jKmoOst/n5UC2Qzl3vdzRAVcv5aZhP1Jdaz6e32+oId9SQ6GlhmJLpUsN5ZamefmW2kLtru3QDISz640HopYqUDdxuQW2awmoTWyI2myGKLU0AbXZDFFbB0PUZjPE2FBDTC0l4DabIW7/zULDNvEJ4PLyVo9EuX7sNR8rKk+ez8dperQx/QIp5zbREgkAAA==</MonomerMolFile>' + 
'        <MonomerType>Undefined</MonomerType>' + 
'        <PolymerType>CHEM</PolymerType>' + 
'        <MonomerName>SM(PEG)2 linker from Pierce</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'    </Polymer>' + 
'    <Polymer polymerType="RNA">' + 
'      <Monomer>' + 
'        <MonomerID>dfB</MonomerID>' + 
'        <MonomerSmiles>Fc1ccc([*])c(F)c1 |$;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWRsRLCIAyGd54id7qaI4FSMlt1qud1cHd0cXDw+Q0MtrQdbJsLHPfx85OAAWgf78/zBWAjiY1MOhr4hTEAktMOsg8RgTtba1UHhxorz5JWhFJ7SgqLumvhCKXFfGaXiFzVLq0YXQxhq4tDJlrp0nfkMPDajgJGjn5rLb3LlncZ/hF5GXZ0XlILkZt/lwUufS0efVlLt/vTRQ9xnguqyOW5oIr8VKuommoVhamWMh1rldZTrTrE2dtkTFuA7nLLNG0CJXK6NsbsNcwX+yPTAqYDAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2,4-Difluoro-Benzene</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5iU</MonomerID>' + 
'        <MonomerSmiles>Ic1cn([*])c(=O)[nH]c1=O |$;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2Tuw7CMAxF93yFJViJbCeh8UwRYmhBDOyMLAwMfD9OJfpKh1KwrCq9dY+uncQAVLfn6/4AwIICCgoLl9CGMUCYEvrZhYjAlRHR6MuGLJOLaUG2cNGlCrT6FWEHQ8R0NhS0XsQlClv1FH+nSBEWUrqOnHUx+h6l/oYiHP/gpaOM5vKVl09HaIVcf49O8ylst56Ldi4LKZ0Xn1b96V5Wcyn6B1PgyVN3nOuFALQbztVt8xyrnKsquZygks9rVQqTquSqFsacGyadcXNTh2oFcDmcGzXhgZKyr0tj1hrmDW+8vHMCBAAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-iodo-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>qR</MonomerID>' + 
'        <MonomerSmiles>OCCOCO[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;;;;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWVMU8EIRCFe37FJNpKZgYYmNozVqfGwt7SxsLC3+8A3rkXSM7jCMXu29kv7w2w6wD271/fH58AGLAQEoXEOzgO54BynYCb+TdUFd4YEV29Ix+l1gKw54LtCr09RXiGU8R8uv5Gjlk7r0jmDeX+SKFzFPaUpRwoOqfweS8qnDoF80miCyhklBgPFKa1RNVL+HXAMS12t3pJcqBkWqOgT6qx99kCyTTRWUpdo+6FvSLGDeX15gIvxH2/BOtu4qVEd+hFezeCZ9ay5oW8SMLOswMV1ijspSB1CkmKa90NPmhM16509ISK13qJvnCYe7mAknwKZe7l34monVca1TCqVhinamkqbVV7PY21pupYG6e1pkpTZataYR5VAZqkKEA4qCYRjbX2VR8Tm0RjYpNo9GsSyahK+1ucqnuA18eX1o3ajtbqugWqrXpcuVY8PO2cu7XhfgDJFNm0lgYAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2-O-beta-hydroxy-ethoxy-methyl Ribose (Qiagen)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>nasP</MonomerID>' + 
'        <MonomerSmiles>[Na+].[S-]P([*])([*])=O |$;;;_R1;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2RTQvCMAyG7/0VAb1uJP1cz07mZXNM8L6jFw8e/P02LWgtBYehLWne9CFJBcC4Pp63OwBqJEL0ZGUPbxMCwALooGfrY957uEpEFHzDlsj55DllbfKCijDDN6K+mNKEt+ioSll2WylZLdQaSznlvLmW8MJrWe/on1pCb9h1OqNcUi1mE0Uq4xLF6k5mlGmNeeonJYxVxrOMqiiUUV3NNWV0BDichkhgseHP41ERK8swJ4U3K9y+ZOU49ULsg4kXLsMq84gCAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Sodium Phosporothioate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5FAM</MonomerID>' + 
'        <MonomerSmiles>OC(=O)c1ccc(cc1-c1c2ccc(O)cc2oc2cc(=O)ccc12)C(=O)NCCCCCCO[*] |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWVu27cQAxFe30FgaTdAR/zrGMjlR3DhfuUaVKkyPfnSvZaWnGKzYwgCLtH1BUvyRktRE8///z99ZuIkxRhUWv6QJ/HspBlsob7h3M/Wmv0psy84M+lhpaLrr8sFLO6RnDAXaZvdCvRP08qGhrXYRVNWt5VYss2plJCsjqdy64yV5eroxgkjjo6qrQiwyrXHqVgddRRC7lKns3lqHKqy48RRznocKf3XHLIOuboIhysZZnL5agy06N9XiTk2x7dXd2LSBDhfl3+o0f7OppxlEPV7dmpqctBuNl8LleVmanbHY1P3bG6M7mgGi1OVzdiHXG/us9juYzvDIadIbVZR4Z1JHF2XhQ9ytO5COZF02wuWNNceTaXdZey2VzwhKn0c7m/0ySBLfV79Prlbkf7jjmzGneVEuLw7LbAxT7WdOGSR1TwCdHtekOBbLveUKDoY4GSjwXKPhaWq49ttHb3HCubwjlWurF5kz7TSiI9ihc6ihyiexseF/VUae37SQFIOtUBTd3YjrdC4l0Aia8ZqPq+IVC8NyBlpwCkvjpA2nEMBe8YSL3jlfp5QKD6eQBS7xhIq6eV1HsDMj8PQOa9AZmvGZB1vIF6b0Dmu7lS180notfvL1vsKk+6ksfnh2X5imP5B4JgK5GcDQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>5\'-6FAM (6-carboxyfluorescein)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5eU</MonomerID>' + 
'        <MonomerSmiles>[*]n1cc(C#C)c(=O)[nH]c1=O |$_R1;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UOw7CMAxA95zCEqxY/iQ0ngEx8REDOyMLAwPnx6kELaQDUKyoSl/dV8dNGwA2p+vtfAEgJWVijiRLeEYIwFwGUG90YWZwFCIKfjJjFNZcJoyNZi0ZhH6VYAGviuHRWgijmRaLICfK4y3WpB8t3YoUNefYs2y/sZjkP9TSWd768lUtjxURGmv/He0+twjOozTPvvxo6WqJZdbv7mHyqcXvEE4yctcBI/nWH2fxz8R7IjWdt8d3KjV1pLXBUaxzHaVBajX1xFx702BlAkwVdVT+AvpCNwCH9b7NLQ8FLmS1XYYw9Qh3fjNy4F4EAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-ethynyl-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>mR</MonomerID>' + 
'        <MonomerSmiles>CO[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UvU7EQAyE+30KS9Biebz/NYeoDtAV9JQ0FBQ8P94NORIS6bhdbZFMZr+MLSeO6Pj2+fX+QSQJUYrCix7ovJwj+LZJFvt31VrpVUXE2c0dOGgsdgXhKNDmELanQs+0RuzvTlGGr2miSMl5Qbk/U3CJIpwheabUfYpeooCrxl5xZa2riq6giFE8ZoqmsYpaFt+6S4VDSoPdbVlQZ0pOYxRlLQVTd2vQ/b78I0tGzwIwFLKgnG6uyJLjNC+w7vb5G6jIcyzhhxKi+LEslkA1trOZbVwGKWLdmKausMaAke6izyW2qt+qZgy7aukqlqodj1uvqXXrDbteU1NX01I1Y96qibBTRSH8/WBck4CtN/e/11o9Ep0eX3rqFru3pA8z9deRNsfD08G5W1vuG7LLZjomBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-O-Methyl-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>LR</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@@]12CO[C@@H]([C@H]([*])O1)[C@@H]2O[*] |$_R1;;;;;;;;_R3;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TP2/EIAzFdz6FpXYtsg0YPPeqTtdWN3Tv2KVDh37+409zlwtI0YEYyMP88vxIDMDx6/fv+wcACRMqOQ58gMswBsgB+by/mtehqvDJiGjKE1kvFMuKLSesK7R5F+EdbhHjadqJ6KM2XpLIK8rzhUJ7FLYUJS0UHVN434sKh0bBeNPRHRTKFO8XCtNcR8WL+3fAPkynG1R9SyhbkaGXXUpJN0hbKaJfUU4Pd3ghbjftci6Bpzp6QisaqVGYNc15ISsSsPEcJjfbUXDXm0Y3ly7Z4F1oZ30inMmF6ndJvep6NRf6oRqrSms1Hw99bVZTX+uHtQJEvZpfpb2qQNtfozqj1pus1CzRoLewqLJxJlv1CHB6/ai9lGZqUCX6YrZ8XlwqXt4OxjzmYc5BfspyPAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2,\'4\'-locked-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>3A6</MonomerID>' + 
'        <MonomerSmiles>[*]OCCCCCCN([*])[*] |$_R1;;;;;;;;;_R2;_R3$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTP08EIRDFez7FJNpK5g8LTO0ZqzvNFfaWNhYWfn4fxHi3QrG5nZDN8gPePmZ2AtHx/ev745OITQu7JGY90F+EQCIkjPWrcQl3pzdl5oDJg8Zay9K4xLpkbW8cscr0SGuJ+fhVkWL9Kxo113KbisS01LzXC8eSkuz1ghPqe73gRK7Jd3qBA3O3qZfTdhXUSKxOvZzvNufFYmadV/ple3ZTNMlpeqPtXlZ5YZObVPCjaH+uKJCNFCiNFGgZKVAeKVAZKVAdKeY+Uu+dPSqg5f/RI9H5+bW7bvL9mq1wbWNrD2s7nk6HEO4R4Qcs2AjwWAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>6-amino-hexanol (3\' end)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>cpU</MonomerID>' + 
'        <MonomerSmiles>[*]n1cc(C2CC2)c(=O)[nH]c1=O |$_R1;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UPW/CMBBAd/+Kk8rK6T5s4puh6gStGLp37NKhQ38/54iSwGWABMuK7Ofz0/kcOQHsv37/vn8ASJXIOBPLDi4tJWABVl8f9aGZGXwKESWfrBmFtbYBY6dVWwShrxJs4Vox3XsLYTbTZhHkQnW5xboy0zKcSFFrzSPL4RGLSX1CLoPlpi4P5fJ/IkJjHd/R+/0WwU2W7lKXmZYhl9xG4+oeX+61+A7hIgv/Ot+hxHauS63z7ggYKdPCXBjAKyuRbvrvLZVIHWk0OMox1lGZpBapB9boLZOZ+atBgTpinqTxFO3dCbF7gOPbR09bgsCNvB52Ka28pRMBrm+M0AQAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-cyclopropyl-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5A6</MonomerID>' + 
'        <MonomerSmiles>[*]N([*])CCCCCCO[*] |$_R1;;_R3;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TsU4DMQyG9zyFJViJbMeJnZlWTC2oAzsjCwMDz1/ncpQrYSiJojvn8+XX73MSAA5vn1/vHwCYWLGS+HsHlxECEAGh5zfzZ9Ra4ZURMbQVRRKmFnFEKtYijJ5FeIRrib9n6DuExLpeYZUplQeMbOXbS+E8p0JeR5LViyaaVVGS1L0QGs+pcBSh0r0omc6ppNajsnrJaduj439UrNS1R1pk26PT3c2dpmiSsEfZaFvR8+3nhWNWTF2lKvGUl/ZfqHDXq2pTFfnx4OV5RR2lkTqSkTrKI3VURupIR+rIRurrOtK63OxRwa/8L3oAOD29LK6bfMu2rUu57VKk9sX+uAvh3kc4Ay986HJYBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>6-amino-hexanol (5\' end)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>am6</MonomerID>' + 
'        <MonomerSmiles>[*]NCCCCCCO[*] |$_R1;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPW8CMQyG9/wKS3StZTsfF88FdTpaMXRnZGFg4PfjpAiOS4ZDZ0VR8jh59TofDmA8Xq6nMwB5Uib2PssWHuEcMAGo5SftGaoKf0JErsw8MqnY4JMwxMyFEVqWYA+vEv12V8ni078KhZgmKl/LVQS9hqGrctgsVgkYfa2jregNLxElyuqKImoaVntJmDLHtV4GO91Ea71kZKa+l593VLIE7XpZfNO2ydf+hdpTDi01FFtqKLXU0NBSQ7mluf6zOdX6ATvOeE5HgMP3b82VYuqCckVSMrv91rkPC3cD/lciavQDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>5\'-6-amino-hexanol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>cdaC</MonomerID>' + 
'        <MonomerSmiles>CN(C)c1nc(=O)n([*])cc1C1CC1 |$;;;;;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK1TPY/CMAzd8ysscWsj22k+PMPpJuDEcDsjyw038PtxgnSlTQZosKIqfX5+9XMTA7A//10vvwDoHKKQ84l38B/GAI1AXvMPawoRgR9GRKMvA1kXiPIuWp8kZAZazSJsYS7RXkUFbRhDrh2S1jL1qySOK1UmR2LZzRwdnldhi9H73l4eVRZzeaGXyVGwUUe01lEUxOZcjq/3MpDWzns5bZ5VyRUhSuep04ok/AYVTnph7tMVjh1/OtxVnO+/AetVtIjLc4mGkliiseYqy9Vchcaaq5BvolKjvvTQQFP9NQbCiqtQPnsNtHasUIOrdsk10crbHuD09V3QbAYoI5+HnTEfGuYGKi3AQYgFAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>5-cyclopropyl-4-dimethylamino-cytosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>eR</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@@]12CCO[C@@H]([C@H]([*])O1)[C@@H]2O[*] |$_R1;;;;;;;;;_R3;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UsU7EMAyG9zyFJViJbMdx4plDTAfoBnZGFgYGnp+k6R09JVK5RBnSv/ZX/64VB3D8+P75/AIgRELDLMoHuCzngAQoAuBm/y0zg3dGRFefyItSqif2nHE5oS9vEV7hGjHermUkSdZ4WRNvKI8XCu1R2FPSfKbYmML7tZhybBRMV45uoFChiJwpTHOOai1hrYAlTnc3mknrUClFh7XsUmp3o7aTIcqGcrq7oRbi9qdD6UvkKUcP6NUSNQqz5blayKtGbLyAOcxR2Iek1nJDTDrlqOaGuM4LRR5P3T8cSeC1FiEdT90OhZbppl4NvVoCZaimRaWtWtJjH1vU3MfKMFaBqFfLp6xXrdxuvSoVUlXdqhGIe5WBQqcWiXrH9b7senYEOD2/LQ6rxaV9ddiqhfpjuEY8vRycuy/L/QLtJoiQmAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-O,4\'-ethylene bridged Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>RGNA</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@@H](C[*])O[*] |$_R1;;;;;_R3;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Suw4CQQjs9ytItCbAPqk9Y+UjFvaWNhYWfr97nI87zxg9wm7YASbsBAewPl6upzMAiURSlhikgac5B1AAcs33/GWqCgchIte+BBNxNhwz+dJGhDVLsIBHMw+5Bm4sHr1mqQETcvT8keWbj1g0lz7LfvYzi2BUtt6CJRftsWz/moXIdywhZj9tFsaiXO66SJBpujAqMd11CSrTfsTInS7M6JOmKT+q7WI399EK+bcl6WrDGK1Q/FibxmiyLX5Hs633EF0D7Fc7G+N5IthkYPK3FctN49y8mrsBR9d6e0QDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>R Propanetriol (GNA sugar)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>cpmA</MonomerID>' + 
'        <MonomerSmiles>[*]n1cnc2c(NCC3CC3)ncnc12 |$_R1;;;;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTvW7DMAyEdz0FgWatQFKifuamyJSgyNC9Y5cOHfr8pRwkdkwttgTBkD9RhzvacgDnr9+/7x8ADAGxUiTmIzyGc0AClHV/MedRa4VPRkSnL6/RY8qxrdDnXKVVoNddhDd4lujPSSX4IFzbijxVxlEV9kh5p8qciH3kp0SXLSq5UBn3clcxfdnghX0KZTgR+coRRxPNKiOJHt+onY2yM9Hcl+BZ4lLl+rL9r9OzUcrOvkxepJtoU3dLpHQ7y1J3e2FOeLvTKe1TISBszzUFdceWsq2tXaooWIU80XWtomipIrEKMjlb16pu6VEiS8vd8pJqE8imUETWryKyfhsVS6VTewa4nj4m2gwCNfJ+OTp30OH+ASXyzBj6BQAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N-cyclopropylmethyl-adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>hx</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@H]1OC[C@@H]([*])C[C@@H]1O[*] |$_R1;;;;;;;_R3;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2SPW8DIQxAd36FpXYtsg0+8JxUnZJWGbp37NKhQ39/DJePa0ClF8RJvnfmnQ04gN3H98/nFwAhEioqBd7CZTgHxGUCLuZ1qCq8MyI6e3lCj5K1cPRZosyRfUV4hd+K/jxZUgpxXhsj48KyuVjo3xaLQg59C48tp46KT2XqWkYd2YpJRAa1jDq6Wv7al+Huko859c9ohYU9I4duLStOmr3SlLu1HB7WdzSf0X23DsiHhNi1rKolIcU5EuV4j4XqvaQbaii01FBsqSFpqaGppdSl9rdUKS2podzmGtJeZYRn+7IGosZridR0vAM4vLzVDou+rrGnboIlA5eM5/3WuUcb7giTOKbdygQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>hexitol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>aR</MonomerID>' + 
'        <MonomerSmiles>O[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1N[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UPU/EMAyG9/wKS7AS2U7ixDOHmO5AN7AzsjAw8PuJE3rk2krlGmVI3zqPXn+0DuD4/vX98QmAAQshUQh8gMtyDohtAw77b6kqvDEiOnsiH4WyndhzwXZCX98ivMA1Yn27fiPHrJ1XJPNAebxQaIvCnrKUiaLrFN72osKpUzBfZXQDhSolxonCtC8j8xJ+HXBMo5fT/6trXpJMlDx6ualHSTX2OteEZDWjTYr1qHthr4hxoJzvbvBC3Ocl1Oom3pXRA3rRXo3gmbXs80JeJGHn1Q8q7KFQmyhaqmGp1sC4qpam0qjW62kZW1VdxsbV2KpKU2VUa2BeqtL+GnNCAZqPujOJaK4eAc7Pr82fGWzJW3ss0FrMFvF0Ojh3X5f7AcMFSCTKBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>3-Amino-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5tpU</MonomerID>' + 
'        <MonomerSmiles>[*]n1cc(C#CCN(CC#C)CC#C)c(=O)[nH]c1=O |$_R1;;;;;;;;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2Vu04DMRBFe3/FSNDGmocfMzVBVAmIgp6ShoKC72e8EdlNvEXixLJWm7Pjozu2pQSA3efP79c3AAoKIVEqvIXjCAHI2gRczHmYGXwwIgb/saHIJNpeKFZRaRUY/SvCE5wq1udkwZjMpFk4Uka93WI1D1rmjiSKalpY9tdYjPUOWWbL2b5cleW/I4xGsjyj18stHEvietyXQcucJbW35e6+P1xq8RVMmW+8dUARE97BklO7Jc2CbGMn7RbOUg9nRFTGbp1bUqmtj41FIctjWThi1fUsV1lIqbYsGg0rjlqSER+yqKCNWcRXlJuzSGRVOmQpVIf2xZd7Du5pmZ7nlHvqSHqDo9TXOsqr1Hrqhdp782oyBsKOOiKakpxQAuq7cETSUwHqu2i078ILqU/mhe3OndMCpH2yOv3LndIdwPvL22RomwTUyPN+G8Kjj/AH4Zksiz4HAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-tris-propynyl-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>SGNA</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@H](C[*])O[*] |$_R1;;;;;_R3;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2SPU8DMQyG9/wKSzBb/khie6aIqYA6sDOyMDDw+8m5pdz1KgRnOafLE+eV88oFYP/68fn2DkDKRsFSXXZwjlIAHMDG+Sx/IiLgRYioTDvBTmzJ0Uh9+iMcpwR38H1ZllqLTBVFDRtVwITclK+q/JYrlTCfqxxu/qwi2ILzrqObx0zl6V+9EOlRpTbTbb0werCffJEq23xhDGI6+VJDtr2IkY++MKP26FtexDkL49vndCBNellb13SgdrW2r2nPKb6kluO9pHuAw8NztnFeDbIzSPunivvHXSm3I8oXLmGqFEQDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>S Propanetriol (GNA sugar)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>tfU</MonomerID>' + 
'        <MonomerSmiles>FC(F)(F)c1cn([*])c(=O)[nH]c1=O |$;;;;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2SPU/DMBCGd/+Kk2DFug878c0UmFpQB/aOXRgY+vt7jpQm5Dw0KZYV2U/Oj15fEgD2p9/L+QcARRCVEna8g9sIAUjqBJzNaagqfDMiBtu8UGSSUhcUeylSKzDaW4RX+Ktoz8GCMalKtXCkjOVxi/Z5o2W6kUQpJc0shzUW5fIPWSbLoi+rsow3wqgk82/0eb+FY5e4v/Vlo2XKkupq3t3j070WO8GU+cG/zk4oa9/s7vsay5jFdXeVZcxCUThvykIAZmBPu+G5pOypIfEGQ8nXGspNqp5aYfHe3EzGQOioIaIm9beoVJZ0D3D8+BpoDQhUydthF8KzjXAFM1FO+xYFAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-trifluoromethyl-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5cGT</MonomerID>' + 
'        <MonomerSmiles>CN([*])CC(N)=O |$;;_R2;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPQ/CIBCGd37Fm+gqOb5htsap1Ti4O7o4OPj7PWij1HZo6uUGeI57whEE0N6er/sDoERJkbLK6AafEAIIgOd6ld9IKeGqiYjPYUeSXEyZk4zOun7FVcIJY8V8DpYQjO17rdVUWfYrLLwy0ay2DBNlX3K+snSLLdzhnXP/3kVJG8P86y6/SzWRkl5TPdFls9CiAF1yRHlvSm1EGdkpZeSmVJefNnM2/NIWuBzPheYidCaHrhFiyyHekPEbNtgCAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2-(methylamino)acetamide (GeneTools 5\'-cap for PMO)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>mph</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@@H]1CN([*])C[C@H]([*])O1 |$_R1;;;;;;_R2;;;_R3;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPW8DIQxAd36FpWYtsg0GPDdVp3woQ/aOXTp06O+PuYtyl4CaS4M4iXtn3tkGB7D5/Pn9+gZAIUUl4cxruAzngKhOwNmchqrCkRHR2csrepSilaMvEmVc2VeEHVwr+vNsyTnEcW+MjDPL28VCiy22CiX0LQtyOVdUfSppZtkuttiOJCJP5jJZ/uoL36uIfCy5f0YP5EI+qErXcnhZ3F32jBy6FT1wX9grpfJsLtNJk0+M6T8WGvpPN9RQaKmh2FJD0lJDqaXUpfa3PFCaUwssLbVAbQ0KhL3MiG7pBuDwsR9qqfqhzHqINdAe4Brxvl07t7LhTjoge+NuBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>morpholino</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5fU</MonomerID>' + 
'        <MonomerSmiles>Fc1cn([*])c(=O)[nH]c1=O |$;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2TOw7CMAxA95zCEqxE/iQ0nikwFRADOyMLAwPnx6kELU2H8omsKn11n2y3cQDN+Xa/XAFQBFEpoHANr+UcEOaAfnRLVeHEiOjsZkGeSVLekK8kSc5Ab08RVvCuGI/Wgj6oSrawp4jpd4tW8UtL15F4SSn0LLtPLMrpD7V0lsFcPqrl2RF6Jel/o/10C/tl4Oo1ly8tXS0h7/rTPc6mWuwNpsijf91mai0EYN1wSZftdUi5pIakNBgKZa6hOEq1pJaYSm8crYzbk/pOG4Dj9tDSrAfKZL2rnZvbcg8CMlzfAgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-fluoro-uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>eaA</MonomerID>' + 
'        <MonomerSmiles>CCNc1ncnc2n([*])cnc12 |$;;;;;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPW/DIBCGd37FSe3a031hYG6qTomqDNkzZsnQob+/h6XEjvFig5CFH45H92IHgOP19+92ByBVosLGJAd4jhCAFdh8fzanUUqBixBR8JcPQxqS1RVhSiXWCkLfJfiEV8X6HC2KGqXUFSMXoV6LIHHaaZkSCZq8JDptsaTMub+Xh6W5lw29CA6auxMxFjHqTTRZehI9v1E9a3FnouleFCXa3HJ+2/7X+VmLufffBUbJusvCwFSfSwoDgLRU2tqySh1pa0gjXdY6spY6iq0hjp0ta92b1yhzS/Oj5Tn1S+A2hSNu+j0CnL9/Rlr1wJV8nQ4hvPsI/6CGOlcsBQAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N-ethyl-adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meA</MonomerID>' + 
'        <MonomerSmiles>CNc1ncnc2n([*])cnc12 |$;;;;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWRMW7DMAxFd52CQLuWICnJEuck6JSgyJA9Y5cOHXr+Ug4SO6EXW4IG+Yl64KcDwPH6+/f9A0CVlaowDbKHxwoBWICj3c/2tFQVLkJEwT4+EtJQUjsRlqK5VRDaLcEOnhXLe7REjFm0nRhZhXotgsRlo2VKJJjkKdFpjaVUrv293C1uLit6ERxi7U7EqJKoN9Fk6Un0+EftbcobE01ziSg5zS3ntzW9pBxvb2viTXNhaO/YURgAxFPxtbpIDUVvKCN9rTWUPDWUvSGPnb3WmrcuUWZP673lObUhsEtxBDh/fo20iYAbOZz2IbzbCv9ATQe+0AQAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>fR</MonomerID>' + 
'        <MonomerSmiles>F[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UsU7EMAyG9zyFJViJbCdx4pkDpgN0AzsjCwPDPT9xQo9cW6m6Rq6U/nU+/bajOoDj58/56xsAC2l9Qgh8gMtyDogtAIf4X6oKH4yIzt7IR6FsO/ZcsO3Q168Ib3CNWA/XT+SYtfOKZB4ojxcKbVHYU5YyUXSdwtteVDh1Cuarim6gUKXEOFGY9lVkXsKfA45pZ3fNS5KJkkcvz7fMKKnG3udakKxWtEmxGXUv7BUxDpTT3Q1eiPt9CbW7iXf15QG9aO9G8Mxa9nkhL5Kw8wKWsIdC7UbRUg1LtSbGVbU0lUa1Hk/L3KrqMjeu5lZVmiqjWhPzUpX215gTCtD8qjuTiObqEeD08t78mcFWvI3HEm3EbBlPrwfn7utyv8RhCiLKBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-Flu0ro-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>bP</MonomerID>' + 
'        <MonomerSmiles>BP([*])([*])=O |$;;_R1;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Quw7CMAzc/RUnwUrlpHmuqIipUHVgZ2RhYOD766QShChDhWVHjs8+nU3AeH+9H0+Ag4oSloMe8DEiwAJG8MK/FmPETTMzpR93Svm4Zr53bs0EZUz4pWh7YjnILHvVZJl3W1kKLaqzTpUs181aZCIa3d7oHy2yG4dgCpbjVi1yEJ3futpnoK6aZq+tqyMwn6fMkCOdPcnTCTldBqK9GC1h6X3hKAIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Boranophosphate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>sP</MonomerID>' + 
'        <MonomerSmiles>SP([*])([*])=O |$;;_R1;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Quw7CMAzc/RUnwUrlpHnuRUyFqkjsjCwMDHx/nVSCEGWosOzI8dmnswkY76/34wlwUFHCctADPkYEWMAIXvjXYoy4aWam9ONOKR/XzPfOrZmgjAm/FG1PLAeZZa+aLPNuK0uhRXXWqZLlslmLTESj2xv9o0V24xBMwXLdqkUOovNbV/sM1FXT7LV1dQTm05QZcqSzJ3k6IcfzQLQXowUrxnZUKAIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Phosporothioate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>A</MonomerID>' + 
'        <MonomerSmiles>Nc1ncnc2n([*])cnc12 |$;;;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPY/CMAxA9/wKS9x6lu3E+ZjhxFR0Yrj9xltuYOD341SClqYDNFZUpS/Ok52qcQDD7+X69w9AkZUyR1U5wCOcA2ZgsfXZmKKUAj9CRM5ePgNSTKHOCFMqWjMIbZVgD8+K9TFaPHqVUmeMXIR6LYLEaaNl6kgwyFNHp3csKXPur+Vuac7ljVoEo8/dHTEWCdTb0WTp6ejxjereoBs7ms7Fo2iYW867Fy32p1B9LilEAGmptLlllRryrSGNdJlrKLTUkLYGHStb5po3r1G7CBqa7yXP6ABwPn6PuXULcCVfp4NzHxbuBv6B7WF0BAAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>Adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>C</MonomerID>' + 
'        <MonomerSmiles>Nc1ccn([*])c(=O)n1 |$;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVQuw7CMAzc8xWWYG3kuM3DM0VMLagDOyMLAwPfj5OBtkmHllpWFF3uLmcrgO7x/jxfAOiMxUBoiVr4lVIAnBonPRYzw50QUXhQGV07Y+LNaxvYRQZqeUU4wdxiuZMLate4qK2CaMnsdwnk/3QZJ2JN9Wyifr0LafTW7s0ydcn2siHLOJHTXlb070SeERf3ct2epTKinWcZDitdRE7pzFGXHnLUl1xh1SVXoKbkCmQXUS5RmzIsoCH/rQMYLrfEjUZgInLuW6WOUuoL2dwq3aYDAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>Cytosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>In</MonomerID>' + 
'        <MonomerSmiles>[*]n1cnc2c1nc[nH]c2=O |$_R1;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUsQ7CIBBAd77iEl293B1QYFbjZDUd3B1dHBz8fo8m2lY6aCGkuT6OlzuaYgCO18fzdgcgJ5GJIons4DOMAWZg0fXRHEZKCS5CREZfNg6pCS5HhCEknzMIdZVgC1PF/OwtFq2XlCNGTkK1FkHisNAydCToZNJR+48lRI71tbwtxbn8UYtgY2N1R4xJHNV2NFhqOvp8o7zX+XFHpyXnYlG8G1u61Y8W/VM0koJC0z+/qZQ0zVJFtvSGnn7nKnIlVeRLg5+tTL1xjupFUND4LnlEjwDd4dzn5i3AmezbnTFrHeYFzcP3oHQEAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>Inosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>G</MonomerID>' + 
'        <MonomerSmiles>Nc1nc2n([*])cnc2c(=O)[nH]1 |$;;;;;_R1;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSMW8DIQyFd36FpXaNZRvMwdxUnZJUGbp37NKhQ39/zKnpcYHhEix08n3Au/c4HMDh8+f36xuAIislISXZw385ByzA3uarsVTOGT6EiJy97BgnpVw6jymk0gGhzRK8wFqiP/5UyMdQuoASOYyqKFKKD6tcEymGvEp03K4iGKIOe1lUmnO5wwuhF6HBRLbDZ9HBRJXKSKL61pH4OtFpu4pHnnIa/dPL6UbrVl7OTxtVGNg6aSjE+XlLpaW5Sw35Vnea6e1aQ6GlhrRV0K4zBeaW2tdSj3LHb7oGqegB4Pz2Pq8tW4ALeT3unXu2chf0XxBg0AQAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>G</NaturalAnalog>' + 
'        <MonomerName>Guanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>3FAM</MonomerID>' + 
'        <MonomerSmiles>Oc1ccc2c(Oc3cc(O)ccc3C22OC(=O)c3ccc(cc23)C(=O)NCCCCC(CO[*])O[*])c1 |$;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWWP28bMQzFd38KAe0agX8lcW6KTkmLDN07dunQoZ8/lM52YvOGlHewA+Od9DPfI09OOZXy9Ovvv99/SoFBAwxFmR7L9TqdCo8i5Pffvd4uMys/CQCcVB60Ag+ZOlTEbtsnvwvl5dMtYv+1KFJxsO1SvpcPU7j2judaBhO/o3z5Hwpoh22voI2DlAengFLOEVUW0uOOqMOkPGAlIMz1CGvzcTmaC1RDPuzIp8QMD9biOxR1f16eMxRPSHvOke8lsjX3VKHl073kEigfnzqvxUSWD64MXY47GibJHr3VciRd8r1jHEz3hpJ3RNW4LR/iTyNorkfk56TaRkGUZC7zZEDbPom0pCPxTLdcnMfMeUe4KFp7kyQFK9v2e6SVFTDnCP3MBtm8KSlkOz3I+EIZmqdscz8dcct2WgWu6fZkpydlm/s5dVmKz70OOufClEx3UhpdculJCtTmTbrkAulzFxjauRZpuR5NynlK5rxgstPTUbueDElHvtc69Esuljul3FGX7elxihpmKL6J1t8b1SWOqksSVZd0V21R9YU9qr5wRNUli6oVhKC6hBhVLBi9uYTR21Rl+b5R21p7r3LB6AJ1Lg9qL/PUvSeMgtGbS7RTr661dwT/NxNj6v6wU8xhqpHrEkVv1HYJWCg6Jim0U4OrsZu+nSF+29jl2iLcrfXtHCtziSlyban3a3nVu+M4uvAfAr8RauDC8QlwiSPXJY7z4GVxdDwJIbOnUl6+/VjceWe955FB887X58fT6bNfp1d/xwh7cw4AAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>3-FAM</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>UNA</MonomerID>' + 
'        <MonomerSmiles>OC[C@H]([*])O[C@H](CO[*])CO[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UPU8EIRBAe37FJNoemRlmGag9Y3VqrrC3tLGw8PffwK53KCRrICS7+4CX+SDrAE7vX98fnwBIjIQUmfkI1+EcEAORrTfzNnLO8MaI6MoXekmo5S14YuGV2SrCC/xWjGe1kJdFq4W9WjiN5eFq4R3LwWKJmTeLpDy00L4FSTdLQA5Dy25G6DPzlhErTlpudQl+EW3rcr77r6Wpi1k0jOuyayFPKcTVklOUqU4f2GPIsloSssxm9NMjq5BqmIql6ZFZZJmzWCwaaLNglDSTEdXbTT0NPTUklVJL7fgypHFo0J4aSj01lHsqQNjTpf41/lDbSF1uJ4Dz02uNpARYn+ValuOlrVx2PD4fnbu34S4uWRtGtAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-3\'-Unlocked-ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>FR</MonomerID>' + 
'        <MonomerSmiles>F[C@@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UsU7EMAyG9zyFJViJbCdx4pkDpgN0AzsjCwMDz4+TlCO9VirXyIP7x/n024nqAI7vX98fnwBInFEpJOEDnJdzQFwDcIi/parwxojo6hf5KJRrxp4Ltgy97SK8wByxHq6fyDFr5xXJPFDuzxTaorCnLOWXousU3vaiwqlTMM86uoJCRolxokSW/V7C5IBj2j3dpBr7hDLTupdNSp1ukp4pYhwop5srvNijazcdbLqJd3V0h140U6cwa9nnhbxIws4LWMJeirXBUxaDDpTH/3ZE7S3QhWpSXFVzU2lUzXxa1ppalrVxtdZUaaqMqgDRstYM6FJVIFyqqf1LLj1QMzevPQKcnl7bRrXdCur11LP1srlWPDwfnLu15X4AJC3xA8oEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>FANA</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5FBC6</MonomerID>' + 
'        <MonomerSmiles>[H]C(=O)c1ccc(cc1)C(=O)NCCCCCCO[*] |$;;;;;;;;;;;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UMU/EMAyF9/wKS7AS2Y7dJDOHYLkD3cDOyMLAwO/HbTl6lSNUNURR1X51nt6L0waA49vn1/sHACYqhKQ68AF+RwjAOE64nsuotcIrI2KwhzuORXMdOcVBcarEaG8RnmAt0Z4/KiRJZhVOWa9U7rerUBQubS+7VDhK1p0qGDOJziql7Ex0WdHnBf7Hyx/7ctqusnS6x8ty6nr2JUXN3O1FIpeh9HpRW0Gp14tap7XbyxAlITe9PO85dcnueLfK5Qvo+aYXLz3/l+XsYpTdibKpSG726HyzUYVs8XRdUUPJU0MyvVtRQ+prDQ2+1lD2tYaKp4aqpxUIHTVE5CkB+WyGyGczROKpADWyZaBmNvLZDFHxtWmiftepulozwC7xEeD8+DJ3b2w7j+ThdAjh1kb4BtW5FVSaBwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>4-Formylbenzamidehexanol (5\' end)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>5meC</MonomerID>' + 
'        <MonomerSmiles>Cc1cn([*])c(=O)nc1N |$;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVTuw7CMAzc8xWWYG1kJ83DM0VMLagDOyMLAwPfj5OBPtKhpZZVpefz9Ww1CqB9vD/PFwASRmSyZE0Dv1AKCFPCOIdgZrgbRFTyUpG2niidgnaRfWKglirCCaYSy5lVUPvap94qSq+h/SrRhD9VholYGzuZqFuvYjQG5/Z6GavM9rLByzCR10FW9O9EgREX93Ld7qUi6Z166Q9rVVKHD7zvrxMTJj/nqM+FORpKrrBsyRWoLrkCuUWUS9RlDwtoLL9m8k2dcluA/nLLaJIHSsi5a5Q6SqgvVrPgLAIEAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>5-methyl-cytidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>P</MonomerID>' + 
'        <MonomerSmiles>OP([*])([*])=O |$;;_R1;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Quw7CMAzc/RUnwUrlpHnuRUyFqgM7IwsDA9+Pk0olRBmqnpzI8cWnswkYH+/P8wWwU5aDZuP1gBVEgAWM8EX8EGPEXTMzpRd3Svm4ZL53bsmEZUz4l2hHUjlJL3vVVJkPW1UKL6qzTpUqt81epCMa3Z5ojxeZjUMwe7zIQnS+62qfibpqmn9tXR2B+TJlhXzS2pM9nZjzdSA6CugLHPwdaigCAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Phosphate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>R</MonomerID>' + 
'        <MonomerSmiles>O[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UMW/EIAyFd36Fpd5aZBsweO5Vna6tbujesUuHDv39xdDc5ZJI0YEY4OXx6dmgOIDT58/v1zcACiUsjDHxES7DOSC2CTib16Gq8MGI6GxHPgplW7Hngm2Fvn5FeINbxPZ0/USOWTuvSOYZ5elCoT0Ke8pSJopuU3g/iwqnTsF8U9EdFKqUGCcK01hFliX8J+CYBrtrWZJMlExjFPRJNfY+14Jks6Jdit1Rz8JeEeOMcn64Iwtxfy+hdjfxUEWP6EV7N4Jn1jKWhbxIws4LWMIIhdqLorUa1mo1xk21NJXmaj2e1t6q6tobN71VlabKXK3GvFal/TWWhAK0fOrOJKKlegI4v7y3fBawFW/XY0a7YjbH8+vRuUMd7g/o8iW5ygQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>prpU</MonomerID>' + 
'        <MonomerSmiles>CC#Cc1cn([*])c(=O)[nH]c1=O |$;;;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2Uu67CMAxA93yFJViJ/EjaeL4gJh5iYGdkucMd+P7rBEFb0qEUrKhKT50jx6niAHaXv9v1FwCFBJUwNLyGZzgHxHkA9kYXqgpnRkRnLyvyTJLyhHwrSXIGevuK8ANDxfgoFvRBVbKFPUVMn1u0jTMt3Y7ES0qhZ9m/Y1FOX6ils7z05a1aHjtCryT9MzpMt7BvArfPvsy0dLWEPOt397SYarEVTJE//OtshbI2d4vwzDMCsr4EGu3uZIstt85yTZvyfKVcU0NSGwyFOtdQHKVaU0tMtTeOVma3BlbUEFGpZECp3DDD3B3AaXssNJcClMlmv3ZuaeH+ASJEHrO6BAAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>5-propynyl Uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>T</MonomerID>' + 
'        <MonomerSmiles>Cc1cn([*])c(=O)[nH]c1=O |$;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TsU7EMAyG9zyFJVgvsh3bTWYOMd2BbmBnZGFg4PlxUg4a0uFay6qav+7X304aAE5vn1/vHwBopJgZVfgIvxECENaEZf5FKQVeGRFDXWnMSuw3B45I0iox+lOEB+gR69koFtWyzRRh0t2USaRSUmSxnRTvyDjPFDOhBeW8hUKiVy+63wulcp1L6uayyUsWre8eKFIuy46eb6eIO0jlZy5Tt9MbKHW68047r/dyubuZMsVkc0ccGfOuU+efngB4VK1d/6s8qi6lkeCSjLUu6apaRtUL88jVVWfc/tRePQFcnl6aWvFAVXk8H0O49wjfl4a+fQIEAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>T</NaturalAnalog>' + 
'        <MonomerName>Thymine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>U</MonomerID>' + 
'        <MonomerSmiles>[*]n1ccc(=O)[nH]c1=O |$_R1;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2RMQ7CMAxF95zCEqxEjp208UwRUwvqwM7IwsDA+Uki0YamQylYVhW9Wk8/jgJor4/n7Q6AlXHoCZ2hBoZSCkBSY9ZjiQhcCBHDHOyMJsM+Hoyu2XOcQB3+IuzhUzHfyYLainC0kI6ZfrdI7VZaxhuxZu9tZum+sQj5P2QZLZO9fJXlfSPUYjh/o9NyC+nKUj3sZaVlzGLjKd9uv1loMQAhB5W0St8ppZIGxKUhIFvOBuRmqZQ0DPrS62aStQD98ZxoFIGJ5NA1Sm1DqRdzhTyQpgMAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>U</NaturalAnalog>' + 
'        <MonomerName>Uracil</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>PONA</MonomerID>' + 
'        <MonomerSmiles>[*]OCCN([*])C[*] |$_R1;;;;;_R3;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2SsW4DIQyGd57CUjpbNuYAz7ko012rDNkzdunQoc8fm4uSSy9DhAXI/EafzC8HgOny+/f9A0CJKikPkuII9wgBoAIUq6/WI1QVzpGIgt8iZuLSdCwk1TNCqxLM8Ix4vW6UQZk9q1hL1RVl/z5FUIhkoaShyIpy2r1NYazK/g8m5JhiXy+MSkwLRZN2U3jxhRkla15RPnso0bKU+3wxdznHmy+cu9y1JmI7n1STZKvaPW1Vk4atalLeqrlN8Qtu/a9OAKfjV2ujbf+mD7Wb5qMg/uIwjyF8WIQry1bjgkQDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2-(methylamino)ethanol (PHONA sugar)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>12ddR</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@H]1OCC[C@@H]1O[*] |$_R1;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPU/EMAyG9/wKS7Bi2U6cxDOHmA7QDeyMLAwM/H6clLvLXYsKtVypfe089UcbAPZvn1/vHwBkzH6pkuzgZCEAU3MY/WxmBq9CRMEf7hiTaPU7JlRiaRmEHiV4hkvEsneKIEfLE4VqKQPl/kThNQphYSpHii1TVmthNNHesaHYRUdniqzXYhL5SJG8vZbYpgsVU86bpyu18jQXS7Lc0R8oRacdsXfUd76hloha0w8lKcWBcrj5x1xERNvZgr6iTRTuW+S5GueqJ6ZFtXSVR9WP6zw3/abmruZRzf3vu871V9W56pJdq3uAw+NLr68Fe4Xtg5YWeXjahXDrFr4BdXzqtAoEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>1\',2\'-Di-Deoxy-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>3SS6</MonomerID>' + 
'        <MonomerSmiles>[*]OCCOCCCSSCCCOCCO[*] |$_R1;;;;;;;;;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWVu04EMQxF+3yFJWiJ7DjPmkVUC2iR6ClpKCj4fu7MSjzWLiaMFY1mjpOr60ysBKLj68fn2zsRl5SFJWtOB/qOEEg6SUP+1/iJMQa9JGYO+LjJsfbcF66Rh65vHJFluqW/Ev5YVTSOxvmsUrjq/1RK1DHUVXmc8ZJKGW5FEyopliy7K5LYU/W9TKmIpLLXC2N3O7tenjerYIVK9b1MqEhk5b37ApWWy95/RCnmMnZ70Sgt+162nzqs7Yi9XtDTrH4fTaigG6X5Xib6qOLsqq9yutrspeK8pORWtFlF8KvX5yVVSzExWwpULAWqlgI1S4G6pUDD0kHChgKJWCoktjYgsbUBia0NSGxtQOLUpuvtcjm3LtfOBT0Sne6fzhvfaM0ukygtmbuHQwjXiPAFy87UD9QGAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>3\'-Thiol-Modifier 6 S-S from Glen Research</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dier</MonomerID>' + 
'        <MonomerSmiles>CCCCCCCC\\C=C/CCCCCCCCCCCCOCC(CO[*])OCCCCCCCCCCCC\\C=C/CCCCCCCC |$;;;;;;;;;;;;;;;;;;;;;;;;;;;_R2;;;;;;;;;;;;;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWWu27cMBBFe30Fgbg1wXnwVcdGKieBi/Qp06RIke/31cIO174qshphYXiPV7Pncji0tpSefv75++t3SiIypEgrQx/Sv2vbUpVUS0rXr3XNOdMPLaVseHNfsovWnVvur7+VjL+W9Dm9L3H8+lBF8xj9XBXcYUUvrp5RrlxV+XamimbvJ6vcCwz6cZUb1kXycPHDdbnBRXOtdR66PH/673WRjK1y7HJDjyR3K8cuN1TBvV7DLpalzrCL5dHdoi6e6xgj6lKxdy3s0tDp3qMuDZ1Wjbp0dLqFXUaWJmGXgU7XFnWZuc4i8Tl6m8bAuXs1jXRinprGiMuaxojLmsaIy5rGiMuaxojLmsaIy5rGiMuaxojLmsaIy5rGiMuaxoCL7M8vNVxlf2aY0URXLoHz5colcNbJ/vziJbou+/PLqNF1saw47KIulicOmKiL515kRl0qOt3CLi3L6/+A2N5963Rk161OR3bd6nTEZXU64rI6HXFZnY64rE6fd8HBopefH6kxxQf9kFamQI0pUGeKooMp0GQ6cSASBRJhKkk4G5BwNiDhbEDC2YCEswEJZwMSzgYknA1IORsaoZwNSDkbkHI2IOVsQMrZgJSzASlnA1LOBqScDcg4G5BxNiDjbEDG2YDML3vwHfVkB9nwbY0/25JxNtxunA3IOBuQczYg52xAztmAnLMBOfcNss7ZgJz7BuScDcg5G5BzNqDK2YAqZXtK6fnL9wvdhzzpTh6/PmzbHa7tBbAhXGSoEgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>5- 1,2-Dierucyl-rac-glycerol (Genzyme)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>tR</MonomerID>' + 
'        <MonomerSmiles>[*]O[C@H]1CO[C@@H]([*])[C@@H]1O[*] |$_R1;;;;;;_R3;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TMU8EIRCFe37FJF4rmZmFgam9i9WpucLe0sbCwt8vA67Hhk1OmUyy8Pbx7VsCDuD89vn1/gGAkRgVNWY+wm85B4TW0Pe1VBVeGRGdzcgHoWQj9pyxjtCXtwjPsEXst2srUkjaeFkSd5SHv1PYU5K8UnSfwrezqHBsFEybP7pS6BaFCiWElcI0R7Esy08CDnFydy1LlJWSaI5iu9so7BUxdJTL3T+yiEQ7T/foF8zLHIW9ZKRGIYlTWaieBRrVZVSLMYxqMcZdNVeVejXseosqo7cYU5WkV8tER0KqN3WrngEujy81iUWpT7tc9h3bejbH6eno3KGU+waaCI8kEgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>am12</MonomerID>' + 
'        <MonomerSmiles>[*]NCCCCCCCCCCCCO[*] |$_R1;;;;;;;;;;;;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU/EMAyG9/wKS7Bi2c73zCGmO9AN7IwsDAz8/nuTAe5wh6JEVZU8bl89bqIGouP71/fHJ5FE6SpaY7ID/YwQSAtpRv3q+h29d3ozEQlj1TiqzLpwU5TmDFWhE91GbF8zpXLuOY+ZskVLVymP+1MKt6a66fKvFC2lrLpkTtmWXRLXWOuqS2LBy6sukaO0ZZcOl7S90+e73SmG85KWO1JutbfVjhTnJcdVF8F5kVWXB2ErsS66IKXXppsuL/tTlEu3sumye6chYfN+Q4Gip0DJU6DsKVDxFKh6CtQ8xbp72kjFUaDxV/pLldT3BqS+NyD1vQGp7w1IXW9HovPz6/xyQ3tUx0Nko/J0OoRwjxEu3VkVUxwGAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>5\'-12-amino-dodecanol</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>prpC</MonomerID>' + 
'        <MonomerSmiles>CC#Cc1cn([*])c(=O)nc1N |$;;;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUu27DMAzc9RUE2tXCkbJec1N0ShpkyJ4xS4cO/f5QSlHHlodaIQjDPh3PR0qQIdpfvn+uX0RwSAxmB9nRXxhDLCUJDzlFzpnOAsDox8DWBebyFq1PORQGrK6C3mgusZ5VBTaModQOSWuFn1dJEjtVpo6yFTfr6PB/FbGI3j/r5VFlMZcNXqaOgo06ot6OYgZW5/K53cvAWjv3cnrZsNMITu6nbuQUu6arFV7wO5fk/Ninwpbh/F1FVLBHRU1IfS7RUBeWaGy5ynItV6Gx5SrkV9Hcor56WEFT+ze9NdBwFSr77RYo1xtmzt0TnT6OFS1WiAvyftgZ86phbqgbsyq6BAAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>5-Propynyl-Cytosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>MOE</MonomerID>' + 
'        <MonomerSmiles>COCCO[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;;;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUMU8EIRCFe37FJNpKZgYYmNozVqfmCntLGwsLf7/D4p57QnJZJBTs2+HLewO7DuD49vn1/gGAmTMqYQx8gPNwDkjqBNzM36Gq8MqI6OoT+SiU64o9F1xW6O0twjNcIsbTtR05Zm28Ipk3lPszha5R2FOWslJ0TOHrXlQ4NQrmi0Q7KGSUGFcK01yi6iX8OOCYJrtbvSRZKZnmKOiTamx9tkAyTHSVUs+oeWGviHFDOd3s8ELc7kuw7iaeSnSHXrR1I3hmLXNeyIskbLyAJcxR2EtBahSSFOe6G3zQmIYnvYMSPaHi0MuO+xJ94fBPL7R8adSroVetMA7Vsqi0VW176mtN1b42DmtNlUWVrWqFuVftbzpIUYCwU00i6mszUJ/YJOoTm0S9X5NI/qpHgNPjy5K7Bl+aWo+pGqifFNeKh6eDc7c23DeNYgd8OgYAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-O-Methoxyethyl ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>baA</MonomerID>' + 
'        <MonomerSmiles>[*]n1cnc2c(NCc3ccccc3)ncnc12 |$_R1;;;;;;;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UMW7DMAxFd52CQLuWICnJkuak6JSgyNC9Y5cOHXr+UgIS2aYXWxUMw36mHvhpJw7g8vnz+/UNQN4TFQ7s5QyP5RxwBiF9Pjv6KqXAhxCR05uXgDSlUK8IUyqxVhDqU4ITLBXbR7N49FFKvWLkIjRqESROBy09kWCQRaLrHkvKOsbhXu4WM5cdvQhOPg8nYiwSaDRRt4wkeryjujfEg4n6XDxKDHPL7Wn/V6d7Q8yj3y4wSvbDFsHij1r6dAWj0MHfdLcwTiUetLR3FP/PcjwRA1M9rylMarVUbG3ZpIq8NaRG17WKgqWKojXE1tm6Vr15izJbmu8tz6kOgW0KRWz75anRtcEDJ1sbgG0KRWxT6Pb6r7iuDY0uay8At7f3RmtE4Eper2fnnnW5P1uPjMoOBwAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N-benzyl-adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>daA</MonomerID>' + 
'        <MonomerSmiles>CN(C)c1ncnc2n([*])cnc12 |$;;;;;;;;;_R1;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSsY7DIAyGd57C0nU9yzYm4Pl66tTq1OH2G7t06NDnPxOpTRqypCAUkS/mk39IADj+3e6XKwDFSGSspLKH5wgBOAKrf5/NaZgZ/AoRBX/5VKQha10R5mypVhD6V4IveFWsz9ESMSaxumJkE+q1CBLnNy1TIkGVl0SnLZZcuPT38rA057KhF8Ehlu5EjCZKvYkmS0+i5x3VvZreTDSdS0RJOrecP7b/db5XU+m56U4LA1N9LikMANJSaWttlTqKrSGPdFnrSFvqKLWGNHa2rHVvWaPMLS2PlufUD4HbFJU2/R4BzoefkVY9cCXfp30IOx/hH8PXaNwsBQAA</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N,N-dimethyl-Adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>aFR</MonomerID>' + 
'        <MonomerSmiles>F[C@@H]1[C@@H]([*])O[C@H](CO[*])[C@H]1O[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UO08EMQyE+/wKS9ASje28XHNAdYCuoKekoaDg95PHceztLjrYKIV3Mvk0iaN1RPvXj8+3dyKoAsYKkR2dhnPE0iZhMn+GmdGLAHDti32ogFaJF4TcKvi6Cnqic8T6dGNHlkFhXxAxodyeKHyJIp4R5JuSbBsF3hRhUKC/ZJFLlJrAih0pyGUbpWXhNCrRHLfebswWxg0lxfq9XKS021UeVYFOO324+kcWFk2DYlm2vZcb+JS1n0MrT3hbFvYJFgdPrGAzxbQcqxKnnb7/64m4vwWeqVUKq2ruKk9VJYpLb1VLV9NUDave0F1zbyLmpbcGsKVqxFiqsf9L5nm5hzv37okOD899ocXuhtaUtre1WJrj7nHn3HUd7gscBEpWygQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>alpha-FANA</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dR</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@H]1O[C@@H]([*])C[C@@H]1O[*] |$_R1;;;;;;_R3;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TP0/EMAzF93wKS7Bi2c5fzxxiOkA3sDOyMDDw+c9OuaOlkaprlKF9ffnp2XEDwPHj++fzC4AKZ2rCkeUA1xUCMPsGmu2/parwLkQU7OWBMUlu9sSEmVjcQWhfCV5hiRjvThHkqGWiUKt1Rnm8UniLQliZ6oWiY4psURhVcq9YUXRR0Q0UMkrkC0XKkLLZF88SvbvQMJWyu7vSGk990STjijYp3l1WpzCyMM0op7sbstQ83TRbX/rk7KgoYm7pl5IyxX1ZLIFI9rMV7aJ3UbjPAq/VuFbNmIZq7SrPVTue115T29qbhl5TS1fLXC39z/7vtQC6VhX8lpfqEeD0/NaTeJRepo+CQ33ExB1PL4cQ7m2FMzjbi3JuBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>Deoxy-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>25R</MonomerID>' + 
'        <MonomerSmiles>O[C@@H]1[C@@H](CO[*])O[C@@H]([*])[C@@H]1O[*] |$;;;;;_R1;;;_R3;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UPU/EMAyG9/wKS7AS2Y7z4ZlDTAfoBnZGFgYGfj9OQo9WqVRdrAzpW+fRazuKAzh/fP98fgEQIqFiEeITXMM5IK4LcLX+Q1XhnRHR1S/ykijXHXsu2Hbo7S/CK2wR+8v1E1mydl5JmVeUxyuFjijsKaeyUHSfwsdeNHHsFMybim6gkFFEFgrTXEXVS/hzwBInu1u9xLRQMs1R0EdV6X22gtJuRYeUOqPuhb0iyopyubvBC3G/L8G6G3mqogf0SXs3gmfWMueFfRTFzgshhRkKtRtFoxpG1RJlVy1NpbVqx+OYa6qOubKba2pqalqrlphHtdiLMhBMIhq5ub0wW/UMcHl+a/6qwVZ8HU89XkfMNePp5eTcvYX7BW+JaGjKBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2,5-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dabA</MonomerID>' + 
'        <MonomerSmiles>Nc1nc(N)c2c(Br)nn([*])c2n1 |$;;;;;;;;;;_R1;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTu27DMAxFd30FgXYtQVJPrm2KTgmKDN07dumQod8fykVix9KQWIJgyEf0Aa8EO4D99+nv5xeAPCkTZy6yg+twDtgDB9tfzHmoKnwJETl7eQlIKYe6IsxZY60gtF2CN7hV9Odk8eijaF0xsgqNWgQt1kbLnEgwyE2iwyOWXLiM93KxNOfyQC+CyZfhRIwqgbqJNllGbvp6R/XbEDcmms/Fo8SwtByf7rZEDJr8+On6QOn/P0pU0sLyerrTwsBUn2sKZpOWSlurXWrIt4Y80XWtodBSQ7E1xKmzda15S48yt7RcWl55uZuNm373AMePz4lWPXAl74edc8823BnvLUGjLAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>7-deaza-8-aza-7-bromo-2-amino-Adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>lLR</MonomerID>' + 
'        <MonomerSmiles>[*]OC[C@]12CO[C@H]([C@H]([*])O1)[C@H]2O[*] |$_R1;;;;;;;;_R3;;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Su04EMQxF+3yFJWiJfPN2zSKqBbQFPSUNBQXfjzOP3awSaXYnijSeG/vEvoohOn79/n3/EHGBZwEQ3YHOyxiCJwQ9b/ZliQh9OmY29Q82JOQaOesKTxFbPWV6p2vEeJu5IocsM6+k7BrK85mCLYqzyKmsFBlT3HYvklycKZyvJrqjFyglhJXisK8XWIgsFDXX73U3LhRntZU07GWTUt2NaY6EOTSU08PNFNhcnMy1iSP2UXQif3GX/b6J1NNQsHZV2olud/eJrRNOw17uomjp4oaPsezxBdOLQq/6XtXEMFTzpKJVtTz2uaqWPjcMc9UeGd0G7tVIwJCbOlXLMZg4r4RW1UR0PhyJTq8f0yx1mOlbH2eF1hg14+XtYMyjLvMPN0UxaTwFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2,\'4\'-locked-Ribose (alpha-L-LNA)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>4sR</MonomerID>' + 
'        <MonomerSmiles>O[C@H]1[C@H]([*])S[C@H](CO[*])[C@H]1O[*] |$;;;_R3;;;;;_R1;;;_R2$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UMU8EIRCFe37FJNpKZgYYmNozVqfmTOwtbSws/P0O4J7cscl5SyjYt48vbwaCA9i/f31/fAIQIqFiicw7OA7ngLhOwGH+DVWFN0ZEV7/IR6FcV+y5YFuht78Ir3CKWJ+u78gxa+cVyTxQ7o8UukRhT1nKQtF1Cl/OosKpUzCfVHQFhYwS40Jh2lZRzRJ+E3BMY5bn/3e3ZkmyUDJto6BPqrH32QqS1YouUuoZ9SzsFTEOlMPNFVmI+30J1t3Emyq6Qy/auxE8s5ZtWciLJOy8gCVsoVC7UTSrYVbNGFfV0lQaVdueZq+pOnvjqtdUaaqMqhnzrEp7Nc4Jxd6ZSTWJ6FzdAxweX1q+GrAVX4+nGusRc3U8PO2cu7XhfgBrwiZsygQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>4-Thio-Ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>cpC</MonomerID>' + 
'        <MonomerSmiles>Nc1nc(=O)n([*])cc1C1CC1 |$;;;;;;_R1;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK1UPa/CMAzc8ysswdrIdpoPz/DEBA8xsDOyMDDw+3Ei9EqbDNA+K6qa8/lydqsYgP3l/rjeANA5RCHnA2/hL4wBYiCn+bc1hIjAmRHR6KYj6wJRfovWJwmZgVazCBsYS7RXUUEb+pBru6S1TMtVEseZKkNHYtmNOjp8rsIWo/dLvbyrTObyhZeho2CjjmhuR1EQm3P5/d5LR1o79nJafaqSK0KUhX+dViThf1DhRP1rusJxjooOhMtzioaSmKKx5irL1VyF+pqrkG+iUqO+eGigqT5Nbw2suArl791A647zvVNx9wCn3bGg2SBQRn4OW2PWGuYJAqtPZNAEAAA=</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>5-cyclopropyl-cytosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>clA</MonomerID>' + 
'        <MonomerSmiles>COc1cccc2c3cn([*])c4nc(N)nc([nH]c12)c34 |$;;;;;;;;;;_R1;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Uu1IDMQxF+/0KzUCLR5JtPWrCUPEYCnpKGgoKvh/Zu8AGbwF2djLOjXJyJUteAO5e3j9e3wDQGCleufIJvteyACNwju93z89yd3hmRFziwxUlU5W2wYTupUXELhbcwzni+OkUTpnVV4o66o7ydPEPCilz23nwzHaU6797oYQ165ZR1TJHwWTZcfXCgtNeasbcdpaMsM5SpFqviyb3OknhVNhwpYibzp10TijRQD0jJsVZL154qy5mpjkv0WsVy5YRZZ6lxASV7YxM82y/YHVaKSh57oziF6JSv84I56oLlLKorV6oIE9TuOcRFJdCsxlVU99mOrebZo6i3GfwSpKJ7L08/CejUqWslOI85yUmIG4G3aaRcd8vf+66SID7+281H6plVEOqHXKmhiRjrHTu79hQdYwNycbYkHyMdSAcYpt0kIUC0ahWoLEOIdFICOmA0NQyeihAdYyNf5MxVoDGOoTUnB1wbYw1oMPqtBvuXL0DeLp97GpjAzXl5v60LJexlk/Bz6Nu3AcAAA==</MonomerMolFile>' + 
'        <MonomerType>Branch</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>T-clamp OMe</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>naP</MonomerID>' + 
'        <MonomerSmiles>[Na+].[O-]P([*])([*])=O |$;;;_R1;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Ruw7CMAzc/RWWYG1l59nMFJWlperA3pGFgYHvJ04RtCUSFZYTOT77dHYAsR3vj+sNkbQmJraWVI1vA0B0iCbiM/9YCAEviohAXlQy+zBFXjs3RREl7HFJkXdhKWIvec6yDLutLDMtXFrHc5bzZi2xIxiVn+gfLXE2qirzrcVuY/Guem1oqaUbU53+yRLXqtK9zuoErLMmW2vX2RbxcGoSg4CFfJ7IY0GGpp8QOYLI+EqQY1cD7KPBE5lJmyyIAgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Sodium Phosphate</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-OH</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>FMOE</MonomerID>' + 
'        <MonomerSmiles>FC(F)(F)C(OCCO[C@H]1[C@H]([*])O[C@H](CO[*])[C@H]1O[*])(C(F)(F)F)C(F)(F)F |$;;;;;;;;;;;_R3;;;;;_R1;;;_R2;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2WMZPUMAyF+/wKz0B7GkmWZbnmgOqAuYKekoaC4n4/sr1ZstiwE3MZF9m3yrfvyXa8WwhP336+fP8RAgoaIUk0fgzXa9sCWx0BD+P3VUoJXxkRt/qJQJRyvWNgw3aH4N9i+BxuEfOx9Sey5NJ5ppkPlHdXCt2jMFBW2yllTuH7Xopy6hTMN4lOUMgpIjuFaS1R9RIvDljSYnerl6Q7JdMaBSGVIr3PHkinie5S6hx1LwwFUQ6U5zcnvBD39RK9u4mXEj0gaOndiMBcbM0LgWrCzotocY3CoIbUKaRJ1robIRZJ05k+QREgLDj1cmK9CBjHV/CyU/6xj+5SEqjYf3tJgDFf+pLkZr2cSoSsl91jyY776MMZihLi9V2Ha5QEgvsbU1NKqxRTvnhBkUUvCpL/sl5OUdAb0+dINMsaRSByOwMe2mkQV/uSE70CZV91BDGLrVConVg0qnFUvVCmqjWVjqo/nsZaV8tYK9NaV7WpelS9MI+qBpqksFDn+w/VJaKxNgcaE7tEY2KXaPTrEumourM8VW2qllHNgScpXB1TVHXsg/8UT7K5Osnm6iRbCTzJ5uokW2n/EG/VpxCeP35p818XQFtcdRvXCPWI5lrx/tPjtr31a/sFm0Cw94oKAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>RNA</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>2\'-O-Tris-trifluoromethoxyethyl ribose</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-H</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'    </Polymer>' + 
'    <Polymer polymerType="PEPTIDE">' + 
'      <Monomer>' + 
'        <MonomerID>App</MonomerID>' + 
'        <MonomerSmiles>O[C@H](CC([*])=O)[C@H](Cc1ccccc1)N[*] |$;;;;_R2;;;;;;;;;;;_R1$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUP1PEIBDFez7Fzmjrzj5g+VN7jtWdzhX2ljYWFn5+gUSTO6IXLwyThMfym91HwBDtXz8+396JJIuHg6jYHf00YwihdpLW0Z5TyznTixURU0eOk3hbPu4se9VYNeEyK3RP34i/eqN4Ljn4gZKyumspPkqqFMcReZ7L03qKsnUWQy4K8TPK8WY1xbFEr2NFXnSxInuJYtkFkdFdm2SRgksUcIwhDL4IMK/osN4XsAQ77rTmlLf64jgEnfvyjz2afAEHccu+XKQIWwy+gJF/2aMVlOyAcW35AbfmIqU23ZrLJl/KWt8y2OTLRLm+IrQzgjO1SO7s8Ayq72PLWHu1SKFXixR7tUhpkZCbilMCpFPhCOjyLRL6fGFreKd6gvYEbbf0AiH0sdIIp7F7ouPjc4ut1rV3vT5RZx4OO2NuSzNfJk5I2zIGAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>gamma-amino-beta-hydroxybenzenepentanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Sta</MonomerID>' + 
'        <MonomerSmiles>CC(C)C[C@H](N[*])[C@@H](O)CC([*])=O |r,$;;;;;;_R1;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UPU/EMAyG9/wKS7Bi2c6nZw4x3YFuYGdkYWDg958bpGtLIoWLsFIpfWy9eh23cQDH96/vj08AUgrsORDJAa7hHLAHFstv1hqqCm9CRM5eHiJyTH7ZCZL3tZLQsgTnu71Ef1WVgCFwWXaMSShuVE7wZxWPWXLfy+NVRcYqxNL3coOKoGgJAy/Djhhj8TrwMlQhLEn7Xm6Y0fZ0SyyTHa2n61HybEerSkDSOKmyndF/dESY915eZiY9r8L1u+Rf1JBvqaHQUkOxpYZSSw3lrm6pNG2pIW1rFZi6lHvO+Kc33nuwq2r/M7ojwPn5tdKluD5mFGTJPJ0Ozt1buAvwiHMZCAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>statin (4-amino-3-hydroxy-6-methylheptanoic acid)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>pnA</MonomerID>' + 
'        <MonomerSmiles>Nc1ncnc2n(CC(=O)N(CCN[*])CC([*])=O)cnc12 |$;;;;;;;;;;;;;;_R1;;;_R2;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWWsVLDMAyG9zyF72DFJ8lyLM2UY2rhOrAzsjAw8PzISY6mkYfG9aU597P895cU5zqEcPz8+f36DgEYEyjmpHQI/2MYAlGgZOur6zJUNXwQAAz25SlFAdA6gwikuUbYzEY4P1xLtK9FBWTkeW+SBCuVU7hZhWIqBE0vz7erYBxzyU0vO1QgKqe2lx0ZQSSSe73YDpbc7tEOFYzW9HaPbu/0lRfJvPby1lfdjcquTmeanjqbcSrS22kUkFkFC1BfRhcvFGmktZddJwA1yTwr3JsRRhPR+VzmVN8EfSqIqa2y6wRInr3ckxFF1vktxRE5dz4vKZKWJSMtDH0ZWTXy1F+boSj3erENS6dzGTurSxGK8FwXGaErIwyBpvsVNZQ8NcSeGsqeGho9NVQ8NSRNqpOTjS6CizWE2KTkFCwQfW6G0OdWqfeL5sHnZqjGbn+NAzWccRVxsabr62AIfR0Mka+DIUIfK/UvwSb2GML59X2KrSvTpz6QVFdeTodheLQx/AEdhZGucAgAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>PNA Adenine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>pnC</MonomerID>' + 
'        <MonomerSmiles>Nc1ccn(CC(=O)N(CCN[*])CC([*])=O)c(=O)n1 |$;;;;;;;;;;;;_R1;;;_R2;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTMU/EMAyF9/wKS7AS2U7SxDOHmO5AN7AzsjAw8PvPaeHanjO0uSit0q/O03Ne6wCOnz+/X98AGCmgUIrEB7gO54CxTljOeYgIfDAiOn14Cr4gSl2hR5ZUK3SlA84Pa4n2/FPBMsRpbygBFyon2KzCPuTqu+HlebsK+SHl1PSyQwW9xND2sqMj9MzlXi+6I5bUzmiHCnkNvZ3R9qRXXkqKSy9vfad7o7Ir6cTjV6erGHLpTZoKlkmFMnJfR7MX9jzw0suuP4Dj5IX9kFPo62hWCT5dM+8/3eCFWHpPtxBJ08uu/+hf5Z5z0R2S2xl1JR19Dll6OiIAHu8rqihYqihaqihZqmiwVFG2VFFpUhmd3OgSmlpFRE3KRkELyfamiGxvlVpnWkjJ6qoz27EiyrY2N3ULkO1YFdh0fAQ4v76PtfXNeNWPiOubl9PBuUcd7gI+rbpmogcAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>PNA Cytosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>pnG</MonomerID>' + 
'        <MonomerSmiles>Nc1nc2n(CC(=O)N(CCN[*])CC([*])=O)cnc2c(=O)[nH]1 |$;;;;;;;;;;;;_R1;;;_R2;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUsU4DMQyG93sKS7AS2Y5ziWeKmFpQB3ZGFgYGnh/nUtFrnaGXRtcq/eL8/W0nNwHsP39+v74BUCiiUhLkHfyPaQKOwGLrq+c8VBU+GBEn+/EUQ0HUOsOArKlG2MwGHB8uJfrPSQXLLG1vLBFXKge4WYVDzIxdL8+3q1CYU05dLxtUMKjEvpcNGWFgLvd6sR1SUr9HG1QoWNP7Pbq90xdeSpK1l7ex6l6pbOp04uXU2UxiLqOdpoKlqVBGHsvo7IUDz7z2sukGkMbSZllGM6JgItruZYr2MhhUIYp9lU03oKTm5Z6MOIi2t5QEkjR4XmJgzaeMNAuOZWTVSEt/bUZFZdSLbTh1OuV5sLocMBdpdSkzrjPacHYlRNHc9DSnobNLALx8X1BD0VND4qmh5Kmh2VND2VNDpUt1cXKlS+hiDRF1KTsFCySfmyHyuVXq/ZJ58LkZqrHX/ybAHWdSRVys6fo6GCL1VIF9HQwxed0C7OtQY10d9gDH1/cltq4sn3qsuK68HHbT9Ghj+gOvnAxDzAgAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>PNA Guanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Glp</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)[C@@H]1CCC(=O)N1 |r,$_R2;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Su24CQQxF+/kKS9BmZHseHteAqCCIgj5lGgoKvp95JSy7q4is5cK+Mz668zAAh6/b/fsKgIqeHDEyb+E3jAHQmjjIZ6gqXBgRTenQSohaKrIYIjUtryJs4GeYXlkv2SnoXWoUL4SzlL+yUD7QBqHuQHk5hV3qsxQjL6LkcwQiaZVLuoySvcTA2s/m2z13yud/vETE6oUto/pllOwgsbSKvcqAcnyfwpZEQn8j5OF/Oa/epIT6o2ik5j7Nqjzabqrkpnuz5KdqlmKdGHuQWVVnCRNnB4Dz/lTVMgJclN1xa8w6h3kAHFD4VKYDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>pyroglutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Mhp</MonomerID>' + 
'        <MonomerSmiles>CC1CN([*])[C@@H](C1O)C([*])=O |r,$;;;;_R1;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UPU/EMAyG9/wKS7AS2Y4TxzOHmO5AN7AzsjAw8PsvH4XrNZVQKyxLbV/HT+u3URzA8f3r++MTAA2FAgXOfIDfcA6IagLO8hpmBm+MiK48PAQvilJ18hk11Dv0pYrwCLeI9ZwoFjl2CgXVvRRJMvWKdt52CvuUiXuvBswzymkbRXKfKMaYV7+F/6KQN8XQKZbyTnevFPZqYU552ULhaY5hovPdBl/QdOolUdlHEa+q/7BfiqXWfUkovMcXan+RFmpsEs0Lri0M49oiyajKD2TJTaNaJF1spq7mVa6NKgPhqPZT4FY9ApyfX9vbKr5dq4VUK0+ng3P3JdwFvqVL0WYEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>4-methyl-3-hydroxyproline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>pnT</MonomerID>' + 
'        <MonomerSmiles>Cc1cn(CC(=O)N(CCN[*])CC([*])=O)c(=O)[nH]c1=O |$;;;;;;;;;;;_R1;;;_R2;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWVMVPDMAyFd/8K38GKTpLt2Jopx9TCdWBnZGFg4PdXTqBJKg9x6nN77hfl9T3LaZ33x8+f369v7zFSQKEUkQ/+OpzzTHV6XMx5iIj/YER0+uEpQEGUukJAllQrdKXDnx/WEu35p4JliNO9oQRcqJz8ZhWGkBmbXp63qxAMKaemlw4VBImh7aUjEQJzudeL3hFLaveoQ4VAm97u0fZOr7yUFJde3vbt7o1KV6cTj6dOVzHksrfTVLBMKpSR9yWavTDwwEsvXU8Ax8kLw5BT2JdoVgmQrj3fv7sBhFj27m4hkqaXrufoX+WefZkTRcghLxN1nV2U3O50hwqDpDHHHburP/E8vq+oomCpomipomSposFSRdlSRaVJZXRyo0toahURNSkbBS0km00R2WyVWmdaSMnqqjObWBHZxIpaulprE2th/T+z38Ym8dH78+v7WFuvjK96tLheeTkdnHvU4S5QDZ+H/gcAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>PNA Thymine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Aib</MonomerID>' + 
'        <MonomerSmiles>CC(C)(N[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxF93yFJVhrOc57poipBXVgZ2RhYOD7SVJB08dAi2Wpzb3VyY1TAdDcnq/7A0BK1hTIa8M1fEsIAA/gAKjooUIIcGUiEmllUHtv40ulkLTnpBFGl+AAY8RyZ4pFJiV7irbkt1KCdEMW9UeWdOJKI3tTZmlXZnGJwsisyizn3ykOreJhLqGgdLufKcMdabRhNJcVFIuSmfoTGWfDlunG30PmHqn6Y0y/VXM1SiZ7U9Uuct1c9Qu7NQDd6ZKNBMrPdHkyOce2FmIfS7wBi46jDzwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>alpha-aminoisobutyric acid (2-aminoalanine)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>ac</MonomerID>' + 
'        <MonomerSmiles>CC([*])=O |$;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2QvQ7CMAyE9zzFSbAS2W5ikpkipgLqwM7IwsDA8xNH/LTQoeJkRdad88myA7rz7X65AqQcmVhYpcVbzgEBaEo+qI9yzjgJEZU5rNSnrGK++EZiso58SQkbjBHT9aSE1KztL3tlDv9SXruQdXlAOcynRK8xTe/SL2ZSuJyjviNX6lXl1w3fsx3Q747VtRBiznbfOrcscg9SdDZTxAEAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>N-Terminal Acetic Acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Aad</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCCC([*])=O)C([*])=O |$_R1;;;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUu04EMQzs8xWWoMXyI86j5hDVHegKekoaCgq+//K4hdXmBFyIolUy9o5mbCsOYP/68fn2DkCZPGv5muzgazkHLMBc4m33w/fKOcOLEJGrN8WklsrhjjEoa8UIS5TgHhaKn/bCQl4qi6A3ixdZ+DcWj0biO0vKNqnFo4/UHClGzmstT39nMRQV7lqMya9YjjdX1IWit7MjT7ZiOVzjyIy090g4pdm6LCyEmnWSRTGHkPu/XJr0XxZGYm+z1eVI3B2VwaG5TgtqIDrPriSa0SJtunk94x3Vzdi7BvkW26I25pasMKLlHke0QGlEC5RHNAPTRZRHZaE+J5vcPcDx8bmprrKb/1q4arc+A1wzHg47527Lcif5yTFqtAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-aminoadipic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Maa</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)CS[*] |$_R2;;;;;_R3$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Suw7CMAxF93yFJViJ7DzceKaIqYCKxM7IwsDA9+OkPNrSoaoVOdG1c3QT2QA018fzdgdAwUCevGNXwzeMAWCAqPXe+oWIwMUhovbBhm0SrrLurIJKJ1qtImxhiJheb0pIweW7ZJkoLqV8vKCeqr6X43xKtByFJr20q9mUyrJ47v6FyIUe5TzfS7IBE3aU6IIs8aJPcSUPVJV8yWM1/PdSmYaxGsuYDNUGoN2fCieDyp4/wefK7lAbs9YwL4OyyV6EAgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>mercaptoacetic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>am</MonomerID>' + 
'        <MonomerSmiles>N[*] |$;_R1$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAI2OvQ6DMBCD93sKS3QlOocSkh3UCVQxsDOyMHTo85OAxI/oUMvDyT59sgDt+PlOM6COJZWWha2xSwSwAGN/8qEQAgarqvEPeWF86ZhyNayc367YKjpcEb+9Up7GeR6U6kTpsz8pvM+WFuhf7zVNJZiSpqtFHlGyABH9f08MAQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>C-Terminal amine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Aze</MonomerID>' + 
'        <MonomerSmiles>[*]N1CC[C@H]1C([*])=O |r,$_R1;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2SuQ7CMAyG9zyFJViJbOeeKWJqQR3YGVkYGHh+kpQjPQSllpXjj/PJtiwA6vPtfrkCYEBNitA4ruBtQgD47Fj4x0IIcGJEFOlmJSObeNgoqS2mE6CMrwhbeH3mPqvnT0oghx0FtcdJyjf/UChRWDIrKiiH+RQnrSL9rsgWlHY1m2KkpcBdLt45WlaRkaiM/9HdP3LRsbvKF5RmGcVb75f0hfIs0ECNkhoMSafqcWy8m7xSqUbJTsa6seomY12e+L5aA7T7Y84kpZL3VDall11TCbGOJh7GMaL9UgMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-carboxyazetidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>seC</MonomerID>' + 
'        <MonomerSmiles>[SeH]C[C@H](N[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Suw7CMAxF93yFJViJ4jztmSImHgKJnYGBhYGB78cJUFJaiYKVqum1c3rtVgGsjtfb+QJgCFkuH6JtoA2lAAggSb5a72BmOFhjjMpPSTt0VjYzq8lHzJrRkjUwhy5ieBVK1IEpZYrTNlAcpNhvlKCJvHt5Cfyfl6AxMrdefEXZn37rKPcx89qQqynr8V7KdJ8dGYu2omzGU0jOpth2lCrKbvLDXGS6+OjIc2e6oyliAj8+pHpJ2FdTX5XCMKi6omKtiuT7taH83l11BbBbbgsnv7TcpQgwZxbrRqmphLoDHERcizwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>SelenoCysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Dpm</MonomerID>' + 
'        <MonomerSmiles>NC(CCCCC(O)=O)(N[*])C([*])=O |$;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU8DMQyG9/wKS7AS+TOJZ4qYWlAHdkYWBgZ+f5NcC6emQm2IotPltfModuwEgO371/fHJwA6KgmZMm/gZ4QApEBS7X1S//4Od4c3RsTQVhKLWKk/DxSTtF3VPVYrwiOcEH/NEwWVG4WjmuU5isYshRZKEqRZSinZG0WiiK0jermeYlGzH8/CKduKsr+7IS+Y1RZKUVxTdrdEZIay3BFTKbN5OVEwisskRaKn5MteKm7/pVBE0kkKR0mIx6rjgrN3JLUFlrOYZ5+rF42p1LbrFOWMcxSJzHjsxpJ5XbtX1wv3lqdRlVGtknbbuWoXCWlU6zqPapXKqFbJR9WBcFQT0BhFdSS+qMoYBbdn8Mx3C7B/fu2+LcSeq9bk1CxPu00I93WEA4cbPm5kBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>diaminopimelic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>A</MonomerID>' + 
'        <MonomerSmiles>C[C@H](N[*])C([*])=O |$;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxF93yFJVhrOc57poipBXVgZ2RhYOD7SYIg6UOiCCtS1Hudo1snAqC73B/XGwBZNuSlZsstfEoIAAdgo1+tUiEEODMRifRlUHsfe6FRSNpz0gijS7CDMWJ5ZYpFJiVfFG3JL1Lkd0qQrmRRf2RJf9xoZG/qLP0vlJjFJQojs6qzHNdTHFrFZS6hogyb1ZRyRxptGM1lNYXz/GV9C1HVb2Paq+ZqlEz2pqqd9+r8BMdqBzAcTpmQjuQ9DVgmZ9+3QmxjiSe9Zxcz4AIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>Alanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>C</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CS[*])C([*])=O |$_R1;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPQ/CIBCGd37Fm+hqc3dAC7MaJz+iibuji4ODv1+gtdKPxNYLA7zcPbxciwL2t+fr/gBYSJjYWpIN2lAK8IADKBvf8N7jKkSk4ooKZxzXM8Ni6lnYJazRRYyPhsJal1ntGEV+UFZUWEeu9VL+5WXFhXgrbS1nlMvMG9nalRPjM8phDiV0N3kJrnSVd/c4ncKFLaXx0rvReTG5L7G7TE2Hul5mUCRU+Gr0G02mhCLu/Q7qI/FQrYZqSLSjqk4q52qQzDDXphfSV016Ol11D5x3p8SJVuIpsTRmxWTomLE9bJRahlBvGBYktKADAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>Cysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>D</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CC([*])=O)C([*])=O |$_R1;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TMW/EIAyFd36FpXY9yzYG4rlXdbprdUP3jl06dOjvP4x0B2kiNY2FhPJwPj14EABOH98/n18ALCRMnBLJEe4VAjABGAANo5eZwbsQUfCvgjqRrx8Ei0l2jbCuEjzBHLE+GiVjySk5JaJQolWK/E2hxN1L2uclYYz57kVtH0Uxi3QvOlBe/+nF/z0oktjo5fKwmdIyYqcwWi55n5eW0c1LpDGj83bKhGzak5Z9O+pJK6rOkt5MKfUB/LpU4SbxUrWlWhunVTU2lUe1SrrsrVJeVdPS2dSe5bz3BHB5eWt0B7XZL4lvwY+HveP5fAzhsVa4AiYqlzL8AwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>D</NaturalAnalog>' + 
'        <MonomerName>Aspartic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>E</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCC([*])=O)C([*])=O |$_R1;;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Tu1IDMQzs9RWaIS0eybZsqyYZqgQmBT0lDQUF3x8/wt3FdwPEHhX23mpn1ycD4vH96/vjE5EtWSYWYbvHaQEgMzIhLmteqopvloignMikmGLePJKxor5h+SvhE/40863WTV1VOHh33Ymzmyq/FTQHIuQmL4MqbGzwYfKynegvFWQj6uZENOpFY83REi1Vzg/3JZLWqzEtE73cmchPKjSmUuclNFeU/NLL6f8q1jiK89SFoXtpU8fNi9egIypSp5s7NJ91E7UdHSrk1twM+TWaoVg7ejSsudlZWnOlvuyeq+XJd+gR8fz8Wp0U+Wqy/PQSoVwaF8bhtAfY5QUXTzfiy1gEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>Glutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Nle</MonomerID>' + 
'        <MonomerSmiles>CCCC[C@H](N[*])C([*])=O |r,$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPW8DIQyGd36FpWat5Q84n+dclClplaF7xy4dOvT3B1By4S4npblaSMBr88gYHAAOnz+/X98A5BRZWVVlgNFCACYAz/5m3Mzd4UOIKOTNq6ClyEUX5GhdWRFmL8EWpojlUSmKsevrWUbTJOsoEblXGnOxdRRBUrcxF16k8CMKo0qi/9alpbhJS3lbcyNCZ2pvdPw7hbBjSmNdqKGcXp7IJf+Xy/tGn9TlCUrE3u2Wy6r/IvUVeabGq8qzWF2MtUU13atZ6ipnrvb3sVa7b65qbcupegA47d8rt4Dq7KUqxbM7DiFssoUzdjYTjvQDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>L</NaturalAnalog>' + 
'        <MonomerName>norleucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>F</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CC1=CC=CC=C1)C([*])=O |$_R1;;;;;;;;;;;_R2;$,c:6,8,t:4|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu27DMAxFd30FgXatQFJPzk2RKUmRoXvHLh069PsryonlWB4SlaBh60o64EOyATh8/vx+fQNgJilPCMg7mM0YIKcOuPBmIgIfjIimDF6cjZiC6mwxJa9faMsswivcIra9Urx1TKJ7ycYYcJzCl73Z4yClZpSmvZ5HM2KbxdElFif5HxS81sUPUyjl1iMeo5D10bdY4iaF76K0uiwpx/tjQZu8tIwGO10pbqIIMi0op0co6ALNdVmel/PTYz2K86mjEQrV+lOvxlVjTB27Xi2S7wlFCv3aULnrtUVKvZqvKq1U2VpL2KlFIupiUHUjY6l/r1v1AHDev08F0gugb2096czbcWfMczHzB/nXwLMeBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>F</NaturalAnalog>' + 
'        <MonomerName>Phenylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>G</MonomerID>' + 
'        <MonomerSmiles>[*]NCC([*])=O |$_R1;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPw+CQAzF9/sUL9FV0t4/uFmME2gc3B1dHBz8/PbuRA9xgNgUeLy2vxwNCugu98f1BlDDQS6ng27xDqUADzipF/mJEALOmoikDxuqam5CVp58VKBKqoQtxojf+aIQWZsVB+v+oJg86w3ZgnJYQqllLVFxZQ03BaWfTUGkEA97qbmgnFazzxJPYFxWjR2+bRlF1sApR66866krlkn3b9dNe236TcZuB5z2xzQRR9JTmsCxsutbpdYS6gmdUi5fhAIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>G</NaturalAnalog>' + 
'        <MonomerName>Glycine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Dpr</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CN[*])C([*])=O |$_R1;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1TPU8DMQzd8yss0RXLn5dkphVTC+rAzsjCwMDvb5xr6XGHoJwVRcrz0/OL4ySA/evH59s7AFUyVmZV2cJXpARQAUrL98V9v0atFV6EiFKcFIt648I946CsgRG2LMEDXCR+WxcVMgkVQXPPP6rwXyqGTmKjSqm+0ouhZeo3Usxcp16ebldxFBUevTiTTVSOd//oC2Xz842MfKJyuN2LoA5E5+5KoXVeWneddHxp4VLWebmqEGrVssaL9Fng6USMqM6GJHXIem6O+pLbWMMSbVBeotx/yBwt/et8R/cAx8fnXjOKRpUQDFaQQYOxO2xT2rRIJ+baramgAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2,3-diaminopropanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>H</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CC1=CNC=N1)C([*])=O |$_R1;;;;;;;;;;_R2;$,c:7,t:4|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Uu27DMAzc9RUE2jUCSb3IuSk6JSkydO/YpUOHfn/0cFzFNlBYAg3TJ+p81Mk2AKfPn9+vbwAU0nwFR3yEeRgDxCUAu/gbqgofjIimPJHlEFLJ0HombFmeRXiBR4rtMG1F8OWNba3ETRb+h+WAlpJzsxYa0pJZRJLMWtIYC1uKEhqfi8mPalEiP6mioGMsZGP0U0cssffovIclIWvL0IsfYmlO072jOMhST51MmY+905c9LJpbmp3utVyfdng0nbq8L8yiAyzls6HFATd3iFZo2b8lmgt1E3UVpR7NkF/XxoouNaTN2oyGdW2GZF0rlXqJav3DPKIngOvbe2u6WFruxR4qM6/nozHPeZgbHXG0qcIEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>H</NaturalAnalog>' + 
'        <MonomerName>Histidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>I</MonomerID>' + 
'        <MonomerSmiles>CC[C@H](C)[C@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Tu27DMAxFd30FgXaNQFJPzknQKQ9kyN6xS4cO/f7QVBIriYHWJmSAvpSOyWvIAew+f36/vgGwkuiTIvMG7uEcEAKI1rs1hojAmRHR6csKfSk1tCxTGjJAr1WENTwippdRyEfh2iiMls2n6ImcMN97SZMU+otCPuTEt14CLevFKFc3MpN0lMPMidLVoYj9RPv/u6snchjdlUW+NEq5TcQLfWGPRcZ/VDrK6W3WRBGbLzUFXELRAcrT2E3lVzVM7lU1T6rRVOpVlZKh8UmVV4J+qpqaezXbtXzcuwM4fRyNO4Cs9cEMGirb/ca5dw13AQuqQFH0AwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>I</NaturalAnalog>' + 
'        <MonomerName>Isoleucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>K</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCCCN[*])C([*])=O |$_R1;;;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUP0/EMAzF93wKS7Bi2c5fzxxiugPdwM7IwsDA5z+7B22vqcTRizI0v9ivL+prAsD+/ev74xOAhYSJcxbZwThCsA1gBqDZnIaqwpsQUbDFA6NJiHNBUlZ/IrRdgke4lFifPyoqqXkvY6maVlXkLxXBEnX0IrTNS8SY4+Qlb1NJSKXd7CVhbXKzl4xJ6+SFZyqHLd+IsOWUtqpMeVEu87y8XK9CdqK8npfj3dUqQ17iuTeli+z+Q6XYibiOXsoWFXs1LwIefhF3lKmnVthWaRwoz6mh1Ncayj01VHpqqPa0DbfGkla/ThZ0D3B8fj2b81/DCzyW3u7hiF7xdNiFcG8jnADxHCCFtAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>Lysine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>L</MonomerID>' + 
'        <MonomerSmiles>CC(C)C[C@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVixbCdp4hkQEw8xsDOyMDDw/SQRlPQhAcXK0F7bR/ZNawC259v9cgWgKESRPZGsoA1jgAlAU74671BVOKVGMullIRi846wLsgtNfiJMWYIldBHjp1AsuiY+e5VJ/qUwBusnUhxytNRuFKZRBMlqaGfhUQp/ojBa8fSvuzVFg9SU/ZSNyh3VG+2+pxA2TL71hSrKcfbDLOmre96v044vX1Ns8Z97qn+p3KuVYW1S3SghjqrNUE1SKOi+qsPaWH7LrroFOG4OhZBbypDZUs6Z9W5lzDyFeQDwkrwt9AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>L</NaturalAnalog>' + 
'        <MonomerName>Leucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>M</MonomerID>' + 
'        <MonomerSmiles>CSCC[C@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPU8DMQyG9/wKS7A2svPh2DOtmFpQkdgZWRgY+P04OZqmvZNoz8pJd4/jV6+dnAPYf3z/fH4BoJDak5OELfRwDggB1PLDOoeqwntARGcfm+SJglSOXkji9GZZhCe4lFhefyoSSq3doE+kNKgc7lExL6XWkucURy8vd3oJU23CrIsd0X8q2edE57nkdXNhHzLHkxemdSrFs+TeEYe1XrRg6R3xoPJ2u0r0UaV3lMugcny4WaVP1+6LROI1KrGdYriihtLV8U5U5zS18gWaG6WRGuL5XkMyp4bKnIb2W17SPcDx+bXZqAabHaz3v2Z2h61zjxbuF9z7N/X0AwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>M</NaturalAnalog>' + 
'        <MonomerName>Methionine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Mba</MonomerID>' + 
'        <MonomerSmiles>CC[C@H](S[*])C([*])=O |r,$;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1SOQ4CMQzs8wpL0BLZjnPVgKg4BBI9JQ0FBe/HyXLsLitYYVk5xpPJyIkBWJ+ut/MFADMKOXIceQGvMAYgAUStt/IdOWc4MiIqD2bBphxiwdk6DpWJVqsIc3gepq5WJx8qkoTLWbKByA+qfMueF9RVbHvZjlfxNvhMg172k9Eq0YbsQtMXIpaWymG8l2QFEzYqniX/5+XdXWdR8M/ual9SdI0Kexl+6R8q2lbufQdTIVfHPiqfXN37T1ShMMiNdaQ2Guv37nLXAPvVrt5ZLq1zeTxXKsvNwpiphrkDAHT9rTwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>mercaptobutanoic acid (GMBA)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>N</MonomerID>' + 
'        <MonomerSmiles>NC(=O)C[C@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2TvW7DMAyEdz0FgWQtQVISLc5NkClpkaF7xy4dMuT5Szl/TiwghlNCBuwj8eGOtgPA9vtw/PkFoMLmV+YkK7hWCMAEYN4fnFuZGXwJEYX6pGiixW/eBIskrhqhdwne4R7RPmeKsMRKiShRtUmRZ5SMybp/8HJJxOhZh5SPOYkSkvIw0W46JWFXYnqylwkUUqPrXmReopuXVxJ1qInbb3q/mEzJqHJKlJyXaQ7Fo/DDRxUuEo9VG6s+mJtq7FUeqi7peNal0lS7sbPc/5b3s1uA/eazn60Ge+t1GVw7690qhKVX+APfyfk19AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>N</NaturalAnalog>' + 
'        <MonomerName>Asparagine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Phg</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](C([*])=O)c1ccccc1 |r,$_R1;;;;_R2;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTu27DMAxFd30FgXaNQEqUZM5N0SkPZMjesUuHDv3+UlLs2JbRJI5A2NQVdcAHZAB2nz+/X98AKMjkyXN0WxiWMUAuG+DIrktE4OwQ0ehmgzZRJ9WLGLMHaPUU4Q36yzRlTexCQWSuHgmHRcp/dqX4ejd65BHl8AglkeSKN2TZUzei7O+mQKYg9X1JNKKcXu7OJWfgQ/U67mt7lOIsp4D1rrBbntFNirc66MtkwrS7ayjaFyec1lGGivK0MLl1FLIp4tO5DJQn+sLljdBM1b1rVZV8+c7V0MYqN7aqFtq1qkrScgUIm1iViJpYlWgh31TUOZcKYVK02QGcPo4lNhdT/po+UD5532+NedVl/gDE2sDHwgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>G</NaturalAnalog>' + 
'        <MonomerName>2-phenylglycine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Bua</MonomerID>' + 
'        <MonomerSmiles>CCCC([*])=O |$;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPQvCMBCG9/yKF3T1uFzz0cxWnKrSwd3RxcHB399LCtrSDtIeRwjPJS8PIQZoH+/P8wVwYmcrazlJg28ZAwTA63zUv0op4S7MrOdwSOSkDplb8iwx75h0yjhiGrHcJaWmaJ0dUpL1si4lkrptdokk9WCwxSWQjxwXXbrdCheh6Hjscv3XRZ9Vyjqhiqo5VeTm1JXfsEBDyRnRFujOt3I2X4Fkcro0xuy1TA/RvSi5fAIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>butanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>P</MonomerID>' + 
'        <MonomerSmiles>[*]N1CCC[C@H]1C([*])=O |$_R1;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2RPY/CMAyG9/wKS7BeZDtOHc8HYoI7Mdx+4y0MDPx+8tGD0lZCreUo1Wv7Uf3GARx/r7e/CwAmsnxiZN7BI5wDsJo4yGeYGfwwIuY++AheFKXo5BNqKF/ocxXhE14R89lTLHJsFAqqaynSST8r2njLKey7RNxmNWAaUE7LKJLaRjHGNPsv/I5C3hRDo1iXVrr7pLBXC0PK1xIK93tMNjpvFviCpv0sicoaClXnaKTGKtGw4GpjmPZmSaaq/EPG3G6qZklHD9jUNMu1sXoEOB++K6GM1NuKt6WyP+2c2+Zwd8tP5AuuAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>Proline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Q</MonomerID>' + 
'        <MonomerSmiles>NC(=O)CC[C@H](N[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTsU7EMAyG9zyFJVhr2U4dJzOHmO5AN7AzsjAw8Pw4lOuVNtJVwUrV9rPzy3acAHB8+/x6/wCgzMUfFZMDzBYCMAOT+xfraqUUeBUiCvVPMBOLfwwjUiSrjNC9BA/wV6K9flUoJ5tUxjHGporcUmGMJv/OhTCp5Ru57KjI+1L3DhGFdJnL826VgdDMD+OSiyxUTj3dVZSUY5eK50KadK4o9VbkW9N8RqmvuxGV1Zp9Od/tVrnOi2LKlHtUvCG8Gs1wQbyh9VatqQdak8YfykvqaNzGOipb6ig1ad7ma/XKr2KPAOenl6kQguldR5Gr5/F0COHeLXwDeuT3BVAEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Q</NaturalAnalog>' + 
'        <MonomerName>Glutamine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Nty</MonomerID>' + 
'        <MonomerSmiles>Oc1ccc(C[C@H](N([*])N(=O)=O)C([*])=O)cc1 |r,$;;;;;;;;_R1;;;;;_R2;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVTwU7FIBC88xWb6LVkd4ECZ5/x9J7mHbx79OLBg98vu9UWC4kWCUnbAaYzw64BOL+8f7y+AWBGT46cC3yCdRgDFGUCVnMbOWd4ZkQ05WNim4hZcLKeY5Q3tGUV4Q5+UvSnsjgbeE7LWcroKpbL31lUC8lZthy41vJ4UEtcHCEF13VEv7F4y562XPJYLt7mEDYtfowl2DkifWtJOMYyW5f8vGoJ/9AiuUxomXlQi+ay1ctgLuooriyDjqLFnFdHVN/0garjwhK3m6aK5XpzIJevqlvS5TEW7SPXZTnajcpSHPnIw7ksdT/J2TTU0077lXdogfyukRUl16Jej3fQoCjVaIHmZi9hD4Wo6F5ZQVO7NwG1LgTK7d6sP2z3UscFA3VyKGhoXQSgVq+gcY+eAa4PT0tsUgTylGskWbm/nIy5LcN8AkBoE9SOBgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Y</NaturalAnalog>' + 
'        <MonomerName>nitrotyrosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>R</MonomerID>' + 
'        <MonomerSmiles>NC(=N)NCCC[C@H](N[*])C([*])=O |$;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUsU4DMQyG9zyFJbpi2Y4viWeKmFpQB3ZGFgYGnh/nKtq0iUR7F+V0d1+s/37byQWA3cf3z+cXABU2v1RZtnAaIQBHYPH1Zp6HmcG7EFGobwW1iMfCo2CJU30CQl8leIJLifGcVTLmlHNViSiay1BF/lehKZ698DIvCWMs5eQlL1OZMInqWi9zXVJVUSRhbVT2t6u0PSKmtkevt6soGnnrR3W5w4si27S6Lq2KZ8TLvESvC9PajMy9pDxUOTzcsessUzl2WqLaEhX/NF8dk/CHuKM8oI7SkMaZcksdaR/raOqpo9JTR9ZTA+YhpT63VH9VV7E7gMPL2zHputXr3YOA68rzfhvCxkf4BbsmdToIBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>Arginine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hhs</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCc1c[nH]cn1)C([*])=O |r,$_R1;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UPXPDIAyGd36F7to1nD4woLnpdUray9C9Y5cOHfr7y4fjOJhrUnTcGb+gx5IQNgCHj++fzy8AVHQkxMn2sJgxQJIH4GpcTFXhnRHR5DeyPE0hz9A6JqyztIrwBNeI/jDVY3LEZ9/ouxS+QdmhpSCyxEJDsezIeuWp+opjN0ZhG+aMyJKPPEqRUHxzbuRlNCNNIcyxyBXleD9FLLKfqyHqaIhST5pqRpG8G6OUrpszYufXsbz+h6IBL123juX0cHddlq5LdWaOOkqJMcQbN+BvSr581FwTc5Zoo+ZTaNW0UbuqFJXWagrRbb8WitoSkjpt9yYpbvfGgm5VBepkUf9Treo66gHg9PJWS5HbJT/z0VNeeT7ujXlMZn4BJSLl0h4FAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>H</NaturalAnalog>' + 
'        <MonomerName>homohistidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>S</MonomerID>' + 
'        <MonomerSmiles>OC[C@H](N[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxF93yFJVixHDtp7ZkiJh5iYGdkYWDg+0kDKmmpBBQrUqVj9yS5igPYnK638wWA1BspU1RuoCvnABSgTv1ivcrM4MhElOZgwUhioeWMUUKeJExdgiX0FeNrYBGUqFZYdr9Y6ij5X49sVSgs2ykWRs8+jN7If7IIhkrl31wCeuW6O0uclotH4WCjlsPsa0u+0TMNVbEpFs7J8YAmFAaRPmj9TtOgjNKYqS9pQtX7rOTn3acbgMN6n0/Wbpq/2r6jtrPaNs7NU7k7Ruw0UjwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>S</NaturalAnalog>' + 
'        <MonomerName>Serine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>T</MonomerID>' + 
'        <MonomerSmiles>C[C@@H](O)[C@H](N[*])C([*])=O |$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TvW7DMAyEdz0FgWSNQFISJc51kCk/yJC9Y5cOHfL8kelCURIDbSwIsHykPh8PsAPYf/5cv74BsJBiYQyZB2jLOQAFKLXe7ftSVbgwItY+2ATPynnU2ROKndDXKsIHPCLmt1FivZF5ultEqaMc/k8xLzJ50UDSUY5vejEH5EUjzU5Ef1GSj0GwUcLSXDKTtHTLMi9GSS2XvCwX9imX0CbijnJevTfRr4OYRJZQgs3MT2o0lfo8nL2Up4imXp5V5VWtUppV8+vX2H6dx949wHl3stpoxZ46pjhWtofBuXVd7gb1UHc5mAMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>T</NaturalAnalog>' + 
'        <MonomerName>Threonine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Thi</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](Cc1cccs1)C([*])=O |r,$_R1;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU8DMQyG9/wKS7DWsp1PzxQxtaAisTOyMDD09+PkoJdeKtEekaW7e209emNb5wB271/Hj08AUgrsOVCQLZyOc8BSA6iL+agqvAkRufoVMZSS7GXjkUKRqhFaluABzhGXo1ESCnmeKCFRuUjhvynKefbi/+Gl3ngTUErsvexvoZiXXCmCIr738nw9JWPyMvdFO8rh7mrKPKOASc/6cgMloW1K88JI0jq0orsRvUw3IutQjOsoATXlHy8pUb91r7d4iSmeZpR1nRfbF6U0eSk+8BqKtO3mfsdNDb+JZa0fVZNiyy3VNNYaN4+qLbqOBAWmodYk5lHl9tdYEkpTx1oYCDuAw9NLI1Tb7VnHwzXzuN86d2/HfQPCJ/lGwgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>3-thienylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Abu</MonomerID>' + 
'        <MonomerSmiles>CC[C@H](N[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2SPU8DMQyG9/wKS3St5c9LMlPE1II6sDOyMDDw+0l8LT2uVWnPii6619Yj228SwPb96/vjE4AqGSuTumzgN1ICKAC55eNwfE9Ra4U3IaLU/xSLeiuHNeOgrF0jbFmCRzgirp0jhUw6RdDc80UK/0cxdBIbKaX6wl4MLVNMpJi5Tnt5uZ3iKCo89uJMNqHsH+7YC2Xzw0RGPqHs7pnInXT0SLiUZXsR1IHo4JEUWjKRhIs89XJUdWZvCskiN1f9vLZVDecqxyueq0M877/qFmD//Bqcjo+7r4l75mm3SWnVIv0A6Wil9TwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-aminobutanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>V</MonomerID>' + 
'        <MonomerSmiles>CC(C)[C@H](N[*])C([*])=O |$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVgb2Xl7BsTUghjYGVkYGPh+nFRAIZUKxYrU6Ni58nVSBdCerrfzBQATMSaDHs0anqEUAAMkyQ/WK5gZjgYRpQ4arw0HmznqgA77nWQRVvAuMb6KStBIGPuzxORHVcy0SjTe5LOkneHZvTxU/nEUtbMcJhxNqrymWznazZhuI46sHfbSfa/itE+URh0dFr9PtyGNLuAcFRkrfTwH9UBU01RTKYyj1BVKQyrI1rVCfU1j+XXeaQtw2O6Lem6lfDnfaM5surVSSwl1B5P4reOYAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>Valine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>W</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CC1=CNC2=C1C=CC=C2)C([*])=O |$_R1;;;;;;;;;;;;;;_R2;$,c:7,10,12,t:4|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu07EMBBF+3yFJWgZzcv2uGYR1S5oC3pKGgoKvh8/IBucSBt5LUtxrq+PxpOZTM4d37++Pz6dQ6OExqjEBzePaXIUHMW8v5iXkVJyb4yIU355QNCQrOgMKihlhZB30T26/4jt2VEE2Psl5WU/hYBM69m8ShwXlNMIhQEpxs0b0XWKJbs5LwyB5Foseygcac5LGqMISBLfYmELOEoxS77FEjgM3kggUtBWL6iexigKXlqtCdAwxQMK/X4jNT+YXYWIpi0v8Ya8KP1FkDwtq25/B+QTrBrnqrMF5Xy3O5ZLByBEQx6hcO007tQsadeCVSW/VrNRNtXmpaWapbD2xqr2MdiWl7Tae0L2pi0C4dqbKqTnSiX0KjpaZydLxGsvV0gfg5Rffec9Ond+fm25L41anqHUZdl5Oh2m6T6P6QdumO2wSAYAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>W</NaturalAnalog>' + 
'        <MonomerName>Tryptophan</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Y</MonomerID>' + 
'        <MonomerSmiles>OC1=CC=C(C[C@H](N[*])C([*])=O)C=C1 |$;;;;;;;;_R1;;_R2;;;$,c:12,t:1,3|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUsW7EIAzd+QpL7XqWbSDA3Ks63bW6oXvHLh069PsPnDZwIVIbipCSPMzLew8LA3B6+/x6/wCgyImikLNyhGUYA+zKBGpmHSkleBUiMvnjIBhZpOCMTkIob4R5leABbim2p7JY9DLFeW/WZBuW899ZVAuXvYLipdXyvFNLmB0Re7vpiH9jcSiOay5pLBeHyfuqxY2xeJwC8Y+WSGMsE9ropkWL/4eWksuBUEQGtWgutV8Gc1FHYWEZdBSQUloccXvSO7pOMkuoJ80Ny+VuRy7fXTenKyMsVrtbVmiG3KrtFWXbo063b6BeUW7RDE1dLdMWCkHRtbKMxr42AvcuCpT62qQ/7Gt5w4XozXiLngAuTy+z6XJdlGdpSS4rj+ejMfd5mCtwYCmYegUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Y</NaturalAnalog>' + 
'        <MonomerName>Tyrosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hyl</MonomerID>' + 
'        <MonomerSmiles>OC(CC[C@H](N[*])C([*])=O)CN[*] |r,$;;;;;;_R1;;_R2;;;;_R3$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu04DMRBFe3/FSNBizcuPqQmiSkAp6ClpKCj4/ow3kN3EKxGckYvdY8/VtfeuA8D2/ev74xMADZWEWJg3cKoQgASIfX4x5jIzeGNEDP7yQJEJuXGOaGTtCaPPIjzCucT6+FEx1tp6KeZiuqrCf6lwzGInL4xjXiRKktlLGlPRiLne7EVjqXyzlxTVyuyFFiq7kW+EsSbVUZU5L0Z5mZeX61XQd5TW87K/u1plyosce1XPsvsPlew7onLyksdUlnkxKjhyLr4BuvhNwi+ijhL21BfWVSoTpSV1pP1aR6mnjnJPHZWeViDqaZlupF6X5JJuAfbPr0fL7RhbW4t8E20HLG3F024Twr1XOADEEmdZEAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>5-hydroxylysine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dA</MonomerID>' + 
'        <MonomerSmiles>C[C@@H](N[*])C([*])=O |$;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPQ/CIBCGd37Fm+hachyUj9kap1bj4O7o4uDg7xdotPQjscbLJYT3jicvBwJor4/n7Q4oZlZEQRtu8AkhAAdYgIocIoSACxORSLtaGu9jLyotyXhOGslYJewwRixnpljJpFVPMZb8IoW/U4Jygxf9h5d048pI9nXppfuFEr24RGHJrEsvx/UUJ63mYS6hoJw3qynDGxlpw2guqylx+CqnLVXzLkx79VyNUj15xF61816Tv+BYbYHz4ZQJ6Uhe04BVquy7RohtDPEC7ABanuACAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>D-Alanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Aca</MonomerID>' + 
'        <MonomerSmiles>CCCCCCCC[C@H](N[*])C([*])=O |$;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU/DMBCGd/+Kk2DFus/EniliakEd2BlZGBj4/ZydJo3iClpjWUn8nv3o3ovtALB///r++ATAjEpCKCPvYGkhACmQeLx2qs9zyznDGyNiKCOJSSz5xwPFQcoqnx49ivAIM+K3PlNQuVA4qtl4kUJ/UTQask6UlK0zF406YnUkcaS8zuXleopFFqYpFyPUFeV4d0NdcFQ7OVK0FeVwfS4cZUA8VZcT9uXi1TWU6U8zpdRb3ZmCUbJ0UpZdV9ZSurxfbqIklU7K4gi8LjbwfykcMVEn5ezI/3Tuc8T1pNH6vE2qbI5gqJLW2Fa1dq7PGlrVpbFVfZxa1aXcqhkIG9UlolYlIG5VrrfdVpVyDW7UPcDx+bV6KRbruxSZSuTpsAvh3lv4AfLAq5FkBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-aminocapric acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hyp</MonomerID>' + 
'        <MonomerSmiles>O[C@@H]1C[C@H](N([*])C1)C([*])=O |r,$;;;;;_R1;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Tu27DMAxFd30FgXatQFKUKc5J0SlpkCF7xy4dOvT7o4eTuJaB1iYIWLoUD3QJ2QEcPr5/Pr8A0FAoEAfhPdzDOSAsCdN8hJnBhRHR5c1L8KIoRSefUENZoc9VhB38RiznSLHIsVEoqC5S+G+KDDL2ijbe+ruwHxJx69WAaUI5rqNIao5ijGmbI/KmGBrFhrRxug8Ke7UwpbyvofDoo3N0floxFzQde0lUtlHEq+rye/m3I6rzp5kaq0TTgqsHQ382S9KrcoPMuUOvZklnz6CpaZFrvcr1T6XadFMPAOe3U+UWUP1amVWpvB73zj3ncFcWoCwuCgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>4-hydroxyproline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dC</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](CS[*])C([*])=O |$_R1;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Tu27DMAxFd33FBZLVBkk9LM11kSlp4ADdO3bpkCHfH0k2HPkBxC6hQboij65oSwHnn/vj9w9gEWGioK20GEMpIAAeoGK8IoSAbyEilVZUe+O5nxkW08/iLuEDU8T6GCistStq1yj8hlJRbT350Yv7l5eKawlWxlouKLedN7K9Ky8mFJTLHkrsbvYSXemm7O7XdgrX1sngZXaj7rC5L6m7TEOHpl52UCRWhGb1G22muPwvyEztJV6qzVKNiXZV1Vl1pRols8y1+YXMVZOfzlQ9A93pmjnJSjollaaslAydMj4vrVLHGOoJ+lFARqADAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>D-Cysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dD</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](CC([*])=O)C([*])=O |$_R1;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TsW7DMAxEd30FgWYNQVKUZM5NkSlJkaF7xy4dOvT7Y6poJNcG6pgQYOhEPZx0cgA4vX99f3wCsIgwkcUsB7hXCMAEYADUjVZmBm9CRMFnBXUgX98LFpPsGuG4SvAMU8TyqJSMJafklIhCiRYp/D+FEjcvaZuXhDHmuxe1bRTFLNK8aEe5POjF9+4VSaz3cn1aTakZsVMYLZe8zUvN6NdLpD6j83rKgGzakpZtJ2pJK6pOkl5NKfVFyR/1R+K5anN1bBwW1VjV3KujpPNerV0Lapo7G+pvOe09AVyPr5XuoPr1R+JH8Oth73g5H0LYjRVuYaLxZvwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>D</NaturalAnalog>' + 
'        <MonomerName>D-Aspartic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Pqa</MonomerID>' + 
'        <MonomerSmiles>[*]N1CCN(CC1)c1ccc2ccn(CC([*])=O)c(=O)c2c1 |$_R1;;;;;;;;;;;;;;;;_R2;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK1WsW4DIQzd+QpL7RpkG8PB3FSdklYZunfs0qFDv7+GnJLL+YYGihjuHo/H8zsTxQEcPr5/Pr8AsKBQoBCJ93AZzgEzsOj6Yl5HKQXeGRGdvuzIC0moOHoOcTo/6SrCE9xKbM+mwp44z3uTZO5VyRL+wcusskMfcwmDFWlCiJT7VC7pDnnRTEvJg17qDpJp08uxQ2XoG10qGuoX8TLlNOtR7vQSPZWAc7qBOr0sVXJMfekuKmLPKXd2XfBTEtr00qmyyuWOiqIvWX9wWkWYyrKi08MdXTdx4fEbcFXJGu/4bVypvP7dC/nIieZcBENvLiQxn1WEkHq86CZu8wbV99DWblCFxHIViparULJcvaTZchUqFi1AaBWo6a651LhrNLUDVygply3KQLZihUgsKkC2YoXIOqunbfiVTa6eZv1qOmQzU4g2MpuAbWZKZLIKpf5RWHEPAKeXt4ZWK607altxXXk+7p171OF+AZR0G9yGCAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>Piperazine quinazolinone acetic acid, 2-(4-oxo-6-piperazin-1-yl-quinazolin-3-yl)acetic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dE</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](CCC([*])=O)C([*])=O |$_R1;;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Tu04EMQzs8xWWoCWynadrDlHdga6gp6ShoOD7z0mO3exDwMWyVsmsM5pxYgNwfP/6/vgEIGYmRHGJDzCFMUAEhAB9ziEi8MaIaMoObU456eIBLQfxDdO/CI/wc5iXXIu8slD07roKjndZfkvTFISAbtIyyEKWo4+Tln1Hf7EA2SBudoSjWiRVH81Rz3K+u81RaGcl5d7Ry42O/MSCYyz1vcSmCrPvtZz+z8LWYZpfXRzqS3t11LR4iTLCom2lmgtU97KLcv3GHlXIbWsV8ltUobQap4bGba0qy9vaUCd7XStl5FfoEeD8/FqVFPoqslx6sVCaRqXi6XQw5l7DXADD0KAEWAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>D-Glutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Asu</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCCCCC([*])=O)C([*])=O |$_R1;;;;;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTu04DMRBFe3/FSKRlNE+vXRNElYBS0FPSUFDw/djeLFnFESTGslb28fjuPDwBYPf2+fX+AUCZjJXJVbbwM0IANmAt521y+55GzhlehYhC3Skm9VQW94xR661ijuWU4AEWid/mokImVUXQ3KeLKvyXiqGT2KySsg/6YmgTtYgUJ85rX56vV3EUFZ59cSZbqRzubsgLTebHiIx8pbK/JSJ30rlGwimN5mVRIdSsgyqKOcY83+VSpP+qMBLboIqgRqLjq5NEYzUyjIlt9sVkotHsLiqC4jLoi5fKtG7s83L125XWabzut5nqWQuGhqydnVPvbYtV7GnZTz0tKPW0oNzTDEw9jcDcUZZLtpX2sVXaxbYDODy9tAhriC1XtcnrryrTavG434awKSN8Ax8R4wlsBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-aminosuberic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dF</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](Cc1ccccc1)C([*])=O |$_R1;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU/EMAyG9/wKS7AS2c6nZw4x3YFuYGdkYWDg9xOnd03bdLgLkaU2r+NH/khrAI6fP79f3wDEzIQoLvMB5mUMkFMDXFhbIgIfjIimbJ6cjZiC6mwxJa9vaIsX4RnWiH2rFG8dk2gs2RgDjlP4Eps9DlJqRWmK9TxaEdssji65OMn/oOC1L36YQim3GfEYhayPvuUSdyl0E6X1ZUk53Z4L2uSlVTQ46UpxE0WQaUF5u4eCLtDcl+V9OT/cN6M43zoaoZQg3oxgUmN1rNSyd71aJN8TihT6s6Fyt2eLlHo1X9W4UWXvLG0vklGJqMtB1Z2Kpf691uoR4Pz6PjVIPwB96uhJPS+ngzGPZZk/s6BY7R4FAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>F</NaturalAnalog>' + 
'        <MonomerName>D-Phenylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Bux</MonomerID>' + 
'        <MonomerSmiles>O[C@H](CN[*])CC([*])=O |r,$;;;;_R1;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPw/CIBDFdz7FJbr2cneFHszWOLUaB3dHFwcHP79AE6uWWP9cSEp+jzzeATUA3fFyPZ0BKJDlmplFWriXMQABwEf9YYwVQoCDEFFcB1VAK75JnNGRaJoRRpVgBc8W5ZFdPCpbHlwCOym6yJyLYsz2dxZF8UOCN1lmXRp0SlrMsl/8kEVQLT1m2X6apWJCtjUVO+q/cfFO3b8djTf9e0ec3wK/0IjqKY3ITmlErkibl2c27KbTtZr/kEKGkOkomA5gv9llLW2avz6dYlLWfWvMMpa5AdVCVOqYAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>4-amino-3-hydroxybutanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dH</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](Cc1c[nH]cn1)C([*])=O |$_R1;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UPU/EMAyG9/wKS7BS2c6XPXOI6Q50AzsjCwMDvx8nKSXXVkJNFKnuG+epnTeqAzi/f31/fAIQMxOieuUTLMM5WygTsJt/Q1XhjRHRlTeaOMZcIpyC0VpkqwiPcIvYn67tiKF8se2VtEuhfygPOFH2fqmFhmoxikiWpZY8RuGJksTG8ymH0VqUKMxVUdQxCk0phbkjltR7dDlCycjaIgwShijNafrtKA1S6q2TOQqpd/rlCEWtpcXpvpbr3QGP5ltn58IsOkChdrt5xW4SbdRyfmvVEnVX9VVNvWpS2Oamqq5ryLu5psZtrkmyzZWKXqta/zC36hng+vzami6Wlmexh8rK0+Xk3L0N9wPK6+BkwgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>H</NaturalAnalog>' + 
'        <MonomerName>D-Histidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Dab</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCN[*])C([*])=O |$_R1;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1TPU8DMQzd8yss0RXLX8nZM0VMLagDOyMLAwO/nyTXo8cdgnJWFCXPzsuz4ySAw8v7x+sbAAUZK7O47OHLUgImgKj+PrjPF4sIeBYiSm2n6Jq9Lm4Zi7I2jLB6Ce5govhtTCxk0lgELefhRxb+i8Uwk9jI4pE3ajG0gXpGigPHXMvj9SwZRYVHLZnJZiynm3/UhQbL54yM8ozleL0WQS1E5+qK0zYttbqZdHxpYfet1Z1YCDXUt2WkGKXEeJY9ypaMpHcUz/tqRHXRaqlD1n1LNK9ja1RZoxUa1mjd+xr1/vuWaPRv+R09AJwenrqSJqXd3a7pWbVn1hZxf9yntKuWPgGD8yRB/AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2,4-diaminobutanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dK</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](CCCCN[*])C([*])=O |$_R1;;;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUP0/EMAzF93wKS7AS2Y7zxzOHmO5AN7AzsjAw8PmJU9T20kocuTRD+4v99KK+xAEc37++Pz4BiFGoPkx8gHk4VxeACABXcxmqCm+MiK5+PJBnQjbOHpXU3tDXVYRHuJTYn78qylKsl3zKKrsq9JcK+xR09sI45iX4EMPiJY6piMdUbvYiPhe+2Uv0onnxQiuV08g/Ql+iyKjKkheltM7Ly/UqWHcU9/NyvrtapeUlTL0iF9n9h0qqO6I8e0kjKtrSzR2dEG0o9YfBtcKyS0OjaU0rkm1tRXFLY+vtaUV5S0u7NXqa7Trp6BHg/Pw6mbOjYQUWS2u3cASreDodnLuvw/0AH3NhK7QEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>D-Lysine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dL</MonomerID>' + 
'        <MonomerSmiles>CC(C)C[C@@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU8DMQyG9/wKS7DWeu18nWeKmFpQB3ZGFgYGfj9J2h653km0V8tD8sZ+ZDuJI9p9fP98fhGJqgpgAbql0ZwjAZERofM/MzN6VwCubDbKOQapurKEnOoKXE5BTzRFLHujeA5pOOWaQO+lCGcfV1ICy+AxdpTXUZThLY+1yCJF/6MIe424d7o9xbL2lNc1HbU76jvaX08BJ0Ec54KOcni4oZby6k73G2wyl6spvpTQfKLGs5ouYnUeW9SwSBgW1TRXi5QvnsFRtXns0L7lVN0RHV7eGqGmtCLrSKWePO+3zj0Wc7/t2mp89AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>L</NaturalAnalog>' + 
'        <MonomerName>D-Leucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dM</MonomerID>' + 
'        <MonomerSmiles>CSCC[C@@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TsW4DIQyGd57CUrsG2QYbPDdRp6RVKnXv2KVDhz5/gTSE3J3U5CyEjo/zr98GHMD+4/vn8wuAmJkQLRJvoYdzQAhgADiMS5gZvDMiurLYRE/EuXL0mXI4fZVdhCe4llgefyqZU83doI9kNKgc7lEpXlLNJa8xjF5e7vTCp9yIYosV8X8q4iXSpS+yri/qWTScvSitU0les/SKlNd6sYSpV6SDytvtKsEHy70iSYPK8eFmld7dcl9yIF2jUkzQ5CBdQ7HNU2pzGlv6ApVGdaTS1tN/C8pzWlCaU27P8pruAY7Pr81GNdjsYL3/dWd32Dr3WML9AgCONqT0AwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>M</NaturalAnalog>' + 
'        <MonomerName>D-Methionine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dN</MonomerID>' + 
'        <MonomerSmiles>NC(=O)C[C@@H](N[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2TMW8CMQyF9/wKS3StZTuO7zyXqhO0YmBn7NKBgd9Pkmvh4CJxOmplSF6sT+/5LgFgczievn8AWESYyFVkDZcKAZgAHIBG61ruDnsholBOhi7W582rYC/KRSPMtwRvcItor1+KsMRCiSjRrEnhR5SE6t0/ePlLxJizjimfSxIpkvE40XY+RbHroz6YywwKmdNlLrIs0dXLM4k6NOX2l96tZlMSmgyJNPMSLaFo/aPkTh0knqo+VXNjaqqxqjZWYz3f92apb6rd1Fmqz/K2dwOw+/iqvcVgtV6GweXmfbsO4SVXOAN9/iOD9AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>N</NaturalAnalog>' + 
'        <MonomerName>D-Asparagine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dP</MonomerID>' + 
'        <MonomerSmiles>[*]N1CCC[C@@H]1C([*])=O |$_R1;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2QsW4DIQxAd77CUrsGGWMwnpOoU5IqQ/eOXTp06PfHwCW53p1U3VmWQA/7CdsBnD5/fr++AQIRBUTlSAd4hHMA2hJH+QxVhQ9CRKuDXfQsyJUHX1BivaG3V4Q9/FUs52DRRKlbQhTZauHMQy9L9623kM8lUO+ViGVkOa+zcOkTpZTK4l/Cf5bgVTB2i+aycbtPC3nROLZc1lhomGM20fVlxV5QZegNLLzFYmujyfKMpoYs85haYZzXGuI55btk6s1zakiafUrLolen9ARwfXtvhtrSTq27rS/H88G5Vwt3A8c+8dWuAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>P</NaturalAnalog>' + 
'        <MonomerName>D-Proline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dQ</MonomerID>' + 
'        <MonomerSmiles>NC(=O)CC[C@@H](N[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU/EMAyG9/wKS9xayx9JnMzciekOdAM7IwsDA7+fpIVeaSNdFaJIbZ/Yr147rgM4v31+vX8AsIgwUfYqR5iXc8AMTADLfVs5Z3gVInL1SzARS3kZPJKSVUZYTgke4a9Ee/+oUIo2qXiv2lTheyqMavJvL4QxWLrjZUdFpS81d1AUCksvz7tVBkKzchm/XmShcunpbkCJSbtUihcKMcwVxd6KSmqc7yj2dVcxcLBmX64Pu1Vu8xIwJko9KmGcS1nRCfGG8nqM3RhoTaojjUtakN/GFpS3NI+5DZq2fq3+8qvYM8D16WUqhGB61lHkenK6HJ07lOW+AbQH4tRQBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Q</NaturalAnalog>' + 
'        <MonomerName>D-Glutamine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dR</MonomerID>' + 
'        <MonomerSmiles>NC(=N)NCCC[C@@H](N[*])C([*])=O |$;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUsU4DMQyG9zyFJVixbMeXxDNFTC2oAzsjCwMDz1/nTmpDE4n2Lop0d5+tX7/tXALA/vPn9+sbgEWEiUxVdnBeIQBHjwFQsy/LzOBDiCjUr4JaxHPhSbDEqb4BoUcJnuGvxHjPKhlzyrmqRBTNZajC/6vQFC9eeJ2XhDGWcvaS16lMmER1q5e5L6mqKJKwNiqH21XaGRFTO6O321UUjXz0o77c4UWRbdrcl1bFK+J1XqL3hWlrReZeUh6qHB/uOHWWqSyTlqi2RiXP/4hc0QVxR3lAHaUhjTNNLXWkfa6jqaeOSk8dWU8NmIeU+tpSvaqucvcAx9f3peh61OvTk4Br5OWwC+HRVzgB6QOSHwgFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>D-Arginine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Tic</MonomerID>' + 
'        <MonomerSmiles>[*]N1Cc2ccccc2C[C@H]1C([*])=O |r,$_R1;;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UPU/EMAyG9/wKS9xKZDufnrkT0x3oBnZGFgYGfv85qY62SSVKixX144n79rUtxQCc37++Pz4BUNCTI4+Rj/ATxgB5oKD7kzWGiMAbI6Ipb8FSDkkfHskSSSwMre4iPMFcYnlVFW99Ih5UgmPaq8LWhcTbVMaK2KYoaauKIP6Dl7vKnr6MFTkbxO+uyOu3s4ou61WijeTjL15ovcqeGSXrWGixoj+oZEsccagoiZt6uT5s8pIdT728bJtRo7Lai5rgZgSmIlevM6rI97l6dMSeUqWtQgBqB26qaOhzlaY+V1HuqSLpqdz/Rg2lLlcR9X0odKEPuRyZTe4Z4Pr8OjSzDKLcNQmo7JwuR2MOGuYGRljDaZAFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>1,2,3,4-tetrahydro-3-isoquinolinecarboxylic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dS</MonomerID>' + 
'        <MonomerSmiles>OC[C@@H](N[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSMW8CMQyF9/yKJ8GK5djOXTwXxARUDN07dunQgd/fnIXgOE5qe7WsRHlxvjhPScDh/evy8QlkEcnMbkW2uEVKQAV6gEd5D3fHmzBzq8NGiNVt0IWKWlQytV3GCx4R8zmhKGmpPqKc/kLpi8bZTOKdjSjHJRShLNlmXyQ/UZSsq/pfX4xylf7WS1nmSyYV81nKefVrSrzo6kat6ksozbY8MS+FZDFO1f5ZbYU6q5ZQu7FaYj2t1fjej+oBOO9fo7Ph0pjr8I+Gnd1xm9K6RfoGFAiajzwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>S</NaturalAnalog>' + 
'        <MonomerName>D-Serine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Lac</MonomerID>' + 
'        <MonomerSmiles>C[C@H](O)C([*])=O |r,$;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1SPQ/CQAjd+RUkunoB7kpltsapajq4O7o4OPj7vbuq/bAxTQkh5AEv7+AAsb4+nrc7IhkF9uzFS4VfA0BUxCLWe96ZmeFFiCj24Ubd1rRMuDgvmjvJxSrhDj/DPOQa+JslbIOkWXbKXEyy/PORFopZ2ddyms9SOC2MJ7U0q9kspVPz2u6FWcIyLerieXzLYmRhyV7iU2R0AsiQz3GMht9ezr9hAtUcuwLUiM3hnKFEhJKQ/bECWEeDF8kKI5l8AgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>lactic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dV</MonomerID>' + 
'        <MonomerSmiles>CC(C)[C@@H](N[*])C([*])=O |$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTP28CMQzF93yKJ9H1Itv5d56hYoJWDN0ZWTp04POT5AQc5KSDqxUp0S/Ok5+TGGB3/DuffgEWESZSH2WDWxgDKNADNBr3UFX8CBHlPHTBikZXONlInoZV3iWs8SgxPapKtMSUhrOsHCZVeF4lSZBylq0XXVzLVeU/jpL1TuOMo1mVe3cbR18LuttlR86Na9m/ruJt6LmfdHRYvd/dji35SEtUYn0L8kQHxC3tW5oT0yT1lcYxzci1uZmGlqb6dR7pDjhsv6t6KaXOWm607HzuN8Z85DAXNaClG5gDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>D-Valine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dW</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@H](Cc1c[nH]c2ccccc12)C([*])=O |$_R1;;;;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu07EMBBFe3/FSNAympdfNYuodkFb0FPSUFDw/dgOZIMTaSOvZSX29fXReDKOAzi+f31/fAKwiDBRtiAHmJtzwAE4AtCiX1rOGd6EiFyZPBBayKnqgqakdURYVgke4T9iu3cURfF+SXnZT2HkZG1vGWWJC8pphCJIHOPmieQ6JeV0c14EA+u1WPZQJPKclzxGUdSsfopFUqBRSkrZT7EECYMnUowcbKoXMs9jFEOvU60p8jDFIyn/fiNLfjC7hpGSTXmJN+TF+C+C7HlZdftvQNkhZnGuurSgnO92x3K5AYQxkYxQyibuLptrkrVnp7Jfq8Wom+rkDUvVt3nvjU3tY0hbXrZm7wnFm7cITGtvbpCeq43QqwS8zk6RWNZeaZA+Bq2/+s57BDg/v065rxe1vkOty7rydDo4d1+a+wHsTadXSAYAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>W</NaturalAnalog>' + 
'        <MonomerName>D-Tryptophan</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Ggu</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCC([*])=O)C([*])=O |r,$_R1;;;;;;_R2;;;_R3;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJViJ7Lwaz4CYeIiBnZGFgYHvx0l5tEkFBaKoSk/sq6ubRAGsj5fr6QyAjI4skUezgOdQCoiAUPY78zWYGQ4GEZX8zFC7SDZx1D5YbFeyizCHRzP1tXpTtR3GWtOuxI4fVHk37yrsmvDBy0cV0iEY+tNLJxfSNsZ/vYheaFzXy34yWsVo24ThXLbfpPs4I9IRe7mMV5mRJvZxMN3NLyqVl/G5iAoTmsFcRqvI4fj8DQXl4tq31NRUkK2pIFdTQU3uKGmoa8VWrGt9ftllLacnX9A1wH61y06SfLaeIkpm05WkVLHcLJSaylA3DWsS4lgEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>gamma-glutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hiv</MonomerID>' + 
'        <MonomerSmiles>CC(C)[C@H](O)C([*])=O |r,$;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxFd3+FJVipbOfZmSKmAurAzsjCwMD3k6T0XalVsTw4N/GJ7QQQy8f783whkohiI6ydFNgaAKJHdGG/553leY53ISKIK87EGBcjyrQw1VHYJTziEDHvUGcYzdLkejtLkQXKgTJ2SrW18B+1cM3zbHWPcl1PSXPxv0hb3krJHXVz6ddS7dZSYh/e+YXprqAob5uO2G96aROSRw8JjcRT1U7VcFDPqiqp3FdV+sXjsyp976FaIlbnW1LjpShROV0KgH0w+AKtE1QKNAMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-hydroxyisovaleric acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>dY</MonomerID>' + 
'        <MonomerSmiles>Oc1ccc(C[C@@H](N[*])C([*])=O)cc1 |$;;;;;;;;_R1;;_R2;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUsU7EMAzd8xWWYD3LdpImnjnEdAe6gZ2RhYGB77/EhTbXVoKGKGqbF/v1PceKAzi9fX69fwCwiDCRhixHmIZzwKFOoGbOQ1XhVYjIlcVBMBeaijMGSal+EZZdgge4pdiexuIxypDHXFbyDcv57yymhWuuoERptTzv1JJGR8TRbzqS31gCSuC5LtpXl4Aa46wl9LFEHBLxj5ZMfSwD+hyGSUv8h5ZalwNhab9OLVaXuV8662KO0sTS6SghqU6OuD3pHV0nhSXNJ80Ny+VuR12+u26srvSwlIbnRYM7g4I9Fyj7NRosfQONhg4tGm29iGXaQiEZulRW0LyOzcBrFxXSdazaD9exvOFC7Ga8RU8Al6eX0XS9Luq7tiTXncfz0bn7MtwVl0xo33oFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Y</NaturalAnalog>' + 
'        <MonomerName>D-Tyrosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Nva</MonomerID>' + 
'        <MonomerSmiles>CCC[C@H](N[*])C([*])=O |r,$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVgb2YmT1jNFTC2oAzsjCwMD30+SAn1KBWpFSnXsXl07iQKoLvfH9QaAgkyWrPWmhE8oBSAARcj3VhciAmeDiKEOMqeNeBs5ao+M7VfIIuxgKDG/korXSJi3/5KQm1Uxyyq5cWatl1yzFb/gZVGlmwtpNtL3cvxjLlnoyNq+l/p7FdauoGK2o2bzg5fXdDPSyB7/Uyk0OaZ1ZxQaoNF1UG9EU5pPaSj0s9QmSn0aEE9rfXohY8rp6QxpBdAcTkk9Wkl7PAyKmX1dKrUNoZ794aWhmAMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>norvaline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Har</MonomerID>' + 
'        <MonomerSmiles>NC(N)NCCCC[C@H](N[*])C([*])=O |r,$;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UMU/EMAyF9/wKS7AS+TlxYs8cYroD3cDOyMLAwO8naQ8o10rcJYpU9yX9ZL/EDUT714/Pt3cids5IEEB29DNCIGRCauuL+TvcnV6EmUN/qxEm2oK7EsXRI+LYVpnu6S9ie06UEpPWcqLUIpsU+Y+i0dVyp2hUzduUS3KxjE7J0XIdrKjlkoTnitzEF5TD5ZQaC5ucKrJsC8rTNRUxMPkisXixsVxKzKlOviC6M0bd5VR9pkgxjPoiBT5XxKx5lKKG2im1OZSWJ328ueKkWwPpiaKljlLcss+3DqLDfZTBUx+lFpmNUNrnOGu28C1hpQJrtW3UTTVNKpZqk/J6bzPR1qoReEslX6tK2Mh3/q+dqU3CZg5rdU90fHyerehXtz97e6KvPBx2Idy2Eb4AKg2QzWQFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>homoarginine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Tza</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](Cc1cscn1)C([*])=O |r,$_R1;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSP0/DQAzF9/sUlmCNZfv+eqaIqQUViZ2RhYGhnx/ftZBrEok0nC5K8uz89PLODmD//nX6+AQgpcCe7ZId/C7ngKVuoG6PS1XhTYjI1beIoZRkD4NHCkWqRmhVgge4RizvRkko5PlMCYnKIoX/pijn0Yv/h5f6x0NAKbH3criFEinWNAYxivS5PK+nZExexly0oxzvVlPGMwqY9CqXGyj2bZbqYGDMqmlbLhF9jOGSS2o5bzojokwXLzHzNkrELLmdEaEW7r28rqcEVJJ89mKuNk2dtOnmfsZNDT+Faa+fqybFVpuqad5r3DxXbdB1rirUXCZck5hnvSbxgt/S1KkznfxuVfcAx6eX1lttt3sNlmvl8bBz7t6W+wYVumhSwgQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>3-thiazolylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Cha</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CC1CCCCC1)C([*])=O |$_R1;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUPU/EMAzd8ysswYrlzyaZOcR0B7qBnZGFgYHfT5Je76qmAq5nWW3z7D752XUDwP796/vjE4AyGSszJ9nB2UIA1upAzbldL5ZzhjcholBPikk9lYcHxkHrWyUdS5TgESaK33xiIZPKImjucZWF/2IxdBIbWVL2jbUYWqSmSDFyntfy8n8WR1HhsRZnshnL8e6KvlA0Pyky8hnL4RpF7qTjjIRT2tYXQR2ITjOSRNsUlb4MNlXAaX3SVygi1KwbFZ1ruenbdcwxy63dvbBsVyRtR3i+KSOqi+UJDbIWW6Le55asoUfLOfZoSUwdyrSaG4G5R3NLXzIwsPSotP/UCkOH7gGOz69NS5XY7rXJXCNPh10I98XCD2iKT6MeBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>3-cyclohexylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Edc</MonomerID>' + 
'        <MonomerSmiles>CCSSC[C@H](N[*])C([*])=O |r,$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TvW7DMAyEdz0FgWaNwaP+rLkpOiUtUqB7xy4dOvT5S0lxqloGEpsQYPkkfjiTtCE6fnz/fH4RcWIHC9gkB7qGMQQQWM+b9RcpJXoXZjb5jQeFjLrZ8wAOXDU9ZXqk/4jldaFwVGylAGGRIjcommtt9DU35NwtXvYYEMTVXJ+cNJS3+ynqRWKou1HGsaGc7q8LBovJS9BGNZSXVRQRe/GCqUKFcn5YUxcv0xdZF7ZSfO10dsU+bqtu7lEsdZGBhdserep0sJIqxTu3PHU3KJqE2WiaSUKvxl7Vi35RtUVFq6rk+ruaPvaqXky9msqfPVNVAubqkej8/FqcZNvlmccY+eTpdDBmp2F+AVBzmV9QBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>S-ethylthiocysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Cya</MonomerID>' + 
'        <MonomerSmiles>OS(=O)(=O)C[C@H](N[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPU/EMAyG9/wKS9yKZTt2PmYOMd2BDomdkYWBgd9PkvaOqKngrlHUNK+tp29cxwEc3r++Pz4BKJOyZ5Yge7gM54AZmEq8TW7P35FzhjchIld3HpO3VF7uGYNnXzXCEiV4gDPir3mmkEqlCKpZXKXwfxRFI9GJkrJt9KKokdqJPEbOvZfn6ymG4oUnL8akHeV0d0NdKKrNJ1KyjnK83ougD0RzdSXRVi9iU3UZSWPuKK83/em5Xwg1aNhWXcEQMq923SbKdi/S+pL77pxUv2hY1yRtsaVqY27JCqNapDiqZZ9GtUh5/FpqN3tF5SXhAHB6emm51WBb62XgGnk87p3bleF+ACfhaqFQBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>3-sulfoalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Spg</MonomerID>' + 
'        <MonomerSmiles>[*]NC1(CCCC1)C([*])=O |$_R1;;;;;;;;_R2;$,@:2|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TO28DIQyAd36FpXYN8oOX56TqlLTK0D1jlg4d+vtjuKghOaTmDnmAz/gTZzgHsD/9/J6/AVAxkJDExDv4G84BYQ3o4zZUFb4YEZ0tNuIpBqkz8hRKqjvQWxZhC/eKcTQL+0j5akmZy9BC/1nIFyadZsyKa8+CU+0GfRCMay0lcpwsUjCvs1h3sdWaj+2aOsvheQt5FdGhZcFZbhbxWKi3fCyxEOY0nYUU+zs6vizoi3Ic9+Vpiz0nfnhUriFplHpqKMz3GopzSkNq3jSkeU4NlZZ7pDrfm9qfek/3AMf3z2aoJe0za6OpZt4OO+debbgL+J9yWAoEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>1-amino-1-carboxycyclopentane</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hse</MonomerID>' + 
'        <MonomerSmiles>OCC[C@H](N[*])C([*])=O |r,$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuW7DMAxAd30FgXYtIR6yxbkpOtkNMmTv2CVDhn5/ZDZwfAio6xICDDzSDxQlBYDu8/r9dQGIFpWEmBMfYIwQAAwgl/xkPcLM4MwxxlIHL4xRTAfOmES9MmLJRniFuaK+FhZBSdkmlo+/WNok/i8hW6MTS7/HwkhMWt0R/WYR1CbLf+eiSJnbsZe0z0IorFa1nJ42W3xH92nkLLbPopit5epcNp80+/x5QQvSxcH80HZNS6FUaXJKU1pQs64VfyFL2vjTmdMO4PR+9H6HVvybhzs6ZN76QwjPJcIN/QN8tJgDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>S</NaturalAnalog>' + 
'        <MonomerName>homoserine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Dsu</MonomerID>' + 
'        <MonomerSmiles>NC(CCCC[C@H](N[*])C([*])=O)C(O)=O |$;;;;;;;;_R1;;_R2;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU/DMBCGd/+Kk2Dt6b78NVPE1II6sDOyMDDw+2u7gYTaQmmwLCd5fXny3vniAA5vn1/vHwCUyVjZW5A9/AzngD2wlf02ua3zyDnDqxCRq0+KiUzKzU7QvI9VIyy7BA/wGzGejWIYNfGFEpR4SPlrTpSUYq4URVWvC8rzeopHi3nyIiH6BeV0t5qiSNH8hZKMlpTjei+CGoim6kqirV40cz2ZHWM0lm3VnU+akSSkrZRvL4TKov/0Ut41ks0ZTV6AkTmMe/cGL4xJeWPvzl4EvfmwrXcNg+SxlxsoxUEI47qs7t3yabn68V2TtK3XqvWx5dn3apHCMDa2lZdqkVIfW6TcqxmYOrVIzL3KwH1uRWIdqtZlXAldbgeA09NLi63laNfaBlx3Ho975+7LcGdaVuSnwAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2,7-diaminosuberic acid (2,7-diaminooctanedioic acid)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Oic</MonomerID>' + 
'        <MonomerSmiles>[*]N1C2CCCCC2C[C@H]1C([*])=O |r,$_R1;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2UMU/DMBCFd/+Kk2Ctdc9nO76ZIqYW1IGdkYWBgd/fcyrSUBuFpliW4nx3frl3luOIdm+fX+8fRKwcIRDRsKVpOEcQQrT4bJ6HqtJrYGZnL5vkg2apnH3myKeVRZke6KdEf44q2TN4OO2FInVVwrLKEFK4tZbBR9G8UMuiyrkv8DHovJbnFX3ZmCOReS37v6tEnwpK19Hh7gpHAta6gqmIrFOZuts6uqK7xSNF3HrSxZdc0q0nPan8jyPrLse8ypF9GhfXxH0jtHRoqSXmLpWRYk4NxTbXtpeWak/X/jI10MltdcG/UKClILSODUEu6Y7o8PQyOqztGJ/1oqBGHvdb5+5tuCMj7+BgNAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-carboxyocthydroindole</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meA</MonomerID>' + 
'        <MonomerSmiles>C[C@H](N(C)[*])C([*])=O |$;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSPw/CIBDFdz7FJbqWHMefHrM1TlXTwd3RxcHBzy9gFNqS2MYLCe175JfHHQKgvz6etzsAamSlFBqkDr4lBAADtMEvVi7vPVwIEUX8s9Iwu/DRaImGKWoog4uwgzGivhLFSUKt3hTjkKsU9ZviVZuz6D+yxBs3RhLbMstxDSVkaSOFJJEus5yWU1rpNOW++IIybBZT8oyMdH7UlxWUdCNbpSzuLqUpqnKWQTUfY3pWz9Ug2eRNVTc/a9Irrqg8VXuA4XBO3AhKexyeis7+2AmxDSVeeHj/CTwDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Alanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meC</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CS[*])C([*])=O |$;;_R1;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TsY7DIAyGd57CUrs2sg0kMLenm9JWrXT7jbfc0KHPX5v0UhKQLqnFQH7sjx9DDED/fbv//AKgxY6IkCIfYAxjgBAgyno2XhFjhC9GRKNf2AQXaJg5YjfMZBVhD1NEfTwpZG2b1dYo/A9lh40PGEYv7VtedtRw9DzWUka5rjyRH1wFdjGjHNdQpLvJi7iyXd7d03IKNb7lp5fZiS6bxX3R7urDSB2aellBYamIXfWOllOGvtS9LL5p2Zpmj8r8SVSqXalKoq+qNqmUqyK5MlfKQ6m69PeVudr9qdoDXD7Pia4GdW8FapYiwGrGx/FgzFbCPAA06bHO/AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Cysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meE</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CCC([*])=O)C([*])=O |$;;_R1;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1Uu04DMRDs9ytWIi3Wrt9bk4gqAaWgp6ShoOD740e4O2wLElsu7PHs3IwfB4jH96/vj09EMhSZmYzXe1waALJG5rS+6WsTEXzTRAR5RiqGGNLgkZR2YiuWVgmf8Ke40frVryrsrbmOnNFDlb86VAfOkVm8TKqw0t76xcs40X8qyMqJWRPRrBcJJUdNtFU5P9yXyNVaCXGb6OXORHZRoTmVcl98dUXRbr2cblfRylBYb52f2pd667h6seJlTqXsCw1Vbj5pV94IN2iayxDVDR0KZHpugmyPJiiUihb1PTc5iz3XIVPPlfLXGKC6RY+I5+fX4i9/tFjPW5iJ+UA4Mw6nPcAuNbgAgUr1s7QEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Glutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meD</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CC([*])=O)C([*])=O |$;;_R1;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TvW7DMAyEdz0FgWYNQVLU39wUmZIWGbp37NKhQ58/ooDEimWgjgUBhk/U5xPPcgCnr9+/7x8A8pSZmXyUA9yHc8AMTHW9m9MopcCnEJGzt4Saydb3gqlINI2wrhK8wiNieTZKxBRDMIpHoUCLFPmfQoEnL2Gbl4Dex7sXLdsoilFk8qId5f1JL7Z3r0hSei+Xl9WUlhEbhbHEFLd5aRndvHjqMzqvp2TkolPSsu1EU9KKqg9JP9eX1Ho6UlYnnQB49mu6m8SjWka1FuZF1TeVe7VKOtZWKS6qYXSW282e12a78jP1BHA5frRvGr49rVl2MGs9W8Xb+eDcrg53BRbEn4lYBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>D</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Aspartic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Cit</MonomerID>' + 
'        <MonomerSmiles>NC(=O)NCCC[C@H](N[*])C([*])=O |$;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK1UPU/EMAzd8ysswYrljzgfM4eY7kA3sDOyMDDw+89Ne1zVVHBXYUVt8+w+PdtxAsD+/ev74xOAKkVWZlHZwY+FAKzA4v62uD0vVmuFNyGiMOwUi1rxjwfGpP6jG6F7CR7hTPHbOrNQlIFFMJrlVRb+iyWikcSRpVTbqCVizNQyUsxc51permcx9KryqMWY4ozleHdDXShHmzKKZDOWwy0ZmZGOPRIuZVtdBDURTT2SQtsyumgh1KobtRiy6tQZLjVtq4t5TQuPWkSkbtOS0JKk/9PCSDHPtVx96qTNCM8nZUR1MTyhQbH5lqj1sR6VetT3uUc9sPRoXY2twNShDjH3KLcbaQXVZRZ7gOPza0OHZNp7OGY8eJ4OuxDu3cIJ4pof5ggFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>citrullin</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meF</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](Cc1ccccc1)C([*])=O |$;;_R1;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPW/EIAyGd36FpXYtsjEBPPeqTnetbujesUuHDv39h8ldSANDjlpICS/mkb8wAMfPn9+vbwBkTKTG7gCLGQPkdQGuVjURgQ+HiCZvntgGjJPqzmKMXv/Q5lOEZ/iL6K9C8ZYdid4lG8KE4xR3vZs8DlJKRnG+691oRs4mYbrGwpL+QcFbXfwwhWKqPXJjFLI++BpL6FLcLkqty5py2h8L2uilZjTY6ULhmSLoaEV5u4eCPNFSl/W8nB/u61FYpo7GKCWj2KXsrguVLlKrhk17Tdlzq2bJt4QsTa3vVLhb3yzFVk03lTaq9HwJGzVLRE0MqnYyFiDuqk1uR4Dz6/tcNn1c+tWxIj15OR2MecxmLlGHX2R6BQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>F</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Phenylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meI</MonomerID>' + 
'        <MonomerSmiles>CC[C@H](C)[C@H](N(C)[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TvW5DIQyFd57CUrsG2fwYmJOoU5IqQ/eOXTp06PPHmCSX3iA191oMcAwf9kEYgMPnz+/XNwB6zFQjuR3cwxggAkLJd2OKUgp8OEQ0stigTSn7NmOKdQZoJYuwhb+I8VAK2VBcbhSHOltOkRMcke+1xCGF/qOQ9RzdrRZP62pRytUNdlQ6ymlhR/HqUMC+o+Pz7soJ9pO7ZZUvjZJuHbmVvjiLqUxvlDrK+WVRRwGbLzl6XEXRNwplSHm6I7EhzcxrqntU/XCvqDxUg6rUqyJFReNMLY8EuSqryr3K+rPne7l++Zl6ADi/vettFa8NVYuoZvbHnTGvEuYCkEjMZlAEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>I</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Isoleucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meH</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](Cc1c[nH]cn1)C([*])=O |$;;_R1;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1UPU/EMAzd8ysswUplO1/2zCGmO9AN7IwsDAz8fvLRllwbCRorUt0X5+k5L4kBOL9/fX98AqBFoRyRT7CGMUA2D8Bm/Iaqwhsjosl/NLH3MWc4OSasWZpFeIRbiv4wdYV3xMtaCV0W/oPlASeK1q5aaEhLYhGJsmqJYyw8URBf+WyIblSLErlZFXkdY6EpBDd3xBJajy5HWCKy1gyduCGW6jQtHYVBlnLqZM5caJ1+OcKiqaXV6VbL9e6AR/OpS/vCLDrEUjsKXZb/Op0vH22uiVkg2qHZhS2aCrWL2oJSiybI7WtDQbcaYrc2oX5fmyDZ10qh3qIK1OlNy+t1i54Brs+vdSvyccnfbD3lmafLyZj7FOYHlxLb7h4FAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>H</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Histidine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meK</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CCCCN[*])C([*])=O |$;;_R1;;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUvW7DMAyEdz0FgXYNQVLU39wUnZIWGbp37NKhQ58/lN3aTiSgjiNosD9Rh6N1lgM4fHz/fH4BkKfEzMRB9jAN54A9sNj6Ys6jlALvQkTOXnaMwiSVC1LhUp8IbZXgCS4l+vNXpYjmupcxpqJdFflPRTD6MnkR2ubFow9+9hK2qShSzHd7UUxZ7vYSUEuavfBC5bjljAhzUN2qMuelcFzm5XW9CllHoZ+X08NqlSEvftyrepHdG1SidcRp8hK3qQzfpe9l9UnbJr76Tdwf4oYytdQKc5f6gfKSGtK21lBoqaHYUkOppRmYW5qGG6lT66/pAeD08jZaJhibr5GvojV4vlY8H/fOPdpwZ4RdzEcQBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Lysine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Cap</MonomerID>' + 
'        <MonomerSmiles>O[C@H]([C@H](CCC1CCCCC1)N[*])C([*])=O |r,$;;;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2Uu04DMRBFe3/FSNBmNNfvqQmiSkAp6ClpKCj4fjy7CknWKxIsrCnW1zvHvuOHI9q9fX69fxCJSkQAkP2WfppzhGxBchanpqr06kXEtc5GuSRfTPec1Kt9CbdRoQc6JuOSdRETpbL6co3ir1NCjGGmiGhapfwWjbKBcAhZVin72ylgZKxTDnc3UmhTOEHXHf2BUjmlUi0X7OHzGeX5VkdGKYjecgOHqmWEYtVFTkeKlDCyR3bqUkWdKVWljFDO1xI5lohRSi061TS1CiGPUdDO/byCxF51cC0nyv84iiwZw/foWN1xR5huPRZqk0Kvtn7s1SalXm3peVUti2dmnq1O/2Ixm/aqkt35BbdJQK+mVRXTy7tUPaF33CT0jpuE3rEROu6O6PD0Mjm0ItmolYW8jTzut87dt+a+AUx9RCQyBgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>gamma-amino-beta-hydroxycyclohexanepentanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meM</MonomerID>' + 
'        <MonomerSmiles>CSCC[C@H](N(C)[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPU8DMQyG9/wKS3RtZOfTnmnF1IKKxM7IwsDQ34+TgzTcReJ6VobL4/Or15ZjAE7vX9ePTwD0yFRC3AFaGANEQKj57txCRODNIaLRyz5YIseFo2ViP31pFuER/kqMz48Ku1xq92gDCXUq53tU1EsutWRT8L2X5zu9uKk2YJRhR/SfSrQx0G0ucdtcknUx+V8vibapZJs4to6S2+pFMubWUepUXtereOuFW0cxdyqXh9Uqbbq6L+wpbVOp+yJDldVz8XUX3IwqCrMlmagsaajlAxorpZ4qSst/FfGSKspL6urLHlCa0xPA5emlmiu2q0ksb6tkjueDMTsN8w0szjkdUAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>M</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Methionine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meL</MonomerID>' + 
'        <MonomerSmiles>CC(C)C[C@H](N(C)[*])C([*])=O |$;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVixbOc9A2LiIQZ2RhYGBr6fJColtJGAYmVor50j+7pVANvz7X65ApCmwDmcrKAPpYAZmFK+Oq+IMcJJiEill4Wgt4azLsjGu/xEmLIES3hHtE+haDQudHcjk/xLYfTaTqQY5KCpn8hPowiSjr7vhZsU/kRh1GLpX3drSvRSU/ZTJio7qifafU8hdEy294UqynH2Qy/pq+v2a+KbLz9Qii9tytfu6rJFHqj2qfKgVsa1STVNQmiqbqwmyRf0UI3j2lD+7IY6mmILcNwcCjeDSut5XZwz691KqXkK9QCg6QogUAQAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>L</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Leucine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Iva</MonomerID>' + 
'        <MonomerSmiles>CC[C@](C)(N[*])C([*])=O |r,$;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPW8DIQyGd36FpXYNso3P4DmpOiWpMnTv2KVDh/7+GKLkuNxJzYeFxPG+3CPbQADYfv3+ff8AoKFQosTEG7hECAAGUNzvxhhmBp+MiKGuhiilqH+sUkQpXDWM7iKsYYpYHo2ikTHRiSKKZZFC/1OM8phLeiKXWvFKIpehz2V3D8VzyZXCkTn1uexvp+SofjqXvlhHObzcTBnPSKLapC93UayYnipSTfZYdyXmLGNF+REKt7tA/Y1wVc7G9d40V10amnet6nyvc/Mit8xVak9nqm4BDu8f7Y+Kb3Mtm6rzttuE8OoRjqyLgHaYAwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>isovaline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meN</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CC(N)=O)C([*])=O |$;;_R1;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAK2TsW4CMQyG9zyFJVhr2U7iJHNBnaAVAzsjCwMDz49zFLjeReJ01MqQ/LY++XcSB7A5nC/HEwB5ylwjygoe4RwwA5Ple+sZpRTYCxG5elIsotk2H4JZAleN0LIEn/AX0V6/FGHxleJRvGqTIq8oEUNJ/9DL3RGjee1Tvuc4CkjKfUfb6ZSAKfvwYi4TKKSFHnOReY6evbzjKKEGbt/0bjGZElHl5igYL9I8it10CvFG8Sn5OdO1gfDgabq7xGO1jFUrjE3Vdyr3VZN0XGtSbqpp3FnsfvawNtYvP1A3ALuvn45Q2+4M1UFzzay3K+eWFu4KZDxyIFAEAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>N</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Asparagine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meQ</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CCC(N)=O)C([*])=O |$;;_R1;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUMW7DMAxFd52CQLuaIClLlOek6JSkyNC9Y5cOHXr+UHFiu5aAGAohwNAj9UFStBzA4ev37/sHgDwlzhZkD5M5ByzAbP7Fmm0YBvgUInJ5J5jIwgG6Hk1PMyM0L8EO/kvU102FUtRRpe+9r6rIIxVGr/J0LoQxaHqQy4aKrC/5bOdRKCxzOW1W6QhV803ccpGFyrGluwElJt+kYrlQiGGqKLZWZEfjdEexrbseAwet9uX8slllnpeAMVFqU5n/gEJlc0XWVl4NuLsjLihTSS1Qq9RfKS+pob6MNTSU1FCs0lTmq9dXYx2r+TlZ0QPA+f1jLI9g/OYx5+x5O+6dezVzF1faf9+sBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Q</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Glutamine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meS</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CO)C([*])=O |$;;_R1;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTwQ7CIAxA73xFE73aQAsbPTvjadN48O7RiwcPfr+AZpuMxDkbEpLX8lLKpgDay/1xvQFo1t7EqKiBPpQCEAAf8qM1hIjAmbTWoQ42hJrFRk7o2KZKjSGrYQufivLKLIzsvIwsh18steN01iBJZUeWbomF0JCxxRuZbxZGW3n+dy4Wjae678Utm4tBJitFy2k125Ju9J6G9yzLLMNLTyyz50Jp/pTRgGz2MC9aT2ko5CJ1iZoxDaia1nL6QwpUctoCnPbH1G9sJe0+fqMxs+sapdYh1BNuMuMbmAMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>S</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Serine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Wil</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](Cn1ccc(=O)[nH]c1=O)C([*])=O |r,$_R1;;;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2UsU7EMAyG9zyFJVgb2YmdxDOHmO5AN7AzsjAw8PznpAVCW4m7RJGa/kk/2b+dOoDj2+fX+wcAKjJFYsrhAD/DOSCpE7Cbv0NV4TUgoqtv7IPkYospeuZSV4DedhEe4C9ify6UjMiVwp5YaJdC/1HES+C0UAhxNJZIJc+UkpN0lNP1FPGaclgomEJHeb6JginO7sZcUkc5311NscooL+4q0SCFvRW6+UI+FC1jvlhlNNfKTMFjoN6Xm2qUospMyZSHa8QplpmSSohjsYgvLDL7okKDXWexYMTFXeE8SsmlfTuh3YXYZ3RD19VeC4svKGmIEtp9pf7WmsrfG+uzcauaJG1vrabtWePmrWop6FZVqDVaqSYRbVWC2qGrGEyinXjLnmoS8TYLbf/XNRdXhlX1CHB+emlna+LtWQtMdefxdHDu3oa7AJ0L7bLWBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>alpha-amino-2,4-dioxopyrimidinepropanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meR</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](CCCNC(N)=N)C([*])=O |$;;_R1;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu24DIRBFe75ipLgNmhevOo5S2YlcpE+ZJkWKfH+GXcXGC1LsXYS07Bm4uswADuDw8f3z+QWAgpmIUJn3cG7OASmQWLzpl1ZKgXdGRFf/stfMbINH9llCHQF6iyI8wbXEuE8qyaeYUlURz5ryUIX/V8EgFy+0zkv0IjmfvaR1KsFHVt3qZcpLrCrqkUkblePtKm2NkLCt0evtKuoLWulHebnDi3oqYXNeWhXbEa3zIpYXwq07KuYlpqHK6eGOU1cS5rnSLFrWqVilmWlWCSyrzq4tosVlc3+IOkoDaigOqUyUWmpI+7mGQk8N5Z4aKj0tQDSk2O8tTq/dcm6sz+CCHgBOL29zKuo1ql9bClQjz8e9cztr7hcZBNzwZAUAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>R</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Arginine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meT</MonomerID>' + 
'        <MonomerSmiles>C[C@@H](O)[C@H](N(C)[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1TsW5DIQzc+QpLzVpkGzB4bqJOSasM3Tt26dCh31/wqyh5QWryLCTgjI/zIRzA8f3r++MTAAMWaiG8hx7OASGA1vww/kJV4Y0R0dXNY/CsnBvOnlBshb5mEZ7gkmI+jCXWisxLbRGlgeV0O4tpkUWLBpKB5eVOLaaAvGikaUf0H0vyMQh2lrDVl8wk3d2yTYuxpO5L3uYL+5RL6B3xwHJ+uK+jXwUxiWxjsZcuU5ab3Q3mHK/QaCiNrjrblJXRy1meonKNVihN0Xx9G9vvW59l+5aX6BHg/PxqFU2gzdpeqGUOp71zuxruB5TE9q/0AwAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>T</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Threonine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meW</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](Cc1c[nH]c2ccccc12)C([*])=O |$;;_R1;;;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWVPU/EMAyG9/wKS7AS+SuJM3OI6Q50AzsjCwMDv58khV5JK12VsyI1feM8clw7dQDH96/vj08AFDSqpnyA2ZwDSkBW1hfjYjlneGNEdOXlAb3GbFVnr4JSZ+jLKsIj/Edsj44inkNYUl72U8iTadtbZpnTgnIaobBHSmnzRHSdYtluzgv7SHItlj0UTjTnJY9RxEuWMMXCFnGUYpbDFEvkOHgi8YmiTvWCGmiMoj7IVGviaZgSPAr9fiO1MJhd9QlNp7ykG/Ki9BdBDrSsuv0dUHawapqrzhaU893uWC4dgD4Z8hjlcjOsKLvzwq1fuVOLpF0jN5XCWi2OsqlOvrRUixTXvqmpfQy25Uva3HtC8c1bBMK1b26QniuN0KsItM5OkYjXvtwgfQwCtHFiqb+RTj0CnJ9fpy9SL4H6jLXm68rT6eDcfTH3A7jDAvykBgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>W</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Tryptophan</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hcy</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCS[*])C([*])=O |r,$_R1;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ1TPW/DIBDd+RUnNavRfYDNzU3VKUmVStkzdunQob+/B3YSGizFzokBHo937w5wALvzz+/XNwAqBhJiCryFazgHhABq+9W4harCiRHR5RX6FBKNs0AcxpntIrzCf4n5MamQSF+dnVPhByod+r5XnrwMFJ/y0rFnuVYUmCqVz5UVxdFV4qCVyn6NinW3VETmaqi7e1iuQj72PHmxo3VFx5fFfUEfU34Y0DVeVqiw18iXm46Kz6mQlyTDrMrimzYTdPeo3AWiFh1a1IhxFpWCUo0aMbXcUP7ZPSrlA7bcFt0BHN8/SsJsMOfOaTIrC4Nkxtt+69zGwv0ByVlr6/wDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>C</NaturalAnalog>' + 
'        <MonomerName>homocysteine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meV</MonomerID>' + 
'        <MonomerSmiles>CC(C)[C@H](N(C)[*])C([*])=O |$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVgb2XnWMyCmFsTAzsjCwMD346QCColUKFakpsfJrX2bKIDudL2dLwBosSUidGjW8AylgBCAJT8ar2BmOBpEVPLSeG042MRRB1EaZpJFWMG7RH1klaCRMA57iclXVcy0SjTepL2kneHZtTxU/ukoamc5THQ0qfJyt+hoN8PdRjqydlxL/72K076lttrRYfG7uw1pdAHnqWRf6ipfuys/hz4OlXogKmlbUlkYq9RlSmMqyJZrhfqSxnz7Spqu5TvtAA7bff5mKjA/OZ2WlNn0a6WWEuoOyOaAj/QDAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Valine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>meY</MonomerID>' + 
'        <MonomerSmiles>CN([*])[C@@H](Cc1ccc(O)cc1)C([*])=O |$;;_R1;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVUsU7EMAzd8xWWYD3LdpImmTnEdAe6gZ2RhYGB7ydxoc01kbiGKFLbV+f1vRenBuD09vn1/gFAliIzk7NyhGUYA+zLBKrmOlJK8CpEZPLDQTCySMEZnYRQ7gjzW4IHuKboT2Wx6GWK81pOZCuW8+0sqoXLWkHxUmt53qklzI6Ive064r9YHIrjNZc0lovD5P2qxY2xeJwC8a+WSGMsE9ropkWL/4eWksuBUEQGtWgua78M5qKOwsIy6CggpbQ44nqnd3SdZJaw7jRXLJe7Hbn8dN2croyx6DmyXZabc7F6RmSDZshtDo+ibFvU6fIO6hXlGs3Q1NQy9VAIim6VZTS2tRG4dVGg1NYm/WBbyx0XAtzJQfSve42eAC5PL3MUZUvKtbQ7lzeP56Mx93mYb60UuPXWBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>Y</NaturalAnalog>' + 
'        <MonomerName>N-Methyl-Tyrosine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Sar</MonomerID>' + 
'        <MonomerSmiles>CN([*])CC([*])=O |$;;_R1;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxF93zFlWBtZTdpHjNFTC2oAzsjCwMD308eFNLH0ArLSpxr5yi2IoD29nzdHwBJssxMiqsGXxMCMID2+cx/5pzDtSIiX4eCSsPWpUiTDhGo9FnCAWPEsn8oREqliJ2q/6DIdFdLUhnlvIVi2IWOCy6VZJtRutUUBArxMBfDGaXfrX5LeIGsU2TV0NtWSpyLXqSsnq4fJkcfqf5czVUvybhO1Xpeq+JPW1DNVG2B/nSJnACKe2iKQ+bYNULsvYk3ZnYCAeACAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>G</NaturalAnalog>' + 
'        <MonomerName>sarcosine (N-methylglycine)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Orn</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCCN[*])C([*])=O |r,$_R1;;;;;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU8DMQyG9/wKS7Bi+SvpeaaIqQV1YGdkYWDg9zdOae96dxIlRBkuT+w379lJAti9f31/fAKQk7GymsgWLiMlYAamuj+Z43B3eBMiSnXxwChMElyQnD2+COsuwSNcS6zPHxUXGyKXsWzcVlXkNxXBon7xItTnRVGzjl5yn4qhl3JWycQTlX1PXQiHbNarMvbIuUx79HK7CqF5Xu/R4e5mldYjPeWaXd2XP6jkWo2BT38k2uvFkMqg/7svm1qO2dVMZ8RLOixpDSyrVBvlKa3IlrE13Zc0tzc8pxaPe04D5TndARyeX9uZYTscxTHNU5RKI+Jpv03pvo50BJ5hYzNYBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>L-ornithine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Tle</MonomerID>' + 
'        <MonomerSmiles>CC(C)(C)[C@H](N[*])C([*])=O |r,$;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTuw7CMAxF93yFJVgb2XnWM0VMPMTAzsjCwMD346QqFBKpUKxIbY+dW/u2UQDb8+1+uQIgoyNLDqPp4BlKASEAS360XsHMcDKIqOSh8dpwsImjDuiwv5MswgreJeorqwSNhLHfS0y+qmKmVaLxJu0l7QzP7mVQ+WeiqJ3lMDHRpMrL3WKi/Qx3G5nI2nEvu+9VnPYttdWJjovf3W1Iows4TyW7G3tfkMIsd+Xj0MdPpQZEJW1LKoWxSl2mNKaCbFkr1Jc05tNX1qZj+U63AMfNIb8zNZivnFxJmfWuU2opoR7slh3r9AMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>3-methylvaline</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>fmoc</MonomerID>' + 
'        <MonomerSmiles>[*]C(=O)OCC1c2ccccc2-c2ccccc12 |$_R2;;;;;;;;;;;;;;;;;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2TPU/EMAyG9/6KSLBS+SO245lDTAfoBnZGFgYGfj9uUsEdZoBEUeU+cd46b52llOPL+8frWymgqAjgSHQoX2NZCrZCEOtn83u4e3kmAFji5QZX89rXYTU1HFGsQrktlxK/z12lVa1bFHtFaVYFzG2osILOqcAqwjz2klWbVXGvbex1w+lazKjXEj6rwqwvXL17SiuL+JwKrVgbDxUUrLMqbODjRCw6XUt13vtFtE32y1YL6+5Qq5MnwjVazfaotfl+EW9DBW3Sl61jlfcuaShzvsSfgWYy9rIQn6k8/kfFSHc3DCdvwKYi3EYkrDhXS/QL4n4bSQjOVE5Xf1SJT1N/XtBA3J8XNFDNuYEkU+z0p0IgzbmBLOcGajk3kOdc7DSfAiHRQIhJIRBmHwLhrz5sNPuA2Z1AmN0JhNmHQJh92Gjy4VjK6f6p094AtJG7h8OyXMdYPgFPI1VYDgcAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>fmoc N-Terminal Protection Group</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Bal</MonomerID>' + 
'        <MonomerSmiles>[*]NCCC([*])=O |$_R1;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSuw7CMAxF93yFJVixbOfVzBQxtaAO7IwsDAx8P0kKpa8hAstKnGvrKDeKAmiuj+ftDkCBDGtmIqlhCKUAPICL/VF+I4QAFyEilU4OhcTGYqfROEoVEMYuwR6miPV8UwJ76ilkKvqDwokiKKJ5RDmVUzw6zWZw5EaUblNMseg4SH+Xynv+zZFF0rZafd22nGJQy8fR7HWLHUUDkteJGiWd17lqlrPxbJeqzT9trrr8BadqA9Adz5me8HmPQ8Cpc2hrpbYx1Ash+07T4AIAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>beta-Alanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Hva</MonomerID>' + 
'        <MonomerSmiles>CCC[C@H](O)C([*])=O |r,$;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWSOw7CMAxA95zCEqxY/qWJZ4qY+IiBnZGFgYHzkwYJSqmEoJanZ+fFsRIANqfr7XwBICdjZVGSFp4RAkAGSKXey1e4OxyFiEofLARJ3TouGNVqJ2GpEizhXTGeA4uixuw9y+4XS4pazzKKNzbVIsjCNvoi/mZRtCbr1L0Ycpb0nCX+Z2FUMR+1HGY/zJI9ybQXSd2cDGhBNljpg6ZPWhp1lMZKuU8Laj57m/q93+kG4LDeV9pdCtKR1bYNYV4i3AFW8JSCNAMAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-hydroxypentanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Tml</MonomerID>' + 
'        <MonomerSmiles>C[N+](C)(C)CCCC[C@H](N[*])C([*])=O |r,$;;;;;;;;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU/EMAxA9/wKS7AS2Y7z4fkOHcsd6AZ2RhYGBn4/bkOvPRKJ0ositX1JXh3HrQM4vn1+vX8AoKJQIEHlPVyac0ACFGx80eemqvDKiOjs4YE8E/LA2aOSDnfobRRhB9eKfv+xKEsZ1pJPWaVr4b8s7FPQSyyM22IJPsQwxxK3WcRjKjfHIj4XvjmW6EXzHAstLKdqCSss8xmhL1Gktaw76blelNKyXp7XW9B2FPv1cr5bbRnrJdS1Ile1+w9L8lR4yi6GvPWMFDVXS8GUtloyYa55YY28xWJpoF8fm5sQNZSwpTaxdGkYKS2pIWnnGootNZRaaii3tABRSzNQZxd5/Nt1aBPZEWD3dBjp8FKggZwPLzU5CPVK08jjae/cvTX3DVBeVod2BQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>K</NaturalAnalog>' + 
'        <MonomerName>epsilon-N-trimethyllysine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Pen</MonomerID>' + 
'        <MonomerSmiles>CC(C)(S[*])[C@H](N[*])C([*])=O |r,$;;;;_R3;;;_R1;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWTPU/DMBCGd/+Kk+ga675s52aKOrWgIrEzsjAw9PdzTlQa4kih4eQheXz3+r1zEgCO71+Xj08ANFQSElXew0+EAERA6PuTdQszgzdGxOAvXYpsWSrHmFFxfPJdhEf4LbG8BpUckbCMtWSUFlV4XaVw4lpLUdk2e7mq/KejElUsr3S0qnKbbtPR84bpdt6RyNTL6e8qGlNP/WJH54f7p9tRRM24TaXExExjbU9l6uX1njsy0TxONwlv8uLlNPs0wxVRS/uWemJZpDpQmlJH0uY6TS11UVvKrX/2jDoimtMjwPnwMhxYbVdHVXDwVEcvNePptA9h5xG+Ad/HlHFYBAAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>V</NaturalAnalog>' + 
'        <MonomerName>penicillamine (3-mercaptovaline)</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Nal</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](Cc1ccc2ccccc2c1)C([*])=O |r,$_R1;;;;;;;;;;;;;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUPU/DQAyG9/sVlmCtdbbvc6aIqQV1YGdkYWDg99d3FeQaR6JNTiclee08eu1L7AAOH98/n18AvvpAQiLMe/hbzgFloKLxYU+r1grv7L137SliKCXpzU7Qh8JN86hRD09wjVjenZKQvdCFEpIvixT6n1IpT15kg5dW8S4glzh6Od5DUS+5URiZZfTyejslYxKe+lIHyunhZsp0RgFTverLHRRBKhcvjMQU1nWXtY5LXwizL3UdRd+Nwlu9jJQa0uaKBCWurWjs7novgqWmtNWLfiVEm72MlPVnNFW0/nvhPjtonCCqht/APFesqlLssbmabK5ys1V1jFSrViBvuCoRmVyViG0uA1m/2myyflUi61clHfemttK5C6qtTRPb6c7VOGt5Uw8Ap5e3zm2t69f261CLPB/3zj3qcmedjATApAYAAA==</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>A</NaturalAnalog>' + 
'        <MonomerName>3-naphthylalanine</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Gla</MonomerID>' + 
'        <MonomerSmiles>OC(=O)C(C[C@H](N[*])C([*])=O)C([*])=O |r,$;;;;;;;_R1;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKVTsVLDMAzd/RW6g7U+ybIda6YcUwvXgZ2RhYGB70eOW5pEOZomOl3OeZZenp8cB3D4+P75/AJAwUhMHYewh79wDigCse4P8hoiAu8BEZ2+7NDHUmu1yKfM2Fa6i/AEl2Yac43StY7AHNqKEqZZlv/yzCKxyze03GQhn3OgjVoGvpDnUrZqUb7cxaGW08NiluC5y/O+vN7j7mVG5AuOfFnOsiNPksqsu8c1LEbLcl+URQjDrC93uHu9ddsmrSM6uxsFed2M1JdM1GZOJcoaFm1P/TNPUJn8yA0NFlWILapQtKhCXd8xRbOtVVnF1iYgtLUC1QergaxehcjqrWicfu0AcHp5689SBfaHrwOv7dV2qhXPx71zjxruF/sRG4tsBQAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>E</NaturalAnalog>' + 
'        <MonomerName>gamma-carboxyglutamic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Mpa</MonomerID>' + 
'        <MonomerSmiles>C[C@H](S[*])C([*])=O |r,$;;;_R3;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Suw7CMAxF93yFJViJbOfpmSKmAgKJnZGFgYHvJ0mBPoWqWlYetnN0dVsFUN+er/sDAAUtGTIsXMEvlAIIAD71O9mGiMCVETHNwcbrKD7kOmvDvkyiTl2ELXwfU5/Vyw/FRsv5LWlP5CYp/3KgBdMpdLUc51Oc9k5oUst5NZsStBfjG1+I2HYol/laorYYsaE4trJMS+uu0WhxkbvJEB58SFVKpqzDqh3PprsbV1350yZmQ1nbhqoBzvtToWd82bPBJnd2h0qpdQr1Bvo+Ls7gAgAA</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>mercaptopropanoic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-H</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Glc</MonomerID>' + 
'        <MonomerSmiles>OCC([*])=O |$;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAJ2Ruw7CMAxF93zFlWAlsp1H65kipgLqwM7IwsDA9zcJrxY6VLUsyzq2r64SA7SX++N6A0jJs2MnThp8whggAD7NB/kNVcVZiCjtYRNtrbHKXKyTWDbJpilhi7HEdL5UfO0l37KNzGGpytsLpa4aejnOVwk2BuVJL91qtkplo7r4fBdm8Uu8JBNS6ogm5Er9pf5/l8tXjmkLdPtTofkEksnu0BizTmF6nvtLuSACAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>glycolic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'      <Monomer>' + 
'        <MonomerID>Apm</MonomerID>' + 
'        <MonomerSmiles>[*]N[C@@H](CCCCC([*])=O)C([*])=O |$_R1;;;;;;;;_R3;;;_R2;$|</MonomerSmiles>' + 
'        <MonomerMolFile>H4sIAAAAAAAAAKWUu05DMQyG9zyFJViJfMvFM0VMLagDOyMLAwPPj5O0cNRU0B6s6Ojkj/PJduIEgO3rx+fbOwAaKgmhCm/g20IAEiD29T6of3/MzOCFETG0mcQqqfrPHcUsvtENo68i3MMR8ds4UlC5UThqSuUshf6iaEzIOijV0spYNGrBnpHEQraM5elySoosTCOW5CVeUPY3V9QFi6ZDRoppQdldk1FKKOOMmGpdW5cjBaOYrKRItJxt7CU/pP9SKCLpSgpHyYiHW8cV156ReAuMWJIVW0fRmCvpoCiXZSwX3zruPULLThmqnDRP6JL2tVM1zb7ulWfV52VWXaqz6pLNqgHhrGYgmlR3JD6rymkWW4D943PPpSXTq9IasUHbEyPN42G3CeHWLXwBaWAHMRAFAAA=</MonomerMolFile>' + 
'        <MonomerType>Backbone</MonomerType>' + 
'        <PolymerType>PEPTIDE</PolymerType>' + 
'        <NaturalAnalog>X</NaturalAnalog>' + 
'        <MonomerName>2-aminopimelic acid</MonomerName>' + 
'        <Attachments>' + 
'          <Attachment>' + 
'            <AttachmentID>R1-H</AttachmentID>' + 
'            <AttachmentLabel>R1</AttachmentLabel>' + 
'            <CapGroupName>H</CapGroupName>' + 
'            <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R2-OH</AttachmentID>' + 
'            <AttachmentLabel>R2</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'          <Attachment>' + 
'            <AttachmentID>R3-OH</AttachmentID>' + 
'            <AttachmentLabel>R3</AttachmentLabel>' + 
'            <CapGroupName>OH</CapGroupName>' + 
'            <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'          </Attachment>' + 
'        </Attachments>' + 
'      </Monomer>' + 
'    </Polymer>' + 
'  </PolymerList>' + 
'  <AttachmentList>' + 
'    <Attachment>' + 
'      <AttachmentID>R3-X</AttachmentID>' + 
'      <AttachmentLabel>R3</AttachmentLabel>' + 
'      <CapGroupName>X</CapGroupName>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R3-H</AttachmentID>' + 
'      <AttachmentLabel>R3</AttachmentLabel>' + 
'      <CapGroupName>H</CapGroupName>' + 
'      <CapGroupSmiles>[*][H] |$_R3;$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R1-X</AttachmentID>' + 
'      <AttachmentLabel>R1</AttachmentLabel>' + 
'      <CapGroupName>X</CapGroupName>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R1-H</AttachmentID>' + 
'      <AttachmentLabel>R1</AttachmentLabel>' + 
'      <CapGroupName>H</CapGroupName>' + 
'      <CapGroupSmiles>[*][H] |$_R1;$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R2-OH</AttachmentID>' + 
'      <AttachmentLabel>R2</AttachmentLabel>' + 
'      <CapGroupName>OH</CapGroupName>' + 
'      <CapGroupSmiles>O[*] |$;_R2$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R2-H</AttachmentID>' + 
'      <AttachmentLabel>R2</AttachmentLabel>' + 
'      <CapGroupName>H</CapGroupName>' + 
'      <CapGroupSmiles>[*][H] |$_R2;$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R2-X</AttachmentID>' + 
'      <AttachmentLabel>R2</AttachmentLabel>' + 
'      <CapGroupName>X</CapGroupName>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R1-OH</AttachmentID>' + 
'      <AttachmentLabel>R1</AttachmentLabel>' + 
'      <CapGroupName>OH</CapGroupName>' + 
'      <CapGroupSmiles>O[*] |$;_R1$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'    <Attachment>' + 
'      <AttachmentID>R3-OH</AttachmentID>' + 
'      <AttachmentLabel>R3</AttachmentLabel>' + 
'      <CapGroupName>OH</CapGroupName>' + 
'      <CapGroupSmiles>O[*] |$;_R3$|</CapGroupSmiles>' + 
'    </Attachment>' + 
'  </AttachmentList>' + 
'</MONOMER_DB>';
  };
});
