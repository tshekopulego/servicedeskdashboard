angular.module('serviceDeskApp')
.controller('ChannelModalInstanceCtrl', function ($scope, $modalInstance, channel) {

    $scope.channel = channel;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
