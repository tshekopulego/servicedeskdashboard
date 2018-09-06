
'use strict';



angular.module('serviceDeskApp')

.controller('ReportCtrl', function ($scope, $http, $location, $window, socket) {


$scope.currentPage = 1;

$scope.pageSize = 10;

    $scope.today = new Date();

    var data = [];

//don't try this at home

anychart.onDocumentReady(function() {

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
    
    //create data
    $http.get('/api/issues/data').success(function(issues) {

        data = issues;

         // create the chart
         var chart = anychart.pie();
         // set the chart title
         chart.title("Issues by Status ");

         // add the data
         chart.data(data);
         // display the chart in the container

         chart.container('container1');

         chart.draw();

        //download chart in pdf
         $scope.StatusPdf = function(){

            chart.saveAsPdf();

         };

         $scope.StatusCsv = function(){

        //     chart.saveAsCsv("raw",

// {"rowsSeparator": "\n",

        // "columnsSeparator": ","});

         chart.saveAsXlsx();

         };

    });

    //create data
    $http.get('/api/issues/prioritisation/59673b1434c441b43f3995b4').success(function(issues) {

            data = issues;

    

             // create the chart
             var chart = anychart.pie();
            
             // set the chart title
             chart.title("Incident Prioritisation Report");
             // add the data
             chart.data(data);
             // display the chart in the container
             chart.container('container2');
             chart.draw();

             //download chart in pdf

             $scope.PrioritisationReportPdf = function(){

                chart.saveAsPdf();

             };

             $scope.PrioritisationReportCsv = function(){

            //  chart.saveAsCsv("raw",

            // {"rowsSeparator": "\n",

            // "columnsSeparator": ","});

             chart.saveAsXlsx();

             };

    

        });
    
    //create data
    $http.get('/api/issues/sourceReport').success(function(issues) {
        data = issues;
        
        // create the chart
        var chart = anychart.pie();
        
        // set the chart title
        chart.title("Incident Source Report");

        // add the data
        chart.data(data);
        
        // display the chart in the container
        chart.container('container3');
        chart.draw();
        
        //download chart in pdf
        
        $scope.sourceReportPdf = function(){
            chart.saveAsPdf();
        };
        
        $scope.sourceReportCsv = function(){

                //  chart.saveAsCsv("raw",

                // {"rowsSeparator": "\n",

                // "columnsSeparator": ","});

                chart.saveAsXlsx();

                 };



            });



});






$http.get('/api/issues').success(function(issues) {

        $scope.issues = issues;

        $scope.counts={};

        $scope.totalIssues=issues.length;

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

    $http.get('/api/rfc-calls').success(function(rfccalls) {

$scope.rfccalls = rfccalls;

socket.syncUpdates('rfccall', $scope.rfccalls,function(event,rfccall,rfccalls){

});


var rfccount = rfccalls.length;


$scope.totalrfccalls = rfccount;

        

        var itemsArray = [];

        var itemIds = rfccalls

        

        for (var i = 0; i < rfccalls.length; i++) {

            var status = itemIds[i].changeRequestType.requesttypeName

            

            itemsArray.push(status);

            if(itemIds.length === itemsArray.length){

                console.log(itemsArray)

                $scope.rfccounts = {}, i, $scope.value;

                for (i = 0; i < itemsArray.length; i++) {

                    $scope.value = itemsArray[i];

                    if (typeof $scope.rfccounts[$scope.value] === "undefined") {

                        $scope.rfccounts[$scope.value] = 1;

                    } else {

                        $scope.rfccounts[$scope.value]++;

                    }

                }

                console.log($scope.rfccounts);


};

        };


// $scope.isAdminAsync = Auth.isAdminAsync(function(admin) {

//      $scope.isAdminAsync = admin;

//      $scope.open = function (issue) {

//          var modalInstance = $modal.open({

//              templateUrl: 'app/issues/partials/issue-details.modal.html',

// controller: 'IssueModalInstanceCtrl',

// //size: size,

// resolve: {

// errand: function() {

// return issue;

// }

// }

// });

//

// modalInstance.result.then(function (selectedItem) {

// $scope.selected = selectedItem;

// }, function () {

// $log.info('Modal dismissed at: ' + new Date());

// });

// };

//

// $scope.comments = function(errand) {

//

// var modalInstance = $modal.open({

// templateUrl: 'app/errands/partials/errand-comments.modal.html',

// controller: 'ErrandCommentsModalCtrl',

// //size: size,

// resolve: {

// errand: function() {

// return errand;

// }

// }

// });

//

// modalInstance.result.then(function (selectedItem) {

// $scope.selected = selectedItem;

// }, function () {

// $log.info('Modal dismissed at: ' + new Date());

// });

// };

//

// //$scope.user = Auth.getCurrentUser();

//

// });

// 

// 


});





}); 
