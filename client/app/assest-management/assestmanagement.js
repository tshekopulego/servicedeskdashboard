'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/assestmanagement', {
        templateUrl: 'app/assest-management/partials/assestmanagement.html',
        controller: 'assestmanagementCtrl'
    })
    .when('/assestmanagement/add', {
        templateUrl: 'app/assest-management/partials/add-assestmanagement.html',
        controller: 'AddAssestManagementCtrl'
    }).when('/assestmanagement/edit/:id', {
        templateUrl: 'app/assest-management/partials/edit-assestmanagement.html',
        controller: 'EditAssestmanagementCtrl'
    });
});
