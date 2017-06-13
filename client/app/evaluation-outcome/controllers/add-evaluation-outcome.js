'use strict';

angular.module('serviceDeskApp')
.controller('AddEvaluationOutcomeCtrl', function ($scope, $http, $location, $window) {

    $scope.submitted = false;

    $scope.addEvaluationOutcome = function(issuechannel,isValid) {
        $scope.submitted = true;
        if(isValid && $scope.submitted) {
            $http.post('/api/evaluationoutcome',issuechannel);
            $scope.issuechannel = '';
            $location.path('/evaluationoutcome');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});