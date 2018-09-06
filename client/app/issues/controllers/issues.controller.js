'use strict';

angular.module('serviceDeskApp')
.controller('IssueCtrl', function ($scope, $http, $modal, $log, $filter, socket, Auth, $location) {

    $scope.issues = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.currentUser = Auth.getCurrentUser();
    console.log($scope.currentUser);
    
    $scope.issueData = {};
    
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
    });

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
    
    if ($scope.currentUser.role == "admin" || $scope.currentUser.role == "Service Desk Senior Manager" || $scope.currentUser.role == "Service Desk Agent") {
    
        $scope.data = [];
        $scope.counts={};

        $http.get('/api/issues').success(function(issues) {
                   $scope.issues = issues;

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


        $http.get('/api/rfc-calls').success(function(rfccalls) {
                   $scope.rfccalls = rfccalls;

               });


        $http.get('/api/issues/issuedata').success(function(data){
            console.log(data);
            console.log('Report Created!!')
        })

    } else if ($scope.currentUser.role == "Customer"){
        $http.get('/api/issues/reportedBy/'+$scope.currentUser._id).success(function(issues) {
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
    } else {
        $http.get('/api/issues/assignedUser/'+$scope.currentUser._id).success(function(issues) {
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
    }
    /*$http.get('/api/issues/assignedUser/'+$scope.currentUser._id).success(function(issues) {
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
*/
    
    anychart.onDocumentReady(function() {
        //create data


        var data = [];
        $http.get('/api/issues/data').success(function(issues) {

            data = issues;

             // create the chart
             var chart = anychart.pie();
             // set the chart title

            /*chart.listen("pointClick",function(e){
                chart.title(e.point.get("x") + " #" + e.point.getIndex() + " " + e.point.getSeries().name());
            });*/

             chart.title("Issues by Status ");

             // add the data
             chart.data(data);
             // display the chart in the container

             chart.container('container1');

             chart.draw();


             chart.listen("pointClick",function(e){
                    chart.title(e.point.get("x") + " " + e.point.getIndex());
                    var selectedData = data[e.point.getIndex()].x;
                    console.log('Data Selected :  ' + selectedData)

                });
             });




    });
    
        $scope.searchIssues = function (category, status, startDate, endDate) {
            
            if ((category == "-1") && (status == "-1")) { //get all records
                $http.get('/api/issues').success(function (issues) {
                    $scope.issues = issues;
                    console.log('/api/issues/');
                });

            } else if ((startDate != "-1") &&(endDate !=" -1")) {
                $scope.dateR = {};
                $scope.dateArray = [];
                $scope.dateArray.push(startDate);
                $scope.dateArray.push(endDate);
                
                $scope.dateR = JSON.stringify($scope.dateArray);
                /*$scope.date.endDate = endDate;*/
                console.log($scope.dateR);
                
                //var dateRange = $scope.date;
                $http.get('/api/issues/date/'+ $scope.dateR).success(function (issues) {
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
       
        //$scope.api.updateWithTimeout(5);
    /*$timeout(function(){
            $scope.api.refresh();
    },500);*/
    
    $scope.options = {
        chart: {
            type: 'discreteBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 60,
                left: 55
            },
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            showValues: true,
            valueFormat: function(d){
                return d3.format(',.4f')(d);
            },
            transitionDuration: 500,
            xAxis: {
                axisLabel: 'X Axis'
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: 30
            }
        }
    };
    
    $scope.data1 = [];
    
    $http.get('/api/issues/data').success(function(issues) {
                $scope.data1 = issues;
                                          });
    
    
    
     /*$scope.data = [{
        key: "Cumulative Return",
        values: [
            { 
                "label" : "New",
                "value" : 3
            },
            { 
                "label" : "Approved",
                "value" : 1 
            },
            { 
                "label" : "Assigned",
                "value" : 5
            }
        ]
     }]*/
    
    $scope.getValues = function() {
        var labs = ['New','Approved','Rejected','clossed'];
        var ourData = [];
        
        for (var i = 0; i<labs.length; i++){
            ourData.push({
                label: labs[i],
                value: $scope.counts.New
            })
        }
    }
    
    /*var values: [
            { "label" : "New" , "value" : 4 },
            { "label" : "Assigned" , "value" : 6 },
            { "label" : "Approved" , "value" : 1 }
            ]
        
        d3.select('body')
        .selectAll('div')
        .data(values)
        .enter()
        .append('div')
        .text(function(d) {
            return d.day + '\'s best seller
        })*/

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
    
    $scope.comments = function (issue) {
        var modalInstance = $modal.open({
            templateUrl: 'app/issues/partials/issue-comments.modal.html',
            controller: 'IssueCommentsModalInstanceCtrl',
            //size: size,
            resolve: {
                issue: function() {
                    return issue;
                }
            }
        });
    };
    
    $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });

    $scope.issue = {};
    $scope.priority = {};
    $scope.isOverSLACopy = function (dateCaptured, sla, issue) {
      
        
        var now = moment(new Date()); //todays date
        
        var duration = moment.duration(now.diff(dateCaptured));
        var hours = duration.asHours();
        console.log(hours > sla);
        var isOverSLA = hours > sla;
        
        console.log(sla);

        if (isOverSLA == true){
        
            if (issue.issuePriorityId < $scope.priorities.length){
                
                $scope.escalate(issue);
                return hours > sla;
            } else {
                console.log('Last Priority Send Reminder Mail!!')
                return hours > sla;
            }
            return hours > sla;
        } else {
            console.log('under SLA');
            return hours > sla;
        }
        
        
        
    }
    
    $scope.escalate = function(issue){
        if (issue.issuePriorityId < $scope.priorities.length){
            var escalateTo = issue.issuePriorityId + 1;
            
            
            for(var i = 0; i < $scope.priorities.length; i++){
                if ($scope.priorities[i].priorityId == escalateTo) {
                    $scope.priority = $scope.priorities[i];
                    break;
                }
            }
        
            issue.issuePriority = $scope.priority._id;
            issue.issuePriorityId = $scope.priority.priorityId;
            /*
            if ($scope.currentUser.role == 'Service Desk Agent'){
                issue.assignedUser = 'Service Desk Manager';
            } else if ($scope.currentUser.role == )
             */
            issue.modified = moment(new Date());
            
            console.log(issue);
            
            $http.put('/api/issues/' + issue._id,issue);
            
            $location.path('/issues');
        }
    };

    $scope.isOverSLA = function (dateCaptured, sla) {

            var now = moment(new Date()); //todays date
            var duration = moment.duration(now.diff(dateCaptured));
            var hours = duration.asHours();
            console.log(hours > sla);
        

            console.log(sla);

            return hours > sla;
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
