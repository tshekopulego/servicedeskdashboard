'use strict';

angular.module('serviceDeskApp')
.controller('EditChannelCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.channel = {};
    $scope.submitted = false;
    $scope.channel_id = $routeParams.id;

    $http.get('/api/channel/' + $scope.channel_id ).success(function(channel) {
        $scope.channel = channel;
    })

    $scope.editChannel = function(channel,isValid) {
        $scope.submitted = true;
        $scope.channel = channel;
        if(isValid && $scope.submitted) {
            $http.put('/api/channel/' + $scope.channel_id,channel);
            $scope.channel = '';
            $location.path('/channel');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
