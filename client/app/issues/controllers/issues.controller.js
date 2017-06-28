'use strict';

angular.module('serviceDeskApp')
.controller('IssueCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.issues = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/issue-status').success(function (issuestatuses) {
               issuestatuses.unshift({
                   issueStatusName: 'All',
                   _id: -1
               });
               $scope.issuestatuses = issuestatuses;
           });


           $http.get('/api/category').success(function (categories) {
               categories.unshift({
                   categoryName: 'All',
                   _id: -1
               });
               $scope.categories = categories;
           });

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
        
        
        
        socket.syncUpdates('issue', $scope.issues,function(event,issue,issues){
            
           
            
            
        });
    });

        $scope.searchIssues = function (category, status) {

            if ((category == "-1") && (status == "-1")) { //get all records
                $http.get('/api/issues').success(function (issues) {
                    $scope.issues = issues;
                    console.log('/api/issues/');
                });

            } else {

                if ((category != "-1" && !category) && (status != "-1" && !status)) {
                    $http.get('/api/issues/' + category + '/' + status).success(function (issues) {

                        $scope.issues = issues;
                    });
                } else {

                    if (category != "-1" && !angular.isUndefined(category)) {

                        $http.get('/api/issues/' + category + '/categories').success(function (issues) {

                            $scope.issues = issues;

                        });

                    } else if (status != "-1") {

                        $http.get('/api/issues/' + status + '/statuses').success(function (issues) {

                            $scope.issues = issues;

                        });
                    }

                }

            }
        };
    
    
    
    
    
    
    
   
                                          
    
    

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
    
    
    
    
    

    
    


    $scope.isOverSLA = function (dateCaptured, sla) {

            var now = moment(new Date()); //todays date
            var duration = moment.duration(now.diff(dateCaptured));
            var hours = duration.asHours();
            console.log(hours > sla);

            console.log(sla);

            return hours > sla;
    }
    
    


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
