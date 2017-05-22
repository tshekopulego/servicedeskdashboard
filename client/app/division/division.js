'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/division', {
        templateUrl: 'app/division/partials/division.html',
        controller: 'DivisionCtrl'
    })
    .when('/division/add', {
        templateUrl: 'app/division/partials/add-division.html',
        controller: 'AddDivisionCtrl'
    })
    .when('/division/edit/:id', {
        templateUrl: 'app/division/partials/edit-division.html',
        controller: 'EditDivisionCtrl'
    });
});
