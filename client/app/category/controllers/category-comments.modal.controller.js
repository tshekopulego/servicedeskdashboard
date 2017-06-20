angular.module('serviceDeskApp')
.controller('CategoryCommentsModalInstanceCtrl', function ($scope, $modalInstance, $http, $location, category, Auth) {

    $scope.category = category;
    $scope.comment = {};
    $scope.currentUser = Auth.getCurrentUser();
    $scope.processedComment = {};

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.addCategoryComment = function(comment,isValid) {

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

            if(!$scope.category.comments) {
                $scope.category.comments = $scope.processedComment;
            } else {
                $scope.category.comments[time] = comment;
            }

            $http.put('/api/category/' + $scope.category._id, $scope.category);
            $location.path('/category');
        }
    }

    $scope.deleteComment = function(comment) {

        console.log($scope.category);

        $http.put('/api/category/' + $scope.category._id, $scope.category);
        $location.path('/');
    }

});
