'use strict';

angular.module('serviceDeskApp')
.controller('EditRfccallCtrl', function ($scope, $http, $location, $window, socket, $routeParams) {

    $scope.rfccall = {};
    $scope.submitted = false;
    $scope.rfccall_id = $routeParams.id;

    $http.get('/api/rfc-calls/' + $scope.rfccall_id ).success(function(rfccall) {
        $scope.rfccall = rfccall;
    })
    
	 $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });
	
	 $http.get('/api/evaluation-outcome').success(function(evaluationoutcomes) {
        $scope.evaluationoutcomes = evaluationoutcomes;
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
			$scope.rfccall.rfccallPriority = rfccall.priority._id;
			$scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
			$scope.rfccall.department = rfccall.department._id;
			
			$scope.rfccall.priorityId = rfccall.priority.priorityId;
			$scope.rfccall.changeRequestTypeId = rfccall.requesttype.changerequesttypeId;
			$scope.rfccall.callEvaluationOutcomeId = rfccall.evaluationoutcome.evaluationoutcomeId;
			$scope.rfccall.departmentId = rfccall.department.departmentId;
			
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
