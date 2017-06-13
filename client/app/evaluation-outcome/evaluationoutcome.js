'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/evaluationOutcome', {
        templateUrl: 'app/evaluation-outcome/partials/evaluationoutcome.html',
        controller: 'EvaluationOutcomeCtrl'
    })
    .when('/evaluationOutcome/add', {
        templateUrl: 'app/evaluation-outcome/partials/add-evaluation-outcome.html',
        controller: 'AddEvaluationOutcomeCtrl'
    })
    .when('/evaluationOutcome/edit/:id', {
        templateUrl: 'app/evaluation-outcome/partials/edit-evaluation-outcome.html',
        controller: 'EditEvaluationOutconeCtrl'
    });
});
