'use strict';

angular.module('serviceDeskApp')
.controller('EditEvaluationOutconeCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.evaluationoutcome = {};
    $scope.submitted = false;
    $scope.evaluationoutcome_id = $routeParams.id;

    $http.get('/api/evaluation-outcome/' + $scope.evaluationoutcome_id ).success(function(evaluationoutcome) {
        $scope.evaluationoutcome = evaluationoutcome;
    })

    $scope.editEvaluationoutcome = function(evaluationoutcome,isValid) {
        $scope.submitted = true;
        $scope.evaluationoutcome = evaluationoutcome;
        if(isValid && $scope.submitted) {
            $http.put('/api/evaluation-outcome/' + $scope.evaluationoutcome_id,evaluationoutcome);
            $scope.evaluationoutcome = '';
            $location.path('/evaluationoutcome');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
