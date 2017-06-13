'use strict';

angular.module('serviceDeskApp')
.controller('AddCostcenterCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.issuecostcenter = {};
    $scope.submitted = false;

    $scope.addCostcenter = function(issuecostcenter,isValid) {
        $scope.submitted = true;
        $scope.issuecostcenter = issuecostcenter;
        if(isValid && $scope.submitted) {
            $http.post('/api/costcenter',issuecostcenter);
            $scope.issuecostcenter = '';
            $location.path('/costcenter');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
