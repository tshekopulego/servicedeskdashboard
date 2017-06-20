'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/stats', {
        templateUrl: 'app/stats/partials/stats.dashboard.html',
        controller: 'StatsCtrl'
    })
    .when('/rfccallStats', {
        templateUrl: 'app/admin/partials/rfccallStats.html',
        controller: 'RfccallStatsCtrl'
    })
    .when('/issuesStats', {
        templateUrl: 'app/admin/partials/issuesStats.html',
        controller: 'IssuesStatsCtrl'
    })
    .when('/clients/invoice', {
        templateUrl: 'app/admin/partials/client-invoice.html',
        controller: 'ClientsCtrl'
    });
});
