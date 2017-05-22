'use strict';

angular.module('serviceDeskApp')
.controller('PriorityCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.priorities = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/priority').success(function(priorities) {
		$scope.priorities = priorities;
		socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
		});
	});

	$scope.open = function (issuepriority) {

		var modalInstance = $modal.open({
			templateUrl: 'app/priority/partials/priority-details.modal.html',
			controller: 'PriorityModalInstanceCtrl',
			resolve: {
				priority: function() {
					return issuepriority;
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

	$scope.delete = function(issuepriority) {
		$http.delete('/api/priority/' + issuepriority._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('priority');
	});
});
