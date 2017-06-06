'use strict';

angular.module('serviceDeskApp')
.controller('AddIssueStatusCtrl', function ($scope, $http, $window, $location) {

    $scope.issuestatus = {};

    $scope.addissueStatus = function(issuestatus,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.post('/api/issue-status',issuestatus);
            $scope.issuestatus = {};
            $location.path('/issuestatus');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
