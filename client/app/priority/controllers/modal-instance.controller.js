angular.module('serviceDeskApp')
.controller('PriorityModalInstanceCtrl', function ($scope, $modalInstance, priority) {

    $scope.priority = priority;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
