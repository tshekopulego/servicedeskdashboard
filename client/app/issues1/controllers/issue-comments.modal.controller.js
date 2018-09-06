angular.module('serviceDeskApp')
.controller('IssueCommentsModalInstanceCtrl', function ($scope, $modalInstance, $http, $location, issue, Auth) {

    $scope.issue = issue;
    $scope.comment = {};
    $scope.currentUser = Auth.getCurrentUser();
    $scope.processedComment = {};

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.addIssueComment = function(comment,isValid) {

        $scope.submitted = true;

        if(isValid) {

            console.log($scope.currentUser);
            comment.commenter = $scope.currentUser._id;
            comment.commenterName = $scope.currentUser.firstName+' '+$scope.currentUser.lastName;

            var time = moment().format();
            comment._id = time;
            comment.added = time;
            comment.modified = time;
            $scope.processedComment[time] = comment;

            if(!$scope.issue.comments) {
                $scope.issue.comments = $scope.processedComment;
            } else {
                $scope.issue.comments[time] = comment;
            }

            $http.put('/api/issues/' + $scope.issue._id, $scope.issue);
            $location.path('/issues');
        }
    }

    $scope.deleteComment = function(comment) {

        console.log($scope.issue);

        $http.put('/api/issues/' + $scope.issue._id, $scope.issue);
        $location.path('/');
    }

});
