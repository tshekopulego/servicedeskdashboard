'use strict';

angular.module('serviceDeskApp')
.controller('HardwareCtrl', function ($scope, $http, $window, socket) {

    $scope.hardware = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/hardware').success(function(hardwares) {
        $scope.hardwares = hardwares;
        socket.syncUpdates('hardware', $scope.hardwares,function(event,hardware,hardwares){
        });
    });

    $scope.delete = function(hardware) {
        $http.delete('/api/hardware/' + hardware._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('hardware');
    });
});
