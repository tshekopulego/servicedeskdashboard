angular.module('serviceDeskApp')
.controller('GenerateInvoiceModalInstanceCtrl', function ($scope, $http, $modalInstance, $window, $filter, $location, clients, axn) {

    $scope.clients = clients;
    $scope.axn = axn;
    $scope.submitted = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.today = new Date();

    $scope.generateInvoices = function(query,valid) {
        $scope.submitted = true;
        if(valid && axn === 'Generate Invoices') {
            console.log(query);
            _.each(clients,function(clnt) {
                console.log(clnt);
                $scope.client = {};
                $scope.invoice = {};
                var startDate = $filter('date')(query.startDate,'yyyy-M-d');
                var endDate = $filter('date')(query.endDate,'yyyy-M-d');
                var clientID = clnt.client;
                // For each client, get the number of errands run in the specified time period
                // If they are a package client, count the number above the limit and multiply that by the the price after limit
                // Send all this information back to the controller for printing
                // Open each invoice as a different pop-up window

                $http.get('/api/users/client/' + clientID).success(function(client) {

                    $scope.client = client;

                    // If invoice doesn't exist, calculate invoice details
                    $scope.existingInvoice = false;
                    $http.get('/api/errands/' + startDate + '/' + endDate + '/' + clientID).success(function(errands) {
                        $scope.invoice.client = clientID;
                        $scope.errands = errands;
                        $scope.numberOfErrands = errands.length;
                        $scope.invoice.numberOfErrands = errands.length;
                        $scope.invoice.startDate = startDate;
                        $scope.invoice.endDate = endDate;

                        if($scope.client.billingType === 'Single') {
                            $scope.totalCost = 300 * $scope.numberOfErrands;
                            $scope.invoice.totalCost = $scope.totalCost;
                        } else if($scope.client.billingType === 'Package') {
                            $scope.invoice.packageLimit =  $scope.client.clientPackage.packageLimit;
                            $scope.invoice.priceAfterLimit = $scope.client.clientPackage.priceAfterLimit;
                            $scope.invoice.packagePrice = $scope.client.clientPackage.packagePrice;
                            if($scope.numberOfErrands > $scope.client.clientPackage.packageLimit) {
                                $scope.exceedsLimit = true;
                                $scope.numberOfErrandsOutsidePackage = $scope.numberOfErrands - $scope.client.clientPackage.packageLimit;
                                $scope.costOfErrandsOutsidePackage = $scope.client.clientPackage.priceAfterLimit * $scope.numberOfErrandsOutsidePackage;
                                $scope.totalCost = $scope.costOfErrandsOutsidePackage + $scope.client.clientPackage.packagePrice;

                                $scope.invoice.exceedsLimit = true;
                                $scope.invoice.numberOfErrandsOutsidePackage = $scope.numberOfErrands - $scope.client.clientPackage.packageLimit;
                                $scope.invoice.costOfErrandsOutsidePackage = $scope.client.clientPackage.priceAfterLimit * $scope.numberOfErrandsOutsidePackage;
                                $scope.invoice.totalCost = $scope.costOfErrandsOutsidePackage + $scope.client.clientPackage.packagePrice;
                            } else {
                                $scope.invoice.totalCost = $scope.client.clientPackage.packagePrice;
                            }

                        }
                        // Save new invoice details to DB
                        $http.post('/api/invoices/'+ startDate + '/' + endDate + '/' + clientID,$scope.invoice).success(function(invoice) {
                            $scope.invoiceId = invoice.invoiceId;
                        });
                    });
                });
            });
            $modalInstance.close();
            //$location.path('/invoices')
        } else if(valid && axn === 'Generate Invoices And Runsheets') {
            console.log(query);
            _.each(clients,function(clnt) {
                console.log(clnt);
                $scope.client = {};
                $scope.invoice = {};
                var startDate = $filter('date')(query.startDate,'yyyy-M-d');
                var endDate = $filter('date')(query.endDate,'yyyy-M-d');
                var clientID = clnt.client;
                // For each client, get the number of errands run in the specified time period
                // If they are a package client, count the number above the limit and multiply that by the the price after limit
                // Send all this information back to the controller for printing
                // Open each invoice as a different pop-up window

                $http.get('/api/users/client/' + clientID).success(function(client) {

                    $scope.client = client;

                    // If invoice doesn't exist, calculate invoice details
                    $scope.existingInvoice = false;
                    $http.get('/api/errands/' + startDate + '/' + endDate + '/' + clientID).success(function(errands) {
                        $scope.invoice.client = clientID;
                        $scope.errands = errands;
                        $scope.numberOfErrands = errands.length;
                        $scope.invoice.numberOfErrands = errands.length;
                        $scope.invoice.startDate = startDate;
                        $scope.invoice.endDate = endDate;

                        if($scope.client.billingType === 'Single') {
                            $scope.totalCost = 300 * $scope.numberOfErrands;
                            $scope.invoice.totalCost = $scope.totalCost;
                        } else if($scope.client.billingType === 'Package') {
                            $scope.invoice.packageLimit =  $scope.client.clientPackage.packageLimit;
                            $scope.invoice.priceAfterLimit = $scope.client.clientPackage.priceAfterLimit;
                            $scope.invoice.packagePrice = $scope.client.clientPackage.packagePrice;
                            if($scope.numberOfErrands > $scope.client.clientPackage.packageLimit) {
                                $scope.exceedsLimit = true;
                                $scope.numberOfErrandsOutsidePackage = $scope.numberOfErrands - $scope.client.clientPackage.packageLimit;
                                $scope.costOfErrandsOutsidePackage = $scope.client.clientPackage.priceAfterLimit * $scope.numberOfErrandsOutsidePackage;
                                $scope.totalCost = $scope.costOfErrandsOutsidePackage + $scope.client.clientPackage.packagePrice;

                                $scope.invoice.exceedsLimit = true;
                                $scope.invoice.numberOfErrandsOutsidePackage = $scope.numberOfErrands - $scope.client.clientPackage.packageLimit;
                                $scope.invoice.costOfErrandsOutsidePackage = $scope.client.clientPackage.priceAfterLimit * $scope.numberOfErrandsOutsidePackage;
                                $scope.invoice.totalCost = $scope.costOfErrandsOutsidePackage + $scope.client.clientPackage.packagePrice;
                            } else {
                                $scope.invoice.totalCost = $scope.client.clientPackage.packagePrice;
                            }

                        }
                        // Save new invoice details to DB
                        $http.post('/api/invoices/'+ startDate + '/' + endDate + '/' + clientID,$scope.invoice).success(function(invoice) {
                            $scope.invoiceId = invoice.invoiceId;
                        });
                    });
                });

                $http.get('api/errands/print-errand-runsheet/' + startDate + '/' + endDate + '/' + clientID).success(function(pdf) {
                    $http.get('assets/'+pdf).success(function(res){
                        $window.open('assets/'+pdf);
                    });
                });
            });
            $modalInstance.close();
        }
    };

    $scope.openStart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedStart = true;
        $scope.openedEnd = false;
    };

    $scope.openEnd = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedEnd = true;
        $scope.openedStart = false;
    };

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});
