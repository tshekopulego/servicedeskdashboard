'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/report', {
        templateUrl: 'app/report/partials/reports.html',
        controller: 'ReportCtrl'
    })
    
    
    .when('/report/add', {
        templateUrl: 'app/report/partials/dailytarget.html',
        controller: 'ReportCtrl'
    })
    
    .when('/report/edit', {
        templateUrl: 'app/report/partials/slaoverdue.html',
        controller: 'ReportCtrl'
    })
    .when('report', {
        templateUrl: 'app/report/partials/reports.html',
        controller: 'ReportCtrl'
    });
});