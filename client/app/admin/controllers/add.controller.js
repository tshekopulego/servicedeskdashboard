angular.module('serviceDeskApp')
.controller('AddCtrl', function ($scope, $http, $location, $window) {

    $scope.submitted = false;
    $scope.errors = {};


    $scope.clientTypes = [{
        value: "Individual",
        name: "Individual"
    },{
        value: "Company",
        name: "Company"
    }];

    $scope.roles = [{
        value: "user",
        name: "User"
    },{
        value: "servicedeskagent",
        name: "Service Desk Agent"
    },{
        value: "servicedeskmanager",
        name: "Service Desk Manager"
    },{
        value: "servicedeskseniormanager",
        name: "Service Desk Senior Manager"
    },{
        value: "changeauthority",
        name: "Change Authority"
    },{
        value: "technician",
        name: "Technician"
    },{
        value: "ictstoreagent",
        name: "ICT Store Agent"
    }];

    $scope.extraContacts = {};

    $scope.addUser = function(user,form,isValid) {
        $scope.submitted = true;
        $scope.user = user;
        if(isValid && $scope.submitted) {

            if(user.zone)
                user.zone = user.zone._id;

            if(!_.isEmpty($scope.extraContacts))
                user.extraContacts = $scope.extraContacts;

            $http.post('/api/users',user)
            .then(function() {
                $scope.user = '';
                $location.path('/users/');
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
        if($scope.submitted && $scope.user.role === 'user') {
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
