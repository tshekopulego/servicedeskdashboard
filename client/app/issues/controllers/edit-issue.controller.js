'use strict';

angular.module('serviceDeskApp')
.controller('EditIssueCtrl', function ($scope, $http, $location, $window, $routeParams, socket) {

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
     // console.log(issue);
        $scope.issue = issue;
    });
    
    
    $http.get('/api/users').success(function (users) {
      console.log(users);
        $scope.users = users;
    });

    $scope.editIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        if($scope.submitted) {

            $scope.issue.issueCategory = issue.issueCategory._id;
            $scope.issue.issueChannel = issue.issueChannel._id;
            $scope.issue.issuePriority = issue.issuePriority._id;
            $scope.issue.issueDivision = issue.issueDivision._id;
            $scope.issue.issueUser = issue.issueUser._id;

            $http.put('/api/issues/' + $scope.issue._id,$scope.issue);
            $scope.issue = '';
            $location.path('/issues');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
});
