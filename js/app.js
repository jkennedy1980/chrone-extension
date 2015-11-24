(function(angular) {
	'use strict';
	
	var app = angular.module( 'chrone', ['chrone.controllers', 'chrone.filters']);
	
	app.run(['$http', function( $http ){
		$http.defaults.headers.common.Accept = 'application/json';
	}]);

	var filters = angular.module( 'chrone.filters', []);
	filters.filter( 'batch', function(){
			var cacheInputs = [];
			var cacheResults = [];

			return function( input, size ){
				var index = cacheInputs.indexOf( input );

				if( index !== -1 ){
					return cacheResults[index];
				}

				var result = [];

				for( var i = 0; i < input.length; i += size ){
					result.push( input.slice( i, i + size ) );
				}

				cacheInputs.push( input );
				cacheResults.push( result );

				return result;
			}
		})
	;


})(angular);