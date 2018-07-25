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

	$scope.open = function (ictstore) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictstore/partials/ictstore-details.modal.html',
			controller: 'ICTStoreModalInstanceCtrl',
			resolve: {
				ictstore: function() {
					return ictstore;
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

            console.log(sla);

            return hours > sla;
    }

	$scope.cancel = function() {
		$window.history.back();
	};

	$scope.delete = function(issueictstore) {
		$http.delete('/api/ictstore/' + ictstore._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictstore');
	});
});
