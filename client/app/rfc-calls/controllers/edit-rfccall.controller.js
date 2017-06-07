'use strict';

angular.module('serviceDeskApp')
.controller('EditRfccallCtrl', function ($scope, $http, $location, $window, $routeParams, socket) {

    $scope.rfccall = {};
    $scope.submitted = false;
    $scope.rfccall_id = $routeParams.id;    

    $http.get('/api/rfc-calls/' + $scope.rfccall_id ).success(function(rfccall) {
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
    

    $scope.editRfcCall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if(isValid && $scope.submitted) {
            
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
                
            $http.put('/api/rfc-calls/' + $scope.rfccall_id,$scope.rfccall);
            console.log(rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
