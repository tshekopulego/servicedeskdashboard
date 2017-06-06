'use strict';

angular.module('serviceDeskApp')
.controller('RequesttpeCtrl', function ($scope, $http, $window, socket) {

    $scope.requesttpe = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/request-tpe').success(function(requesttpe) {
        $scope.requesttpes = requesttpes;
        socket.syncUpdates('requesttpe', $scope.requesttpes,function(event,requesttpe,requesttpes){
        });
    });

    $scope.delete = function(requesttpe) {
        $http.delete('/api/request-tpe/' + requesttpe._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('requesttpe');
    });
});
