'use strict';

angular.module('serviceDeskApp')
.controller('EditCategoryCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.category = {};
    $scope.submitted = false;
    $scope.category_id = $routeParams.id;

    $http.get('/api/category/' + $scope.category_id ).success(function(category) {
        $scope.category = category;
    })

    $scope.editCategory = function(category,isValid) {
        $scope.submitted = true;
        $scope.category = category;
        if(isValid && $scope.submitted) {
            $http.put('/api/category/' + $scope.category_id,category);
            $scope.category = '';
            $location.path('/category');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
