'use strict';

angular.module('serviceDeskApp')
.controller('RolesCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.roles = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    

    $http.get('/api/role').success(function(roles) {
        $scope.roles = roles;
        socket.syncUpdates('role', $scope.roles,function(event,role,roles){
        });
    });

    $scope.open = function (role) {

        var modalInstance = $modal.open({
            templateUrl: 'app/role/partials/role-details.model.html',
            controller: 'RoleModalInstanceCtrl',
            //size: size,
            resolve: {
                role: function() {
                    return role;
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

    $scope.delete = function(role) {
        $http.delete('/api/role/' + role._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('role');
    });
});
