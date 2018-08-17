'use strict';

angular.module('serviceDeskApp')
.controller('assestmanagementCtrl', function ($scope, $http, $modal, $log, $filter, socket) {

$scope.assestmanagement = [];
$scope.currentPage = 1;
$scope.pageSize = 10;

$http.get('/api/assestmanagement').success(function(assestmanagements) {
$scope.assestmanagements = assestmanagements;
socket.syncUpdates('assestmanagement', $scope.assestmanagements,function(event,assestmanagement,assestmanagements){

});
});
    
    
    
//    
    
$http.get('/api/category').success(function (categories) {
               categories.unshift({
                   categoryName: 'All',
                   _id: -1
               });
               $scope.categories = categories;
           });
    
    
    
    
    $http.get('/api/assetstatus').success(function(assetstatuses) {
        $scope.assetstatuses = assetstatuses;
        socket.syncUpdates('assetstatus',
        $scope.assetstatuses,function(event,assetstatus,assetstatuses){
        });
    });
     
    
    $http.get('/api/department').success(function(departments) {
        $scope.departments = departments;
        socket.syncUpdates('department', 
        $scope.departments,function(event,department,departments){
        });
    });
    
    
    
      $scope.searchAssestmanagements = function (category, departments) {

            if ((category == "-1") && (departments == "-1")) { //get all records
                $http.get('/api/assestmanagement').success(function (assestmanagement) {
                    $scope.assestmanagement = assestmanagement;
                    console.log('/api/assestmanagement/');
                });

            } else {

                if ((category != "-1" && !category) && (departments != "-1" && !departments)) {
                    $http.get('/api/assestmanagement/' + category + '/' + departments).success(function (assestmanagement) {

                        $scope.assestmanagement = assestmanagement;
                    });
                } else {

                    if (category != "-1" && !angular.isUndefined(category)) {

                        $http.get('/api/assestmanagement/' + category + '/categories').success(function (assestmanagement) {

                            $scope.assestmanagement = assestmanagement;

                        });

                    } else if (departments != "-1") {

                        $http.get('/api/assestmanagement/' + departments + '/departments').success(function (assestmanagement) {

                            $scope.assestmanagement = assestmanagement;

                        });
                    }

                }

            }
        };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

$scope.open = function (assestmanagement) {

var modalInstance = $modal.open({
templateUrl: 'app/assestmanagement/partials/assestmanagement-details.modal.html',
controller: 'assestmanagementModalInstanceCtrl',
resolve: {
assestmanagements: function() {
return assestmanagement;
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

$scope.delete = function(issuechannel) {
$http.delete('/api/assestmanagement/' + assestmanagement._id);
        
};

$scope.$on('$destroy', function () {
socket.unsyncUpdates('assestmanagement');
});
});

