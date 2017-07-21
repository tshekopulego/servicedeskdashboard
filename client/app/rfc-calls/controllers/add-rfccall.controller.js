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
	
		
    
    $http.get('/api/department').success(function(department) {
        $scope.departments = department;
        socket.syncUpdates('department', $scope.departments,function(event,department,departments){
        });
    });
    //console.log($scope.departments)
    
    $http.get('/api/request-type').success(function(requesttypes) {
        $scope.requesttypes = requesttypes;
        socket.syncUpdates('requesttype', 
        $scope.requesttypes,function(event,requesttype,requesttypes){
        });
    });
    
    $http.get('/api/priority').success(function(priorities) {
		$scope.priorities = priorities;
		socket.syncUpdates('priority', 
        $scope.priorities,function(event,priority,priorities){
		});
	});
    
    $scope.addRfccall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if($scope.submitted) {
            
            /*$scope.rfccall.rfccallpriorities = rfccall.priority._id;*/
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
			$scope.rfccall.rfccallPriority = rfccall.priority._id;
			$scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
			$scope.rfccall.department = rfccall.department._id;
			
			$scope.rfccall.priorityId = rfccall.priority.priorityId;
			$scope.rfccall.changeRequestTypeId = rfccall.requesttype.changerequesttypeId;
			$scope.rfccall.callEvaluationOutcomeId = rfccall.evaluationoutcome.evaluationoutcomeId;
			$scope.rfccall.departmentId = rfccall.department.departmentId;
            if ($scope.rfccall.requesttypeName = 'Standard') {
                
                $scope.rfccall.changeAuthorized = 'Manager';
            }
                
            $http.post('/api/rfc-calls',$scope.rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}); 