'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
    $routeProvider
    .when('/category', {
        templateUrl: 'app/category/partials/category.html',
        controller: 'CategoryCtrl'
    })
    .when('/category/add', {
        templateUrl: 'app/category/partials/category-comments.modal.html',
        controller: 'CategoryCommentsModalInstanceCtrl'
    })
    .when('/category/add', {
        templateUrl: 'app/category/partials/add-category.html',
        controller: 'AddCategoryCtrl'
    }).when('/category/edit/:id', {
        templateUrl: 'app/category/partials/edit-category.html',
        controller: 'EditCategoryCtrl'
    });
});
