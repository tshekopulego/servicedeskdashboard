'use strict';

angular.module('serviceDeskApp')
.controller('EditHardwareCtrl', function ($scope, $http, $window, $location, $routeParams) {

    $scope.hardware = {};
    $scope.hardware_id = $routeParams.id;

    $http.get('/api/hardware/' + $scope.hardware_id).success(function(hardware) {
        $scope.hardware = hardware;
    });

    $scope.editHardware = function(hardware,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/hardware/' + $scope.hardware_id,hardware);
            $scope.hardware = {};
            $location.path('/hardware');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
