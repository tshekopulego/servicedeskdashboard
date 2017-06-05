'use strict';

angular.module('serviceDeskApp')
.controller('AddChannelCtrl', function ($scope, $http, $location, $window) {

    $scope.issuechannel = {};
    $scope.submitted = false;

    $scope.addChannel = function(issuechannel,isValid) {
        $scope.submitted = true;
        $scope.issuechannel = issuechannel;
        if(isValid && $scope.submitted) {
            $http.post('/api/channel',issuechannel);
            $scope.issuechannel = '';
            $location.path('/channel');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});