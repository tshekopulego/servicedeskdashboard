'use strict';

angular.module('serviceDeskApp')
.controller('EditCostcenterCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.costcenter = {};
    $scope.submitted = false;
    $scope.costcenter_id = $routeParams.id;

    $http.get('/api/costcenter/' + $scope.costcenter_id ).success(function(costcenter) {
        $scope.costcenter = costcenter;
    })

    $scope.editCostcenter = function(costcenter,isValid) {
        $scope.submitted = true;
        $scope.costcenter = costcenter;
        if(isValid && $scope.submitted) {
            $http.put('/api/costcenter/' + $scope.costcenter_id,costcenter);
            $scope.costcenter = '';
            $location.path('/costcenter');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
