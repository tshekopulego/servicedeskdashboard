'use strict';

angular.module('serviceDeskApp')
.controller('DashboardCtrl', function ($scope, $http, socket, $filter, $modal, $log, $location, Auth) {

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.today = new Date();
    
    $http.get('/api/issues').success(function(issues) {
                $scope.issues = issues;
        
        
        
        
          $scope.counts={};
        
               var itemsArray = [];

                var itemIds = issues

                for (var i = 0; i < issues.length; i++) {
                    var status =itemIds[i].issueStatus.issueStatusName
                  
                    itemsArray.push(status);

                    if(itemIds.length === itemsArray.length){

                        console.log(itemsArray)
                              
                        
                         $scope.counts = {}, i, $scope.value;
                        for (i = 0; i < itemsArray.length; i++) {
                        $scope.value = itemsArray[i];
                        if (typeof $scope.counts[$scope.value] === "undefined") {
                        $scope.counts[$scope.value] = 1;
                        } else {
                        $scope.counts[$scope.value]++;
                        }
                            }
                        console.log($scope.counts);
                        
                       

                    }

                    
                };
        
        
        
        
        
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
