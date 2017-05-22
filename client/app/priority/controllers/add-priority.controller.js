'use strict';

angular.module('serviceDeskApp')
.controller('AddPriorityCtrl', function ($scope, $http, $location, $window) {

    $scope.issuepriority = {};
    $scope.submitted = false;

    $scope.addPriority = function(issuepriority,isValid) {
        $scope.submitted = true;
        $scope.issuepriority = issuepriority;
        if(isValid && $scope.submitted) {
            $http.post('/api/priority',issuepriority);
            $scope.issuepriority = '';
            $location.path('/priority');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
