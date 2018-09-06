'use strict';

angular.module('serviceDeskApp')
.controller('EditIssueCtrl', function ($scope, $http, $location, $window, $routeParams, socket, Auth) {

    $scope.issue = {};
    $scope.submitted = false;
    $scope.issue_id = $routeParams.id;

    $http.get('/api/channel').success(function(channels) {
        $scope.channels = channels;
    });

    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
    });

    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
    });

    $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });

    $http.get('/api/issue-status').success(function(issuestatuses) {
        $scope.issuestatuses = issuestatuses;
    });

    $http.get('/api/issues/' + $scope.issue_id).success(function (issue) {
        
        $scope.issue = issue;
        $scope.issue.category = issue.issueCategory;
        $scope.issue.channel = issue.issueChannel;
        $scope.issue.priority = issue.issuePriority;
        $scope.issue.division = issue.issueDivision;
    });
    
    
   
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

    $scope.currentUser = Auth.getCurrentUser();
    
   console.log($scope.currentUser.role);
    $http.get('/api/users/userD/594100614b80982c21fdb3cb').success(function(user) {
            $scope.user = user;
            console.log($scope.user);
            socket.syncUpdates('user', $scope.users,function(event,user,users){
            });
        });
        
    $scope.escalateIssue = function(issue) {
        $scope.issueProp = issue;
        $scope.submitted = true;
        $scope.issue = issue;
        if($scope.submitted) {

            $scope.issue.issueCategory = issue.category._id;
            $scope.issue.issueCategoryId = issue.category.categoryId;
            $scope.issue.issueChannel = issue.channel._id;
            $scope.issue.issueChannelId = issue.channel.channelId;
            $scope.issue.issuePriority = issue.priority._id;
            $scope.issue.issuePriorityId = issue.priority.priorityId;
            $scope.issue.issueDivision = issue.issueDivision._id;
            $scope.issue.issueDivisionId = issue.division.divisionId;
            $scope.issue.issueUser = issue.issueUser._id;
            $scope.issue.escalated = true;
            $scope.issue.escalateCount++;
            $scope.issue.modified = moment(new Date());
            
            $http.put('/api/issues/' + $scope.issue._id,$scope.issue);
            $scope.issue = '';
            $location.path('/issues');
        }
        
    }
    $scope.issue1 = {};
    
    $scope.editIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        $scope.issue1 = issue;
        /*
        $scope.issue1CategoryId = issue.issueCategory.categoryId;
        $scope.issue1ChannelId = issue.issueChannel.channelId;
        $scope.issue1PriorityId = issue.issuePriority.priorityId;
        $scope.issue1divisionId = issue.issueDivision.divisionId;*/
        if($scope.submitted) {
            
            if(issue.issueStatus.issueStatusName == 'Closed'){
                $scope.issue.closed = moment(new Date());
            } else if(issue.issueStatus.issueStatusName == 'Assigned'){
                $scope.issue.assigned = moment(new Date());
            }
            $scope.issue.issueStatus = issue.issueStatus._id;
            $scope.issue.issueStatusId = issue.issueStatus.issueStatusId;
            $scope.issue.issueCategory = issue.category._id;
            $scope.issue.issueCategoryId = issue.category.categoryId;
            $scope.issue.issueChannel = issue.channel._id;
            $scope.issue.issueChannelId = issue.channel.channelId;
            $scope.issue.issuePriority = issue.priority._id;
            $scope.issue.issuePriorityId = issue.priority.priorityId;
            $scope.issue.issueDivision = issue.issueDivision._id;
            $scope.issue.issueDivisionId = issue.division.divisionId;
            $scope.issue.issueUser = issue.issueUser._id;
            $scope.issue.modified = moment(new Date());

            $http.put('/api/issues/' + $scope.issue._id,$scope.issue);
            $scope.issue = '';
            $location.path('/issues');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
