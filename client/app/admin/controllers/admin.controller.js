'use strict';

angular.module('serviceDeskApp')
.controller('AdminCtrl', function ($scope, $http, socket, $filter, $modal, $log) {
    $scope.users = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.delete = function(user) {
        $http.delete('/api/users/' + user._id);
    };

    $scope.activate = function(user) {
        var newUser = {
            status: 1
        };
        $http.put('api/users/' + user._id,newUser);
    };

    $scope.deactivate = function(user) {
        var newUser = {
            status: 0
        };
        $http.put('api/users/' + user._id,newUser);
    };

    $scope.open = function (user) {

        var modalInstance = $modal.open({
            templateUrl: 'app/admin/partials/user-details.modal.html',
            controller: 'UserModalInstanceCtrl',
            //size: size,
            resolve: {
                user: function() {
                    return user;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.restoreDB = function() {
        $http.get('/api/admin/restore-latest-backup').success(function(output) {
            console.log(output);
        });
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('user');
    });
});
