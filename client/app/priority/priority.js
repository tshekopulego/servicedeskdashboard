'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/priority', {
        templateUrl: 'app/priority/partials/priority.html',
        controller: 'PriorityCtrl'
    })
    .when('/priority/add', {
        templateUrl: 'app/priority/partials/add-priority.html',
        controller: 'AddPriorityCtrl'
    }).when('/priority/edit/:id', {
        templateUrl: 'app/priority/partials/edit-priority.html',
        controller: 'EditPriorityCtrl'
    });
});
