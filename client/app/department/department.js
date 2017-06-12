'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/department', {
        templateUrl: 'app/department/partials/department.html',
        controller: 'DepartmentCtrl'
    })
    .when('/department/add', {
        templateUrl: 'app/department/partials/add-department.html',
        controller: 'AddDepartmentCtrl'
    })
    .when('/department/edit/:id', {
        templateUrl: 'app/department/partials/edit-department.html',
        controller: 'EditDepartmentCtrl'
    });
});