'use strict';

angular.module('serviceDeskApp')
.controller('CategoryCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.categories = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/category').success(function(categories) {
		$scope.categories = categories;
		socket.syncUpdates('category', $scope.categories,function(event,category,categories){
		});
	});

	$scope.open = function (issuecategory) {

		var modalInstance = $modal.open({
			templateUrl: 'app/category/partials/category-details.modal.html',
			controller: 'CategoryModalInstanceCtrl',
			resolve: {
				category: function() {
					return issuecategory;
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

	$scope.delete = function(issuecategory) {
		$http.delete('/api/category/' + issuecategory._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('category');
	});
});
