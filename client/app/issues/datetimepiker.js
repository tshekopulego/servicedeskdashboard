'use strict';

			angular
					.module('app', [
						'datetimepicker'
					])
					.config([
						'datetimepickerProvider',
						function (datetimepickerProvider) {
							datetimepickerProvider.setOptions({
								locale: 'en'
							});
						}
					])
					.run([
						'$rootScope',
						function ($rootScope) {
							$rootScope.scoped = {
								format: 'HH:mm:ss'
							};

							$rootScope.vm = {
								datetime: '05/13/2011 6:30 AM'
							}
						}
					]);