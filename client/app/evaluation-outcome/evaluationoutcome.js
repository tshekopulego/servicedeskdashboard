'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/evaluationoutcome', {
        templateUrl: 'app/evaluation-outcome/partials/evaluationoutcome.html',
        controller: 'EvaluationOutcomeCtrl'
    })
    .when('/evaluationoutcome/add', {
        templateUrl: 'app/evaluation-outcome/partials/add-rfccall.html',
        controller: 'AddRfccallCtrl'
    })
    .when('/evaluationoutcome/edit/:id', {
        templateUrl: 'app/evaluation-outcome/partials/edit-rfccalls.html',
        controller: 'EditRfccallCtrl'
    });
});
