'use strict';

angular.module('serviceDeskApp')
.controller('ClientsCtrl', function ($scope, $http, socket, $filter, $modal, $log) {

    $scope.users = [];
    $scope.user = {};
    $scope.currentPage = 1;
    $scope.pageSize = 20;
    $scope.selectedClients = {};
    $scope.bulkActions = [{
        name: 'Generate Invoices',
        value: 'Generate Invoices'
    },{
        name: 'Generate Invoices And Runsheets',
        value: 'Generate Invoices And Runsheets'
    }];

    $http.get('/api/users/clients').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
        });
        // Foreach client, get all errands that are not paid for
        // Total the balances
        // Show the paymnent status as Paid or Unpaid as appropriate
        _.each($scope.users,function(client) {

            $http.get('/api/errands/unpaid/' + client._id).success(function(errands) {
                client.priceArray = [];
                client.paymentStatus = 'Paid';
                _.each(errands,function(errand) {
                    //console.log(errand.price);
                    if(errand.price)
                        client.priceArray.push(errand.price);
                });
                if(client.priceArray.length > 0) {
                    client.paymentStatus = 'Unpaid';
                    client.balance = client.priceArray.reduce(function(previousValue, currentValue, index, array) {
                        return previousValue + currentValue;
                    });
                }
            });
        });
    });

    $scope.delete = function(user) {
        $http.delete('/api/users/' + user._id);
    };

    $scope.activate = function(user) {
        var newUser = {
            status: 1
        };
        $http.put('api/users/' + user._id,newUser);
    };

    $scope.deactivate = function(user) {
        var newUser = {
            status: 0
        };
        $http.put('api/users/' + user._id,newUser);
    };

    $scope.open = function (user) {

        var modalInstance = $modal.open({
            templateUrl: 'app/admin/partials/user-details.modal.html',
            controller: 'UserModalInstanceCtrl',
            //size: size,
            resolve: {
                user: function() {
                    return user;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.bulkAction = function(clients,axn) {
        if(!angular.equals({},clients) && axn) {
            var modalInstance = $modal.open({
                templateUrl: 'app/admin/partials/generate-invoices.modal.html',
                controller: 'GenerateInvoiceModalInstanceCtrl',
                //size: size,
                resolve: {
                    clients: function() {
                        return clients;
                    },
                    axn: function() {
                        return axn;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('user');
    });
});
