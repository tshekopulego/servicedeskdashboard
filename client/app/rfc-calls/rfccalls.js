'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/rfccalls', {
        templateUrl: 'app/rfc-calls/partials/rfccalls.html',
        controller: 'RfccallCtrl'
    })
    .when('/rfccalls/add', {
        templateUrl: 'app/rfc-calls/partials/add-rfccall.html',
        controller: 'AddRfccallCtrl'
    })
    .when('/rfccalls/edit/:id', {
        templateUrl: 'app/rfc-calls/partials/edit-rfccalls.html',
        controller: 'EditRfccallCtrl'
    });
});