'use strict';

angular.module('serviceDeskApp')
.controller('AssettypeCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.assettypes = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/assettype').success(function(assettypes) {
		$scope.assettypes = assettypes;
		socket.syncUpdates('assettype', $scope.assettypes,function(event,assettype,assettypes){
		});
	});

	$scope.open = function (issueassettype) {

		var modalInstance = $modal.open({
			templateUrl: 'app/assettype/partials/assettype-details.modal.html',
			controller: 'AssettypeModalInstanceCtrl',
			resolve: {
				assettype: function() {
					return issueassettype;
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

	$scope.delete = function(issueassettype) {
		$http.delete('/api/assettype/' + issueassettype._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('assettype');
	});
});
