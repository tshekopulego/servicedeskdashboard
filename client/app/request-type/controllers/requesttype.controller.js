'use strict';

angular.module('serviceDeskApp')
.controller('RequesttypeCtrl', function ($scope, $http, $window, socket) {

    $scope.requesttpe = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/request-type').success(function(requesttypes) {
        $scope.requesttypes = requesttypes;
        socket.syncUpdates('requesttype', $scope.requesttypes,function(event,requesttype,requesttypes){
        });
    });

    $scope.delete = function(requesttpe) {
        $http.delete('/api/request-type/' + requesttype._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('requesttpe');
    });
});
