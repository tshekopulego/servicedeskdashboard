'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/issues', {
        templateUrl: 'app/issues/partials/issues.html',
        controller: 'IssueCtrl'
    })
    .when('/issues/add', {
        templateUrl: 'app/issues/partials/add-issue.html',
        controller: 'AddIssueCtrl'
    })
    .when('/issues/edit', {
        templateUrl: 'app/issues/partials/edit-issue.html',
        controller: 'EditIssueCtrl'
    })
    .when('/issues/edit/:id', {
        templateUrl: 'app/issues/partials/edit-issue.html',
        controller: 'EditIssueCtrl'
    })
    .when('/issues/comments/:id', {
        templateUrl: 'app/issues/partials/issue-comments.modal.html',
        controller: 'IssueCommentsModalInstanceCtrl'
    });
});
