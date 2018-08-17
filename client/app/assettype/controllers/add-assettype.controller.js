'use strict';

angular.module('serviceDeskApp')
.controller('AddAssettypeCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.issueassettype = {};
    $scope.submitted = false;

    $scope.addAssettype = function(issueassettype,isValid) {
        $scope.submitted = true;
        $scope.issueassettype = issueassettype;
        if(isValid && $scope.submitted) {
            $http.post('/api/assettype',issueassettype);
            $scope.issueassettype = '';
            $location.path('/assettype');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
