'use strict';

angular.module('serviceDeskApp')
.controller('EditAssettypeCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.assettype = {};
    $scope.submitted = false;
    $scope.assettype_id = $routeParams.id;

    $http.get('/api/assettype/' + $scope.assettype_id ).success(function(assettype) {
        $scope.assettype = assettype;
    })

    $scope.editAssettype = function(assettype,isValid) {
        $scope.submitted = true;
        $scope.assettype = assettype;
        if(isValid && $scope.submitted) {
            $http.put('/api/assettype/' + $scope.assettype_id,assettype);
            $scope.assettype = '';
            $location.path('/assettype');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
