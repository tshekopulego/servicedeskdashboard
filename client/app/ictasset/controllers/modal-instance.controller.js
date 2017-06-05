angular.module('serviceDeskApp')
.controller('ICTAssetModalInstanceCtrl', function ($scope, $modalInstance, ictasset) {

    $scope.ictasset = ictasset;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
