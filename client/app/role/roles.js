'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/roles', {
        templateUrl: 'app/role/partials/roles.html',
        controller: 'RolesCtrl'
    })
    .when('/roles/add', {
        templateUrl: 'app/role/partials/add-role.html',
        controller: 'AddRolesCtrl'
    })
    .when('/roles/edit/:id', {
        templateUrl: 'app/role/partials/edit-role.html',
        controller: 'EditRolesCtrl'
    });
});
