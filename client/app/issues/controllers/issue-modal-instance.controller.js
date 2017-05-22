angular.module('serviceDeskApp')
.controller('IssueModalInstanceCtrl', function ($scope, $modalInstance, issue) {

    $scope.issue = issue;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
