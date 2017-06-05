'use strict';

angular.module('serviceDeskApp')
.controller('EditRfccallCtrl', function ($scope, $http, $location, $window, $routeParams) {

    $scope.category = {};
    $scope.submitted = false;
    $scope.category_id = $routeParams.id;

    $http.get('/api/rfc-calls/' + $scope.category_id ).success(function(rfccall) {
        $scope.rfccall = rfccall;
    })
    
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

    $scope.editRfccall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if(isValid && $scope.submitted) {
            
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
            $scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
                
            $http.put('/api/rfc-calls/' + $scope.rfccall._id,rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
