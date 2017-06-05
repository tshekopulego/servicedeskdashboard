'use strict';

angular.module('serviceDeskApp')
.controller('AddICTStoreCtrl', function ($scope, $http, $location, $window) {

    $scope.issueictstore = {};
    $scope.submitted = false;

    $scope.addICTStore = function(issueictstore,isValid) {
        $scope.submitted = true;
        $scope.issueictstore = issueictstore;
        if(isValid && $scope.submitted) {
            $http.post('/api/ictstore',issueictstore);
            $scope.issueictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});