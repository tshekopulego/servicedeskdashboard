'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/issuestatus', {
        templateUrl: 'app/status/partials/issuestatus.html',
        controller: 'IssueStatusCtrl'
    })
    .when('/issuestatus/add', {
        templateUrl: 'app/status/partials/add-issuestatus.html',
        controller: 'AddIssueStatusCtrl'
    })
    .when('/issuestatus/edit/:id', {
        templateUrl: 'app/status/partials/edit-issuestatus.html',
        controller: 'EditIssueStatusCtrl'
    });
});
