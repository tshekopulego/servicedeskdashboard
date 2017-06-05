'use strict';

angular.module('serviceDeskApp')
.controller('ChannelCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.channels = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/channel').success(function(channels) {
		$scope.channels = channels;
		socket.syncUpdates('channel', $scope.channels,function(event,channel,channels){
		});
	});

	$scope.open = function (issuechannel) {

		var modalInstance = $modal.open({
			templateUrl: 'app/channel/partials/channel-details.modal.html',
			controller: 'ChannelModalInstanceCtrl',
			resolve: {
				channel: function() {
					return issuechannel;
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

	$scope.delete = function(issuechannel) {
		$http.delete('/api/channel/' + issuechannel._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('channel');
	});
});