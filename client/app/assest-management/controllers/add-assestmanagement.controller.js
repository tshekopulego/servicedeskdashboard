'use strict';

angular.module('serviceDeskApp')
.controller('AddAssestManagementCtrl', function ($scope, $http, $location, $window,socket) {

    $scope.assestmanagement = {};
    $scope.submitted = false;
    
    
    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
        socket.syncUpdates('category',
        $scope.categories,function(event,category,categories){
        });
    });
    
    
    
    $http.get('/api/assetstatus').success(function(assetstatuses) {
        $scope.assetstatuses = assetstatuses;
        socket.syncUpdates('assetstatus',
        $scope.assetstatuses,function(event,assetstatus,assetstatuses){
        });
    });
    
    
    $http.get('/api/department').success(function(department) {
        $scope.departments = department;
        socket.syncUpdates('department', 
        $scope.departments,function(event,department,departments){
        });
    });


    $scope.addAssestmanagement = function(assestmanagement,isValid) {
        $scope.submitted = true;
        $scope.assestmanagement = assestmanagement;
        if($scope.submitted) {
             $scope.assestmanagement.assetCategory = assestmanagement.category._id;
            
             
//           $scope.assestmanagement.departments = assestmanagement.department._id;
            
            $http.post('/api/assestmanagement',assestmanagement);
            $scope.assestmanagement = '';
            $location.path('/assestmanagement');
            
            
        }
    };
    

    $scope.cancel = function() {
        $window.history.back();
    };
});


