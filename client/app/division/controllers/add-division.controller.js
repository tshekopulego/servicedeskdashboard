'use strict';

angular.module('serviceDeskApp')
.controller('AddDivisionCtrl', function ($scope, $http, $window, $location) {

    $scope.division = {};

    $scope.addDivision = function(division,isValid) {
        $scope.submitted = true;
        console.log(division);
        if(isValid && $scope.submitted) {
            $http.post('/api/division',division);
            $scope.division = {};
            $location.path('/division');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
