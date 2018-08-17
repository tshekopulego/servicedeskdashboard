'use strict';

angular.module('serviceDeskApp')
	.config(function ($routeProvider) {
		$routeProvider
			.when('/login', {
				templateUrl: 'app/account/login/login.html',
				controller: 'LoginCtrl'
			})
			.when('/login/:sessionToken', {
				templateUrl: 'app/account/login/login.html',
				controller: 'LoginCtrl'
			})
			.when('/signup', {
				templateUrl: 'app/account/signup/signup.html',
				controller: 'SignupCtrl'
			})
			.when('/signup-serviceagent', {
				templateUrl: 'app/account/signup/signup-servicedeskagent.html',
				controller: 'SignupCtrl'
			})
			.when('/settings', {
				templateUrl: 'app/account/settings/settings.html',
				controller: 'SettingsCtrl',
				authenticate: true
			})
			.when('/confirm', {
				templateUrl: 'app/account/confirm/confirm.html',
				controller: 'ConfirmCtrl',
				//authenticate: true
			})
			.when('/confirm/:confirmToken', {
				templateUrl: 'app/account/confirm/confirm.html',
				controller: 'ConfirmCtrl'
			})
			.when('/pwdreset', {
				templateUrl: 'app/account/pwdreset/pwdreset.html',
				controller: 'PwdResetCtrl',
			})
			.when('/pwdreset/:passwordResetToken', {
				templateUrl: 'app/account/pwdreset/pwdreset.html',
				controller: 'PwdResetCtrl'
			});
	});