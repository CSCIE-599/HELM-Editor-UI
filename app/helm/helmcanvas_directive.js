
// helmNotation module.
angular.module('helmNotation', ['dragging'] )

// Directive that generates the helm canvas 
.directive('helmCanvas', function() {

 return {

  	restrict: 'E',
  	templateUrl: "helm/helmcanvas_template.html",
  	replace: true,
  	scope: {
  		chart: "=chart",
  	},

  };
})

;
