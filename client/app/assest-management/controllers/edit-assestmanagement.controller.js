'use strict';

angular.module('serviceDeskApp')
.controller('EditAssestmanagementCtrl', function ($scope, $http, $location, $window, $routeParams,socket) {

    $scope.assestmanagement = {};
    $scope.submitted = false;
    $scope.assestmanagements_id = $routeParams.id;
    
    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
    });

    
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
    });
    
    $http.get('/api/assetstatus').success(function(assetstatuses) {
        $scope.assetstatuses = assetstatuses;
        socket.syncUpdates('assetstatus',
        $scope.assetstatuses,function(event,assetstatus,assetstatuses){
        });
    });
    

    $http.get('/api/assestmanagement/' + $scope.assestmanagements_id).success(function(assestmanagements) {
        $scope.assestmanagements = assestmanagements;
        console.log(assestmanagements);
       
//        $scope.assestmanagements.assetCategory = assestmanagements.assetCategory;
        
        
    })
    
   
    

    $scope.editAssestmanagement = function(assestmanagement,isValid) {
        $scope.submitted = true;
        $scope.assestmanagement = assestmanagement;
        if($scope.submitted) {
            
             $scope.assestmanagement.assetCategory = assestmanagement.category._id;
            
            $http.put('/api/assestmanagement/' + $scope.assestmanagement_id,assestmanagement);
            $scope.assestmanagement = '';
            $location.path('/assestmanagement');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
