'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/costcenter', {
        templateUrl: 'app/costcenter/partials/costcenter.html',
        controller: 'CostcenterCtrl'
    })
    .when('/costcenter/add', {
        templateUrl: 'app/costcenter/partials/add-costcenter.html',
        controller: 'AddCostcenterCtrlCtrl'
    }).when('/costcenter/edit/:id', {
        templateUrl: 'app/costcenter/partials/edit-costcenter.html',
        controller: 'EditCostcenterCtrlCtrl'
    });
});
