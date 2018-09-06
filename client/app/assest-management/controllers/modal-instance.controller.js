angular.module('serviceDeskApp')
.controller('assestmanagementModalInstanceCtrl', function ($scope, $modalInstance, assestmanagement) {

    $scope.assestmanagement = assestmanagement;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
