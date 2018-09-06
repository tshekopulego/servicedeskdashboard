'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/requesttype', {
        templateUrl: 'app/request-type/partials/requesttype.html',
        controller: 'RequesttypeCtrl'
    })
    .when('/requesttype/add', {
        templateUrl: 'app/request-type/partials/add-requesttpe.html',
        controller: 'AddRequesttypeCtrl'
    })
    .when('/requesttype/edit/:id', {
        templateUrl: 'app/request-type/partials/edit-requesttype.html',
        controller: 'EditRequesttypeCtrl'
    });
});
