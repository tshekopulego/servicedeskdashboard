'use strict';

angular.module('serviceDeskApp')
.controller('EditEvaluationCtrl', function ($scope, $http, $window, $location, $routeParams) {

    $scope.evaluation = {};
    $scope.evaluation_id = $routeParams.id;

    $http.get('/api/evaluation-outcome/' + $scope.evaluation_id).success(function(evaluation) {
        $scope.evaluation = evaluation;
    });

    $scope.editEvaluation = function(evaluation,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/evaluation-outcome/' + $scope.evaluation_id,evaluation);
            $scope.evaluation = {};
            $location.path('/evaluation');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
