'use strict';

angular.module('serviceDeskApp')
.controller('EditICTAssetCtrl', function ($scope, $http, $location, $window, $routeParams, socket) {

    $scope.ictasset = {};
    $scope.submitted = false;
    $scope.ictasset_id = $routeParams.id;
	
	 $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
    });
	
	 $http.get('/api/assettype').success(function(assettypes) {
        $scope.assettypes = assettypes;
    });
	
	 $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });

    $http.get('/api/ictasset/' + $scope.ictasset_id ).success(function(ictasset) {
		console.log(ictasset);
        $scope.ictasset = ictasset;
    })

    $scope.editICTAsset = function(ictasset,isValid) {
        $scope.submitted = true;
        $scope.ictasset = ictasset;
        if($scope.submitted) {
			$scope.ictasset.assetCategory = ictasset.category._id;
			$scope.ictasset.assetType = ictasset.assetType._id;
			$scope.ictasset.assetPriority = ictasset.priority._id;
			
			$scope.ictasset.assetCategoryId = ictasset.category.categoryId;
			$scope.ictasset.assetTypeId = ictasset.assetType.assetTypeId; 
			$scope.ictasset.assetPriorityId = ictasset.priority.priorityId;
			
			$http.post('/api/ictasset',$scope.ictasset);
			$http.put('/api/ictasset/' + $scope.ictasset_id,ictasset);
            $scope.ictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});