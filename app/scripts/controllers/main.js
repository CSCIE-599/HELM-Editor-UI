'use strict';

/**
 * @ngdoc function
 * @name helmeditor2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helmeditor2App
 */

var app = angular.module('helmeditor2App');

app.controller('MainCtrl', ['$scope', 'webService', 'HelmConversionService', 'CanvasDisplayService', 'MonomerSelectionService', 'HELMNotationService', 'FileSaver', 'Blob', '$uibModal', 
  function ($scope, webService, HelmConversionService, CanvasDisplayService, MonomerSelectionService, HELMNotationService, FileSaver, Blob, $uibModal) {
    var self = this;

    /* Toggle modal dialogue display */
    self.modalShown = false;
    self.toggleModal = function() {
      self.modalShown = !self.modalShown;
    };

    /* Variables for loadsequence view */
    self.polyTypes = [
      { value: 'HELM', label:'HELM' },
      { value: 'RNA', label:'RNA/DNA' },
      { value: 'PEPTIDE', label:'PEPTIDE' },
    ];
    // the selected one
    self.polymerType = self.polyTypes[0];

    // indicates whether to reset during loading a new sequence 
    self.shouldReset = true;
    self.result = '';

    // expose the current HELM through the HELMNotationService
    self.getHelm = function () {
      return HELMNotationService.getHelm();
    };

    /* Check if need to validate HELM input, or convert input to Helm */
    self.processInput = function (polymerType, inputSequence) {
      /* Check that input is not empty */
      if (!angular.isDefined(inputSequence)) {
        window.alert('Invalid input');
        return;
      }

      // clear the canvas if the reset check box is selected
      if (self.shouldReset) {
        CanvasDisplayService.resetCanvas();
      }
      
      /* TODO: Check that input is valid type? */
      if (self.polymerType.value === 'HELM') {
        self.validateHelmNotation(inputSequence);
      }
      else {
        self.getHelmNotation(self.polymerType, inputSequence);
      }
      self.toggleModal();
    };
    
   
    /* Invoke factory function to get HELM notation */
    self.getHelmNotation = function (polymerType, inputSequence) {
      var successCallback = function (helmNotation) {
        self.helm = helmNotation;
        HELMNotationService.setHelm(helmNotation);
        CanvasDisplayService.loadHelmTranslationData(HelmConversionService.convertHelmNotationToSequence(helmNotation));
        self.result = HelmConversionService.error;
        self.getCanonicalHelmNotation(self.helm);
      };
      var errorCallback = function(response) {
        self.result = response.data;
        HELMNotationService.setHelm('');
        console.error(response.data);
      };

      switch(polymerType.value) {
        case 'PEPTIDE':
          webService.getHelmNotationPeptide(inputSequence).then(successCallback, errorCallback);
          break;
        case 'RNA':
          webService.getHelmNotationRna(inputSequence).then(successCallback, errorCallback);
      }
    };

    /* Invoke factory function to validate the HELM notation */
    self.validateHelmNotation = function (inputSequence) {
      // make sure that we have a string to even pass
      if (inputSequence === null || inputSequence.length === 0) {
        self.helm = '';
        HELMNotationService.setHelm('');
        return;
      }

      var successCallback = function (valid) {
        if (valid) {
          self.result = '';
          self.helm = inputSequence;
          HELMNotationService.setHelm(inputSequence);
          CanvasDisplayService.loadHelmTranslationData(HelmConversionService.convertHelmNotationToSequence(inputSequence));
          self.result = HelmConversionService.error;
          self.getCanonicalHelmNotation(self.helm);
        }
        else {
          self.result = 'INVALID HELM SEQUENCE';
          HELMNotationService.setHelm('');
        }
      };
      var errorCallback = function (response) {
        self.result = response.data;
        console.error(response.data);
      };

      webService.validateHelmNotation(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get canonical helm notation */
    self.getCanonicalHelmNotation = function (inputSequence) {
      var successCallback = function (result) {
        self.chelm = result;
      };
      var errorCallback = function(response) {
        console.error(response.data);
        if(response.status === 400) {
           self.chelm = response.data;
        }
      };
      webService.getConversionCanonical(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get molecular weight */
    self.getMolecularWeight = function (inputSequence) {
      var successCallback = function (result) {
        self.molecularweight = result;
      };
      var errorCallback = function(response) {
        console.error(response.data);
      };
      webService.getMolecularWeight(inputSequence).then(successCallback, errorCallback);
    };

    /* Invoke factory function to get molecular formula */
    self.getMolecularFormula = function (inputSequence) {
      var successCallback = function (result) {
        self.molecularformula = result;
      };
      var errorCallback = function(response) {
        console.error(response.data);
      };
      webService.getMolecularFormula(inputSequence).then(successCallback, errorCallback);
    };

     /* Invoke factory function to get the extinction coefficient */
    self.getExtinctionCoefficient = function (inputSequence) {
      var successCallback = function (result) {
        self.extcoefficient = result;
      };
      var errorCallback = function(response) {
        console.error(response.data);
      };
      webService.getExtinctionCoefficient(inputSequence).then(successCallback, errorCallback);
    };

    // link up the canvas that we are displaying
    self.getCanvasView = function () {
      return CanvasDisplayService.canvasView;
    };
    self.resetCanvas = function () {
      CanvasDisplayService.resetCanvas();
      HELMNotationService.setHelm('');
    };
    

    /* zoom and pan functions */
    $scope.zoom = function (scale, evt, svgCanvas){
      CanvasDisplayService.zoom(scale, evt, svgCanvas);
      if (evt) {
        evt.stopPropagation();
      }
    };

    $scope.pan = function (dx, dy, evt){
      CanvasDisplayService.pan(dx, dy, evt);
      if (evt) {
        evt.stopPropagation();
      }
    };

    /*
     * Begin code for lower pane
     */
       /* Variables for view types in lower pane */
    self.viewTypes = [
      { value: 'HELM', label:'HELM' },
      { value: 'Sequence', label:'Sequence' },
      { value: 'Molecule Properties', label:'Molecule Properties' }
    ];
    $scope.viewType = self.viewTypes[0];
    $scope.helm = true;
    $scope.sequence = false;
    $scope.moleculeprops = false;
    self.result = '';
    self.helm = '';
    HELMNotationService.setHelm('');
    self.chelm = '';
    self.componenttype = '';
    self.molecularweight = '';
    self.molecularformula = '';
    self.extcoefficient = '';
    self.helmImageLink = '';

    /* view type selection event handler */
    $scope.updateLower = function(selectedView) {
      $scope.viewType = selectedView;
      switch(selectedView.value) {
        case 'HELM':
          $scope.helm = true;
          $scope.sequence = false;
          $scope.moleculeprops = false;
          break;
        case 'Molecule Properties':
          $scope.helm =false;
          $scope.sequence = false;
          $scope.moleculeprops = true;
          if(self.helm !== '' && self.molecularformula === '') {
            self.getMolecularWeight(self.helm);
            self.getMolecularFormula(self.helm);
            self.getExtinctionCoefficient(self.helm);
            self.helmImageLink = 'Show';
          }
          break;
        case 'Sequence':
          $scope.helm = false;
          $scope.moleculeprops = false;
          $scope.sequence = true;
          break;
      }
    };

    /*
    * Begin code for showing Image Modal
    */
    /* Invoke factory function to get the HELM Image */
    $scope.showHelmImage = function () {
      $scope.requestedview = '';  
      $scope.imageMessage = '';
      var successCallback = function (result) {
        $scope.requestedview = result;
        $scope.imageMessage = '';
      };
      var errorCallback = function(response) {
        $scope.imageMessage = 'Image not available. See console for more information.';
        $scope.requestedview = '';
        console.error(response);
      };
      if (self.helm !== '') {
        webService.getHelmImageUrl(self.helm).then(successCallback, errorCallback);
      } else {
        $scope.imageMessage = 'Structure is empty!';
      }
      $scope.openImageView();
    };

    /* Invoke factory function to get the Monomer Image */
    $scope.showMonomerImage = function (monomerId, polymerType) {
      $scope.requestedview = '';  
      $scope.imageMessage = '';
      var successCallback = function (result) {
        $scope.requestedview = result;
        $scope.imageMessage = '';
      };
      var errorCallback = function(response) {
        $scope.imageMessage = 'Image not available. See console for more information.';
        $scope.requestedview = '';
        console.error(response);
      };
      if (monomerId !== '' && polymerType !== '') {
        webService.getMonomerImageUrl(monomerId, polymerType, '').then(successCallback, errorCallback);
      }
      $scope.openImageView();
    };

    // Methods used by the monomer library to add/drag elements to the 
    // sets the current selected monomer to be what was clicked
    self.toggleSelectedMonomer = function (monomer, evt) {
      MonomerSelectionService.toggleSelectedMonomer(monomer, evt);
    };

    // helper function to convert from titles to types
    var convertTitle = function (title) {
      switch (title) {
        case 'Nucleic Acid':
          return 'RNA';
        case 'Peptide':
          return 'PEPTIDE';
        case 'Chemical Modifier':
          return 'CHEM';
        default:
          return 'RNA';
      }
    };

    // // helper method just to clear the canvas
    // var clearCanvas = function () {
    //   var emptyData = {
    //     nodes: [],
    //     connections: []
    //   };
    //   CanvasDisplayService.setNodeNum(0);
    //   CanvasDisplayService.setParamNum(0);
    //   CanvasDisplayService.setNodeID(0);
    //   $scope.canvasView = new CanvasDisplayService.CanvasView(emptyData);
    // };

    // adds the monomer to what already exists
    var addMonomer = function (monomer) {
      // don't add it if it's a branch monomer
      if (monomer.encodedMonomer && monomer.encodedMonomer.MonomerType === 'Branch') {
        console.warn('Branch monomers cannot exist in their own sequence');
        return;
      }
      // if we have a monomer selected, we need to add it
      if (monomer._name) {
        var type = monomer.encodedMonomer ? monomer.encodedMonomer.PolymerType : convertTitle(monomer._title);
        var notation;
        if (monomer._notation) {
          notation = monomer._notation;
        }
        else {
          // make sure to encapsulate multi-character names with []
          notation = monomer._name.length > 1 ? '[' + monomer._name + ']' : monomer._name;
        }

        HELMNotationService.addNewSequence(type, notation);

        // output it all
        CanvasDisplayService.resetCanvas();
        self.validateHelmNotation(HELMNotationService.getHelm());
      }
    };

    // handle the clicks on the SVG itself
    self.svgClicked = function () {
      var currentMonomer = MonomerSelectionService.getSelectedMonomer();
      addMonomer(currentMonomer);
      // and clear the selection so we don't keep adding over and over again
      MonomerSelectionService.clearSelectedMonomer();
    };

    // handle the dropping -- only supports dropping monomers right now
    self.elementDropped = function (evt, data) {
      addMonomer(data);
      MonomerSelectionService.clearSelectedMonomer();
    };

    /*****************/
    /*  right-click  */
    /*****************/

    //helper function - download file to user's browser
    $scope.downloadFile = function () {

      //make filename - eg, "HELM.04.21.2016.txt"
      var now = new Date();
      var date = (now.getMonth()+1) + '.' + now.getDate() + '.' + now.getFullYear();
      var filename = 'HELM.' + date + $scope.fileExtension;

      //Safari - can't add filename
      //http://stackoverflow.com/questions/12802109/download-blobs-locally-using-safari
      if (typeof safari !== 'undefined'){
        //alert("When downloading from Safari, filenames are not provided.  Please rename the file.");
        window.open('data:attachment/csv;charset=utf-8,' + encodeURI($scope.requestednotation));
      }
      //Chrome, Firefox (should work in IE, but not tested)
      //FileSaver: https://github.com/alferov/angular-file-saver#filesaver
      //Supported browsers: https://github.com/eligrey/FileSaver.js/#supported-browsers
      else {
        var blob = new Blob([$scope.requestednotation], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, filename);
      }
    };

    //helper function - show notation in modal
    //ui-bootstrap modal doc: https://angular-ui.github.io/bootstrap/
    $scope.open = function () {
      $uibModal.open({
        templateUrl: 'templates/viewmodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //wider modal
    $scope.openWideModal = function () {
      $uibModal.open({
        templateUrl: 'templates/viewmodal.html',
        controller: 'modal',
        windowClass: 'wide-modal',
        scope: $scope,
      });
    };

    //helper function - show molecular properties table in modal
    //TODO - should show Mass
    $scope.openMolecularPropertiesModal = function () {
      $uibModal.open({
        templateUrl: 'templates/tablemodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //helper function - show image in modal
    $scope.openImageView = function () {
      $uibModal.open({
        templateUrl: 'templates/imagemodal.html',
        controller: 'modal',
        scope: $scope,
      });
    };

    //helper function - copy string to user's clipboard
    //source: http://stackoverflow.com/questions/25099409/copy-to-clipboard-as-plain-text
    $scope.copyToClipboard = function () {
      var input = document.createElement('textarea');
      document.body.appendChild(input);
      input.value = $scope.requestednotation;
      input.focus();
      input.select();
      document.execCommand('Copy');
      input.remove();
    };

    //options for right-click context-menu
    //contextMenu doc: https://github.com/Templarian/ui.bootstrap.contextMenu
    $scope.menuOptions = [
      ['Show Molecular Structure', function () {
        $scope.showHelmImage();
      }],
      null,
      ['View', function () {}, [
        ['HELM Notation', function () {
          $scope.requestedview = self.helm;
          if (self.helm.length > 100) {    //for long sequences,
            $scope.openWideModal();      //use wider modal
          }
          else {
            $scope.open();
          }
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestedview = self.chelm;
          if (self.helm.length > 100){
            $scope.openWideModal();
          }
          else {
            $scope.open();
          }
        }],
        /*,
        ['xHELM Notation', function (){
          $scope.requestedview = 'TO-DO: xHELM NOTATION';
          $scope.open();
        }],
        ['SMILES', function () {
          $scope.requestedview = 'TO-DO: SMILES NOTATION';
          $scope.open();
        }],
        ['MDL Molfile', function (){
          $scope.requestedview = 'TO-DO: MDL MOLFILE NOTATION';
          $scope.open();
        }],
        ['PDB Format', function (){
          $scope.requestedview = 'TO-DO: PDB FORMAT';
          $scope.open();
        }]*/
        ['Molecule Properties', function () {
          self.getMolecularWeight(self.helm);       //sets self.molecularweight
          self.getMolecularFormula(self.helm);      //sets self.molecularformula
          self.getExtinctionCoefficient(self.helm); //sets self.extcoefficient
          $scope.openMolecularPropertiesModal();
        }]
      ]],
      null,
      ['Copy', function () {}, [
        /*['Image', function ($itemScope) {
          $scope.requestednotation = webService.getHelmImageUrl(self.helm);
          $scope.copyToClipboard();
        }],*/
        ['HELM Notation', function () {
          $scope.requestednotation = self.helm;
          $scope.copyToClipboard();
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestednotation = self.chelm;
          $scope.copyToClipboard();
        }]
        /*,
        ['xHELM Notation', function () {
          $scope.requestednotation = 'TODO: GET xHELM';
          $scope.copyToClipboard();
        }],
        ['SMILES', function () {
          $scope.requestednotation = 'TODO: GET SMILES';
          $scope.copyToClipboard();
        }],
        ['MDL Molfile', function () {
          $scope.requestednotation = 'TODO: GET MDL MOLFILE';
          $scope.copyToClipboard();
        }]*/
      ]],
      null,
      ['Save', function () {}, [
        ['HELM Notation', function () {
          $scope.requestednotation = self.helm;
          $scope.fileExtension = '.helm';
          $scope.downloadFile();
        }],
        ['Canonical HELM Notation', function () {
          $scope.requestednotation = self.chelm;
          $scope.fileExtension = '.chelm';
          $scope.downloadFile();
        }]
        /*,
        ['xHELM Notation', function (){
          $scope.requestednotation = 'TODO:_GET_xHELM';
          $scope.fileExtension = '.xhelm';
          $scope.downloadFile();
        }],
        ['SMILES', function () {
          $scope.requestednotation = 'TODO:_GET_SMILES';
          $scope.fileExtension = '.smi';
          $scope.downloadFile();
        }],
        ['MDL Molfile', function (){
          $scope.requestednotation = 'TODO:_MDL_Molfile';
          $scope.fileExtension = '.mol';
          $scope.downloadFile();
        }]*/
      ]]
    ];

    // listen for the delete key being released and try to delete the node if possible
    self.keyUp = function (evt) {
      // only do it on the delete key (fn+delete on Macs)
      if (evt.which === 46) {
        self.trashClicked();
      }
    };

    self.showTrash = function () {
      var currentNode = CanvasDisplayService.getSelectedNode();
      if (!currentNode || !currentNode.data) {
        return false;
      }
      return true;
    };

    // "remove" button is clicked -- should parse current HELM string, removing the HELM substring
    // associated with the selected node and generate new HELM string(s) and graph
    self.trashClicked = function () {

      var currentNode = CanvasDisplayService.getSelectedNode();
      if (!currentNode || !currentNode.data) {
        return;
      }
      else{
        var nodeID = currentNode.data.id;

        // if node is part of a CHEM sequence, just delete the chem sequence
        if (currentNode.data.seqType === 'CHEM') {
          // nodeType for chem nodes is actually a sequence name like "CHEM1"
          // and seqName is "undefined" for chem nodes (TODO: check why / fix?)
          HELMNotationService.removeSequence(currentNode.data.nodeType);

          var updatedHelm = HELMNotationService.getHelm();
          CanvasDisplayService.resetCanvas();
          self.validateHelmNotation(updatedHelm);
          return;
        }

        var sequences = HELMNotationService.getSequences();

        var priorSeqNodes = 0;

        for (var i = 0; i < sequences.length; i++) {
          var sequenceName = sequences[i].name;
          var sequenceNotation = sequences[i].notation;

          var polymers = HelmConversionService.getPolymers(sequenceName, sequenceNotation);

          // found the sequence to modify (containing the node to be removed)
          if (sequenceName === currentNode.data.seqName) {
            nodeID -= priorSeqNodes;
            var updatedHELM = HELMNotationService.helmNodeRemoved(polymers, sequences[i], currentNode, nodeID);
            
            CanvasDisplayService.resetCanvas();
            self.validateHelmNotation(updatedHELM);
          }
          else{
            // track number of elements in sequences not containing the node-to-delete
            priorSeqNodes += (polymers.length);
          }
        }
      }
    };

    // remember the node that we started with
    self.dragStartNode = null;
    self.dragStartLocation = null;
    self.dragEndLocation = null;
    self.svgEl = null;
    self.svgPt = null;

    // handle the beginning of a drag
    self.mousedown = function (node, evt) {
      // set up the SVG stuff for transforms
      if (!self.svgEl) {
        self.svgEl = document.querySelector('svg');
        self.svgPt = self.svgEl.createSVGPoint();
      }

      self.dragStartNode = node;
      self.dragStartLocation = {
        x: node.x() + node.width()/2,
        y: node.y() + node.height()/2
      };

      evt.stopPropagation();
    };

    // on the move, make sure to update our destination
    self.mousemove = function (evt) {
      if (self.dragStartNode) {
        // transform the point correctly
        self.svgPt.x = evt.clientX;
        self.svgPt.y = evt.clientY;
        var pt = self.svgPt.matrixTransform(self.svgEl.getElementById('map-matrix').getScreenCTM().inverse());
        self.dragEndLocation = {
          x: pt.x,
          y: pt.y
        };

        // shift the dragged location back from the cursor so we don't click it
        if (self.dragEndLocation.x < self.dragStartLocation.x) {
          self.dragEndLocation.x += 2;
        }
        else {
          self.dragEndLocation.x -= 2;
        }
        if (self.dragEndLocation.y < self.dragStartLocation.y) {
          self.dragEndLocation.y += 2;
        }
        else {
          self.dragEndLocation.y -= 2;
        }
      }
    };

    // on the mouse up, try to connect the nodes
    self.mouseup = function (node, evt) { 
      // deal with this if we dropped onto a node
      if (self.dragStartNode && node && self.dragStartNode !== node) {
        var helmOut = HELMNotationService.connectNodes(self.dragStartNode, node);
        console.log(helmOut);
        if (helmOut !== HELMNotationService.getHelm()) {
          CanvasDisplayService.resetCanvas();
          self.validateHelmNotation(helmOut);
        }
      }

      // clean up our stored information
      self.dragStartNode = null;
      self.dragStartLocation = null;
      self.dragEndLocation = null;
      evt.stopPropagation();
    };

  }]);