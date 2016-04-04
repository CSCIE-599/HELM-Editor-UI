'use strict';

/**
 * @ngdoc service
 * @name helmeditor2App.MonomerLIbraryService
 * @description
 * # MonomerLibraryService
 * Service in the helmeditor2App.
 */
angular.module('helmeditor2App')
  .service('MonomerLibraryService', ['$scope', '$http', function ($scope, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    var self = this;

    // Hierarchy of monomer types, retrievable through the monomer library. See
    // milestone 1 documentation for reference

    var peptides = {
        name: "Peptide",
        subtypes: [
        {
            lAmino: [
            {
                name: "L Amino Acid",
                subtypes: [{"Natural","Modified"}]
            }],
            dAmino: [
            {
                name: "D Amino Acid"
            }],
            nmAmino: [
            {
                name: "N-Methylated Amino Acid"
            }],
            synAmino: [
            {
                name: "Synthetic Amino Acid"
            }],
            pepNucleic: [
            {
                name: "Peptide Nucleic Acid (PNA)",
                subtypes: [{"Standard"}]
            }],
            nTerminal: [
            {
                name: "N-Terminal"
            }],
            cTerminal: [
            {
                name: "C-Terminal"
            }]
        }]
    };
    var rna = {
        name: "RNA (Nucleic Acid)",
        subtypes: [
        {
            sNucleotide: [
            {
                name: "Standard Nucleotide"
            }],
            mNucleotide: [
            {
                name: "Modified Nucleotide",
                subtypes: [{"dR","mR","fR","LR + sP","R + sP"}]
            }],
            sugar: [
            {
                name: "Sugar",
                subtypes: [{"Standard","Special","Custom","Commercial","5’-Modifier","3’-Modifier"}] 
            }],
            base: [
            {
                name:"Base",
                subtypes: [{"Standard","Modified A","Modified C","Modified G","Modified T","Modified U","Synthetic"}]
            }],
            linker: [
            {
                name: "Linker",
                subtypes: [{"Common","Special","Salt"}]
            }]
        }]
    };
    var chem = {
        name: "Chem (Chem Modifier)",
        subtypes: [{"Reactive","Mono-Functional","Bi-Functional"}]
    };

    var hierarchy = {
        peptides: peptides,
        rna: rna,
        chem: chem
    };

    var monomerDB = $http.get("MonomerDBGZEncoded.xml", {
        transformResponse: function (cnv) {
            var x2js = new X2JS();
            var aftCnv = x2js.xml_str2json(cnv);
            var returnObj = JSON.parse(aftCnv);
            return returnObj;
        }
    });

    // uses the hierarchy to parse the database info according to polymer and 
    // monomer subtypes
    var dbParser = function(){
    }

    // for now the library service does not different between polymer subtypes
    // this is due to the fact that monomer type info in the xml database does
    // reflect the monomer categories we have listed in our appendix
    self.getPeptides = function(){
        var output = monomerDB.MONOMER_DB.PolymerList.polymerType["PEPTIDE"];
        return output;
    };
    self.getRNAs  = function(){
        var output = monomerDB.MONOMER_DB.PolymerList.polymerType["RNA"];
        return output;
    };
    self.getChems = function(){
        var output = monomerDB.MONOMER_DB.PolymerList.polymerType["CHEM"];
        return output;
    };
    self.getAttachments = function(){
        var output = monomerDB.MONOMER_DB.AttachmentList;
        return output;
    }
    self.getAll   = function(){
        return monomerDB;
    };

  }]);
