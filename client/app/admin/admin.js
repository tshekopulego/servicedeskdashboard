'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/users', {
        templateUrl: 'app/admin/partials/admin.html',
        controller: 'AdminCtrl'
    })
    .when('/dashboard', {
        templateUrl: 'app/admin/partials/dashboard.html',
        controller: 'DashboardCtrl'
    })
    .when('/clients', {
        templateUrl: 'app/admin/partials/clients.html',
        controller: 'ClientsCtrl'
    })
    .when('/clients/invoice', {
        templateUrl: 'app/admin/partials/client-invoice.html',
        controller: 'ClientsCtrl'
    })
    .when('/admin/edit/:id', {
        templateUrl: 'app/admin/partials/edit.html',
        controller: 'EditCtrl'
    })
    .when('/admin/add', {
        templateUrl: 'app/admin/partials/add.html',
        controller: 'AddCtrl'
    });
});
