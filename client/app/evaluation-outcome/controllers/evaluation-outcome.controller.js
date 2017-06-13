'use strict';

angular.module('serviceDeskApp')
.controller('EvaluationOutcomeCtrl', function ($scope, $http, $window, socket) {

    $scope.evaluationoutcome = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/evaluation-outcome').success(function(evaluationoutcomes) {
        $scope.evaluationoutcomes = evaluationoutcomes;
        socket.syncUpdates('evaluationoutcome', $scope.evaluationoutcomes,function(event,evaluationoutcome,evaluationoutcomes){
        });
    });

    $scope.delete = function(evaluationoutcome) {
        $http.delete('/api/evaluation-outcome/' + evaluationoutcome._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('evaluationoutcome');
    });
});
