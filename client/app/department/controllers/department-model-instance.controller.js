angular.module('serviceDeskApp')
.controller('DepartmentModalInstanceCtrl', function ($scope, $modalInstance, department) {

    $scope.department = department;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
