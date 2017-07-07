'use strict';

angular.module('serviceDeskApp')
.controller('CounterCtrl', function ($scope, $http, $modal, $log, $filter) {

	$scope.counter = [];
    
	$http.post('/api/counter').success(function(counter) {
		$scope.counter = counter;
	});

	$scope.cancel = function() {
		$window.history.back();
	};

	$scope.delete = function(counter) {
		$http.delete('/api/counter/' + counter._id);
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('counter');
	});
});