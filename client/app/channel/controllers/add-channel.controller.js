'use strict';

angular.module('serviceDeskApp')
.controller('AddChannelCtrl', function ($scope, $http, $location, $window) {

    $scope.issuechannel = {};
    $scope.submitted = false;
    
    $http.get('/api/counter').success(function(counters) {
        $scope.counters = counters;
    })

    $scope.addChannel = function(issuechannel,isValid) {
        $scope.submitted = true;
        $scope.issuechannel = issuechannel;
        if(isValid && $scope.submitted) {
            
            $scope.issuechannel.id = issuechannel.counter.seq;
            $http.post('/api/channel',issuechannel);
            $scope.issuechannel = '';
            $location.path('/channel');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});