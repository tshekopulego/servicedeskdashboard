'use strict';

angular.module('serviceDeskApp')
.controller('SignupCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = false;

    $scope.register = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.createGuest({
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                email: $scope.user.email,
                role: 'User',
                password: $scope.user.password,
                added: Date.now()
            })
            .then( function() {
                // Account created, redirect to home
                $location.path('/');
            })
            .catch( function(err) {
                err = err.data;
                $scope.errors = {};

                // Update validity of form fields that match the mongoose errors
                angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                });
            });
        }
    };

    $scope.registerClient = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.registerClient({
                email: $scope.user.email,
                phoneNumber: $scope.user.phoneNumber,
                password: $scope.user.password,
                added: Date.now()
            })
            .then( function() {
                // Account created, redirect to home
                $location.path('/');
            })
            .catch( function(err) {
                err = err.data;
                $scope.errors = {};

                // Update validity of form fields that match the mongoose errors
                angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                });
            });
        }
    };

    $scope.passwordsMatch = function(value) {
        //console.log(value);
        if(value && value === $scope.user.password)
            return true;
        else
            return false;
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
});
