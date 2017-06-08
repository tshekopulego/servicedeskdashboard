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

    $scope.addICTAsset = function(ictasset,isValid) {
        $scope.submitted = true;
        $scope.ictasset = ictasset;
        if($scope.submitted) {
			
			$scope.ictasset.assetCategory = ictasset.category._id;
			/* $scope.issue.issueRefNumber = (new Date).getTime();
            */
			$http.post('/api/ictasset',$scope.ictasset);
            $scope.ictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});