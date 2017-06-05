'use strict';

angular.module('serviceDeskApp')
.controller('ICTStoreCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictstores = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/ictstore').success(function(ictstores) {
		$scope.ictstores = ictstores;
		socket.syncUpdates('ictstore', $scope.ictstores,function(event,ictstore,ictstores){
		});
	});

	$scope.open = function (issueictstore) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictstore/partials/ictstore-details.modal.html',
			controller: 'ICTStoreModalInstanceCtrl',
			resolve: {
				ictstore: function() {
					return issueictstore;
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

	$scope.delete = function(issueictstore) {
		$http.delete('/api/ictstore/' + issueictstore._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictstore');
	});
});
