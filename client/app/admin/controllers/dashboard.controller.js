'use strict';

angular.module('serviceDeskApp')
.controller('DashboardCtrl', function ($scope, $http, socket, $filter, $modal, $log, $location, Auth) {

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.today = new Date();
    
    $http.get('/api/issues').success(function(issues) {
		$scope.issues = issues;
		$scope.counts={};
		$scope.totalIssues = issues.length;
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
    
    $http.get('/api/ictstore').success(function(ictstores) {
		$scope.ictcalls = ictstores;
		$scope.ictcounts={};
		$scope.totalictcalls = ictstores.length;
		var itemsArray = [];
		var itemIds = ictstores
		
		for (var i = 0; i < ictstores.length; i++) {
			var status =itemIds[i].assetPriority.priorityName
			
			itemsArray.push(status);
			
			if(itemIds.length === itemsArray.length){
				console.log(itemsArray)
				$scope.ictcounts = {}, i, $scope.value;
				for (i = 0; i < itemsArray.length; i++) {
					$scope.value = itemsArray[i];
					if (typeof $scope.ictcounts[$scope.value] === "undefined") {
						$scope.ictcounts[$scope.value] = 1;
					} else {
						$scope.ictcounts[$scope.value]++;
					}
				}
				console.log($scope.ictcounts);
			}
		};
		socket.syncUpdates('ictstore', $scope.ictstore,function(event,ictstore,ictstores){});
    });
    
    
    anychart.onDocumentReady(function() {
        
        $http.get('/api/issues/data').success(function(issues) {

        var data = issues;

         // create the chart
         var chart = anychart.pie();
         // set the chart title
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
        
        $http.get('api/rfc-calls/rfccallreport').success(function (rfccalls) {
            var data = rfccalls;
            // create the chart
            var chart = anychart.pie();
            
            // set the chart title
            chart.title("Request for Change Report");
            
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
                chart.saveAsXlsx();
            };
    });
        
        $http.get('/api/issues/prioritisation/59673b1434c441b43f3995b4').success(function(repo) {

           var data = repo;

    

             // create the chart
             var chart = anychart.pie();

    

             // set the chart title
             chart.title("Incident Prioritisation Report");

             // add the data
             chart.data(data);

             // display the chart in the container
             chart.container('container3');
             chart.draw();
        });

        
    });
    
    $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
                showControls: true,
                showValues: true,
                duration: 500,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };
    $scope.tableData = function (){
        
    }
        $scope.data = [
            {
                "key": "Issues",
                "color": "#d62728",
                "values": [
                    {
                        "label" : "New" ,
                        "value" : -1.8746444827653
                    }
                ]
            },
            {
                "key": "ICTCalls",
                "color": "#1f77b4",
                "values": [
                    {
                        "label" : "New" ,
                        "value" : 25.307646510375
                    },
                    {
                        "label" : "Old" ,
                        "value" : 25.307646510375
                    }
                ]
            }
        ]
	});