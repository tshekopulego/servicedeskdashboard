'use strict';

angular.module('serviceDeskApp')
    .controller('ConfirmCtrl', function ($scope, Auth, $location, $routeParams) {
        $scope.errors = {};
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.confirmToken = $routeParams.confirmToken;
        var confirmationMailSend = false;
        $scope.invalidToken = false;


        if ($scope.confirmToken) {
            Auth.createUser($scope.confirmToken)
                .then( function() {
                    // Logged in, redirect to home
                    $location.path('/');
                })
                .catch( function() {
                    $scope.invalidToken = true;
                });
        }


        $scope.sendConfirmationMail = function() {

            Auth.sendConfirmationMail();
        };

        $scope.confirmationMailSend = function() {
            return confirmationMailSend;
        };


    });
