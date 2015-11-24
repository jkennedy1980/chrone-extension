(function(angular) {
	'use strict';

	/*global chrome*/
	var services = angular.module( 'chrone.services', [] );
	
	services.service( 'Storage', ['$q', '$rootScope', '$log', function( $q, $rootScope, $log ){
		return {
			saveSettings: function( settings ){
				var deferred = $q.defer();
				chrome.storage.sync.set( settings, function(){
					if( chrome.runtime.lastError ){
						$log.error( chrome.runtime.lastError.message );
						return $rootScope.$apply( function(){
							deferred.reject( chrome.runtime.lastError.message );
						});
					}

					return $rootScope.$apply( function(){
						deferred.resolve();
					});
				});
				return deferred.promise;
			},

			getSettings: function( keys ){
				var deferred = $q.defer();
				chrome.storage.sync.get( keys, function( settings ){
					if( chrome.runtime.lastError ){
						$log.error( chrome.runtime.lastError.message );
						return $rootScope.$apply( function(){
							deferred.reject( chrome.runtime.lastError.message );
						});
					}

					return $rootScope.$apply( function(){
						deferred.resolve( settings );
					});
				});
				return deferred.promise;
			}
			
		};
	}]);

	services.service( 'Drone', ['$q','$log', '$http', function( $q, $log, $http ){
		
		function _get( url ){
			var deferred = $q.defer();

			var xhr = new XMLHttpRequest();
			xhr.onerror = deferred.reject;
			xhr.onload = function(){
				if( xhr.status == 200 ){
					deferred.resolve( JSON.parse( xhr.responseText ) );
				}else{
					deferred.reject( new Error("bad http code: " + xhr.status ) );
				}
			};

			xhr.open( 'GET', url );
			xhr.send();

			return deferred.promise;
		}
		
		return {
			getUser: function( droneUrl, droneApiKey ){
				var url = droneUrl + '/api/user?access_token=' + droneApiKey;
				return _get( url );
			},
			
			getBuilds: function( droneUrl, droneApiKey, owner ){
				var url = droneUrl + '/api/repos/' + owner + '/{name}/builds?access_token=' + droneApiKey;
				return _get( url );
			},

			getUserRepos: function( droneUrl, droneApiKey ){
				var url = droneUrl + '/api/user/repos?access_token=' + droneApiKey;
				return _get( url );
			},
			
			getRecentBuilds: function( droneUrl, droneApiKey, repo ){
				var url = droneUrl + '/api/repos/' + repo.owner + '/' + repo.name + '/builds?access_token=' + droneApiKey;
				return _get( url );
			}
		
		};
	}]);

})(angular);