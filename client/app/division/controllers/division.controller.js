'use strict';

angular.module('serviceDeskApp')
.controller('DivisionCtrl', function ($scope, $http, $window, socket) {

    $scope.divisions = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
        socket.syncUpdates('division', $scope.divisions,function(event,division,divisions){
        });
    });

    $scope.delete = function(division) {
        $http.delete('/api/division/' + division._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('division');
    });
});
