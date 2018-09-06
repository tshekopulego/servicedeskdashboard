'use strict';

angular.module('serviceDeskApp')
.controller('RfccallCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.rfccalls = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    
    
    
    $http.get('/api/request-type').success(function (requesttypes) {
               requesttypes.unshift({
                   requesttypeName: 'All',
                   _id: -1
               });
               $scope.requesttypes = requesttypes;
           });
    
    $http.get('/api/evaluation-outcome').success(function (evaluationoutcomes) {
               evaluationoutcomes.unshift({
                  evaluationoutcomeName: 'All',
                   _id: -1
               });
               $scope.evaluationoutcomes = evaluationoutcomes;
           });
    
    $http.get('/api/rfc-calls').success(function(rfccalls) {
        $scope.rfccalls = rfccalls;
        socket.syncUpdates('rfccall', $scope.rfccalls,function(event,rfccall,rfccalls){
        });
    
    anychart.onDocumentReady(function() {
        
        
        $http.get('/api/rfc-calls/rfccallreport').success(function(issues) {
            var data = issues;
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
        
    })
    
        
        var count = rfccalls.length;
        
        $scope.count = count;
        
    });
    
    
    $scope.searchRfccall = function (changerequesttype, callevaluationoutcome) {

            if ((changerequesttype == "-1") && (callevaluationoutcome == "-1")) { //get all records
                $http.get('/api/rfc-calls').success(function (rfccalls) {
                    $scope.rfccalls = rfccalls;
                    console.log('/api/rfc-calls/');
                });

            } else {

                if ((changerequesttype != "-1" && !changerequesttype) && (callevaluationoutcome != "-1" && !callevaluationoutcome)) {
                    $http.get('/api/rfc-calls/' + changerequesttype + '/' + callevaluationoutcome).success(function (rfccalls) {

                        $scope.rfccalls = rfccalls;
                    });
                } else {

                    if (changerequesttype != "-1" && !angular.isUndefined(changerequesttype)) {

                        $http.get('/api/rfc-calls/' + changerequesttype + '/requesttypes').success(function (rfccalls) {

                            $scope.rfccalls = rfccalls;

                        });

                    } else if (callevaluationoutcome != "-1") {

                        $http.get('/api/rfc-calls/' + callevaluationoutcome + '/callEvaluationOutcomes').success(function (rfccalls) {

                            $scope.rfccalls = rfccalls;

                        });
                    }

                }

            }
        };

    $scope.open = function (rfccall) {

        var modalInstance = $modal.open({
            templateUrl: 'app/rfc-calls/partials/rfccall-details.model.html',
            controller: 'RfccallModalInstanceCtrl',
            //size: size,
            resolve: {
                rfccall: function() {
                    return rfccall;
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

            /*console.log(sla);
*/
            return hours > sla;
    }
	
    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.delete = function(rfccall) {
        $http.delete('/api/rfc-calls/' + rfccall._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('rfccall');
    });
});
