'use strict';

angular.module('serviceDeskApp')
.controller('EditOfficeParkCtrl', function ($scope, $http, $location, $window, $routeParams, $filter) {

    $scope.officepark = {};
    $scope.submitted = false;
    $scope.officepark_id = $routeParams.id;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

  $scope.today = new Date();

  $http.get('/api/officeparks/'+$scope.officepark_id).success(function(officepark) {
        $scope.officepark = officepark;
  });

  $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
  };

  $scope.editOfficePark = function(officepark,isValid) {
        $scope.submitted = true;
        $scope.officepark = officepark;
        if(isValid && $scope.submitted) {
            console.log(officepark);
            $http.put('/api/officeparks/' + $scope.officepark_id,officepark);
            $scope.officepark = '';
            $location.path('/officeparks');
        }
  };

  $scope.cancel = function() {
        $window.history.back();
  };
});
