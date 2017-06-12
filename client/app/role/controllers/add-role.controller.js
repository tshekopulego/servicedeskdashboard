'use strict';

angular.module('serviceDeskApp')
.controller('AddRolesCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.role = {};
    $scope.submitted = false;
    
    $http.get('/api/department').success(function(department) {
        $scope.departments = department;
        socket.syncUpdates('department', $scope.departments,function(event,department,departments){
        });
    });
    
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.addRole = function(role,isValid) {
        $scope.submitted = true;
        $scope.role = role;
        
        if($scope.submitted) {
            
            /*$scope.role.firstName = role.user._id;
            $scope.role.departmentName = role.department._id;*/
                
            $http.post('/api/role',$scope.role);
            $scope.role = '';
            $location.path('/roles');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});