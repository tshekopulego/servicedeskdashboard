'use strict';

angular.module('serviceDeskApp')
.controller('AddDivisionCtrl', function ($scope, $http, $window, $location) {

    $scope.division = {};

    $scope.addEvaluation = function(evaluation,isValid) {
        $scope.submitted = true;
        console.log(division);
        if(isValid && $scope.submitted) {
            $http.post('/api/evaluation',evaluation);
            $scope.division = {};
            $location.path('/evaluation');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
