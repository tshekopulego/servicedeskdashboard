'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/evaluation', {
        templateUrl: 'app/evaluation-outcome/partials/evaluationoutcome.html',
        controller: 'EvaluationCtrl'
    })
    .when('/evaluation/add', {
        templateUrl: 'app/evaluation-outcome/partials/add-evaluationoutcome.html',
        controller: 'AddEvaluationCtrl'
    })
    .when('/evaluation/edit/:id', {
        templateUrl: 'app/evaluation-outcome/partials/edit-evaluationoutcome.html',
        controller: 'EditEvaluatiionCtrl'
    });
});
