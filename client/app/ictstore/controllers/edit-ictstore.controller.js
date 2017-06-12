'use strict';

angular.module('serviceDeskApp')
.controller('EditICTStoreCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.ictstore = {};
    $scope.submitted = false;
    $scope.ictstore_id = $routeParams.id;

    $http.get('/api/ictstore/' + $scope.ictstore_id ).success(function(ictstore) {
        $scope.ictstore = ictstore;
    })

    $scope.editICTStore = function(ictstore,isValid) {
        $scope.submitted = true;
        $scope.ictstore = ictstore;
        if(isValid && $scope.submitted) {
            $http.put('/api/ictstore/' + $scope.ictstore_id,ictstore);
            $scope.ictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});