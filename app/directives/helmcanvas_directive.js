
// helmNotation module.
angular.module('helmNotation', [] )

// Directive that generates the helm canvas 
.directive('helmCanvas', function() {

 return {

  	restrict: 'E',
  	templateUrl: "templates/helmcanvas_template.html",
  	replace: true,
  	scope: {
  		chart: "=chart",
  	},

  };
})

;
