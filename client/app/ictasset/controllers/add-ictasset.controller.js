'use strict';

angular.module('serviceDeskApp')
.controller('AddICTAssetCtrl', function ($scope, $http, $location, $window) {

    $scope.issueictasset = {};
    $scope.submitted = false;

    $scope.addICTAsset = function(issueictasset,isValid) {
        $scope.submitted = true;
        $scope.issueictasset = issueictasset;
        if(isValid && $scope.submitted) {
            $http.post('/api/ictasset',issueictasset);
            $scope.issueictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});