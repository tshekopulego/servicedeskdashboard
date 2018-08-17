'use strict';

angular.module('serviceDeskApp')
.controller('EditICTStoreCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.ictstore = {};
    $scope.submitted = false;
    $scope.ictstore_id = $routeParams.id;
	
	$http.get('/api/costcenter').success(function(costcenters) {
        $scope.costcenters = costcenters;
    });

	 $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });
	
    $http.get('/api/ictstore/' + $scope.ictstore_id ).success(function(ictstore) {
        $scope.ictstore = ictstore;
    })

    $scope.editICTStore = function(ictstore,isValid) {
        $scope.submitted = true;
        $scope.ictstore = ictstore;
		
        if(isValid && $scope.submitted) {
            $scope.ictstore.costCenter = ictstore.costCenter._id;
			$scope.ictstore.assetPriority = ictstore.priority._id;
			
			$scope.ictstore.costCenter = ictstore.costCenter.costcenterId;
			$scope.ictstore.assetPriorityId = ictstore.priority.priorityId;
			
			$http.post('/api/ictstore',$scope.ictstore);
			$http.put('/api/ictstore/' + $scope.ictstore_id,ictstore);
            $scope.ictstore = '';
            $location.path('/ictstore/');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});