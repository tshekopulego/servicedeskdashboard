'use strict';

angular.module('serviceDeskApp')
.controller('EditRequesttypeCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.requesttype = {};
    $scope.submitted = false;
    $scope.requesttype_id = $routeParams.id;

    $http.get('/api/request-type/' + $scope.requesttype_id).success(function(requesttype) {
        $scope.requesttype = requesttype;
    })

    $scope.editRequesttype = function(requesttype,isValid) {
        $scope.submitted = true;
        $scope.requesttype = requesttype;
        if(isValid && $scope.submitted) {
            $http.put('/api/request-type/' + $scope.requesttype_id,requesttype);
            $scope.requesttype = '';
            $location.path('/requesttype');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
