'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/ictstore', {
        templateUrl: 'app/ictstore/partials/ictstore.html',
        controller: 'ICTStoreCtrl'
    })
    .when('/ictstore/add', {
        templateUrl: 'app/ictstore/partials/add-ictstore.html',
        controller: 'AddICTStoreCtrl'
    }).when('/ictstore/edit/:id', {
        templateUrl: 'app/ictstore/partials/edit-ictstore.html',
        controller: 'EditICTStoreCtrl'
    });
});
