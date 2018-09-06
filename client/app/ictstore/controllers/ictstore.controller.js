'use strict';

angular.module('serviceDeskApp')
.controller('ICTStoreCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictstores = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/ictstore').success(function(ictstores) {
		$scope.ictstores = ictstores;
		socket.syncUpdates('ictstore', $scope.ictstores,function(event,ictstore,ictstores){
		});
	});

	$scope.open = function (ictstore) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictstore/partials/ictstore-details.modal.html',
			controller: 'ICTStoreModalInstanceCtrl',
			resolve: {
				ictstore: function() {
					return ictstore;
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

	$scope.delete = function(issueictstore) {
		$http.delete('/api/ictstore/' + ictstore._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictstore');
	});
    
    $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'X Axis'
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    axisLabelDistance: -10
                }
            }
        };

        $scope.data = [
            {
                key: "Cumulative Return",
                values: [
                    {
                        "label" : "Priority 1.1" ,
                        "value" : -29.765957771107
                    } ,
                    {
                        "label" : "Priority 1.2" ,
                        "value" : 0
                    } ,
                    {
                        "label" : "Priority 1.3" ,
                        "value" : 32.807804682612
                    } ,
                    {
                        "label" : "Priority 1.4" ,
                        "value" : 196.45946739256
                    } ,
                    {
                        "label" : "Priority 2.1" ,
                        "value" : 0.19434030906893
                    } ,
                    {
                        "label" : "Priority 2.2" ,
                        "value" : -98.079782601442
                    } ,
                    {
                        "label" : "Priority 2.3" ,
                        "value" : -13.925743130903
                    }
                ]
            }
        ]
});
