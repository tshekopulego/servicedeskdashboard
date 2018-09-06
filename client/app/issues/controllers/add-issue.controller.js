'use strict';

angular.module('serviceDeskApp')
.controller('AddIssueCtrl', function ($scope, $http, $location, $window, socket, Auth) {

    $scope.issue = {};
    $scope.submitted = false;
    $scope.currentUser = Auth.getCurrentUser();
     $http.get('/api/channel').success(function(channels) {
        $scope.channels = channels;
        socket.syncUpdates('channel',
        $scope.channels,function(event,channel,channels){
        });
    });

    
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
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
        socket.syncUpdates('division', 
        $scope.divisions,function(event,division,divisions){
        });
    });

    /*$http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
        socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
        });
    });*/
    
    $http.get('/api/issue-status').success(function(statuses) {
        $scope.statuses = statuses;
        socket.syncUpdates('status', $scope.statuses,function(event,status,statuses){
        });
    });
    
     $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.addIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        $scope.issue1 = issue;
        if($scope.submitted) {

            if ($scope.currentUser.role == "Customer"){
                $scope.issue.reportedBy = $scope.currentUser._id;
                $scope.issue.issueChannel = '5935b6e36a934332d9203c81';
                $scope.issue.issueChannelId = 2;
            } else {
                $scope.issue.reportedBy = issue.reportedBy._id;
                $scope.issue.issueChannel = issue.channel._id;
                $scope.issue.issueChannelId = issue.channel.channelId;
            }
            $scope.issue.issueStatus = '5923ea094632f26f5d77bf5f';
            $scope.issue.issueStatusId = 4;
            $scope.issue.issueCategory = issue.category._id;
            //$scope.issue.issuePriority = issue.priority._id;
            $scope.issue.issueDivision = issue.division._id;
			$scope.issue.issueLoggedby = $scope.currentUser.firstName
			$scope.issue.issueCategoryId = issue.category.categoryId;
            //$scope.issue.issuePriorityId = issue.priority.priorityId;
            $scope.issue.issueDivisionId = issue.division.divisionId;
            $scope.issue.issueRefNumber = (new Date).getTime();
			var issues = $scope.issue;
            
            $http.post('/api/issues',issues);
            $scope.issue = '';
            $location.path('/issues');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
