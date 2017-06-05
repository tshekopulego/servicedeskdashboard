'use strict';

angular.module('serviceDeskApp')
.controller('ICTAssetCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictassets = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/ictasset').success(function(ictassets) {
		$scope.ictassets = ictassets;
		socket.syncUpdates('ictasset', $scope.ictassets,function(event,ictasset,ictassets){
		});
	});

	$scope.open = function (issueictasset) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictasset/partials/ictasset-details.modal.html',
			controller: 'ICTAssetModalInstanceCtrl',
			resolve: {
				ictasset: function() {
					return issueictasset;
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

	$scope.delete = function(issueictasset) {
		$http.delete('/api/ictasset/' + issueictasset._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictasset');
	});
});
