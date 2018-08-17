'use strict';

angular.module('serviceDeskApp')
.controller('AddICTAssetCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.ictasset = {};
    $scope.submitted = false;
	
	 $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
        socket.syncUpdates('category',
        $scope.categories,function(event,category,categories){
        });
    });
	
	$http.get('/api/assettype').success(function(assettypes) {
		$scope.assettypes = assettypes;
		socket.syncUpdates('assettype', $scope.assettypes,function(event,assettype,assettypes){
		});
	});

	 $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
        socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
        });
    });
	
    $scope.addICTAsset = function(ictasset,isValid) {
        $scope.submitted = true;
        $scope.ictasset = ictasset;
        if($scope.submitted) {
			
			$scope.ictasset.assetCategory = ictasset.category._id;
			$scope.ictasset.assetType = ictasset.assetType._id; 
			$scope.ictasset.assetPriority = ictasset.priority._id;
			
			$scope.ictasset.assetCategoryId = ictasset.category.categoryId;
			$scope.ictasset.assetTypeId = ictasset.assetType.assetTypeId; 
			$scope.ictasset.assetPriorityId = ictasset.priority.priorityId;
			
			/* $scope.issue.issueRefNumber = (new Date).getTime();*/
			$http.post('/api/ictasset',$scope.ictasset);
            $scope.ictasset = '';
            $location.path('/ictasset');
        }
    };
	/*console.log($scope.ictasset);*/
    $scope.cancel = function() {
        $window.history.back();
    };
});