'use strict';

angular.module('serviceDeskApp')
.controller('CostcenterCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.costcenters = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/costcenter').success(function(costcenters) {
		$scope.costcenters = costcenters;
		socket.syncUpdates('costcenter', $scope.costcenters,function(event,costcenter,costcenters){
		});
	});

	$scope.open = function (issuecostcenter) {

		var modalInstance = $modal.open({
			templateUrl: 'app/costcenter/partials/costcenter-details.modal.html',
			controller: 'CostcenterModalInstanceCtrl',
			resolve: {
				costcenter: function() {
					return issuecostcenter;
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

	$scope.delete = function(issuecostcenter) {
		$http.delete('/api/costcenter/' + issuecostcenter._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('costcenter');
	});
});
