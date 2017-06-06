'use strict';

angular.module('serviceDeskApp')
.controller('EditIssueStatusCtrl', function ($scope, $http, $window, $location, $routeParams) {

    $scope.issuestatus = {};
    $scope.issuestatus_id = $routeParams.id;

    $http.get('/api/issue-status/' + $scope.issuestatus_id).success(function(issuestatus) {
        console.log(issuestatus);
        $scope.issuestatus = issuestatus;
    });

    $scope.editIssueStatus = function(issuestatus,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/issue-status/' + $scope.issuestatus_id,issuestatus);
            $scope.issuestatus = {};
            $location.path('/issuestatus');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
