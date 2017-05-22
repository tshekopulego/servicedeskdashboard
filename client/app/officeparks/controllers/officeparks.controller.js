'use strict';

angular.module('serviceDeskApp')
.controller('OfficeParksCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.officeparks = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/officeparks').success(function(officeparks) {
        $scope.officeparks = officeparks;
        socket.syncUpdates('officepark', $scope.officeparks,function(event,officepark,officeparks){
        });
    });

    $scope.open = function (officepark) {

        var modalInstance = $modal.open({
            templateUrl: 'app/officeparks/partials/officepark-details.modal.html',
            controller: 'OfficeParkModalInstanceCtrl',
            //size: size,
            resolve: {
                officepark: function() {
                    return officepark;
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

    $scope.delete = function(officepark) {
        $http.delete('/api/officeparks/' + officepark._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('officepark');
    });
});
