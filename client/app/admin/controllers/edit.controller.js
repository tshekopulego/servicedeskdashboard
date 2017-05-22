angular.module('serviceDeskApp')
.controller('EditCtrl', function ($scope, $http, $location, $routeParams, $window) {

    $scope.user = {};
    $scope.user_id = $routeParams.id;
    $scope.submitted = false;

    $scope.billingTypes = [{
        value: "Package",
        name: "Package"
    },{
        value: "Single",
        name: "Single"
    }];

    $scope.clientTypes = [{
        value: "Individual",
        name: "Individual"
    },{
        value: "Company",
        name: "Company"
    }];

    $scope.extraContacts = {};

    $http.get('/api/users/'+$scope.user_id).success(function(user) {
        $scope.user = user;
        $scope.extraContacts = user.extraContacts;
    });

    $http.get('/api/packages').success(function(packages) {
        $scope.packages = packages;
    });

    $http.get('/api/delivery-zones').success(function(zones) {
        $scope.zones = zones;
    });

    $scope.updateUser = function(user,isValid) {
        $scope.submitted = true;
        if(isValid && $scope.submitted) {

            if(!_.isEmpty($scope.extraContacts))
                user.extraContacts = $scope.extraContacts;

            if(user.clientPackage)
                user.clientPackage = user.clientPackage._id;

            if(user.zone)
                user.zone = user.zone._id;

            $http.put('api/users/' + $scope.user_id,user);
            $location.path('/users/');
        }
    };

    $scope.$watch('user.clientType', function (clientType) {
        $scope.user.clientType = clientType;
    });

    $scope.cancel = function() {
        $window.history.back();
    };

});
