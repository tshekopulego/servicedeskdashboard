'use strict';

angular.module('serviceDeskApp')
.controller('IssueCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.issues = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    
     $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
    
    $scope.startDate = new Date();
    $scope.endDate = new Date();
    $scope.isOpen = false;
    $scope.date = {};

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

        $scope.searchIssues = function (category, status, startDate, endDate) {

            startDate = new Date();
            endDate = new Date();
            
            if ((category == "-1") && (status == "-1")) { //get all records
                $http.get('/api/issues').success(function (issues) {
                    $scope.issues = issues;
                    console.log(issues);
                });

            } else if ((startDate != "-1") &&(endDate !=" -1")) {
                $scope.date.startDate = startDate;
                $scope.date.endDate = endDate;
                var dateRange = JSON.stringify($scope.date);
                $http.get('/api/issues/date/' + dateRange).success(function (issues) {
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
        
    
    $scope.addIssueComment = function(comment,isValid) {

        $scope.submitted = true;

        if(isValid) {

            console.log($scope.currentUser);
            comment.commenter = $scope.currentUser._id;
            comment.commenterName = $scope.currentUser.firstName+' '+$scope.currentUser.lastName;

            var time = moment().format();
            comment._id = time;
            comment.added = time;
            comment.modified = time;
            $scope.processedComment[time] = comment;

            if(!$scope.issue.comments) {
                $scope.issue.comments = $scope.processedComment;
            } else {
                $scope.issue.comments[time] = comment;
            }

            $http.put('/api/issues/' + $scope.issue._id, $scope.issue);
            $location.path('/issues');
        }
    }

        
    $scope.comments = function (issue) {

        var modalInstance = $modal.open({
            templateUrl: 'app/issues/partials/issue-comments.modal.html',
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
