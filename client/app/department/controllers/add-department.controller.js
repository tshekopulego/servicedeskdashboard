'use strict';

angular.module('serviceDeskApp')
.controller('AddDepartmentCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.department = {};
    $scope.submitted = false;

    $http.get('/api/users').success(function(users) {

        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.addDepartment = function(department,isValid) {
        $scope.submitted = true;
        $scope.department = department;
        if($scope.submitted) {
            
            $scope.department.departmentManager = department.user._id;
            
            $http.post('/api/department',$scope.department);
            $scope.issue = '';
            $location.path('/issue');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
