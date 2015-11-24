
(function(angular) {
	'use strict';
	var controllers = angular.module('chrone.controllers', ['chrone.services']);

	var DRONE_API_KEY = "DRONE_API_KEY";
	var DRONE_URL_KEY = "DRONE_URL_KEY";

	controllers.controller( 'NewTabController', ['$scope', '$log', 'Storage', 'Drone', '$q', function( $scope, $log, Storage, Drone, $q ){
		
		$scope.builds = [];
		$scope.errorMessage = false;

		Storage.getSettings([DRONE_API_KEY, DRONE_URL_KEY]).then( function( settings ){
			$scope.droneApiKey = settings[DRONE_API_KEY];
			$scope.droneUrl = settings[DRONE_URL_KEY];
			$scope.droneHost = settings[DRONE_URL_KEY].replace( /(https:\/\/|http:\/\/)/gi, "" );
		}).then( function(){
			return Drone.getUser( $scope.droneUrl, $scope.droneApiKey );
		}).then( function( user ){
			$scope.user = user;
			return Drone.getUserRepos( $scope.droneUrl, $scope.droneApiKey );
		}).then( function( repos ){
			$scope.repos = repos;
			
			var getDetailsPromises = repos.map(function( repo ){
				return Drone.getRecentBuilds( $scope.droneUrl, $scope.droneApiKey, repo ).then( function( builds ){
					var last3Builds = (builds.length >= 3 ) ? builds.slice(0,3) : builds;
					var mostRecentBuild = ( last3Builds.length > 0 ) ? last3Builds[0] : false;
					var mostRecentBuildStatus = (mostRecentBuild) ? mostRecentBuild.status : false;
					var buildUrl = (mostRecentBuild) ? $scope.droneUrl + "/" + repo.owner + "/" + repo.name + "/" + mostRecentBuild.number : $scope.droneUrl + "/" + repo.owner + "/" + repo.name;
					return { name: repo.name, owner: repo.owner, repo: repo, builds: last3Builds, status: mostRecentBuildStatus, buildUrl: buildUrl };
				}).catch( function( error ){
					console.error( "Error fetching build for repo:", repo, error );
					return false;
				});
			});
			
			return $q.all( getDetailsPromises );
			
		}).then( function( builds ){
			
			if( builds && builds.length > 0 ){
				$scope.builds = builds;
				console.log( $scope.builds );
			}
			
		}).catch( function( error ){
			$scope.errorMessage = error;
		});
		
	}]);
	
	controllers.controller( 'OptionsController', ['$scope', '$log', 'Storage', function( $scope, $log, Storage ){
		
		$scope.extension_name = "Chrone.io";
	
		$scope.saveSettings = function(){
			
			var settings = {};
			settings[DRONE_API_KEY] = $scope.droneApiKey;
			settings[DRONE_URL_KEY] = $scope.droneUrl;
			
			Storage.saveSettings( settings ).then(function(){
				alert("Saved It!");

				chrome.permissions.request({
					origins: ['https://drone.phin.co/*']
				}, function( granted ){
					alert( "Saved It!" + granted );
				});
				
			});
		};

		Storage.getSettings([DRONE_API_KEY, DRONE_URL_KEY]).then( function( settings ){
			$scope.droneApiKey = settings[DRONE_API_KEY];
			$scope.droneUrl = settings[DRONE_URL_KEY];
		});
		
	}]);

})(angular);