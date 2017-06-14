angular.module('serviceDeskApp')
.controller('ICTAssetCommentsModalInstanceCtrl', function ($scope, $modalInstance, $http, $location, ictasset, Auth) {

    $scope.ictasset = ictasset;
    $scope.comment = {};
    $scope.currentUser = Auth.getCurrentUser();
    $scope.processedComment = {};

    $scope.close = function () {
        $modalInstance.close();
    };

  

    $scope.addICTAssetComment = function(comment,isValid) {

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

            if(!$scope.ictasset.comments) {
                $scope.ictasset.comments = $scope.processedComment;
            } else {
                $scope.ictasset.comments[time] = comment;
            }

            $http.put('/api/ictasset/' + $scope.ictasset._id, $scope.ictasset);
            $location.path('/ictasset');
        }
    }
    
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.deleteComment = function(comment) {

        console.log($scope.issue);

        $http.put('/api/ictasset/' + $scope.ictasset._id, $scope.ictasset);
        $location.path('/');
    }

});