angular.module('serviceDeskApp')
.controller('ICTStoreModalInstanceCtrl', function ($scope, $modalInstance, ictstore) {

    $scope.ictstore = ictstore;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
