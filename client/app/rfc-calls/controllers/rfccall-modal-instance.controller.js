angular.module('serviceDeskApp')
.controller('RfccallModalInstanceCtrl', function ($scope, $modalInstance, rfccall) {

    $scope.rfccall = rfccall;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});