angular.module('serviceDeskApp')
.controller('RoleModalInstanceCtrl', function ($scope, $modalInstance, role) {

    $scope.role = role;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});