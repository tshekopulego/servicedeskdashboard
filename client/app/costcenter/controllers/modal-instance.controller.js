angular.module('serviceDeskApp')
.controller('CostcenterModalInstanceCtrl', function ($scope, $modalInstance, costcenter) {

    $scope.costcenter = costcenter;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
