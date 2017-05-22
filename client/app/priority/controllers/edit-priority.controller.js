'use strict';

angular.module('serviceDeskApp')
.controller('EditPriorityCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.priority = {};
    $scope.submitted = false;
    $scope.priority_id = $routeParams.id;

    $http.get('/api/priority/' + $scope.priority_id).success(function(priority) {
        $scope.priority = priority;
    })

    $scope.editPriority = function(priority,isValid) {
        $scope.submitted = true;
        $scope.priority = priority;
        if(isValid && $scope.submitted) {
            $http.put('/api/priority/' + $scope.priority_id,priority);
            $scope.priority = '';
            $location.path('/priority');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
