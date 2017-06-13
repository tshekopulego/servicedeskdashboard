'use strict';

angular.module('serviceDeskApp')
.controller('AddICTStoreCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.ictstore = {};
    $scope.submitted = false;
	
		$http.get('/api/costcenter').success(function(costcenters) {
		$scope.costcenters = costcenters;
		socket.syncUpdates('costcenter', $scope.costcenters,function(event,costcenter,costcenters){
		});
	});

    $scope.addICTStore = function(ictstore,isValid) {
        $scope.submitted = true;
        $scope.ictstore = ictstore;
        if(isValid && $scope.submitted) {
			$scope.ictstore.costCenter = ictstore.costcenter._id; 
            $http.post('/api/ictstore',$scope.ictstore);
            $scope.ictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});