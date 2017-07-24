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
	
	$http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
        socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
        });
    });

    $scope.addICTStore = function(ictstore,isValid) {
        $scope.submitted = true;
        $scope.ictstore = ictstore;
		
        if(isValid && $scope.submitted) {
			$scope.ictstore.costCenter = ictstore.costCenter._id;
			$scope.ictstore.assetPriority = ictstore.priority._id;
			
			$scope.ictstore.costCenterId = ictstore.costCenter.costcenterId;
			$scope.ictstore.assetPriorityId = ictstore.priority.priorityId;
			
            $http.post('/api/ictstore',$scope.ictstore);
            $scope.ictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});