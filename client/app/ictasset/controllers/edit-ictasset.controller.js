'use strict';

angular.module('serviceDeskApp')
.controller('EditICTAssetCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.ictasset = {};
    $scope.submitted = false;
    $scope.ictasset_id = $routeParams.id;

    $http.get('/api/ictasset/' + $scope.ictasset_id ).success(function(ictasset) {
        $scope.ictasset = ictasset;
    })

    $scope.editICTAsset = function(ictasset,isValid) {
        $scope.submitted = true;
        $scope.ictasset = ictasset;
        if(isValid && $scope.submitted) {
            $http.put('/api/ictasset/' + $scope.ictasset_id,ictasset);
            $scope.ictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});