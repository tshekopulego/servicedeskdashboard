'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/officeparks', {
        templateUrl: 'app/officeparks/partials/officeparks.html',
        controller: 'OfficeParksCtrl'
    })
    .when('/officeparks/add', {
        templateUrl: 'app/officeparks/partials/add-officepark.html',
        controller: 'AddOfficeParkCtrl'
    })
    .when('/officeparks/edit/:id', {
        templateUrl: 'app/officeparks/partials/edit-officepark.html',
        controller: 'EditOfficeParkCtrl'
    });
});
