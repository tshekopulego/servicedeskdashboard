'use strict';

angular.module('serviceDeskApp')
.controller('IssueCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.issues = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    

    $http.get('/api/issues').success(function(issues) {
        $scope.issues = issues;
        socket.syncUpdates('issue', $scope.issues,function(event,issue,issues){
        });
    });

    $scope.open = function (issue) {

        var modalInstance = $modal.open({
            templateUrl: 'app/issues/partials/issue-details.modal.html',
            controller: 'IssueModalInstanceCtrl',
            //size: size,
            resolve: {
                issue: function() {
                    return issue;
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

    $scope.delete = function(issue) {
        $http.delete('/api/issues/' + issue._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('issue');
    });
});
