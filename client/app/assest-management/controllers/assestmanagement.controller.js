'use strict';

angular.module('serviceDeskApp')
.controller('assestmanagementCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.assestmanagement = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/assestmanagement').success(function(assestmanagements) {
		$scope.assestmanagements = assestmanagements;
		socket.syncUpdates('assestmanagement', $scope.assestmanagements,function(event,assestmanagement,assestmanagements){
		});
	});
    
    
    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
        socket.syncUpdates('category',
        $scope.categories,function(event,category,categories){
        });
    });
     
    
    $http.get('/api/department').success(function(departments) {
        $scope.departments = departments;
        socket.syncUpdates('department', 
        $scope.departments,function(event,department,departments){
        });
    });
    

	$scope.open = function (assestmanagement) {

		var modalInstance = $modal.open({
			templateUrl: 'app/assestmanagement/partials/assestmanagement-details.modal.html',
			controller: 'assestmanagementModalInstanceCtrl',
			resolve: {
				assestmanagements: function() {
					return assestmanagement;
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
		$http.delete('/api/assestmanagement/' + assestmanagement._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('assestmanagement');
	});
});