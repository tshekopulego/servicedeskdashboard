'use strict';

angular.module('serviceDeskApp')
.controller('DepartmentCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.departments = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    

    $http.get('/api/department').success(function(departments) {
        $scope.departments = departments;
        socket.syncUpdates('department', $scope.departments,function(event,department,departments){
        });
    });

    $scope.open = function (department) {

        var modalInstance = $modal.open({
            templateUrl: 'app/departments/partials/department-details.modal.html',
            controller: 'DepartmentsModalInstanceCtrl',
            //size: size,
            resolve: {
                departments: function() {
                    return department;

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

    $scope.delete = function(department) {
        $http.delete('/api/department/' + department._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('department');
    });
});
