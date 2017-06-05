'use strict';

angular.module('serviceDeskApp')
.controller('AddIssueCtrl', function ($scope, $http, $location, $window, socket) {

    $scope.issue = {};
    $scope.submitted = false;
    
     $http.get('/api/channel').success(function(channels) {
        $scope.channels = channels;
        socket.syncUpdates('channel',
        $scope.channels,function(event,channel,channels){
        });
    });
    
    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
        socket.syncUpdates('category', 
        $scope.categories,function(event,category,categories){
        });
    });
    
    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
        socket.syncUpdates('division', $scope.divisions,function(event,division,divisions){
        });
    });    
    
    $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
        socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
        });
    });

    $scope.addIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        if($scope.submitted) {
            
            $scope.issue.issueCategory = issue.category._id;
            $scope.issue.issueStatus = issue.issueStatus._id
            $scope.issue.issueChannel = issue.channel.name;
            
            $http.post('/api/issue',$scope.issue);
            $scope.issue = '';
            $location.path('/issue');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
