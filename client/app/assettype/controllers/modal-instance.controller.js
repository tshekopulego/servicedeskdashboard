angular.module('serviceDeskApp')
.controller('AssettypeModalInstanceCtrl', function ($scope, $modalInstance, assettype) {

    $scope.assettype = assettype;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
