'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/division', {
        templateUrl: 'app/request-type/partials/division.html',
        controller: 'DivisionCtrl'
    })
    .when('/division/add', {
        templateUrl: 'app/request-type/partials/add-division.html',
        controller: 'RequesttypeCtrl'
    })
    .when('/division/edit/:id', {
        templateUrl: 'app/request-type/partials/edit-division.html',
        controller: 'EditRequesttypeCtrl'
    });
});
