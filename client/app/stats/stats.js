'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/stats', {
        templateUrl: 'app/stats/partials/issues.stats.html',
        controller: 'PiechartCtrl'
    })
    .when('/stats/issuesStats', {
        templateUrl: 'app/role/partials/add-role.html',
        controller: 'IssueStatsCtrl'
    })
    .when('/stats/rfccallStats', {
        templateUrl: 'app/role/partials/rfccallStats.html',
        controller: 'EditRolesCtrl'
    });
});