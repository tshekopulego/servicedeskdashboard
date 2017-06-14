'use strict';

angular.module('serviceDeskApp')
.controller('AddRequesttypeCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.issuepriority = {};
    $scope.submitted = false;

    $scope.addRequesttype = function(requesttype,isValid) {
        $scope.submitted = true;
        $scope.requesttype = requesttype;
        if(isValid && $scope.submitted) {
            $http.post('/api/request-type',$scope.requesttype);
            $scope.requesttype = '';
            $location.path('/requesttype');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
