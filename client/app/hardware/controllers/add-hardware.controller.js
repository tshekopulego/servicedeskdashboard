'use strict';

angular.module('serviceDeskApp')
.controller('AddHardwareCtrl', function ($scope, $http, $window, $location) {

    $scope.hardware = {};

    $scope.addHardware = function(hardware,isValid) {
        $scope.submitted = true;
        if(isValid && $scope.submitted) {
            $http.post('/api/hardware',hardware);
            $scope.hardware = {};
            $location.path('/hardware');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
