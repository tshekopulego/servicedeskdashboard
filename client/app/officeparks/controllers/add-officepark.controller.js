'use strict';

angular.module('serviceDeskApp')
.controller('AddOfficeParkCtrl', function ($scope, $http, $location, $window, $filter) {

    $scope.officepark = {};
    $scope.submitted = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.today = new Date();

    $scope.addOfficePark = function(officepark,isValid) {
        $scope.submitted = true;
        $scope.officepark = officepark;
        if(isValid && $scope.submitted) {
            $http.post('/api/officeparks',officepark);
            $scope.officepark = '';
            $location.path('/officeparks');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
