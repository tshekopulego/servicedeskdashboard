'use strict';

angular.module('serviceDeskApp')
.controller('StatsCtrl', function ($scope, $http, socket, $filter, $modal, $log, $location, Auth) {

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.today = new Date();
    
    $http.get('/api/issues').success(function(issues) {
                $scope.issues = issues;
                socket.syncUpdates('issue', $scope.issues,function(event,issue,issues){});
    });

    $scope.isAdminAsync = Auth.isAdminAsync(function(admin) {

        $scope.isAdminAsync = admin;

        $scope.open = function (issue) {

            var modalInstance = $modal.open({
                templateUrl: 'app/issues/partials/issue-details.modal.html',
                controller: 'IssueModalInstanceCtrl',
                //size: size,
                resolve: {
                    errand: function() {
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

        $scope.comments = function(errand) {

            var modalInstance = $modal.open({
                templateUrl: 'app/errands/partials/errand-comments.modal.html',
                controller: 'ErrandCommentsModalCtrl',
                //size: size,
                resolve: {
                    errand: function() {
                        return errand;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        //$scope.user = Auth.getCurrentUser();

        });


});
