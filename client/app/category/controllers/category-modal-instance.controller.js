angular.module('serviceDeskApp')
.controller('CategoryModalInstanceCtrl', function ($scope, $modalInstance, category) {

    $scope.category = category;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
