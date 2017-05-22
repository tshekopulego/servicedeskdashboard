'use strict';

angular.module('serviceDeskApp')
.controller('PwdResetCtrl', function ($scope, Auth, $routeParams) {

    var passwordResetToken = $routeParams.passwordResetToken;
    var pwdResetState = 'mailform';
    $scope.pwdResetMailSend = false;

    if (passwordResetToken) {
        Auth.confirmResetedPassword( passwordResetToken)
        .then( function() {
            pwdResetState = 'valid_token';
        })
        .catch( function() {
            pwdResetState = 'invalid_token';
        });
    }

    $scope.sendPwdResetMail = function(form) {
        $scope.submitted = true;
        form.email.$setValidity('unknownMailAddress',true);
        if(form.$valid) {
            $scope.pwdResetMailSend = true;
            Auth.sendPwdResetMail( $scope.reset.email, $scope.reset.newPassword)
            .then( function() {
                pwdResetState = 'mailsent';
            })
            .catch( function() {
                form.email.$setValidity('unknownMailAddress',false);
                $scope.pwdResetMailSend = false;
            });
        }
    };

    $scope.resetStateIs = function(state) {
        return pwdResetState===state;
    };
});
