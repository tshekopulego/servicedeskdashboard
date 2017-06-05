angular.module('serviceDeskApp')
.controller('ChannelModalInstanceCtrl', function ($scope, $modalInstance, category) {

    $scope.channel = channel;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
