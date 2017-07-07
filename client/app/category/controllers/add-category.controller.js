'use strict';

angular.module('serviceDeskApp')
.controller('AddCategoryCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.issuecategory = {};
    $scope.submitted = false;

    $scope.addCategory = function(issuecategory,isValid) {
        $scope.submitted = true;
        $scope.issuecategory = issuecategory;
        if(isValid && $scope.submitted) {
            $scope.issuecategory.id = counter.getNextSequenceValue("categories");
            
            $http.post('/api/category',issuecategory);
            $scope.issuecategory = '';
            $location.path('/category');
        }
    };
    $scope.cancel = function() {
        $window.history.back();
    };
});
