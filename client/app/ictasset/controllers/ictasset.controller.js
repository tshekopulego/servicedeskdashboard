'use strict';

angular.module('serviceDeskApp')
.controller('ICTAssetCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictassets = [];
	
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	
	
	/*$http.get('/api/category').success(function (categories) {
               categories.unshift({
                   categoryName: 'All',
                   _id: -1
               });
               $scope.categories = categories;
           });*/

	$http.get('/api/ictasset').success(function(ictassets) {
		$scope.ictassets = ictassets;
		socket.syncUpdates('ictasset', $scope.ictassets,function(event,ictasset,ictassets){
		});
	});
	
	
	
	/* $scope.searchICTAssets = function (category) {

            if ((category == "-1")) { //get all records
                $http.get('/api/ictasset').success(function (ictassets) {
                    $scope.ictasset = ictasset;
					
                    console.log('/api/ictassets/');
                });

            } else {

                if ((category != "-1" && !category)) {
                    $http.get('/api/ictassets/' + category + '/' + status).success(function (ictassets) {

                        $scope.ictasset = ictasset;
                    });
                } else {

                    if (category != "-1" && !angular.isUndefined(category)) {

                        $http.get('/api/ictassets/' + category + '/categories').success(function (ictassets) {

                            $scope.ictasset = ictasset;

                        });

                    } 

                }

            }
        };*/

	$scope.open = function (ictasset) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictasset/partials/ictasset-details.modal.html',
			controller: 'ICTAssetModalInstanceCtrl',
			resolve: {
				ictasset: function() {
					return ictasset;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
    
    
    $scope.comments = function (ictasset) {

            var modalInstance = $modal.open({
                templateUrl: 'app/ictasset/partials/ictasset-comments.modal.html',
                controller: 'ICTAssetCommentsModalInstanceCtrl',
                //size: size,
                resolve: {
                    ictasset: function () {
                        return ictasset;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
    };

	$scope.cancel = function() {
		$window.history.back();
	};

	$scope.delete = function(ictasset) {
		$http.delete('/api/ictasset/' + ictasset._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictasset');
	});
});
