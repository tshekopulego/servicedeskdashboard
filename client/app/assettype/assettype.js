'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/assettype', {
        templateUrl: 'app/assettype/partials/assettype.html',
        controller: 'AssettypeCtrl'
    })
    .when('/assettype/add', {
        templateUrl: 'app/assettype/partials/add-assettype.html',
        controller: 'AddAssettypeCtrl'
    }).when('/assettype/edit/:id', {
        templateUrl: 'app/assettype/partials/edit-assettype.html',
        controller: 'EditAssettypeCtrl'
    });
});
