'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/ictasset', {
        templateUrl: 'app/ictasset/partials/ictassets.html',
        controller: 'ICTAssetCtrl'
    })
    .when('/ictasset/add', {
        templateUrl: 'app/ictasset/partials/add-ictasset.html',
        controller: 'AddICTAssetCtrl'
    }).when('/ictasset/edit/:id', {
        templateUrl: 'app/ictasset/partials/edit-ictasset.html',
        controller: 'EditICTAssetCtrl'
    });
});
