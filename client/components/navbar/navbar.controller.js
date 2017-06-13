'use strict';

angular.module('serviceDeskApp')
.controller('NavbarCtrl', function ($scope, $location, Auth, $http, socket) {
    $scope.menu = [{
        'title': 'Home',
        'link': '/home'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.path = $location.path();

    $scope.logout = function() {
        Auth.logout();
        $location.path('/login');
    };

    $scope.isActive = function(route) {
        //return $location.path().substr(0, route.length) == route;
    };
    
    $http.get('/api/rfc-calls').success(function(rfccalls) {
        $scope.rfccalls = rfccalls;
        socket.syncUpdates('rfccall', $scope.rfccalls,function(event,rfccall,rfccalls){
        });
        
        var count = rfccalls.length;
        $scope.count = count;
    });

    $scope.restoreDB = function() {
        $http.get('/api/admin/restore-latest-backup').success(function(output) {
            console.log(output);
        });
    };
});
