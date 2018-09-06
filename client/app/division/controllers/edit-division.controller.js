'use strict';

angular.module('serviceDeskApp')
.controller('EditEvaluatiionCtrl', function ($scope, $http, $window, $location, $routeParams) {

    $scope.division = {};
    $scope.division_id = $routeParams.id;

    $http.get('/api/division/' + $scope.division_id).success(function(division) {
        $scope.division = division;
    });

    $scope.editDivision = function(division,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/division/' + $scope.division_id,division);
            $scope.division = {};
            $location.path('/division');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
