'use strict';

angular.module('serviceDeskApp')
.controller('ICTAssetCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictassets = [];
	
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	
	
	$http.get('/api/category').success(function (categories) {
               categories.unshift({
                   categoryName: 'All',
                   _id: -1
               });
               $scope.categories = categories;
           });

    
    
	$http.get('/api/assettype').success(function (assettypes) {
               assettypes.unshift({
                   assettypeName: 'All',
                   _id: -1
               });
               $scope.assettypes = assettypes;
           });
    
    
    
	$http.get('/api/ictasset').success(function(ictassets) {
		$scope.ictassets = ictassets;
		socket.syncUpdates('ictasset', $scope.ictassets,function(event,ictasset,ictassets){
		});
	});
	
	$scope.searchICTAssets = function (category,assettype) {

            if ((category == "-1") && (assettype == "-1")) { //get all records
                $http.get('/api/ictasset').success(function (ictassets) {
                    $scope.ictassets = ictassets;
                    console.log('/api/ictasset/');
                });

            } else {

                if ((category != "-1" && !category) && (assettype != "-1" && !assettype)) {
                    $http.get('/api/ictasset/' + category + '/' + assettype).success(function (ictassets) {

                        $scope.ictassets = ictassets;
                    });
                } else {

                    if (category != "-1" && !angular.isUndefined(category)) {

                        $http.get('/api/ictasset/' + category + '/categories').success(function (ictassets) {

                            $scope.ictassets = ictassets;

                        });

                    } else if (assettype != "-1") {

                        $http.get('/api/ictasset/' + assettype + '/assettypes').success(function (ictassets) {

                            $scope.ictassets = ictassets;

                        });
                    }

                }

            }
        };

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
    
    $scope.isOverSLA = function (dateCaptured, sla) {

            var now = moment(new Date()); //todays date
            var duration = moment.duration(now.diff(dateCaptured));
            var hours = duration.asHours();
            console.log(hours > sla);

            /*console.log(sla);
*/
            return hours > sla;
    }

    
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
