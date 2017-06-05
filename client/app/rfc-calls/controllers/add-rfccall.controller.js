'use strict';

angular.module('serviceDeskApp')
.controller('AddRfccallCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.rfccall = {};
    $scope.submitted = false;
    
    $http.get('/api/evaluation-outcome').success(function(evaluationoutcomes) {
        $scope.evaluationoutcomes = evaluationoutcomes; 
        socket.syncUpdates('evaluationoutcome',
        $scope.evaluationoutcomes,function(event,evaluationoutcome,evaluationoutcomes){
        });
    });
    
    $http.get('/api/request-type').success(function(requesttypes) {
        $scope.requesttypes = requesttypes;
        socket.syncUpdates('requesttype', 
        $scope.requesttypes,function(event,requesttype,requesttypes){
        });
    });

    $scope.addRfccall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if($scope.submitted) {
            
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
            $scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
                
            $http.post('/api/rfc-calls',$scope.rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});