angular.module('serviceDeskApp')
.controller('AddCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.submitted = false;
    $scope.errors = {};
    $scope.user = {};
    $scope.extraContacts={};

    $scope.clientTypes = [{
        value: "Individual",
        name: "Individual"
    },{
        value: "Company",
        name: "Company"
    }];
    
    $http.get('/api/role').success(function(roles) {
        $scope.roles = roles;
        socket.syncUpdates('role', $scope.roles,function(event,role,roles){
        });
    });
    
    $http.get('/api/department').success(function(departments) {
        $scope.departments = departments;
        socket.syncUpdates('departments', $scope.departments,function(event,department,departments){
        });
    });
    
    $scope.addUser = function(user,form,isValid) {
        $scope.submitted = true;
        $scope.user = user;
        if(isValid && $scope.submitted) {
            $scope.user.department = user.department.departmentName;
            $scope.user.role = user.role.roleName;
            
            if(!_.isEmpty($scope.extraContacts))
                $scope.user.extraContacts = $scope.extraContacts;

            $http.post('/api/users',user)
            .then(function() {
                $scope.user = '';
                $location.path('/users');
            }).catch(function(err) {
                err = err.data;
                $scope.errors = {};

                if(err.errors) {
                    // Update validity of form fields that match the mongoose errors
                    _.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                } else {
                    form['email'].$setValidity('mongoose', false);
                    $scope.errors['email'] = err.message;
                }
            });
        }
    };

    $scope.passwordsMatch = function(value) {
        if($scope.submitted && $scope.user.role === 'User') {
            if(value && value === $scope.user.password)
                return true;
            else
                return false;
        } else {
            return true;
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };

});
