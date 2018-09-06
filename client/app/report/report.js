'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/report', {
        templateUrl: 'app/report/partials/reports.html',
        controller: 'GeneralReportCtrl'
    })
    
    
    .when('/report/add', {
        templateUrl: 'app/report/partials/dailytarget.html',
        controller: 'GeneralReportCtrl'
    })
    
    .when('/report/edit', {
        templateUrl: 'app/report/partials/slaoverdue.html',
        controller: 'GeneralReportCtrl'
    })
    .when('/generalreport', {
        templateUrl: 'app/report/partials/general-report.html',
        controller: 'GeneralReportCtrl'
    })
    .when('/priorityreport', {
        templateUrl: 'app/report/partials/incident-priority-report.html',
        controller: 'IncidentPriorityReportCtrl'
    })
    .when('/resolutionreport', {
        templateUrl: 'app/report/partials/incident-resolution.html',
        controller: 'ResolutionReportCtrl'
    })
    .when('/assetreport', {
        templateUrl: 'app/report/partials/asset-report.html',
        controller: 'AssetReportCtrl'
    });
    
    
});