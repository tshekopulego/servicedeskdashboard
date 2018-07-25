'use strict';

angular.module('serviceDeskApp')
.controller('EditRolesCtrl', function ($scope, $http, $location, $window, socket, $routeParams) {

    $scope.role = {};
    $scope.submitted = false;
    $scope.role_id = $routeParams.id;

    $http.get('/api/role/' + $scope.role_id ).success(function(role) {
        $scope.role = role;
    })
       
    $http.get('/api/department').success(function(department) {
        $scope.departments = department;
        console.log(department);
        socket.syncUpdates('department', $scope.departments,function(event,department,departments){
        });
    });
    
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.editRole = function(role,isValid) {
        $scope.submitted = true;
        $scope.role = role;
        
        if(isValid && $scope.submitted) {
            
            $scope.role.firstName = role.user._id;
            $scope.role.departmentName = role.department._id;
            console.log($scope.role) 
            $http.put('/api/role',$scope.role._id,role);
            $scope.role = '';
            $location.path('/roles');
        }
    };
    
    $scope.cancel = function() {
        $window.history.back();
    };
});