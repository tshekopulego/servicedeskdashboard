'use strict';

angular.module('serviceDeskApp')
.controller('RfccallCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.rfccalls = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    

    $http.get('/api/rfc-calls').success(function(rfccalls) {
        $scope.rfccalls = rfccalls;
        socket.syncUpdates('rfccall', $scope.rfccalls,function(event,rfccall,rfccalls){
        });
    });

    $scope.open = function (rfccall) {

        var modalInstance = $modal.open({
            templateUrl: 'app/rfc-calls/partials/rfccall-details.model.html',
            controller: 'RfccallModalInstanceCtrl',
            //size: size,
            resolve: {
                rfccall: function() {
                    return rfccall;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.delete = function(rfccall) {
        $http.delete('/api/rfc-calls/' + rfccall._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('rfccall');
    });
});
