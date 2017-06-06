'use strict';

angular.module('serviceDeskApp')
.controller('IssueStatusCtrl', function ($scope, $http, $window, socket) {

    $scope.issuestatuses = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/issue-status').success(function(issuestatuses) {
        $scope.issuestatuses = issuestatuses;
        socket.syncUpdates('issuestatus', $scope.issuestatuses,function(event,issuestatus,issuestatuses){
        });
    });

    $scope.delete = function(issuestatus) {
        $http.delete('/api/issue-status/' + issuestatus._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('issuestatus');
    });
});
