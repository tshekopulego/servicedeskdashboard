'use strict';

angular.module('serviceDeskApp')
.controller('EvaluationCtrl', function ($scope, $http, $window, socket) {

    $scope.evaluations = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/evaluation-outcome').success(function(evaluations) {
        $scope.evaluations = evaluations;
        socket.syncUpdates('evaluation', $scope.evaluations,function(event,evaluation,evaluations){
        });
    });

    $scope.delete = function(evaluation) {
        $http.delete('/api/evaluation-outcome/' + evaluation._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('evaluation');
    });
});
