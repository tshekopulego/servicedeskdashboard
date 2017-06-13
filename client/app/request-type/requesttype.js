'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/requesttype', {
        templateUrl: 'app/request-type/partials/add-requesttype',
        controller: 'RequesttpeCtrl'
    })
    .when('/requesttype/add', {
        templateUrl: 'app/request-type/partials/add-requesttype.html',
        controller: 'AddRequesttypeCtrl'
    })
    .when('/requesttype/edit/:id', {
        templateUrl: 'app/request-type/partials/edit-division.html',
        controller: 'EditRequesttypeCtrl'
    });
});
