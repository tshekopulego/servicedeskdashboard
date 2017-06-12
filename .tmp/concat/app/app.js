'use strict';

angular.module('serviceDeskApp', [
  'ngRoute',
      'ngResource',
      'ngSanitize',
      'ngCookies',
      'ngAnimate',
      'btford.socket-io',
      'ui.utils',
      'ui.bootstrap',
      'ui.select',
      'ngTable',
      'wysiwyg.module',
      'angularUtils.directives.dirPagination'
])
.config(["$routeProvider", "$locationProvider", "$httpProvider", function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .otherwise({
            redirectTo: '/dashboard'
        });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
}])

.factory('authInterceptor', ["$rootScope", "$q", "$cookieStore", "$location", function ($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if(response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
}])

.run(["$rootScope", "$location", "Auth", function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            }
        });
    });
}]);

'use strict';

angular.module('serviceDeskApp')
	.config(["$routeProvider", function ($routeProvider) {
		$routeProvider
			.when('/login', {
				templateUrl: 'app/account/login/login.html',
				controller: 'LoginCtrl'
			})
			.when('/login/:sessionToken', {
				templateUrl: 'app/account/login/login.html',
				controller: 'LoginCtrl'
			})
			.when('/signup', {
				templateUrl: 'app/account/signup/signup.html',
				controller: 'SignupCtrl'
			})
			.when('/signup-serviceagent', {
				templateUrl: 'app/account/signup/signup-serviceagent.html',
				controller: 'SignupCtrl'
			})
			.when('/settings', {
				templateUrl: 'app/account/settings/settings.html',
				controller: 'SettingsCtrl',
				authenticate: true
			})
			.when('/confirm', {
				templateUrl: 'app/account/confirm/confirm.html',
				controller: 'ConfirmCtrl',
				authenticate: true
			})
			.when('/confirm/:confirmToken', {
				templateUrl: 'app/account/confirm/confirm.html',
				controller: 'ConfirmCtrl'
			})
			.when('/pwdreset', {
				templateUrl: 'app/account/pwdreset/pwdreset.html',
				controller: 'PwdResetCtrl',
			})
			.when('/pwdreset/:passwordResetToken', {
				templateUrl: 'app/account/pwdreset/pwdreset.html',
				controller: 'PwdResetCtrl'
			});
	}]);




'use strict';

angular.module('serviceDeskApp')
    .controller('ConfirmCtrl', ["$scope", "Auth", "$location", "$routeParams", function ($scope, Auth, $location, $routeParams) {
        $scope.errors = {};
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.confirmToken = $routeParams.confirmToken;
        var confirmationMailSend = false;
        $scope.invalidToken = false;


        if ($scope.confirmToken) {
            Auth.createUser($scope.confirmToken)
                .then( function() {
                    // Logged in, redirect to home
                    $location.path('/');
                })
                .catch( function() {
                    $scope.invalidToken = true;
                });
        }


        $scope.sendConfirmationMail = function() {

            Auth.sendConfirmationMail();
        };

        $scope.confirmationMailSend = function() {
            return confirmationMailSend;
        };


    }]);

'use strict';

angular.module('serviceDeskApp')
.controller('LoginCtrl', ["$scope", "Auth", "$location", "$window", function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.login({
                email: $scope.user.email,
                password: $scope.user.password
            })
            .then( function() {
                $location.path('/');
            })
            .catch( function(err) {
                $scope.errors.other = err.message;
            });
        }
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('PwdResetCtrl', ["$scope", "Auth", "$routeParams", function ($scope, Auth, $routeParams) {

    var passwordResetToken = $routeParams.passwordResetToken;
    var pwdResetState = 'mailform';
    $scope.pwdResetMailSend = false;

    if (passwordResetToken) {
        Auth.confirmResetedPassword( passwordResetToken)
        .then( function() {
            pwdResetState = 'valid_token';
        })
        .catch( function() {
            pwdResetState = 'invalid_token';
        });
    }

    $scope.sendPwdResetMail = function(form) {
        $scope.submitted = true;
        form.email.$setValidity('unknownMailAddress',true);
        if(form.$valid) {
            $scope.pwdResetMailSend = true;
            Auth.sendPwdResetMail( $scope.reset.email, $scope.reset.newPassword)
            .then( function() {
                pwdResetState = 'mailsent';
            })
            .catch( function() {
                form.email.$setValidity('unknownMailAddress',false);
                $scope.pwdResetMailSend = false;
            });
        }
    };

    $scope.resetStateIs = function(state) {
        return pwdResetState===state;
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('SettingsCtrl', ["$scope", "User", "Auth", function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
        $scope.submitted = true;
        if(form.$valid) {
            Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
            .then( function() {
                $scope.message = 'Password successfully changed.';
            })
            .catch( function() {
                form.password.$setValidity('mongoose', false);
                $scope.errors.other = 'Incorrect password';
                $scope.message = '';
            });
        }
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('SignupCtrl', ["$scope", "Auth", "$location", "$window", function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = false;

    $scope.register = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.createGuest({
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                email: $scope.user.email,
                password: $scope.user.password,
                added: Date.now()
            })
            .then( function() {
                // Account created, redirect to home
                $location.path('/');
            })
            .catch( function(err) {
                err = err.data;
                $scope.errors = {};

                // Update validity of form fields that match the mongoose errors
                angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                });
            });
        }
    };

    $scope.registerClient = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.registerClient({
                phoneNumber: $scope.user.phoneNumber,
                password: $scope.user.password,
                added: Date.now()
            })
            .then( function() {
                // Account created, redirect to home
                $location.path('/');
            })
            .catch( function(err) {
                err = err.data;
                $scope.errors = {};

                // Update validity of form fields that match the mongoose errors
                angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                });
            });
        }
    };

    $scope.passwordsMatch = function(value) {
        //console.log(value);
        if(value && value === $scope.user.password)
            return true;
        else
            return false;
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/users', {
        templateUrl: 'app/admin/partials/admin.html',
        controller: 'AdminCtrl'
    })
    .when('/dashboard', {
        templateUrl: 'app/admin/partials/dashboard.html',
        controller: 'DashboardCtrl'
    })
    .when('/clients', {
        templateUrl: 'app/admin/partials/clients.html',
        controller: 'ClientsCtrl'
    })
    .when('/clients/invoice', {
        templateUrl: 'app/admin/partials/client-invoice.html',
        controller: 'ClientsCtrl'
    })
    .when('/admin/edit/:id', {
        templateUrl: 'app/admin/partials/edit.html',
        controller: 'EditCtrl'
    })
    .when('/admin/add', {
        templateUrl: 'app/admin/partials/add.html',
        controller: 'AddCtrl'
    });
}]);

angular.module('serviceDeskApp')
.controller('AddCtrl', ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {

    $scope.submitted = false;
    $scope.errors = {};


    $scope.clientTypes = [{
        value: "Individual",
        name: "Individual"
    },{
        value: "Company",
        name: "Company"
    }];

    $scope.roles = [{
        value: "user",
        name: "User"
    },{
        value: "servicedeskagent",
        name: "Service Desk Agent"
    },{
        value: "servicedeskmanager",
        name: "Service Desk Manager"
    },{
        value: "servicedeskseniormanager",
        name: "Service Desk Senior Manager"
    },{
        value: "changeauthority",
        name: "Change Authority"
    },{
        value: "technician",
        name: "Technician"
    },{
        value: "ictstoreagent",
        name: "ICT Store Agent"
    }];

    $scope.extraContacts = {};

    $scope.addUser = function(user,form,isValid) {
        $scope.submitted = true;
        $scope.user = user;
        if(isValid && $scope.submitted) {

            if(user.zone)
                user.zone = user.zone._id;

            if(!_.isEmpty($scope.extraContacts))
                user.extraContacts = $scope.extraContacts;

            $http.post('/api/users',user)
            .then(function() {
                $scope.user = '';
                $location.path('/users/');
            }).catch(function(err) {
                err = err.data;
                $scope.errors = {};

                if(err.errors) {
                    // Update validity of form fields that match the mongoose errors
                    _.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                } else {
                    form['email'].$setValidity('mongoose', false);
                    $scope.errors['email'] = err.message;
                }
            });
        }
    };

    $scope.passwordsMatch = function(value) {
        if($scope.submitted && $scope.user.role === 'user') {
            if(value && value === $scope.user.password)
                return true;
            else
                return false;
        } else {
            return true;
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AdminCtrl', ["$scope", "$http", "socket", "$filter", "$modal", "$log", function ($scope, $http, socket, $filter, $modal, $log) {
    $scope.users = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/users').success(function(users) {
        $scope.users = users;
        socket.syncUpdates('user', $scope.users,function(event,user,users){
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

    $scope.restoreDB = function() {
        $http.get('/api/admin/restore-latest-backup').success(function(output) {
            console.log(output);
        });
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('user');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('ClientsCtrl', ["$scope", "$http", "socket", "$filter", "$modal", "$log", function ($scope, $http, socket, $filter, $modal, $log) {

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
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('DashboardCtrl', ["$scope", "$http", "socket", "$filter", "$modal", "$log", "$location", "Auth", function ($scope, $http, socket, $filter, $modal, $log, $location, Auth) {

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.today = new Date();
    
    $http.get('/api/issues').success(function(issues) {
                $scope.issues = issues;
                socket.syncUpdates('issue', $scope.issues,function(event,issue,issues){});
    });

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


}]);

angular.module('serviceDeskApp')
.controller('EditCtrl', ["$scope", "$http", "$location", "$routeParams", "$window", function ($scope, $http, $location, $routeParams, $window) {

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

}]);

angular.module('serviceDeskApp')
.controller('GenerateInvoiceModalInstanceCtrl', ["$scope", "$http", "$modalInstance", "$window", "$filter", "$location", "clients", "axn", function ($scope, $http, $modalInstance, $window, $filter, $location, clients, axn) {

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

}]);

angular.module('serviceDeskApp')
.controller('UserModalInstanceCtrl', ["$scope", "$modalInstance", "user", function ($scope, $modalInstance, user) {

    $scope.user = user;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqAddClientContact', ['$document', '$compile',
    function ($document, $compile) {
    return {
        template: '<a title="Add Another Contact" href="#">Add Another Contact</a>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('click',function() {
                var index = Math.floor(Math.random() * (100 - 1) +1) + 1;
                var div = $compile('<div class="form-group contact-row"><label></label><div class="input-group col-xs-6"><input class="form-control" type="text" name="person" data-index="'+index+'" placeholder="Contact Person Name" maq-update-extra-contacts/><input class="form-control" type="text" name="number" ng-model="num'+index+'" placeholder="Contact Person Number" maq-update-extra-contacts data-index="'+index+'" ui-mask="9999999999" ui-mask-placeholder ui-mask-placeholder-char="-"/><span maq-remove-client-contact-row class="glyphicon glyphicon-remove trash delete-row" data-index="'+index+'" title="Remove Contact"></span></div></div>')(scope);
                element.parents(".form-group").prepend(div);
            });
        }
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.directive('ngConfirmClick', [
    function(){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs){
                element.bind('click', function(e){
                    var message = attrs.ngConfirmClick;
                    if(message && !confirm(message)){
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqRemoveClientContactRow', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('click',function() {
                var index = attrs.index;
                element.parents('.input-group').slideUp('slow');
                element.parents('.input-group').find('input').val('');
                console.log(scope.extraContacts[index]);
                delete scope.extraContacts[index];
                console.log(scope.extraContacts);
            });
        }
    };
});

'use strict';

angular.module('serviceDeskApp')
.directive('maqSelectAllClients', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {

            element.bind('click',function() {

                var checkboxes = element.parents('.table').find('input.client-checkbox');

                if(element.is(':checked')) {
                    _.each(checkboxes,function(checkbox) {

                        var client = checkbox.name;
                        checkbox.checked = true;

                        if(_.indexOf(scope.selectedClients,client))
                            scope.selectedClients[client] = {client:client};
                        else
                            delete scope.selectedClients[client];
                    });
                } else {
                    _.each(checkboxes,function(checkbox) {

                        var client = checkbox.name;
                        checkbox.checked = false;

                        delete scope.selectedClients[client];
                    });
                }
            });
        }
    };
});

'use strict';

angular.module('serviceDeskApp')
.directive('maqSelectClient', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {

            element.bind('click',function() {

                var client = element.attr('name');

                if(element.is(':checked')) {
                    if(_.indexOf(scope.selectedClients,client))
                        scope.selectedClients[client] = {client:client};
                    else
                        delete scope.selectedClients[client];
                } else {
                    delete scope.selectedClients[client];
                }
                //console.log(scope.selectedClients);
            });
        }
    };
});

'use strict';

angular.module('serviceDeskApp')
.directive('maqSidebarMenu', [
    '$location',
    function(location){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs){
                /*
                 * SIDEBAR MENU
                 * ------------
                 * This is a custom plugin for the sidebar menu. It provides a tree view.
                 *
                 * Usage:
                 * $(".sidebar).tree();
                 *
                 * Note: This plugin does not accept any options. Instead, it only requires a class
                 *       added to the element that contains a sub-menu.
                 *
                 * When used with the sidebar, for example, it would look something like this:
                 * <ul class='sidebar-menu'>
                 *      <li class="treeview active">
                 *          <a href="#>Menu</a>
                 *          <ul class='treeview-menu'>
                 *              <li class='active'><a href=#>Level 1</a></li>
                 *          </ul>
                 *      </li>
                 * </ul>
                 *
                 * Add .active class to <li> elements if you want the menu to be open automatically
                 * on page load. See above for an example.
                 */
                var btn = element;
                var menu = element.next("ul.treeview-menu");
                var isActive = element.is('.active');
                var path = element.attr('href');

                if(location.path().substr(0, path.length) == path) {
                    //menu.slideDown();
                    btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                    btn.parent("li").addClass("active");
                }

                //Slide open or close the menu on link click
                btn.click(function(e) {
                    e.preventDefault();
                    if (isActive) {
                        //Slide up to close menu
                        //menu.slideUp();
                        isActive = false;
                        btn.children(".fa-angle-down").first().removeClass("fa-angle-down").addClass("fa-angle-left");
                        //btn.parent("li").removeClass("active");
                    } else {
                        //Slide down to open menu
                        //menu.slideDown();
                        isActive = true;
                        btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                        //btn.parent("li").addClass("active");
                    }
                });
            }
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqUpdateExtraContacts', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('input',function() {
                var value = element.val();
                var index = attrs.index;
                var field = attrs.name;
                if(value.length > 0) {
                    if(scope.extraContacts[index]) {
                        if(field === 'person')
                            scope.extraContacts[index].person = value;
                        else
                            scope.extraContacts[index].number = value;
                    } else {
                        if(field === 'person')
                            scope.extraContacts[index] = {person:value};
                        else
                            scope.extraContacts[index] = {number:value};
                    }
                } else {
                    delete scope.extraContacts[index];
                }
                console.log(scope.extraContacts);
            });
        }
    };
});

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/category', {
        templateUrl: 'app/category/partials/category.html',
        controller: 'CategoryCtrl'
    })
    .when('/category/add', {
        templateUrl: 'app/category/partials/add-category.html',
        controller: 'AddCategoryCtrl'
    }).when('/category/edit/:id', {
        templateUrl: 'app/category/partials/edit-category.html',
        controller: 'EditCategoryCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddCategoryCtrl', ["$scope", "$http", "$location", "$window", "socket", function ($scope, $http, $location, $window, socket) {

    $scope.issuecategory = {};
    $scope.submitted = false;

    $scope.addCategory = function(issuecategory,isValid) {
        $scope.submitted = true;
        $scope.issuecategory = issuecategory;
        if(isValid && $scope.submitted) {
            $http.post('/api/category',issuecategory);
            $scope.issuecategory = '';
            $location.path('/category');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('CategoryCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.categories = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/category').success(function(categories) {
		$scope.categories = categories;
		socket.syncUpdates('category', $scope.categories,function(event,category,categories){
		});
	});

	$scope.open = function (issuecategory) {

		var modalInstance = $modal.open({
			templateUrl: 'app/category/partials/category-details.modal.html',
			controller: 'CategoryModalInstanceCtrl',
			resolve: {
				category: function() {
					return issuecategory;
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

	$scope.delete = function(issuecategory) {
		$http.delete('/api/category/' + issuecategory._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('category');
	});
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditCategoryCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.category = {};
    $scope.submitted = false;
    $scope.category_id = $routeParams.id;

    $http.get('/api/category/' + $scope.category_id ).success(function(category) {
        $scope.category = category;
    })

    $scope.editCategory = function(category,isValid) {
        $scope.submitted = true;
        $scope.category = category;
        if(isValid && $scope.submitted) {
            $http.put('/api/category/' + $scope.category_id,category);
            $scope.category = '';
            $location.path('/category');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

angular.module('serviceDeskApp')
.controller('CategoryModalInstanceCtrl', ["$scope", "$modalInstance", "category", function ($scope, $modalInstance, category) {

    $scope.category = category;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/channel', {
        templateUrl: 'app/channel/partials/channel.html',
        controller: 'ChannelCtrl'
    })
    .when('/channel/add', {
        templateUrl: 'app/channel/partials/add-channel.html',
        controller: 'AddChannelCtrl'
    }).when('/channel/edit/:id', {
        templateUrl: 'app/channel/partials/edit-channel.html',
        controller: 'EditChannelCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddChannelCtrl', ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {

    $scope.issuechannel = {};
    $scope.submitted = false;

    $scope.addChannel = function(issuechannel,isValid) {
        $scope.submitted = true;
        $scope.issuechannel = issuechannel;
        if(isValid && $scope.submitted) {
            $http.post('/api/channel',issuechannel);
            $scope.issuechannel = '';
            $location.path('/channel');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('ChannelCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.channel = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/channel').success(function(channel) {
		$scope.channel = channel;
		socket.syncUpdates('channel', $scope.channel,function(event,channel,channels){

		});
	});

	$scope.open = function (issuechannel) {

		var modalInstance = $modal.open({
			templateUrl: 'app/channel/partials/channel-details.modal.html',
			controller: 'ChannelModalInstanceCtrl',
			resolve: {
				channel: function() {
					return issuechannel;
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
		$http.delete('/api/channel/' + issuechannel._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('channel');
	});
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('EditChannelCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.channel = {};
    $scope.submitted = false;
    $scope.channel_id = $routeParams.id;

    $http.get('/api/channel/' + $scope.channel_id ).success(function(channel) {
        $scope.channel = channel;
    })

    $scope.editChannel = function(channel,isValid) {
        $scope.submitted = true;
        $scope.channel = channel;
        if(isValid && $scope.submitted) {
            $http.put('/api/channel/' + $scope.channel_id,channel);
            $scope.channel = '';
            $location.path('/channel');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

angular.module('serviceDeskApp')
.controller('ChannelModalInstanceCtrl', ["$scope", "$modalInstance", "channel", function ($scope, $modalInstance, channel) {

    $scope.channel = channel;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddDivisionCtrl', ["$scope", "$http", "$window", "$location", function ($scope, $http, $window, $location) {

    $scope.division = {};

    $scope.addDivision = function(division,isValid) {
        $scope.submitted = true;
        console.log(division);
        if(isValid && $scope.submitted) {
            $http.post('/api/division',division);
            $scope.division = {};
            $location.path('/division');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('DivisionCtrl', ["$scope", "$http", "$window", "socket", function ($scope, $http, $window, socket) {

    $scope.divisions = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
        socket.syncUpdates('division', $scope.divisions,function(event,division,divisions){
        });
    });

    $scope.delete = function(division) {
        $http.delete('/api/division/' + division._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('division');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditDivisionCtrl', ["$scope", "$http", "$window", "$location", "$routeParams", function ($scope, $http, $window, $location, $routeParams) {

    $scope.division = {};
    $scope.division_id = $routeParams.id;

    $http.get('/api/division/' + $scope.division_id).success(function(division) {
        $scope.division = division;
    });

    $scope.editDivision = function(division,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/division/' + $scope.division_id,division);
            $scope.division = {};
            $location.path('/division');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/division', {
        templateUrl: 'app/division/partials/division.html',
        controller: 'DivisionCtrl'
    })
    .when('/division/add', {
        templateUrl: 'app/division/partials/add-division.html',
        controller: 'AddDivisionCtrl'
    })
    .when('/division/edit/:id', {
        templateUrl: 'app/division/partials/edit-division.html',
        controller: 'EditDivisionCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddICTAssetCtrl', ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {

    $scope.issueictasset = {};
    $scope.submitted = false;

    $scope.addICTAsset = function(issueictasset,isValid) {
        $scope.submitted = true;
        $scope.issueictasset = issueictasset;
        if(isValid && $scope.submitted) {
            $http.post('/api/ictasset',issueictasset);
            $scope.issueictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('EditICTAssetCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.ictasset = {};
    $scope.submitted = false;
    $scope.ictasset_id = $routeParams.id;

    $http.get('/api/ictasset/' + $scope.ictasset_id ).success(function(ictasset) {
        $scope.ictasset = ictasset;
    })

    $scope.editICTAsset = function(ictasset,isValid) {
        $scope.submitted = true;
        $scope.ictasset = ictasset;
        if(isValid && $scope.submitted) {
            $http.put('/api/ictasset/' + $scope.ictasset_id,ictasset);
            $scope.ictasset = '';
            $location.path('/ictasset');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('ICTAssetCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictassets = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/ictasset').success(function(ictassets) {
		$scope.ictassets = ictassets;
		socket.syncUpdates('ictasset', $scope.ictassets,function(event,ictasset,ictassets){
		});
	});

	$scope.open = function (issueictasset) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictasset/partials/ictasset-details.modal.html',
			controller: 'ICTAssetModalInstanceCtrl',
			resolve: {
				ictasset: function() {
					return issueictasset;
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

	$scope.delete = function(issueictasset) {
		$http.delete('/api/ictasset/' + issueictasset._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictasset');
	});
}]);

angular.module('serviceDeskApp')
.controller('ICTAssetModalInstanceCtrl', ["$scope", "$modalInstance", "ictasset", function ($scope, $modalInstance, ictasset) {

    $scope.ictasset = ictasset;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/ictasset', {
        templateUrl: 'app/ictasset/partials/ictasset.html',
        controller: 'ICTAssetCtrl'
    })
    .when('/ictasset/add', {
        templateUrl: 'app/ictasset/partials/add-ictasset.html',
        controller: 'AddICTAssetCtrl'
    }).when('/ictasset/edit/:id', {
        templateUrl: 'app/ictasset/partials/edit-ictasset.html',
        controller: 'EditICTAssetCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddICTStoreCtrl', ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {

    $scope.issueictstore = {};
    $scope.submitted = false;

    $scope.addICTStore = function(issueictstore,isValid) {
        $scope.submitted = true;
        $scope.issueictstore = issueictstore;
        if(isValid && $scope.submitted) {
            $http.post('/api/ictstore',issueictstore);
            $scope.issueictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('EditICTStoreCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.ictstore = {};
    $scope.submitted = false;
    $scope.ictstore_id = $routeParams.id;

    $http.get('/api/ictstore/' + $scope.ictstore_id ).success(function(ictstore) {
        $scope.ictstore = ictstore;
    })

    $scope.editICTStore = function(ictstore,isValid) {
        $scope.submitted = true;
        $scope.ictstore = ictstore;
        if(isValid && $scope.submitted) {
            $http.put('/api/ictstore/' + $scope.ictstore_id,ictstore);
            $scope.ictstore = '';
            $location.path('/ictstore');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('ICTStoreCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.ictstores = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/ictstore').success(function(ictstores) {
		$scope.ictstores = ictstores;
		socket.syncUpdates('ictstore', $scope.ictstores,function(event,ictstore,ictstores){
		});
	});

	$scope.open = function (issueictstore) {

		var modalInstance = $modal.open({
			templateUrl: 'app/ictstore/partials/ictstore-details.modal.html',
			controller: 'ICTStoreModalInstanceCtrl',
			resolve: {
				ictstore: function() {
					return issueictstore;
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

	$scope.delete = function(issueictstore) {
		$http.delete('/api/ictstore/' + issueictstore._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('ictstore');
	});
}]);

angular.module('serviceDeskApp')
.controller('ICTStoreModalInstanceCtrl', ["$scope", "$modalInstance", "ictstore", function ($scope, $modalInstance, ictstore) {

    $scope.ictstore = ictstore;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/ictstore', {
        templateUrl: 'app/ictstore/partials/ictstore.html',
        controller: 'ICTStoreCtrl'
    })
    .when('/ictstore/add', {
        templateUrl: 'app/ictstore/partials/add-ictstore.html',
        controller: 'AddICTStoreCtrl'
    }).when('/ictstore/edit/:id', {
        templateUrl: 'app/ictstore/partials/edit-ictstore.html',
        controller: 'EditICTStoreCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddIssueCtrl', ["$scope", "$http", "$location", "$window", "socket", function ($scope, $http, $location, $window, socket) {

    $scope.issue = {};
    $scope.submitted = false;

     $http.get('/api/channel').success(function(channels) {
        $scope.channels = channels;
        socket.syncUpdates('channel',
        $scope.channels,function(event,channel,channels){
        });
    });

    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
        socket.syncUpdates('category',
        $scope.categories,function(event,category,categories){
        });
    });

    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
        socket.syncUpdates('division', $scope.divisions,function(event,division,divisions){
        });
    });

    $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
        socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
        });
    });

    $scope.addIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        if($scope.submitted) {

            $scope.issue.issueCategory = issue.category._id;
            $scope.issue.issueChannel = issue.channel._id;
            $scope.issue.issuePriority = issue.priority._id;
            $scope.issue.issueDivision = issue.division._id;
            $scope.issue.issueRefNumber = (new Date).getTime();
          

            $http.post('/api/issues',$scope.issue);
            $scope.issue = '';
            $location.path('/issues');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditIssueCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", "socket", function ($scope, $http, $location, $window, $routeParams, socket) {

    $scope.issue = {};
    $scope.submitted = false;
    $scope.issue_id = $routeParams.id;

     $http.get('/api/channel').success(function(channels) {
        $scope.channels = channels;
    });

    $http.get('/api/category').success(function(categories) {
        $scope.categories = categories;
    });

    $http.get('/api/division').success(function(divisions) {
        $scope.divisions = divisions;
    });

    $http.get('/api/priority').success(function(priorities) {
        $scope.priorities = priorities;
    });

    $http.get('/api/issue-status').success(function(issuestatuses) {
        $scope.issuestatuses = issuestatuses;
    });

    $http.get('/api/issues/' + $scope.issue_id).success(function (issue) {
      console.log(issue);
    $scope.issue = issue;
});

    $scope.editIssue = function(issue,isValid) {
        $scope.submitted = true;
        $scope.issue = issue;
        if($scope.submitted) {

            $scope.issue.issueCategory = issue.category._id;
            $scope.issue.issueChannel = issue.channel._id;
            $scope.issue.issuePriority = issue.priority._id;
            $scope.issue.issueDivision = issue.division._id;

            $http.post('/api/issues',$scope.issue);
            $scope.issue = '';
            $location.path('/issues');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

angular.module('serviceDeskApp')
.controller('IssueModalInstanceCtrl', ["$scope", "$modalInstance", "issue", function ($scope, $modalInstance, issue) {

    $scope.issue = issue;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.controller('IssueCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.issues = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

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
        socket.syncUpdates('issue', $scope.issues,function(event,issue,issues){
        });
    });

        $scope.searchIssues = function (category, status) {

            if ((category == "-1") && (status == "-1")) { //get all records
                $http.get('/api/issues').success(function (issues) {
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
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/issues', {
        templateUrl: 'app/issues/partials/issues.html',
        controller: 'IssueCtrl'
    })
    .when('/issues/add', {
        templateUrl: 'app/issues/partials/add-issue.html',
        controller: 'AddIssueCtrl'
    })
    .when('/issues/edit', {
        templateUrl: 'app/issues/partials/edit-issue.html',
        controller: 'EditIssueCtrl'
    })
    .when('/issues/edit/:id', {
        templateUrl: 'app/issues/partials/edit-issue.html',
        controller: 'EditIssueCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddOfficeParkCtrl', ["$scope", "$http", "$location", "$window", "$filter", function ($scope, $http, $location, $window, $filter) {

    $scope.officepark = {};
    $scope.submitted = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.today = new Date();

    $scope.addOfficePark = function(officepark,isValid) {
        $scope.submitted = true;
        $scope.officepark = officepark;
        if(isValid && $scope.submitted) {
            $http.post('/api/officeparks',officepark);
            $scope.officepark = '';
            $location.path('/officeparks');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditOfficeParkCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", "$filter", function ($scope, $http, $location, $window, $routeParams, $filter) {

    $scope.officepark = {};
    $scope.submitted = false;
    $scope.officepark_id = $routeParams.id;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

  $scope.today = new Date();

  $http.get('/api/officeparks/'+$scope.officepark_id).success(function(officepark) {
        $scope.officepark = officepark;
  });

  $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
  };

  $scope.editOfficePark = function(officepark,isValid) {
        $scope.submitted = true;
        $scope.officepark = officepark;
        if(isValid && $scope.submitted) {
            console.log(officepark);
            $http.put('/api/officeparks/' + $scope.officepark_id,officepark);
            $scope.officepark = '';
            $location.path('/officeparks');
        }
  };

  $scope.cancel = function() {
        $window.history.back();
  };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('OfficeParksCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.officeparks = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/officeparks').success(function(officeparks) {
        $scope.officeparks = officeparks;
        socket.syncUpdates('officepark', $scope.officeparks,function(event,officepark,officeparks){
        });
    });

    $scope.open = function (officepark) {

        var modalInstance = $modal.open({
            templateUrl: 'app/officeparks/partials/officepark-details.modal.html',
            controller: 'OfficeParkModalInstanceCtrl',
            //size: size,
            resolve: {
                officepark: function() {
                    return officepark;
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

    $scope.delete = function(officepark) {
        $http.delete('/api/officeparks/' + officepark._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('officepark');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/officeparks', {
        templateUrl: 'app/officeparks/partials/officeparks.html',
        controller: 'OfficeParksCtrl'
    })
    .when('/officeparks/add', {
        templateUrl: 'app/officeparks/partials/add-officepark.html',
        controller: 'AddOfficeParkCtrl'
    })
    .when('/officeparks/edit/:id', {
        templateUrl: 'app/officeparks/partials/edit-officepark.html',
        controller: 'EditOfficeParkCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddPriorityCtrl', ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {

    $scope.issuepriority = {};
    $scope.submitted = false;

    $scope.addPriority = function(issuepriority,isValid) {
        $scope.submitted = true;
        $scope.issuepriority = issuepriority;
        if(isValid && $scope.submitted) {
            $http.post('/api/priority',issuepriority);
            $scope.issuepriority = '';
            $location.path('/priority');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditPriorityCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.priority = {};
    $scope.submitted = false;
    $scope.priority_id = $routeParams.id;

    $http.get('/api/priority/' + $scope.priority_id).success(function(priority) {
        $scope.priority = priority;
    })

    $scope.editPriority = function(priority,isValid) {
        $scope.submitted = true;
        $scope.priority = priority;
        if(isValid && $scope.submitted) {
            $http.put('/api/priority/' + $scope.priority_id,priority);
            $scope.priority = '';
            $location.path('/priority');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

angular.module('serviceDeskApp')
.controller('PriorityModalInstanceCtrl', ["$scope", "$modalInstance", "priority", function ($scope, $modalInstance, priority) {

    $scope.priority = priority;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

'use strict';

angular.module('serviceDeskApp')
.controller('PriorityCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

	$scope.priorities = [];
	$scope.currentPage = 1;
	$scope.pageSize = 10;

	$http.get('/api/priority').success(function(priorities) {
		$scope.priorities = priorities;
		socket.syncUpdates('priority', $scope.priorities,function(event,priority,priorities){
		});
	});

	$scope.open = function (issuepriority) {

		var modalInstance = $modal.open({
			templateUrl: 'app/priority/partials/priority-details.modal.html',
			controller: 'PriorityModalInstanceCtrl',
			resolve: {
				priority: function() {
					return issuepriority;
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

	$scope.delete = function(issuepriority) {
		$http.delete('/api/priority/' + issuepriority._id);
        
	};

	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('priority');
	});
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/priority', {
        templateUrl: 'app/priority/partials/priority.html',
        controller: 'PriorityCtrl'
    })
    .when('/priority/add', {
        templateUrl: 'app/priority/partials/add-priority.html',
        controller: 'AddPriorityCtrl'
    }).when('/priority/edit/:id', {
        templateUrl: 'app/priority/partials/edit-priority.html',
        controller: 'EditPriorityCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('RequesttpeCtrl', ["$scope", "$http", "$window", "socket", function ($scope, $http, $window, socket) {

    $scope.requesttpe = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/request-tpe').success(function(requesttpe) {
        $scope.requesttpes = requesttpes;
        socket.syncUpdates('requesttpe', $scope.requesttpes,function(event,requesttpe,requesttpes){
        });
    });

    $scope.delete = function(requesttpe) {
        $http.delete('/api/request-tpe/' + requesttpe._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('requesttpe');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/division', {
        templateUrl: 'app/request-type/partials/division.html',
        controller: 'DivisionCtrl'
    })
    .when('/division/add', {
        templateUrl: 'app/request-type/partials/add-division.html',
        controller: 'RequesttypeCtrl'
    })
    .when('/division/edit/:id', {
        templateUrl: 'app/request-type/partials/edit-division.html',
        controller: 'EditRequesttypeCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddRfccallCtrl', ["$scope", "$http", "$location", "$window", "socket", function ($scope, $http, $location, $window, socket) {

    $scope.rfccall = {};
    $scope.submitted = false;
    
    $http.get('/api/evaluation-outcome').success(function(evaluationoutcomes) {
        $scope.evaluationoutcomes = evaluationoutcomes; 
        socket.syncUpdates('evaluationoutcome',
        $scope.evaluationoutcomes,function(event,evaluationoutcome,evaluationoutcomes){
        });
    });
    
    $http.get('/api/request-type').success(function(requesttypes) {
        $scope.requesttypes = requesttypes;
        socket.syncUpdates('requesttype', 
        $scope.requesttypes,function(event,requesttype,requesttypes){
        });
    });

    $scope.addRfccall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if($scope.submitted) {
            
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
            $scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
                
            $http.post('/api/rfc-calls',$scope.rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);
'use strict';

angular.module('serviceDeskApp')
.controller('EditRfccallCtrl', ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {

    $scope.category = {};
    $scope.submitted = false;
    $scope.category_id = $routeParams.id;

    $http.get('/api/rfc-calls/' + $scope.category_id ).success(function(rfccall) {
        $scope.rfccall = rfccall;
    })
    
    $http.get('/api/evaluation-outcome').success(function(evaluationoutcomes) {
        $scope.evaluationoutcomes = evaluationoutcomes; 
        socket.syncUpdates('evaluationoutcome',
        $scope.evaluationoutcomes,function(event,evaluationoutcome,evaluationoutcomes){
        });
    });
    
    $http.get('/api/request-type').success(function(requesttypes) {
        $scope.requesttypes = requesttypes;
        socket.syncUpdates('requesttype', 
        $scope.requesttypes,function(event,requesttype,requesttypes){
        });
    });

    $scope.editRfccall = function(rfccall,isValid) {
        $scope.submitted = true;
        $scope.rfccall = rfccall;
        
        if(isValid && $scope.submitted) {
            
            $scope.rfccall.changeRequestType = rfccall.requesttype._id;
            $scope.rfccall.callEvaluationOutcome = rfccall.evaluationoutcome._id;
                
            $http.put('/api/rfc-calls/' + $scope.rfccall._id,rfccall);
            $scope.rfccall = '';
            $location.path('/rfccall');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

angular.module('serviceDeskApp')
.controller('RfccallModalInstanceCtrl', ["$scope", "$modalInstance", "rfccall", function ($scope, $modalInstance, rfccall) {

    $scope.rfccall = rfccall;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);
'use strict';

angular.module('serviceDeskApp')
.controller('RfccallCtrl', ["$scope", "$http", "$modal", "$log", "$filter", "socket", function ($scope, $http, $modal, $log, $filter, socket) {

    $scope.rfccalls = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    

    $http.get('/api/rfc-calls').success(function(rfccalls) {
        $scope.rfccalls = rfccalls;
        socket.syncUpdates('rfccall', $scope.rfccalls,function(event,rfccall,rfccalls){
        });
    });

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

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.delete = function(rfccall) {
        $http.delete('/api/rfc-calls/' + rfccall._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('rfccall');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/rfccalls', {
        templateUrl: 'app/rfc-calls/partials/rfccalls.html',
        controller: 'RfccallCtrl'
    })
    .when('/rfccalls/add', {
        templateUrl: 'app/rfc-calls/partials/add-rfccall.html',
        controller: 'AddRfccallCtrl'
    })
    .when('/rfccalls/edit/:id', {
        templateUrl: 'app/rfc-calls/partials/edit-rfccalls.html',
        controller: 'EditrfccallCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('AddIssueStatusCtrl', ["$scope", "$http", "$window", "$location", function ($scope, $http, $window, $location) {

    $scope.issuestatus = {};

    $scope.addissueStatus = function(issuestatus,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.post('/api/issue-status',issuestatus);
            $scope.issuestatus = {};
            $location.path('/issuestatus');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('EditIssueStatusCtrl', ["$scope", "$http", "$window", "$location", "$routeParams", function ($scope, $http, $window, $location, $routeParams) {

    $scope.issuestatus = {};
    $scope.issuestatus_id = $routeParams.id;

    $http.get('/api/issue-status/' + $scope.issuestatus_id).success(function(issuestatus) {
        console.log(issuestatus);
        $scope.issuestatus = issuestatus;
    });

    $scope.editIssueStatus = function(issuestatus,isValid) {
        $scope.submitted = true;

        if(isValid && $scope.submitted) {
            $http.put('/api/issue-status/' + $scope.issuestatus_id,issuestatus);
            $scope.issuestatus = {};
            $location.path('/issuestatus');
        }
    };

    $scope.cancel = function() {
        $window.history.back();
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.controller('IssueStatusCtrl', ["$scope", "$http", "$window", "socket", function ($scope, $http, $window, socket) {

    $scope.issuestatuses = [];
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $http.get('/api/issue-status').success(function(issuestatuses) {
        $scope.issuestatuses = issuestatuses;
        socket.syncUpdates('issuestatus', $scope.issuestatuses,function(event,issuestatus,issuestatuses){
        });
    });

    $scope.delete = function(issuestatus) {
        $http.delete('/api/issue-status/' + issuestatus._id);
    };

    $scope.cancel = function() {
        $window.history.back();
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('issuestatus');
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/issuestatus', {
        templateUrl: 'app/status/partials/issuestatus.html',
        controller: 'IssueStatusCtrl'
    })
    .when('/issuestatus/add', {
        templateUrl: 'app/status/partials/add-issuestatus.html',
        controller: 'AddIssueStatusCtrl'
    })
    .when('/issuestatus/edit/:id', {
        templateUrl: 'app/status/partials/edit-issuestatus.html',
        controller: 'EditIssueStatusCtrl'
    });
}]);

'use strict';

angular.module('serviceDeskApp')
.factory('Auth', ["$location", "$rootScope", "$http", "User", "Local", "$cookieStore", "$q", function Auth($location, $rootScope, $http, User, Local, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
        currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
       login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
            email: user.email,
            password: user.password
        }).
        success(function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            deferred.resolve(data);
            return cb();
        }).
        error(function(err) {
            this.logout();
            deferred.reject(err);
            return cb(err);
        }.bind(this));

        return deferred.promise;
       },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
       logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
       },

      /**
       * Create a new guest user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
       createGuest: function(user, callback) {
        var cb = callback || angular.noop;

        return User.createGuest(user,
            function(data) {
                $cookieStore.put('token', data.token);
                currentUser = User.get();
                return cb(user);
            },
            function(err) {
                this.logout();
                return cb(err);
            }.bind(this)).$promise;
       },

       registerClient: function(user, callback) {
        var cb = callback || angular.noop;

        return User.registerClient(user,
            function(data) {
                currentUser = User.get();
                return cb(user);
            },
            function(err) {
                this.logout();
                return cb(err);
            }.bind(this)).$promise;
       },

       /**
       * Confirm user
       *
       * @param  {String}   mailConfirmationToken
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       createUser: function(mailConfirmationToken, callback) {

        var cb = callback || angular.noop;

        return User.createUser({
            mailConfirmationToken: mailConfirmationToken
        }, function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(currentUser);
        }, function(err) {
            return cb(err);
        }).$promise;
       },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, function(user) {
            return cb(user);
        }, function(err) {
            return cb(err);
        }).$promise;
       },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
       getCurrentUser: function() {
        if (!currentUser&&$localStorage.token) return currentUser = User.get();
        return currentUser;
       },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
       isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
       },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
       isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
            currentUser.$promise.then(function() {
                cb(true);
            }).catch(function() {
                cb(false);
            });
        } else if(currentUser.hasOwnProperty('role')) {
            cb(true);
        } else {
            cb(false);
        }
       },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
       isAdmin: function() {
        return currentUser.role == 'admin';
       },

       isAdminAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
            currentUser.$promise.then(function() {
                if(currentUser.role == 'admin')
                    cb(true);
                else
                    cb(false);
            }).catch(function() {
                cb(false);
            });
        } else if(currentUser.hasOwnProperty('role') && currentUser.role == 'admin') {
            cb(true);
        } else {
            cb(false);
        }
       },

       /**
       * Check if a user is a superadmin
       *
       * @return {Boolean}
       */
       isSuperAdmin: function() {
        return currentUser.role == 'superadmin';
       },

      /**
       * Get auth token
       */
       getToken: function() {
        return $localStorage.token;
       },

      /**
       * Check if a user's mail is confirmed
       *
       * @return {Boolean}
       */
       isMailconfirmed: function() {
        return currentUser.confirmedEmail;
       },

      /**
       * Confirm mail
       *
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       sendConfirmationMail: function(callback) {
        var cb = callback || angular.noop;

        return Local.verifyMail(function() {
            return cb();
        }, function(err) {
            return cb(err);
        }).$promise;
       },

      /**
       * Send Reset password Mail
       *
       * @param  {String}   email address
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       sendPwdResetMail: function(email, newPassword, callback) {
        var cb = callback || angular.noop;
        console.log('email :'+email);
        return Local.resetPassword({
            email: email,
            newPassword : newPassword
        }, function(user) {
            return cb(user);
        }, function(err) {
            return cb(err);
        }).$promise;
       },

      /**
       * Change reseted password
       *
       * @param  {String}   passwordResetToken
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       confirmResetedPassword: function(passwordResetToken, callback) {
        var cb = callback || angular.noop;
        console.log('passwordResetToken: '+ passwordResetToken);

        return Local.confirmPassword({
            passwordResetToken: passwordResetToken,
        }, function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(data);
        }, function(err) {
            return cb(err);
        }).$promise;
       },

      /**
       * Set session token
       *
       * @param  {String}   session token
       * @return {Promise}
       */
       setSessionToken: function(sessionToken, callback) {
        var cb = callback || angular.noop;
        sessionToken = $cookieStore.get('token');
        currentUser = User.get(cb);
       }
    };
}]);

'use strict';

angular.module('serviceDeskApp')
  .factory('Local', ["$resource", function ($resource) {
    return $resource('/auth/local/:controller', {
      id: '@_id'
    },
    {
      verifyMail: {
        method: 'GET',
        params: {
          controller:'mailconfirmation'
        }
      },
      confirmMail: {
        method: 'POST',
        params: {
          controller:'mailconfirmation'
        }
      },
      resetPassword: {
        method: 'GET',
        params: {
          controller: 'passwordreset'
        }
      },
      confirmPassword: {
        method: 'POST',
        params: {
          controller:'passwordreset'
        }
      }
	  });
  }]);

'use strict';

angular.module('serviceDeskApp')
.factory('User', ["$resource", function ($resource) {
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
    },
    {
        changePassword: {
            method: 'PUT',
            params: {
                controller:'password'
            }
        },
        get: {
            method: 'GET',
            params: {
                id:'me'
            }
        },
        createGuest: {
            method: 'POST',
        },
        createUser: {
            method: 'PUT',
        },
        registerClient: {
            method: 'POST',
            params: {
                controller:'register-client'
            }
        }
    });
}]);

'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('serviceDeskApp')
    .directive('mongooseError', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                element.on('keydown', function() {
                    return ngModel.$setValidity('mongoose', true);
                });
            }
        };
    });
'use strict';

angular.module('serviceDeskApp')
.directive('maqDangerAlert', [
    function(){
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'components/navbar/danger-alert.html'
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqInfoAlert', [
    function(){
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'components/navbar/info-alert.html'
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqInspiniaNav', [
    function(){
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'components/navbar/inspinia-navigation.html'
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqInspiniaTopNav', [
    function(){
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'components/navbar/inspinia-topnavbar.html'
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqMinimiseSidebar', [
    function(){
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: ["$scope", "$element", function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 100);
                } else if ($('body').hasClass('fixed-sidebar')){
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 300);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                }
            }
        }]
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqSideNavigation', ['$timeout',
    function(timeout){
        return {
            restrict: 'A',
            link: function(scope, element) {
                timeout(function(){
                    element.metisMenu();
                });
            }
        };
    }
]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqSocketDisconnected', [
    function(){
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'components/navbar/socket-disconnected.html'
        }
    }
]);

'use strict';

angular.module('serviceDeskApp')
.controller('NavbarCtrl', ["$scope", "$location", "Auth", "$http", function ($scope, $location, Auth, $http) {
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

    $scope.restoreDB = function() {
        $http.get('/api/admin/restore-latest-backup').success(function(output) {
            console.log(output);
        });
    };
}]);

'use strict';

angular.module('serviceDeskApp')
.directive('maqTreeviewToggle', ['$location',
    function(location){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs) {
                var isActive = element.is('.active');
                var menu = element.children("ul.treeview-menu");
                var path = location.path().split('/')[1];
                if(path === 'clients' || path === 'invoices' || path === 'users' || path === 'dashboard') {
                    menu.slideDown();
                    element.children('a').children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                    element.addClass("active");
                }
            }
        }
    }
]);

/* global io */
'use strict';

angular.module('serviceDeskApp')
    .factory('socket', ["socketFactory", function(socketFactory) {

        // socket.io now auto-configures its connection when we ommit a connection url
        var ioSocket = io('', {
            // Send auth token on connection, you will need to DI the Auth service above
            // 'query': 'token=' + Auth.getToken()
        });

        var socket = socketFactory({
            ioSocket: ioSocket
        });

        return {
            socket: socket,

            /**
             * Register listeners to sync an array with updates on a model
             *
             * Takes the array we want to sync, the model name that socket updates are sent from,
             * and an optional callback function after new items are updated.
             *
             * @param {String} modelName
             * @param {Array} array
             * @param {Function} cb
             */
            syncUpdates: function (modelName, array, cb) {
                cb = cb || angular.noop;

                /**
                 * Syncs item creation/updates on 'model:save'
                 */
                socket.on(modelName + ':save', function (item) {
                    var oldItem = _.find(array, {_id: item._id});
                    var index = array.indexOf(oldItem);
                    var event = 'created';

                    // replace oldItem if it exists
                    // otherwise just add item to the collection
                    if (oldItem) {
                        array.splice(index, 1, item);
                        event = 'updated';
                    } else {
                        array.push(item);
                    }

                    cb(event, item, array);
                });

                /**
                 * Syncs removed items on 'model:remove'
                 */
                socket.on(modelName + ':remove', function (item) {
                    var event = 'deleted';
                    _.remove(array, {_id: item._id});
                    cb(event, item, array);
                });

        socket.on('disconnect', function () {
            console.log("Socket Connection Lost");
            $('.socket-disconnected').slideDown('slow');
        });

        socket.on('connect', function () {
            console.log("Socket Connected");
            $('.socket-disconnected').slideUp('slow');
        });
            },

            /**
             * Removes listeners for a models updates on the socket
             *
             * @param modelName
             */
            unsyncUpdates: function (modelName) {
                socket.removeAllListeners(modelName + ':save');
                socket.removeAllListeners(modelName + ':remove');
            }
        };
    }]);

// moment.js
// version : 2.1.0
// author : Tim Wood
// license : MIT
// momentjs.com
!function(t){function e(t,e){return function(n){return u(t.call(this,n),e)}}function n(t,e){return function(n){return this.lang().ordinal(t.call(this,n),e)}}function s(){}function i(t){a(this,t)}function r(t){var e=t.years||t.year||t.y||0,n=t.months||t.month||t.M||0,s=t.weeks||t.week||t.w||0,i=t.days||t.day||t.d||0,r=t.hours||t.hour||t.h||0,a=t.minutes||t.minute||t.m||0,o=t.seconds||t.second||t.s||0,u=t.milliseconds||t.millisecond||t.ms||0;this._input=t,this._milliseconds=u+1e3*o+6e4*a+36e5*r,this._days=i+7*s,this._months=n+12*e,this._data={},this._bubble()}function a(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t}function o(t){return 0>t?Math.ceil(t):Math.floor(t)}function u(t,e){for(var n=t+"";n.length<e;)n="0"+n;return n}function h(t,e,n,s){var i,r,a=e._milliseconds,o=e._days,u=e._months;a&&t._d.setTime(+t._d+a*n),(o||u)&&(i=t.minute(),r=t.hour()),o&&t.date(t.date()+o*n),u&&t.month(t.month()+u*n),a&&!s&&H.updateOffset(t),(o||u)&&(t.minute(i),t.hour(r))}function d(t){return"[object Array]"===Object.prototype.toString.call(t)}function c(t,e){var n,s=Math.min(t.length,e.length),i=Math.abs(t.length-e.length),r=0;for(n=0;s>n;n++)~~t[n]!==~~e[n]&&r++;return r+i}function f(t){return t?ie[t]||t.toLowerCase().replace(/(.)s$/,"$1"):t}function l(t,e){return e.abbr=t,x[t]||(x[t]=new s),x[t].set(e),x[t]}function _(t){if(!t)return H.fn._lang;if(!x[t]&&A)try{require("./lang/"+t)}catch(e){return H.fn._lang}return x[t]}function m(t){return t.match(/\[.*\]/)?t.replace(/^\[|\]$/g,""):t.replace(/\\/g,"")}function y(t){var e,n,s=t.match(E);for(e=0,n=s.length;n>e;e++)s[e]=ue[s[e]]?ue[s[e]]:m(s[e]);return function(i){var r="";for(e=0;n>e;e++)r+=s[e]instanceof Function?s[e].call(i,t):s[e];return r}}function M(t,e){function n(e){return t.lang().longDateFormat(e)||e}for(var s=5;s--&&N.test(e);)e=e.replace(N,n);return re[e]||(re[e]=y(e)),re[e](t)}function g(t,e){switch(t){case"DDDD":return V;case"YYYY":return X;case"YYYYY":return $;case"S":case"SS":case"SSS":case"DDD":return I;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return R;case"a":case"A":return _(e._l)._meridiemParse;case"X":return B;case"Z":case"ZZ":return j;case"T":return q;case"MM":case"DD":case"YY":case"HH":case"hh":case"mm":case"ss":case"M":case"D":case"d":case"H":case"h":case"m":case"s":return J;default:return new RegExp(t.replace("\\",""))}}function p(t){var e=(j.exec(t)||[])[0],n=(e+"").match(ee)||["-",0,0],s=+(60*n[1])+~~n[2];return"+"===n[0]?-s:s}function D(t,e,n){var s,i=n._a;switch(t){case"M":case"MM":i[1]=null==e?0:~~e-1;break;case"MMM":case"MMMM":s=_(n._l).monthsParse(e),null!=s?i[1]=s:n._isValid=!1;break;case"D":case"DD":case"DDD":case"DDDD":null!=e&&(i[2]=~~e);break;case"YY":i[0]=~~e+(~~e>68?1900:2e3);break;case"YYYY":case"YYYYY":i[0]=~~e;break;case"a":case"A":n._isPm=_(n._l).isPM(e);break;case"H":case"HH":case"h":case"hh":i[3]=~~e;break;case"m":case"mm":i[4]=~~e;break;case"s":case"ss":i[5]=~~e;break;case"S":case"SS":case"SSS":i[6]=~~(1e3*("0."+e));break;case"X":n._d=new Date(1e3*parseFloat(e));break;case"Z":case"ZZ":n._useUTC=!0,n._tzm=p(e)}null==e&&(n._isValid=!1)}function Y(t){var e,n,s=[];if(!t._d){for(e=0;7>e;e++)t._a[e]=s[e]=null==t._a[e]?2===e?1:0:t._a[e];s[3]+=~~((t._tzm||0)/60),s[4]+=~~((t._tzm||0)%60),n=new Date(0),t._useUTC?(n.setUTCFullYear(s[0],s[1],s[2]),n.setUTCHours(s[3],s[4],s[5],s[6])):(n.setFullYear(s[0],s[1],s[2]),n.setHours(s[3],s[4],s[5],s[6])),t._d=n}}function w(t){var e,n,s=t._f.match(E),i=t._i;for(t._a=[],e=0;e<s.length;e++)n=(g(s[e],t).exec(i)||[])[0],n&&(i=i.slice(i.indexOf(n)+n.length)),ue[s[e]]&&D(s[e],n,t);i&&(t._il=i),t._isPm&&t._a[3]<12&&(t._a[3]+=12),t._isPm===!1&&12===t._a[3]&&(t._a[3]=0),Y(t)}function k(t){var e,n,s,r,o,u=99;for(r=0;r<t._f.length;r++)e=a({},t),e._f=t._f[r],w(e),n=new i(e),o=c(e._a,n.toArray()),n._il&&(o+=n._il.length),u>o&&(u=o,s=n);a(t,s)}function v(t){var e,n=t._i,s=K.exec(n);if(s){for(t._f="YYYY-MM-DD"+(s[2]||" "),e=0;4>e;e++)if(te[e][1].exec(n)){t._f+=te[e][0];break}j.exec(n)&&(t._f+=" Z"),w(t)}else t._d=new Date(n)}function T(e){var n=e._i,s=G.exec(n);n===t?e._d=new Date:s?e._d=new Date(+s[1]):"string"==typeof n?v(e):d(n)?(e._a=n.slice(0),Y(e)):e._d=n instanceof Date?new Date(+n):new Date(n)}function b(t,e,n,s,i){return i.relativeTime(e||1,!!n,t,s)}function S(t,e,n){var s=W(Math.abs(t)/1e3),i=W(s/60),r=W(i/60),a=W(r/24),o=W(a/365),u=45>s&&["s",s]||1===i&&["m"]||45>i&&["mm",i]||1===r&&["h"]||22>r&&["hh",r]||1===a&&["d"]||25>=a&&["dd",a]||45>=a&&["M"]||345>a&&["MM",W(a/30)]||1===o&&["y"]||["yy",o];return u[2]=e,u[3]=t>0,u[4]=n,b.apply({},u)}function F(t,e,n){var s,i=n-e,r=n-t.day();return r>i&&(r-=7),i-7>r&&(r+=7),s=H(t).add("d",r),{week:Math.ceil(s.dayOfYear()/7),year:s.year()}}function O(t){var e=t._i,n=t._f;return null===e||""===e?null:("string"==typeof e&&(t._i=e=_().preparse(e)),H.isMoment(e)?(t=a({},e),t._d=new Date(+e._d)):n?d(n)?k(t):w(t):T(t),new i(t))}function z(t,e){H.fn[t]=H.fn[t+"s"]=function(t){var n=this._isUTC?"UTC":"";return null!=t?(this._d["set"+n+e](t),H.updateOffset(this),this):this._d["get"+n+e]()}}function C(t){H.duration.fn[t]=function(){return this._data[t]}}function L(t,e){H.duration.fn["as"+t]=function(){return+this/e}}for(var H,P,U="2.1.0",W=Math.round,x={},A="undefined"!=typeof module&&module.exports,G=/^\/?Date\((\-?\d+)/i,Z=/(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,E=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,J=/\d\d?/,I=/\d{1,3}/,V=/\d{3}/,X=/\d{1,4}/,$=/[+\-]?\d{1,6}/,R=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,j=/Z|[\+\-]\d\d:?\d\d/i,q=/T/i,B=/[\+\-]?\d+(\.\d{1,3})?/,K=/^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,Q="YYYY-MM-DDTHH:mm:ssZ",te=[["HH:mm:ss.S",/(T| )\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],ee=/([\+\-]|\d\d)/gi,ne="Date|Hours|Minutes|Seconds|Milliseconds".split("|"),se={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},ie={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",w:"week",M:"month",y:"year"},re={},ae="DDD w W M D d".split(" "),oe="M D H h m s w W".split(" "),ue={M:function(){return this.month()+1},MMM:function(t){return this.lang().monthsShort(this,t)},MMMM:function(t){return this.lang().months(this,t)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(t){return this.lang().weekdaysMin(this,t)},ddd:function(t){return this.lang().weekdaysShort(this,t)},dddd:function(t){return this.lang().weekdays(this,t)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return u(this.year()%100,2)},YYYY:function(){return u(this.year(),4)},YYYYY:function(){return u(this.year(),5)},gg:function(){return u(this.weekYear()%100,2)},gggg:function(){return this.weekYear()},ggggg:function(){return u(this.weekYear(),5)},GG:function(){return u(this.isoWeekYear()%100,2)},GGGG:function(){return this.isoWeekYear()},GGGGG:function(){return u(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return~~(this.milliseconds()/100)},SS:function(){return u(~~(this.milliseconds()/10),2)},SSS:function(){return u(this.milliseconds(),3)},Z:function(){var t=-this.zone(),e="+";return 0>t&&(t=-t,e="-"),e+u(~~(t/60),2)+":"+u(~~t%60,2)},ZZ:function(){var t=-this.zone(),e="+";return 0>t&&(t=-t,e="-"),e+u(~~(10*t/6),4)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()}};ae.length;)P=ae.pop(),ue[P+"o"]=n(ue[P],P);for(;oe.length;)P=oe.pop(),ue[P+P]=e(ue[P],2);for(ue.DDDD=e(ue.DDD,3),s.prototype={set:function(t){var e,n;for(n in t)e=t[n],"function"==typeof e?this[n]=e:this["_"+n]=e},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(t){return this._months[t.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(t){return this._monthsShort[t.month()]},monthsParse:function(t){var e,n,s;for(this._monthsParse||(this._monthsParse=[]),e=0;12>e;e++)if(this._monthsParse[e]||(n=H([2e3,e]),s="^"+this.months(n,"")+"|^"+this.monthsShort(n,""),this._monthsParse[e]=new RegExp(s.replace(".",""),"i")),this._monthsParse[e].test(t))return e},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(t){return this._weekdays[t.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(t){return this._weekdaysShort[t.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(t){return this._weekdaysMin[t.day()]},weekdaysParse:function(t){var e,n,s;for(this._weekdaysParse||(this._weekdaysParse=[]),e=0;7>e;e++)if(this._weekdaysParse[e]||(n=H([2e3,1]).day(e),s="^"+this.weekdays(n,"")+"|^"+this.weekdaysShort(n,"")+"|^"+this.weekdaysMin(n,""),this._weekdaysParse[e]=new RegExp(s.replace(".",""),"i")),this._weekdaysParse[e].test(t))return e},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(t){var e=this._longDateFormat[t];return!e&&this._longDateFormat[t.toUpperCase()]&&(e=this._longDateFormat[t.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(t){return t.slice(1)}),this._longDateFormat[t]=e),e},isPM:function(t){return"p"===(t+"").toLowerCase()[0]},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(t,e,n){return t>11?n?"pm":"PM":n?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(t,e){var n=this._calendar[t];return"function"==typeof n?n.apply(e):n},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(t,e,n,s){var i=this._relativeTime[n];return"function"==typeof i?i(t,e,n,s):i.replace(/%d/i,t)},pastFuture:function(t,e){var n=this._relativeTime[t>0?"future":"past"];return"function"==typeof n?n(e):n.replace(/%s/i,e)},ordinal:function(t){return this._ordinal.replace("%d",t)},_ordinal:"%d",preparse:function(t){return t},postformat:function(t){return t},week:function(t){return F(t,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6}},H=function(t,e,n){return O({_i:t,_f:e,_l:n,_isUTC:!1})},H.utc=function(t,e,n){return O({_useUTC:!0,_isUTC:!0,_l:n,_i:t,_f:e})},H.unix=function(t){return H(1e3*t)},H.duration=function(t,e){var n,s,i=H.isDuration(t),a="number"==typeof t,o=i?t._input:a?{}:t,u=Z.exec(t);return a?e?o[e]=t:o.milliseconds=t:u&&(n="-"===u[1]?-1:1,o={y:0,d:~~u[2]*n,h:~~u[3]*n,m:~~u[4]*n,s:~~u[5]*n,ms:~~u[6]*n}),s=new r(o),i&&t.hasOwnProperty("_lang")&&(s._lang=t._lang),s},H.version=U,H.defaultFormat=Q,H.updateOffset=function(){},H.lang=function(t,e){return t?(e?l(t,e):x[t]||_(t),H.duration.fn._lang=H.fn._lang=_(t),void 0):H.fn._lang._abbr},H.langData=function(t){return t&&t._lang&&t._lang._abbr&&(t=t._lang._abbr),_(t)},H.isMoment=function(t){return t instanceof i},H.isDuration=function(t){return t instanceof r},H.fn=i.prototype={clone:function(){return H(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){return M(H(this).utc(),"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var t=this;return[t.year(),t.month(),t.date(),t.hours(),t.minutes(),t.seconds(),t.milliseconds()]},isValid:function(){return null==this._isValid&&(this._isValid=this._a?!c(this._a,(this._isUTC?H.utc(this._a):H(this._a)).toArray()):!isNaN(this._d.getTime())),!!this._isValid},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(t){var e=M(this,t||H.defaultFormat);return this.lang().postformat(e)},add:function(t,e){var n;return n="string"==typeof t?H.duration(+e,t):H.duration(t,e),h(this,n,1),this},subtract:function(t,e){var n;return n="string"==typeof t?H.duration(+e,t):H.duration(t,e),h(this,n,-1),this},diff:function(t,e,n){var s,i,r=this._isUTC?H(t).zone(this._offset||0):H(t).local(),a=6e4*(this.zone()-r.zone());return e=f(e),"year"===e||"month"===e?(s=432e5*(this.daysInMonth()+r.daysInMonth()),i=12*(this.year()-r.year())+(this.month()-r.month()),i+=(this-H(this).startOf("month")-(r-H(r).startOf("month")))/s,i-=6e4*(this.zone()-H(this).startOf("month").zone()-(r.zone()-H(r).startOf("month").zone()))/s,"year"===e&&(i/=12)):(s=this-r,i="second"===e?s/1e3:"minute"===e?s/6e4:"hour"===e?s/36e5:"day"===e?(s-a)/864e5:"week"===e?(s-a)/6048e5:s),n?i:o(i)},from:function(t,e){return H.duration(this.diff(t)).lang(this.lang()._abbr).humanize(!e)},fromNow:function(t){return this.from(H(),t)},calendar:function(){var t=this.diff(H().startOf("day"),"days",!0),e=-6>t?"sameElse":-1>t?"lastWeek":0>t?"lastDay":1>t?"sameDay":2>t?"nextDay":7>t?"nextWeek":"sameElse";return this.format(this.lang().calendar(e,this))},isLeapYear:function(){var t=this.year();return 0===t%4&&0!==t%100||0===t%400},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(t){var e=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=t?"string"==typeof t&&(t=this.lang().weekdaysParse(t),"number"!=typeof t)?this:this.add({d:t-e}):e},month:function(t){var e,n=this._isUTC?"UTC":"";return null!=t?"string"==typeof t&&(t=this.lang().monthsParse(t),"number"!=typeof t)?this:(e=this.date(),this.date(1),this._d["set"+n+"Month"](t),this.date(Math.min(e,this.daysInMonth())),H.updateOffset(this),this):this._d["get"+n+"Month"]()},startOf:function(t){switch(t=f(t)){case"year":this.month(0);case"month":this.date(1);case"week":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===t&&this.weekday(0),this},endOf:function(t){return this.startOf(t).add(t,1).subtract("ms",1)},isAfter:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)>+H(t).startOf(e)},isBefore:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)<+H(t).startOf(e)},isSame:function(t,e){return e="undefined"!=typeof e?e:"millisecond",+this.clone().startOf(e)===+H(t).startOf(e)},min:function(t){return t=H.apply(null,arguments),this>t?this:t},max:function(t){return t=H.apply(null,arguments),t>this?this:t},zone:function(t){var e=this._offset||0;return null==t?this._isUTC?e:this._d.getTimezoneOffset():("string"==typeof t&&(t=p(t)),Math.abs(t)<16&&(t=60*t),this._offset=t,this._isUTC=!0,e!==t&&h(this,H.duration(e-t,"m"),1,!0),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},daysInMonth:function(){return H.utc([this.year(),this.month()+1,0]).date()},dayOfYear:function(t){var e=W((H(this).startOf("day")-H(this).startOf("year"))/864e5)+1;return null==t?e:this.add("d",t-e)},weekYear:function(t){var e=F(this,this.lang()._week.dow,this.lang()._week.doy).year;return null==t?e:this.add("y",t-e)},isoWeekYear:function(t){var e=F(this,1,4).year;return null==t?e:this.add("y",t-e)},week:function(t){var e=this.lang().week(this);return null==t?e:this.add("d",7*(t-e))},isoWeek:function(t){var e=F(this,1,4).week;return null==t?e:this.add("d",7*(t-e))},weekday:function(t){var e=(this._d.getDay()+7-this.lang()._week.dow)%7;return null==t?e:this.add("d",t-e)},isoWeekday:function(t){return null==t?this.day()||7:this.day(this.day()%7?t:t-7)},lang:function(e){return e===t?this._lang:(this._lang=_(e),this)}},P=0;P<ne.length;P++)z(ne[P].toLowerCase().replace(/s$/,""),ne[P]);z("year","FullYear"),H.fn.days=H.fn.day,H.fn.months=H.fn.month,H.fn.weeks=H.fn.week,H.fn.isoWeeks=H.fn.isoWeek,H.fn.toJSON=H.fn.toISOString,H.duration.fn=r.prototype={_bubble:function(){var t,e,n,s,i=this._milliseconds,r=this._days,a=this._months,u=this._data;u.milliseconds=i%1e3,t=o(i/1e3),u.seconds=t%60,e=o(t/60),u.minutes=e%60,n=o(e/60),u.hours=n%24,r+=o(n/24),u.days=r%30,a+=o(r/30),u.months=a%12,s=o(a/12),u.years=s},weeks:function(){return o(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+2592e6*(this._months%12)+31536e6*~~(this._months/12)},humanize:function(t){var e=+this,n=S(e,!t,this.lang());return t&&(n=this.lang().pastFuture(e,n)),this.lang().postformat(n)},add:function(t,e){var n=H.duration(t,e);return this._milliseconds+=n._milliseconds,this._days+=n._days,this._months+=n._months,this._bubble(),this},subtract:function(t,e){var n=H.duration(t,e);return this._milliseconds-=n._milliseconds,this._days-=n._days,this._months-=n._months,this._bubble(),this},get:function(t){return t=f(t),this[t.toLowerCase()+"s"]()},as:function(t){return t=f(t),this["as"+t.charAt(0).toUpperCase()+t.slice(1)+"s"]()},lang:H.fn.lang};for(P in se)se.hasOwnProperty(P)&&(L(P,se[P]),C(P.toLowerCase()));L("Weeks",6048e5),H.duration.fn.asMonths=function(){return(+this-31536e6*this.years())/2592e6+12*this.years()},H.lang("en",{ordinal:function(t){var e=t%10,n=1===~~(t%100/10)?"th":1===e?"st":2===e?"nd":3===e?"rd":"th";return t+n}}),A&&(module.exports=H),"undefined"==typeof ender&&(this.moment=H),"function"==typeof define&&define.amd&&define("moment",[],function(){return H})}.call(this);

/**
* @version: 1.2
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2013-07-25
* @copyright: Copyright (c) 2012-2013 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
*/
!function ($) {

    var DateRangePicker = function (element, options, cb) {
        var hasOptions = typeof options == 'object';
        var localeObject;

        //option defaults

        this.startDate = moment().startOf('day');
        this.endDate = moment().startOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.dateLimit = false;

        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.timePicker = false;
        this.timePickerIncrement = 30;
        this.timePicker12Hour = true;
        this.ranges = {};
        this.opens = 'right';

        this.buttonClasses = ['btn', 'btn-small'];
        this.applyClass = 'btn-success';
        this.cancelClass = 'btn-default';

        this.format = 'MM/DD/YYYY';
        this.separator = ' - ';

        this.locale = {
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            fromLabel: 'From',
            toLabel: 'To',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment()._lang._weekdaysMin.slice(),
            monthNames: moment()._lang._monthsShort.slice(),
            firstDay: 0
        };

        this.cb = function () { };

        // by default, the daterangepicker element is placed at the bottom of HTML body
        this.parentEl = 'body';

        //element that triggered the date range picker
        this.element = $(element);

        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        if (this.element.is('input')) {
            this.element.on({
                click: $.proxy(this.show, this),
                focus: $.proxy(this.show, this)
            });
        } else {
            this.element.on('click', $.proxy(this.show, this));
        }

        localeObject = this.locale;

        if (hasOptions) {
            if (typeof options.locale == 'object') {
                $.each(localeObject, function (property, value) {
                    localeObject[property] = options.locale[property] || value;
                });
            }

            if (options.applyClass) {
                this.applyClass = options.applyClass;
            }

            if (options.cancelClass) {
                this.cancelClass = options.cancelClass;
            }
        }

        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left"></div>' +
                '<div class="calendar right"></div>' +
                '<div class="ranges">' +
                  '<div class="range_inputs">' +
                    '<div class="daterangepicker_start_input" style="float: left">' +
                      '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
                    '</div>' +
                    '<div class="daterangepicker_end_input" style="float: left; padding-left: 11px">' +
                      '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
                    '</div>' +
                    '<button class="' + this.applyClass + ' applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>&nbsp;' +
                    '<button class="' + this.cancelClass + ' cancelBtn">' + this.locale.cancelLabel + '</button>' +
                  '</div>' +
                '</div>' +
              '</div>';

        this.parentEl = (hasOptions && options.parentEl && $(options.parentEl)) || $(this.parentEl);
        //the date range picker
        this.container = $(DRPTemplate).appendTo(this.parentEl);

        if (hasOptions) {

            if (typeof options.format == 'string')
                this.format = options.format;

            if (typeof options.separator == 'string')
                this.separator = options.separator;

            if (typeof options.startDate == 'string')
                this.startDate = moment(options.startDate, this.format);

            if (typeof options.endDate == 'string')
                this.endDate = moment(options.endDate, this.format);

            if (typeof options.minDate == 'string')
                this.minDate = moment(options.minDate, this.format);

            if (typeof options.maxDate == 'string')
                this.maxDate = moment(options.maxDate, this.format);

            if (typeof options.startDate == 'object')
                this.startDate = moment(options.startDate);

            if (typeof options.endDate == 'object')
                this.endDate = moment(options.endDate);

            if (typeof options.minDate == 'object')
                this.minDate = moment(options.minDate);

            if (typeof options.maxDate == 'object')
                this.maxDate = moment(options.maxDate);

            if (typeof options.ranges == 'object') {
                for (var range in options.ranges) {

                    var start = moment(options.ranges[range][0]);
                    var end = moment(options.ranges[range][1]);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (var range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges').prepend(list);
            }

            if (typeof options.dateLimit == 'object')
                this.dateLimit = options.dateLimit;

            // update day names order to firstDay
            if (typeof options.locale == 'object') {

                if (typeof options.locale.daysOfWeek == 'object') {

                    // Create a copy of daysOfWeek to avoid modification of original
                    // options object for reusability in multiple daterangepicker instances
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }

                if (typeof options.locale.firstDay == 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }
            }

            if (typeof options.opens == 'string')
                this.opens = options.opens;

            if (typeof options.showWeekNumbers == 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses == 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses == 'object') {
                this.buttonClasses = options.buttonClasses;
            }

            if (typeof options.showDropdowns == 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.timePicker == 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerIncrement == 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker12Hour == 'boolean') {
                this.timePicker12Hour = options.timePicker12Hour;
            }

        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.startOf('day');
        }

        //apply CSS classes to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });

        if (this.opens == 'right') {
            //swap calendar positions
            var left = this.container.find('.calendar.left');
            var right = this.container.find('.calendar.right');
            left.removeClass('left').addClass('right');
            right.removeClass('right').addClass('left');
        }

        if (typeof options == 'undefined' || typeof options.ranges == 'undefined') {
            this.container.find('.calendar').show();
            this.move();
        }

        if (typeof cb == 'function')
            this.cb = cb;

        this.container.addClass('opens' + this.opens);

        //try parse date if in text input
        if (!hasOptions || (typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined')) {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val();
                var split = val.split(this.separator);
                var start, end;
                if (split.length == 2) {
                    start = moment(split[0], this.format);
                    end = moment(split[1], this.format);
                }
                if (start != null && end != null) {
                    this.startDate = start;
                    this.endDate = end;
                }
            }
        }

        //state
        this.oldStartDate = this.startDate.clone();
        this.oldEndDate = this.endDate.clone();

        this.leftCalendar = {
            month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
            calendar: []
        };

        this.rightCalendar = {
            month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
            calendar: []
        };

        //event listeners
        this.container.on('mousedown', $.proxy(this.mousedown, this));

        this.container.find('.calendar')
            .on('click', '.prev', $.proxy(this.clickPrev, this))
            .on('click', '.next', $.proxy(this.clickNext, this))
            .on('click', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter', 'td.available', $.proxy(this.enterDate, this))
            .on('mouseleave', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change', 'select.yearselect', $.proxy(this.updateMonthYear, this))
            .on('change', 'select.monthselect', $.proxy(this.updateMonthYear, this))
            .on('change', 'select.hourselect,select.minuteselect,select.ampmselect', $.proxy(this.updateTime, this));

        this.container.find('.ranges')
            .on('click', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.showCalendars, this))
            .on('click', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter', 'li', $.proxy(this.enterRange, this))
            .on('mouseleave', 'li', $.proxy(this.updateFormInputs, this));

        this.element.on('keyup', $.proxy(this.updateFromControl, this));

        this.updateView();
        this.updateCalendars();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        mousedown: function (e) {
            e.stopPropagation();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateFormInputs();
        },

        updateFormInputs: function () {
            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator);
            var start = moment(dateString[0], this.format);
            var end = moment(dateString[1], this.format);

            if (start == null || end == null) return;
            if (end.isBefore(start)) return;

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.startDate = start;
            this.endDate = end;

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.updateCalendars();
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate);
        },

        move: function () {
            var parentOffset = {
                top: this.parentEl.offset().top - (this.parentEl.is('body') ? 0 : this.parentEl.scrollTop()),
                left: this.parentEl.offset().left - (this.parentEl.is('body') ? 0 : this.parentEl.scrollLeft())
            };
            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function (e) {
            this.container.show();
            this.move();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            $(document).on('mousedown', $.proxy(this.hide, this));
            this.element.trigger('shown', {target: e.target, picker: this});
        },

        hide: function (e) {
            this.container.hide();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            $(document).off('mousedown', this.hide);
            this.element.trigger('hidden', { picker: this });
        },

        enterRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        showCalendars: function() {
            this.container.find('.calendar').show();
            this.move();
        },

        updateInputText: function() {
            if (this.element.is('input'))
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.startOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();

                this.updateInputText();

                this.container.find('.calendar').hide();
                this.hide();
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('month', 1);
            } else {
                this.rightCalendar.month.subtract('month', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('month', 1);
            } else {
                this.rightCalendar.month.add('month', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                var startDate = this.leftCalendar.calendar[row][col];
                var endDate = this.endDate;
                if (typeof this.dateLimit == 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                var startDate = this.startDate;
                var endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit == 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            cal.find('td').removeClass('active');

            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = moment(startDate).add('day', 1).startOf('day');
            }

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateCalendars();
        },

        clickApply: function (e) {
            this.updateInputText();
            this.hide();
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.updateView();
            this.updateCalendars();
            this.hide();
        },

        updateMonthYear: function (e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.find('.calendar.left');
            if (!isLeft)
                cal = this.container.find('.calendar.right');

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
            } else {
                this.rightCalendar.month.month(month).year(year);
            }

            this.updateCalendars();

        },

        updateTime: function(e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.find('.calendar.left');
            if (!isLeft)
                cal = this.container.find('.calendar.right');

            var hour = parseInt(cal.find('.hourselect').val());
            var minute = parseInt(cal.find('.minuteselect').val());

            if (this.timePicker12Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm == 'PM' && hour < 12)
                    hour += 12;
                if (ampm == 'AM' && hour == 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute);
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute);
            }

            this.updateCalendars();

        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
            this.container.find('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.container.find('.ranges li:eq(' + i + ')').addClass('active');
                    }
                }
                i++;
            }
            if (customRange)
                this.container.find('.ranges li:last').addClass('active');
        },

        buildCalendar: function (month, year, hour, minute, side) {

            var firstDay = moment([year, month, 1]);
            var lastMonth = moment(firstDay).subtract('month', 1).month();
            var lastYear = moment(firstDay).subtract('month', 1).year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute]);
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('hour', 24)) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);
            }

            return calendar;

        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var yearHtml = '<select class="yearselect">';

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate) {

            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="icon-arrow-left glyphicon glyphicon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" style="width: auto">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
                html += '<th class="next available"><i class="icon-arrow-right glyphicon glyphicon-arrow-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate)) || (maxDate && calendar[row][col].isAfter(maxDate))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            if (this.timePicker) {

                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';
                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12)
                        selected_hour -= 12;
                    if (selected_hour == 0)
                        selected_hour = 12;
                }

                for (var i = start; i <= end; i++) {
                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + i + '</option>';
                    }
                }

                html += '</select> : ';

                html += '<select class="minuteselect">';

                for (var i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10)
                        num = '0' + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + num + '</option>';
                    }
                }

                html += '</select> ';

                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';
                    if (selected.hour() >= 12) {
                        html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
                    }
                    html += '</select>';
                }

                html += '</div>';

            }

            return html;

        }

    };

    $.fn.daterangepicker = function (options, cb) {
        this.each(function () {
            var el = $(this);
            if (!el.data('daterangepicker'))
                el.data('daterangepicker', new DateRangePicker(el, options, cb));
        });
        return this;
    };

}(window.jQuery);

/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function($, undefined){

	var $window = $(window);

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function alias(method){
		return function(){
			return this[method].apply(this, arguments);
		};
	}

	var DateArray = (function(){
		var extras = {
			get: function(i){
				return this.slice(i)[0];
			},
			contains: function(d){
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i=0, l=this.length; i < l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i){
				this.splice(i,1);
			},
			replace: function(new_array){
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function(){
				this.splice(0);
			},
			copy: function(){
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function(){
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();


	// Picker object

	var Datepicker = function(element, options){
		this.dates = new DateArray();
		this.viewDate = UTCToday();
		this.focusDate = null;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if (this.isInline){
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		}
		else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('datepicker-rtl');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.today')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if (this.isInline){
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]){
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch (o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode){
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true){
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
				else
					o.multidate = 1;
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity){
				if (!!o.startDate){
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				}
				else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity){
				if (!!o.endDate){
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				}
				else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d){
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch (plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ch, ev; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function(){
			if (this.isInput){ // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput){ // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else if (this.element.is('div')){  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e){
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)){
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format){
					if (arguments.length === 0){
						ix = this.dates.length - 1;
						format = this.o.format;
					}
					else if (typeof ix === 'string'){
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(){
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.place();
			this._attachSecondaryEvents();
			this._trigger('show');
		},

		hide: function(){
			if (this.isInline)
				return;
			if (!this.picker.is(':visible'))
				return;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
		},

		remove: function(){
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput){
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc){
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function(){
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function(){
			return $.map(this.dates, function(d){
				return new Date(d);
			});
		},

		getDate: function(){
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function(){
			return new Date(this.dates.get(-1));
		},

		setDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
		},

		setUTCDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, $.map(args, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function(){
			var formatted = this.getFormattedDate();
			if (!this.isInput){
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			}
			else {
				this.element.val(formatted).change();
			}
		},

		getFormattedDate: function(format){
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			return $.map(this.dates, function(d){
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
			if (this.isInline)
				return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var zIndex = parseInt(this.element.parents().filter(function(){
					return $(this).css('z-index') !== 'auto';
				}).first().css('z-index'))+10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom '+
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto'){
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto'){
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update)
				return;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length){
				$.each(arguments, $.proxy(function(i, date){
					if (date instanceof Date)
						date = this._local_to_utc(date);
					dates.push(date);
				}, this));
				fromArgs = true;
			}
			else {
				dates = this.isInput
						? this.element.val()
						: this.element.data('date') || this.element.find('input').val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date){
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date){
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs){
				// setting date by clicking
				this.setValue();
			}
			else if (dates.length){
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
				html = '<tr>';
			if (this.o.calendarWeeks){
				var cell = '<th class="cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7){
				html += '<th class="dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12){
				html += '<span class="month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)){
				cls.push('old');
			}
			else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)){
				cls.push('new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() === today.getFullYear() &&
				date.getUTCMonth() === today.getMonth() &&
				date.getUTCDate() === today.getDate()){
				cls.push('today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1){
				cls.push('disabled');
			}
			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) !== -1){
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function(){
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				tooltip;
			this.picker.find('.datepicker-days thead th.datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot th.today')
						.text(todaytxt)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.clear')
						.text(cleartxt)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth){
				if (prevMonth.getUTCDay() === this.o.weekStart){
					html.push('<tr>');
					if (this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() === this.o.weekEnd){
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');

			$.each(this.dates, function(i, d){
				if (d.getUTCFullYear() === year)
					months.eq(d.getUTCMonth()).addClass('active');
			});

			if (year < startYear || year > endYear){
				months.addClass('disabled');
			}
			if (year === startYear){
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year === endYear){
				months.slice(endMonth+1).addClass('disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d){
					return d.getUTCFullYear();
				}),
				classes;
			for (var i = -1; i < 11; i++){
				classes = ['year'];
				if (i === -1)
					classes.push('old');
				else if (i === 10)
					classes.push('new');
				if ($.inArray(year, years) !== -1)
					classes.push('active');
				if (year < startYear || year > endYear)
					classes.push('disabled');
				html += '<span class="' + classes.join(' ') + '">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function(){
			if (!this._allow_update)
				return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode){
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e){
			e.preventDefault();
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length === 1){
				switch (target[0].nodeName.toLowerCase()){
					case 'th':
						switch (target[0].className){
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
								switch (this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn === 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this.update();
								this._trigger('changeDate');
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')){
							this.viewDate.setUTCDate(1);
							if (target.is('.month')){
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1){
									this._setDate(UTCDate(year, month, day));
								}
							}
							else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2){
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							day = parseInt(target.text(), 10)||1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.is('.old')){
								if (month === 0){
									month = 11;
									year -= 1;
								}
								else {
									month -= 1;
								}
							}
							else if (target.is('.new')){
								if (month === 11){
									month = 0;
									year += 1;
								}
								else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from){
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function(date){
			var ix = this.dates.contains(date);
			if (!date){
				this.dates.clear();
			}
			else if (ix !== -1){
				this.dates.remove(ix);
			}
			else {
				this.dates.push(date);
			}
			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which){
			if (!which || which === 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which  === 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput){
				element = this.element;
			}
			else if (this.component){
				element = this.element.find('input');
			}
			if (element){
				element.change();
			}
			if (this.o.autoclose && (!which || which === 'date')){
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!date)
				return undefined;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1){
				test = dir === -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){
						return new_date.getUTCMonth() === month;
					}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){
						return new_date.getUTCMonth() !== new_month;
					};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			}
			else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode === 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode){
				case 27: // escape
					if (this.focusDate){
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					this._toggle_multidate(focusDate);
					dateChanged = true;
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')){
						e.preventDefault();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged){
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				var element;
				if (this.isInput){
					element = this.element;
				}
				else if (this.component){
					element = this.element.find('input');
				}
				if (element){
					element.change();
				}
			}
		},

		showMode: function(dir){
			if (dir){
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker
				.find('>div')
				.hide()
				.filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName)
					.css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){
			return i.jquery ? i[0] : i;
		});
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){
			return $(i).data('datepicker');
		});
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){
				return i.getUTCDate();
			});
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){
				return d.valueOf();
			});
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i === -1)
				return;

			$.each(this.pickers, function(i, p){
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			if (new_date < this.dates[i]){
				// Date being moved earlier/left
				while (i >= 0 && new_date < this.dates[i]){
					this.pickers[i--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[i]){
				// Date being moved later/right
				while (i < l && new_date > this.dates[i]){
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());
		function re_lower(_,a){
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]){
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function(option){
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function(){
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data){
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else {
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option === 'string' && typeof data[option] === 'function'){
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function(year){
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month){
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language){
			if (!date)
				return undefined;
			if (date instanceof Date)
				return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var part_re = /([\-+]\d+)([dmwy])/,
				parts = date.match(/([\-+]\d+)([dmwy])/g),
				part, dir, i;
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
				date = new Date();
				for (i=0; i < parts.length; i++){
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			parts = date && date.match(this.nonpunctuation) || [];
			date = new Date();
			var parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){
						return d.setUTCFullYear(v);
					},
					yy: function(d,v){
						return d.setUTCFullYear(2000+v);
					},
					m: function(d,v){
						if (isNaN(d))
							return d;
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() !== v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){
						return d.setUTCDate(v);
					}
				},
				val, filtered;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length !== fparts.length){
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			function match_part(){
				var m = this.slice(0, parts[i].length),
					p = parts[i].slice(0, m.length);
				return m === p;
			}
			if (parts.length === fparts.length){
				var cnt;
				for (i=0, cnt = fparts.length; i < cnt; i++){
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)){
						switch (part){
							case 'MM':
								filtered = $(dates[language].months).filter(match_part);
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(match_part);
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				var _date, s;
				for (i=0; i < setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++){
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&laquo;</th>'+
								'<th colspan="5" class="datepicker-switch"></th>'+
								'<th class="next">&raquo;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>'+
							'<tr>'+
								'<th colspan="7" class="today"></th>'+
							'</tr>'+
							'<tr>'+
								'<th colspan="7" class="clear"></th>'+
							'</tr>'+
						'</tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">'+
							'<div class="datepicker-days">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function(){
		$('[data-provide="datepicker-inline"]').datepicker();
	});

}(window.jQuery));

/*! bootstrap3-wysihtml5-bower 2013-11-22 */
var wysihtml5={version:"0.3.0",commands:{},dom:{},quirks:{},toolbar:{},lang:{},selection:{},views:{},INVISIBLE_SPACE:"﻿",EMPTY_FUNCTION:function(){},ELEMENT_NODE:1,TEXT_NODE:3,BACKSPACE_KEY:8,ENTER_KEY:13,ESCAPE_KEY:27,SPACE_KEY:32,DELETE_KEY:46};window.rangy=function(){function a(a,b){var c=typeof a[b];return c==j||!(c!=i||!a[b])||"unknown"==c}function b(a,b){return!(typeof a[b]!=i||!a[b])}function c(a,b){return typeof a[b]!=k}function d(a){return function(b,c){for(var d=c.length;d--;)if(!a(b,c[d]))return!1;return!0}}function e(a){return a&&p(a,o)&&r(a,n)}function f(a){window.alert("Rangy not supported in your browser. Reason: "+a),s.initialized=!0,s.supported=!1}function g(){if(!s.initialized){var c,d=!1,g=!1;for(a(document,"createRange")&&(c=document.createRange(),p(c,m)&&r(c,l)&&(d=!0),c.detach()),(c=b(document,"body")?document.body:document.getElementsByTagName("body")[0])&&a(c,"createTextRange")&&(c=c.createTextRange(),e(c)&&(g=!0)),!d&&!g&&f("Neither Range nor TextRange are implemented"),s.initialized=!0,s.features={implementsDomRange:d,implementsTextRange:g},d=u.concat(t),g=0,c=d.length;c>g;++g)try{d[g](s)}catch(h){b(window,"console")&&a(window.console,"log")&&window.console.log("Init listener threw an exception. Continuing.",h)}}}function h(a){this.name=a,this.supported=this.initialized=!1}var i="object",j="function",k="undefined",l="startContainer startOffset endContainer endOffset collapsed commonAncestorContainer START_TO_START START_TO_END END_TO_START END_TO_END".split(" "),m="setStart setStartBefore setStartAfter setEnd setEndBefore setEndAfter collapse selectNode selectNodeContents compareBoundaryPoints deleteContents extractContents cloneContents insertNode surroundContents cloneRange toString detach".split(" "),n="boundingHeight boundingLeft boundingTop boundingWidth htmlText text".split(" "),o="collapse compareEndPoints duplicate getBookmark moveToBookmark moveToElementText parentElement pasteHTML select setEndPoint getBoundingClientRect".split(" "),p=d(a),q=d(b),r=d(c),s={version:"1.2.2",initialized:!1,supported:!0,util:{isHostMethod:a,isHostObject:b,isHostProperty:c,areHostMethods:p,areHostObjects:q,areHostProperties:r,isTextRange:e},features:{},modules:{},config:{alertOnWarn:!1,preferTextRange:!1}};s.fail=f,s.warn=function(a){a="Rangy warning: "+a,s.config.alertOnWarn?window.alert(a):typeof window.console!=k&&typeof window.console.log!=k&&window.console.log(a)},{}.hasOwnProperty?s.util.extend=function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}:f("hasOwnProperty not supported");var t=[],u=[];s.init=g,s.addInitListener=function(a){s.initialized?a(s):t.push(a)};var v=[];s.addCreateMissingNativeApiListener=function(a){v.push(a)},s.createMissingNativeApi=function(a){a=a||window,g();for(var b=0,c=v.length;c>b;++b)v[b](a)},h.prototype.fail=function(a){throw this.initialized=!0,this.supported=!1,Error("Module '"+this.name+"' failed to load: "+a)},h.prototype.warn=function(a){s.warn("Module "+this.name+": "+a)},h.prototype.createError=function(a){return Error("Error in Rangy "+this.name+" module: "+a)},s.createModule=function(a,b){var c=new h(a);s.modules[a]=c,u.push(function(a){b(a,c),c.initialized=!0,c.supported=!0})},s.requireModules=function(a){for(var b,c,d=0,e=a.length;e>d;++d){if(c=a[d],b=s.modules[c],!(b&&b instanceof h))throw Error("Module '"+c+"' not found");if(!b.supported)throw Error("Module '"+c+"' not supported")}};var w=!1,q=function(){w||(w=!0,s.initialized||g())};if(typeof window==k)f("No window found");else{if(typeof document!=k)return a(document,"addEventListener")&&document.addEventListener("DOMContentLoaded",q,!1),a(window,"addEventListener")?window.addEventListener("load",q,!1):a(window,"attachEvent")?window.attachEvent("onload",q):f("Window does not have required addEventListener or attachEvent method"),s;f("No document found")}}(),rangy.createModule("DomUtil",function(a,b){function c(a){for(var b=0;a=a.previousSibling;)b++;return b}function d(a,b){var c,d=[];for(c=a;c;c=c.parentNode)d.push(c);for(c=b;c;c=c.parentNode)if(p(d,c))return c;return null}function e(a,b,c){for(c=c?a:a.parentNode;c;){if(a=c.parentNode,a===b)return c;c=a}return null}function f(a){return a=a.nodeType,3==a||4==a||8==a}function g(a,b){var c=b.nextSibling,d=b.parentNode;return c?d.insertBefore(a,c):d.appendChild(a),a}function h(a){if(9==a.nodeType)return a;if(typeof a.ownerDocument!=m)return a.ownerDocument;if(typeof a.document!=m)return a.document;if(a.parentNode)return h(a.parentNode);throw Error("getDocument: no document found for node")}function i(a){return a?f(a)?'"'+a.data+'"':1==a.nodeType?"<"+a.nodeName+(a.id?' id="'+a.id+'"':"")+">["+a.childNodes.length+"]":a.nodeName:"[No node]"}function j(a){this._next=this.root=a}function k(a,b){this.node=a,this.offset=b}function l(a){this.code=this[a],this.codeName=a,this.message="DOMException: "+this.codeName}var m="undefined",n=a.util;n.areHostMethods(document,["createDocumentFragment","createElement","createTextNode"])||b.fail("document missing a Node creation method"),n.isHostMethod(document,"getElementsByTagName")||b.fail("document missing getElementsByTagName method");var o=document.createElement("div");n.areHostMethods(o,["insertBefore","appendChild","cloneNode"])||b.fail("Incomplete Element implementation"),n.isHostProperty(o,"innerHTML")||b.fail("Element is missing innerHTML property"),o=document.createTextNode("test"),n.areHostMethods(o,["splitText","deleteData","insertData","appendData","cloneNode"])||b.fail("Incomplete Text Node implementation");var p=function(a,b){for(var c=a.length;c--;)if(a[c]===b)return!0;return!1};j.prototype={_current:null,hasNext:function(){return!!this._next},next:function(){var a,b=this._current=this._next;if(this._current){if(a=b.firstChild,!a)for(a=null;b!==this.root&&!(a=b.nextSibling);)b=b.parentNode;this._next=a}return this._current},detach:function(){this._current=this._next=this.root=null}},k.prototype={equals:function(a){return this.node===a.node&this.offset==a.offset},inspect:function(){return"[DomPosition("+i(this.node)+":"+this.offset+")]"}},l.prototype={INDEX_SIZE_ERR:1,HIERARCHY_REQUEST_ERR:3,WRONG_DOCUMENT_ERR:4,NO_MODIFICATION_ALLOWED_ERR:7,NOT_FOUND_ERR:8,NOT_SUPPORTED_ERR:9,INVALID_STATE_ERR:11},l.prototype.toString=function(){return this.message},a.dom={arrayContains:p,isHtmlNamespace:function(a){var b;return typeof a.namespaceURI==m||null===(b=a.namespaceURI)||"http://www.w3.org/1999/xhtml"==b},parentElement:function(a){return a=a.parentNode,1==a.nodeType?a:null},getNodeIndex:c,getNodeLength:function(a){var b;return f(a)?a.length:(b=a.childNodes)?b.length:0},getCommonAncestor:d,isAncestorOf:function(a,b,c){for(b=c?b:b.parentNode;b;){if(b===a)return!0;b=b.parentNode}return!1},getClosestAncestorIn:e,isCharacterDataNode:f,insertAfter:g,splitDataNode:function(a,b){var c=a.cloneNode(!1);return c.deleteData(0,b),a.deleteData(b,a.length-b),g(c,a),c},getDocument:h,getWindow:function(a){if(a=h(a),typeof a.defaultView!=m)return a.defaultView;if(typeof a.parentWindow!=m)return a.parentWindow;throw Error("Cannot get a window object for node")},getIframeWindow:function(a){if(typeof a.contentWindow!=m)return a.contentWindow;if(typeof a.contentDocument!=m)return a.contentDocument.defaultView;throw Error("getIframeWindow: No Window object found for iframe element")},getIframeDocument:function(a){if(typeof a.contentDocument!=m)return a.contentDocument;if(typeof a.contentWindow!=m)return a.contentWindow.document;throw Error("getIframeWindow: No Document object found for iframe element")},getBody:function(a){return n.isHostObject(a,"body")?a.body:a.getElementsByTagName("body")[0]},getRootContainer:function(a){for(var b;b=a.parentNode;)a=b;return a},comparePoints:function(a,b,f,g){var h;if(a==f)return b===g?0:g>b?-1:1;if(h=e(f,a,!0))return b<=c(h)?-1:1;if(h=e(a,f,!0))return c(h)<g?-1:1;if(b=d(a,f),a=a===b?b:e(a,b,!0),f=f===b?b:e(f,b,!0),a===f)throw Error("comparePoints got to case 4 and childA and childB are the same!");for(b=b.firstChild;b;){if(b===a)return-1;if(b===f)return 1;b=b.nextSibling}throw Error("Should not be here!")},inspectNode:i,fragmentFromNodeChildren:function(a){for(var b,c=h(a).createDocumentFragment();b=a.firstChild;)c.appendChild(b);return c},createIterator:function(a){return new j(a)},DomPosition:k},a.DOMException=l}),rangy.createModule("DomRange",function(a){function b(a,b){return 3!=a.nodeType&&(H.isAncestorOf(a,b.startContainer,!0)||H.isAncestorOf(a,b.endContainer,!0))}function c(a){return H.getDocument(a.startContainer)}function d(a,b,c){if(b=a._listeners[b])for(var d=0,e=b.length;e>d;++d)b[d].call(a,{target:a,args:c})}function e(a){return new I(a.parentNode,H.getNodeIndex(a))}function f(a){return new I(a.parentNode,H.getNodeIndex(a)+1)}function g(a,b,c){var d=11==a.nodeType?a.firstChild:a;return H.isCharacterDataNode(b)?c==b.length?H.insertAfter(a,b):b.parentNode.insertBefore(a,0==c?b:H.splitDataNode(b,c)):c>=b.childNodes.length?b.appendChild(a):b.insertBefore(a,b.childNodes[c]),d}function h(a){for(var b,d,e=c(a.range).createDocumentFragment();d=a.next();){if(b=a.isPartiallySelectedSubtree(),d=d.cloneNode(!b),b&&(b=a.getSubtreeIterator(),d.appendChild(h(b)),b.detach(!0)),10==d.nodeType)throw new J("HIERARCHY_REQUEST_ERR");e.appendChild(d)}return e}function i(a,b,c){for(var d,e,c=c||{stop:!1};d=a.next();)if(a.isPartiallySelectedSubtree()){if(!1===b(d)){c.stop=!0;break}if(d=a.getSubtreeIterator(),i(d,b,c),d.detach(!0),c.stop)break}else for(d=H.createIterator(d);e=d.next();)if(!1===b(e))return c.stop=!0,void 0}function j(a){for(var b;a.next();)a.isPartiallySelectedSubtree()?(b=a.getSubtreeIterator(),j(b),b.detach(!0)):a.remove()}function k(a){for(var b,d,e=c(a.range).createDocumentFragment();b=a.next();){if(a.isPartiallySelectedSubtree()?(b=b.cloneNode(!1),d=a.getSubtreeIterator(),b.appendChild(k(d)),d.detach(!0)):a.remove(),10==b.nodeType)throw new J("HIERARCHY_REQUEST_ERR");e.appendChild(b)}return e}function l(a,b,c){var d,e=!(!b||!b.length),f=!!c;e&&(d=RegExp("^("+b.join("|")+")$"));var g=[];return i(new n(a,!1),function(a){(!e||d.test(a.nodeType))&&(!f||c(a))&&g.push(a)}),g}function m(a){return"["+("undefined"==typeof a.getName?"Range":a.getName())+"("+H.inspectNode(a.startContainer)+":"+a.startOffset+", "+H.inspectNode(a.endContainer)+":"+a.endOffset+")]"}function n(a,b){if(this.range=a,this.clonePartiallySelectedTextNodes=b,!a.collapsed){this.sc=a.startContainer,this.so=a.startOffset,this.ec=a.endContainer,this.eo=a.endOffset;var c=a.commonAncestorContainer;this.sc===this.ec&&H.isCharacterDataNode(this.sc)?(this.isSingleCharacterDataNode=!0,this._first=this._last=this._next=this.sc):(this._first=this._next=this.sc!==c||H.isCharacterDataNode(this.sc)?H.getClosestAncestorIn(this.sc,c,!0):this.sc.childNodes[this.so],this._last=this.ec!==c||H.isCharacterDataNode(this.ec)?H.getClosestAncestorIn(this.ec,c,!0):this.ec.childNodes[this.eo-1])}}function o(a){this.code=this[a],this.codeName=a,this.message="RangeException: "+this.codeName}function p(a,b,c){this.nodes=l(a,b,c),this._next=this.nodes[0],this._position=0}function q(a){return function(b,c){for(var d,e=c?b:b.parentNode;e;){if(d=e.nodeType,H.arrayContains(a,d))return e;e=e.parentNode}return null}}function r(a,b){if(R(a,b))throw new o("INVALID_NODE_TYPE_ERR")}function s(a){if(!a.startContainer)throw new J("INVALID_STATE_ERR")}function t(a,b){if(!H.arrayContains(b,a.nodeType))throw new o("INVALID_NODE_TYPE_ERR")}function u(a,b){if(0>b||b>(H.isCharacterDataNode(a)?a.length:a.childNodes.length))throw new J("INDEX_SIZE_ERR")}function v(a,b){if(P(a,!0)!==P(b,!0))throw new J("WRONG_DOCUMENT_ERR")}function w(a){if(Q(a,!0))throw new J("NO_MODIFICATION_ALLOWED_ERR")}function x(a,b){if(!a)throw new J(b)}function y(a){if(s(a),!((H.arrayContains(L,a.startContainer.nodeType)||P(a.startContainer,!0))&&(H.arrayContains(L,a.endContainer.nodeType)||P(a.endContainer,!0))&&a.startOffset<=(H.isCharacterDataNode(a.startContainer)?a.startContainer.length:a.startContainer.childNodes.length)&&a.endOffset<=(H.isCharacterDataNode(a.endContainer)?a.endContainer.length:a.endContainer.childNodes.length)))throw Error("Range error: Range is no longer valid after DOM mutation ("+a.inspect()+")")}function z(){}function A(a){a.START_TO_START=W,a.START_TO_END=X,a.END_TO_END=Y,a.END_TO_START=Z,a.NODE_BEFORE=$,a.NODE_AFTER=_,a.NODE_BEFORE_AND_AFTER=ab,a.NODE_INSIDE=bb}function B(a){A(a),A(a.prototype)}function C(a,b){return function(){y(this);var c=this.startContainer,d=this.startOffset,e=this.commonAncestorContainer,g=new n(this,!0);return c!==e&&(c=H.getClosestAncestorIn(c,e,!0),d=f(c),c=d.node,d=d.offset),i(g,w),g.reset(),e=a(g),g.detach(),b(this,c,d,c,d),e}}function D(c,d,g){function h(a,b){return function(c){s(this),t(c,K),t(O(c),L),c=(a?e:f)(c),(b?i:l)(this,c.node,c.offset)}}function i(a,b,c){var e=a.endContainer,f=a.endOffset;(b!==a.startContainer||c!==a.startOffset)&&((O(b)!=O(e)||1==H.comparePoints(b,c,e,f))&&(e=b,f=c),d(a,b,c,e,f))}function l(a,b,c){var e=a.startContainer,f=a.startOffset;(b!==a.endContainer||c!==a.endOffset)&&((O(b)!=O(e)||-1==H.comparePoints(b,c,e,f))&&(e=b,f=c),d(a,e,f,b,c))}c.prototype=new z,a.util.extend(c.prototype,{setStart:function(a,b){s(this),r(a,!0),u(a,b),i(this,a,b)},setEnd:function(a,b){s(this),r(a,!0),u(a,b),l(this,a,b)},setStartBefore:h(!0,!0),setStartAfter:h(!1,!0),setEndBefore:h(!0,!1),setEndAfter:h(!1,!1),collapse:function(a){y(this),a?d(this,this.startContainer,this.startOffset,this.startContainer,this.startOffset):d(this,this.endContainer,this.endOffset,this.endContainer,this.endOffset)},selectNodeContents:function(a){s(this),r(a,!0),d(this,a,0,a,H.getNodeLength(a))},selectNode:function(a){s(this),r(a,!1),t(a,K);var b=e(a),a=f(a);d(this,b.node,b.offset,a.node,a.offset)},extractContents:C(k,d),deleteContents:C(j,d),canSurroundContents:function(){y(this),w(this.startContainer),w(this.endContainer);var a=new n(this,!0),c=a._first&&b(a._first,this)||a._last&&b(a._last,this);return a.detach(),!c},detach:function(){g(this)},splitBoundaries:function(){y(this);var a=this.startContainer,b=this.startOffset,c=this.endContainer,e=this.endOffset,f=a===c;H.isCharacterDataNode(c)&&e>0&&e<c.length&&H.splitDataNode(c,e),H.isCharacterDataNode(a)&&b>0&&b<a.length&&(a=H.splitDataNode(a,b),f?(e-=b,c=a):c==a.parentNode&&e>=H.getNodeIndex(a)&&e++,b=0),d(this,a,b,c,e)},normalizeBoundaries:function(){y(this);var a=this.startContainer,b=this.startOffset,c=this.endContainer,e=this.endOffset,f=function(a){var b=a.nextSibling;b&&b.nodeType==a.nodeType&&(c=a,e=a.length,a.appendData(b.data),b.parentNode.removeChild(b))},g=function(d){var f=d.previousSibling;if(f&&f.nodeType==d.nodeType){a=d;var g=d.length;b=f.length,d.insertData(0,f.data),f.parentNode.removeChild(f),a==c?(e+=b,c=a):c==d.parentNode&&(f=H.getNodeIndex(d),e==f?(c=d,e=g):e>f&&e--)}},h=!0;H.isCharacterDataNode(c)?c.length==e&&f(c):(e>0&&(h=c.childNodes[e-1])&&H.isCharacterDataNode(h)&&f(h),h=!this.collapsed),h?H.isCharacterDataNode(a)?0==b&&g(a):b<a.childNodes.length&&(f=a.childNodes[b])&&H.isCharacterDataNode(f)&&g(f):(a=c,b=e),d(this,a,b,c,e)},collapseToPoint:function(a,b){s(this),r(a,!0),u(a,b),(a!==this.startContainer||b!==this.startOffset||a!==this.endContainer||b!==this.endOffset)&&d(this,a,b,a,b)}}),B(c)}function E(a){a.collapsed=a.startContainer===a.endContainer&&a.startOffset===a.endOffset,a.commonAncestorContainer=a.collapsed?a.startContainer:H.getCommonAncestor(a.startContainer,a.endContainer)}function F(a,b,c,e,f){var g=a.startContainer!==b||a.startOffset!==c,h=a.endContainer!==e||a.endOffset!==f;a.startContainer=b,a.startOffset=c,a.endContainer=e,a.endOffset=f,E(a),d(a,"boundarychange",{startMoved:g,endMoved:h})}function G(a){this.startContainer=a,this.startOffset=0,this.endContainer=a,this.endOffset=0,this._listeners={boundarychange:[],detach:[]},E(this)}a.requireModules(["DomUtil"]);var H=a.dom,I=H.DomPosition,J=a.DOMException;n.prototype={_current:null,_next:null,_first:null,_last:null,isSingleCharacterDataNode:!1,reset:function(){this._current=null,this._next=this._first},hasNext:function(){return!!this._next},next:function(){var a=this._current=this._next;return a&&(this._next=a!==this._last?a.nextSibling:null,H.isCharacterDataNode(a)&&this.clonePartiallySelectedTextNodes&&(a===this.ec&&(a=a.cloneNode(!0)).deleteData(this.eo,a.length-this.eo),this._current===this.sc&&(a=a.cloneNode(!0)).deleteData(0,this.so))),a},remove:function(){var a,b,c=this._current;!H.isCharacterDataNode(c)||c!==this.sc&&c!==this.ec?c.parentNode&&c.parentNode.removeChild(c):(a=c===this.sc?this.so:0,b=c===this.ec?this.eo:c.length,a!=b&&c.deleteData(a,b-a))},isPartiallySelectedSubtree:function(){return b(this._current,this.range)},getSubtreeIterator:function(){var a;if(this.isSingleCharacterDataNode)a=this.range.cloneRange(),a.collapse();else{a=new G(c(this.range));var b=this._current,d=b,e=0,f=b,g=H.getNodeLength(b);H.isAncestorOf(b,this.sc,!0)&&(d=this.sc,e=this.so),H.isAncestorOf(b,this.ec,!0)&&(f=this.ec,g=this.eo),F(a,d,e,f,g)}return new n(a,this.clonePartiallySelectedTextNodes)},detach:function(a){a&&this.range.detach(),this.range=this._current=this._next=this._first=this._last=this.sc=this.so=this.ec=this.eo=null}},o.prototype={BAD_BOUNDARYPOINTS_ERR:1,INVALID_NODE_TYPE_ERR:2},o.prototype.toString=function(){return this.message},p.prototype={_current:null,hasNext:function(){return!!this._next},next:function(){return this._current=this._next,this._next=this.nodes[++this._position],this._current},detach:function(){this._current=this._next=this.nodes=null}};var K=[1,3,4,5,7,8,10],L=[2,9,11],M=[1,3,4,5,7,8,10,11],N=[1,3,4,5,7,8],O=H.getRootContainer,P=q([9,11]),Q=q([5,6,10,12]),R=q([6,10,12]),S=document.createElement("style"),T=!1;try{S.innerHTML="<b>x</b>",T=3==S.firstChild.nodeType}catch(U){}a.features.htmlParsingConforms=T;var V="startContainer startOffset endContainer endOffset collapsed commonAncestorContainer".split(" "),W=0,X=1,Y=2,Z=3,$=0,_=1,ab=2,bb=3;z.prototype={attachListener:function(a,b){this._listeners[a].push(b)},compareBoundaryPoints:function(a,b){y(this),v(this.startContainer,b.startContainer);var c=a==Z||a==W?"start":"end",d=a==X||a==W?"start":"end";return H.comparePoints(this[c+"Container"],this[c+"Offset"],b[d+"Container"],b[d+"Offset"])},insertNode:function(a){if(y(this),t(a,M),w(this.startContainer),H.isAncestorOf(a,this.startContainer,!0))throw new J("HIERARCHY_REQUEST_ERR");this.setStartBefore(g(a,this.startContainer,this.startOffset))},cloneContents:function(){y(this);var a,b;return this.collapsed?c(this).createDocumentFragment():this.startContainer===this.endContainer&&H.isCharacterDataNode(this.startContainer)?(a=this.startContainer.cloneNode(!0),a.data=a.data.slice(this.startOffset,this.endOffset),b=c(this).createDocumentFragment(),b.appendChild(a),b):(b=new n(this,!0),a=h(b),b.detach(),a)},canSurroundContents:function(){y(this),w(this.startContainer),w(this.endContainer);var a=new n(this,!0),c=a._first&&b(a._first,this)||a._last&&b(a._last,this);return a.detach(),!c},surroundContents:function(a){if(t(a,N),!this.canSurroundContents())throw new o("BAD_BOUNDARYPOINTS_ERR");var b=this.extractContents();if(a.hasChildNodes())for(;a.lastChild;)a.removeChild(a.lastChild);g(a,this.startContainer,this.startOffset),a.appendChild(b),this.selectNode(a)},cloneRange:function(){y(this);for(var a,b=new G(c(this)),d=V.length;d--;)a=V[d],b[a]=this[a];return b},toString:function(){y(this);var a=this.startContainer;if(a===this.endContainer&&H.isCharacterDataNode(a))return 3==a.nodeType||4==a.nodeType?a.data.slice(this.startOffset,this.endOffset):"";var b=[],a=new n(this,!0);return i(a,function(a){(3==a.nodeType||4==a.nodeType)&&b.push(a.data)}),a.detach(),b.join("")},compareNode:function(a){y(this);var b=a.parentNode,c=H.getNodeIndex(a);if(!b)throw new J("NOT_FOUND_ERR");return a=this.comparePoint(b,c),b=this.comparePoint(b,c+1),0>a?b>0?ab:$:b>0?_:bb},comparePoint:function(a,b){return y(this),x(a,"HIERARCHY_REQUEST_ERR"),v(a,this.startContainer),0>H.comparePoints(a,b,this.startContainer,this.startOffset)?-1:0<H.comparePoints(a,b,this.endContainer,this.endOffset)?1:0},createContextualFragment:T?function(a){var b=this.startContainer,c=H.getDocument(b);if(!b)throw new J("INVALID_STATE_ERR");var d=null;return 1==b.nodeType?d=b:H.isCharacterDataNode(b)&&(d=H.parentElement(b)),d=null===d||"HTML"==d.nodeName&&H.isHtmlNamespace(H.getDocument(d).documentElement)&&H.isHtmlNamespace(d)?c.createElement("body"):d.cloneNode(!1),d.innerHTML=a,H.fragmentFromNodeChildren(d)}:function(a){s(this);var b=c(this).createElement("body");return b.innerHTML=a,H.fragmentFromNodeChildren(b)},toHtml:function(){y(this);var a=c(this).createElement("div");return a.appendChild(this.cloneContents()),a.innerHTML},intersectsNode:function(a,b){if(y(this),x(a,"NOT_FOUND_ERR"),H.getDocument(a)!==c(this))return!1;var d=a.parentNode,e=H.getNodeIndex(a);x(d,"NOT_FOUND_ERR");var f=H.comparePoints(d,e,this.endContainer,this.endOffset),d=H.comparePoints(d,e+1,this.startContainer,this.startOffset);return b?0>=f&&d>=0:0>f&&d>0},isPointInRange:function(a,b){return y(this),x(a,"HIERARCHY_REQUEST_ERR"),v(a,this.startContainer),0<=H.comparePoints(a,b,this.startContainer,this.startOffset)&&0>=H.comparePoints(a,b,this.endContainer,this.endOffset)},intersectsRange:function(a,b){if(y(this),c(a)!=c(this))throw new J("WRONG_DOCUMENT_ERR");var d=H.comparePoints(this.startContainer,this.startOffset,a.endContainer,a.endOffset),e=H.comparePoints(this.endContainer,this.endOffset,a.startContainer,a.startOffset);return b?0>=d&&e>=0:0>d&&e>0},intersection:function(a){if(this.intersectsRange(a)){var b=H.comparePoints(this.startContainer,this.startOffset,a.startContainer,a.startOffset),c=H.comparePoints(this.endContainer,this.endOffset,a.endContainer,a.endOffset),d=this.cloneRange();return-1==b&&d.setStart(a.startContainer,a.startOffset),1==c&&d.setEnd(a.endContainer,a.endOffset),d}return null},union:function(a){if(this.intersectsRange(a,!0)){var b=this.cloneRange();return-1==H.comparePoints(a.startContainer,a.startOffset,this.startContainer,this.startOffset)&&b.setStart(a.startContainer,a.startOffset),1==H.comparePoints(a.endContainer,a.endOffset,this.endContainer,this.endOffset)&&b.setEnd(a.endContainer,a.endOffset),b}throw new o("Ranges do not intersect")},containsNode:function(a,b){return b?this.intersectsNode(a,!1):this.compareNode(a)==bb},containsNodeContents:function(a){return 0<=this.comparePoint(a,0)&&0>=this.comparePoint(a,H.getNodeLength(a))},containsRange:function(a){return this.intersection(a).equals(a)},containsNodeText:function(a){var b=this.cloneRange();b.selectNode(a);var c=b.getNodes([3]);return 0<c.length?(b.setStart(c[0],0),a=c.pop(),b.setEnd(a,a.length),a=this.containsRange(b),b.detach(),a):this.containsNodeContents(a)},createNodeIterator:function(a,b){return y(this),new p(this,a,b)},getNodes:function(a,b){return y(this),l(this,a,b)},getDocument:function(){return c(this)},collapseBefore:function(a){s(this),this.setEndBefore(a),this.collapse(!1)},collapseAfter:function(a){s(this),this.setStartAfter(a),this.collapse(!0)},getName:function(){return"DomRange"},equals:function(a){return G.rangesEqual(this,a)},inspect:function(){return m(this)}},D(G,F,function(a){s(a),a.startContainer=a.startOffset=a.endContainer=a.endOffset=null,a.collapsed=a.commonAncestorContainer=null,d(a,"detach",null),a._listeners=null}),a.rangePrototype=z.prototype,G.rangeProperties=V,G.RangeIterator=n,G.copyComparisonConstants=B,G.createPrototypeRange=D,G.inspect=m,G.getRangeDocument=c,G.rangesEqual=function(a,b){return a.startContainer===b.startContainer&&a.startOffset===b.startOffset&&a.endContainer===b.endContainer&&a.endOffset===b.endOffset},a.DomRange=G,a.RangeException=o}),rangy.createModule("WrappedRange",function(a){function b(a,b,c,d){var g=a.duplicate();g.collapse(c);var h=g.parentElement();if(e.isAncestorOf(b,h,!0)||(h=b),!h.canHaveHTML)return new f(h.parentNode,e.getNodeIndex(h));var i,b=e.getDocument(h).createElement("span"),j=c?"StartToStart":"StartToEnd";do h.insertBefore(b,b.previousSibling),g.moveToElementText(b);while(0<(i=g.compareEndPoints(j,a))&&b.previousSibling);if(j=b.nextSibling,-1==i&&j&&e.isCharacterDataNode(j)){if(g.setEndPoint(c?"EndToStart":"EndToEnd",a),/[\r\n]/.test(j.data))for(h=g.duplicate(),c=h.text.replace(/\r\n/g,"\r").length,c=h.moveStart("character",c);-1==h.compareEndPoints("StartToEnd",h);)c++,h.moveStart("character",1);else c=g.text.length;h=new f(j,c)}else j=(d||!c)&&b.previousSibling,h=(c=(d||c)&&b.nextSibling)&&e.isCharacterDataNode(c)?new f(c,0):j&&e.isCharacterDataNode(j)?new f(j,j.length):new f(h,e.getNodeIndex(b));return b.parentNode.removeChild(b),h}function c(a,b){var c,d,f=a.offset,g=e.getDocument(a.node),h=g.body.createTextRange(),i=e.isCharacterDataNode(a.node);return i?(c=a.node,d=c.parentNode):(c=a.node.childNodes,c=f<c.length?c[f]:null,d=a.node),g=g.createElement("span"),g.innerHTML="&#feff;",c?d.insertBefore(g,c):d.appendChild(g),h.moveToElementText(g),h.collapse(!b),d.removeChild(g),i&&h[b?"moveStart":"moveEnd"]("character",f),h}a.requireModules(["DomUtil","DomRange"]);var d,e=a.dom,f=e.DomPosition,g=a.DomRange;if(!a.features.implementsDomRange||a.features.implementsTextRange&&a.config.preferTextRange){if(a.features.implementsTextRange){d=function(a){this.textRange=a,this.refresh()},d.prototype=new g(document),d.prototype.refresh=function(){var a,c,d=this.textRange;a=d.parentElement();var f=d.duplicate();f.collapse(!0),c=f.parentElement(),f=d.duplicate(),f.collapse(!1),d=f.parentElement(),c=c==d?c:e.getCommonAncestor(c,d),c=c==a?c:e.getCommonAncestor(a,c),0==this.textRange.compareEndPoints("StartToEnd",this.textRange)?c=a=b(this.textRange,c,!0,!0):(a=b(this.textRange,c,!0,!1),c=b(this.textRange,c,!1,!1)),this.setStart(a.node,a.offset),this.setEnd(c.node,c.offset)},g.copyComparisonConstants(d);var h=function(){return this}();"undefined"==typeof h.Range&&(h.Range=d),a.createNativeRange=function(a){return a=a||document,a.body.createTextRange()}}}else(function(){function b(a){for(var b,c=h.length;c--;)b=h[c],a[b]=a.nativeRange[b]}var c,f,h=g.rangeProperties;d=function(a){if(!a)throw Error("Range must be specified");this.nativeRange=a,b(this)},g.createPrototypeRange(d,function(a,b,c,d,e){var f=a.endContainer!==d||a.endOffset!=e;(a.startContainer!==b||a.startOffset!=c||f)&&(a.setEnd(d,e),a.setStart(b,c))},function(a){a.nativeRange.detach(),a.detached=!0;for(var b,c=h.length;c--;)b=h[c],a[b]=null}),c=d.prototype,c.selectNode=function(a){this.nativeRange.selectNode(a),b(this)},c.deleteContents=function(){this.nativeRange.deleteContents(),b(this)},c.extractContents=function(){var a=this.nativeRange.extractContents();return b(this),a},c.cloneContents=function(){return this.nativeRange.cloneContents()},c.surroundContents=function(a){this.nativeRange.surroundContents(a),b(this)},c.collapse=function(a){this.nativeRange.collapse(a),b(this)},c.cloneRange=function(){return new d(this.nativeRange.cloneRange())},c.refresh=function(){b(this)},c.toString=function(){return this.nativeRange.toString()};var i=document.createTextNode("test");e.getBody(document).appendChild(i);var j=document.createRange();j.setStart(i,0),j.setEnd(i,0);try{j.setStart(i,1),c.setStart=function(a,c){this.nativeRange.setStart(a,c),b(this)},c.setEnd=function(a,c){this.nativeRange.setEnd(a,c),b(this)},f=function(a){return function(c){this.nativeRange[a](c),b(this)}}}catch(k){c.setStart=function(a,c){try{this.nativeRange.setStart(a,c)}catch(d){this.nativeRange.setEnd(a,c),this.nativeRange.setStart(a,c)}b(this)},c.setEnd=function(a,c){try{this.nativeRange.setEnd(a,c)}catch(d){this.nativeRange.setStart(a,c),this.nativeRange.setEnd(a,c)}b(this)},f=function(a,c){return function(d){try{this.nativeRange[a](d)}catch(e){this.nativeRange[c](d),this.nativeRange[a](d)}b(this)}}}c.setStartBefore=f("setStartBefore","setEndBefore"),c.setStartAfter=f("setStartAfter","setEndAfter"),c.setEndBefore=f("setEndBefore","setStartBefore"),c.setEndAfter=f("setEndAfter","setStartAfter"),j.selectNodeContents(i),c.selectNodeContents=j.startContainer==i&&j.endContainer==i&&0==j.startOffset&&j.endOffset==i.length?function(a){this.nativeRange.selectNodeContents(a),b(this)}:function(a){this.setStart(a,0),this.setEnd(a,g.getEndOffset(a))},j.selectNodeContents(i),j.setEnd(i,3),f=document.createRange(),f.selectNodeContents(i),f.setEnd(i,4),f.setStart(i,2),c.compareBoundaryPoints=-1==j.compareBoundaryPoints(j.START_TO_END,f)&1==j.compareBoundaryPoints(j.END_TO_START,f)?function(a,b){return b=b.nativeRange||b,a==b.START_TO_END?a=b.END_TO_START:a==b.END_TO_START&&(a=b.START_TO_END),this.nativeRange.compareBoundaryPoints(a,b)}:function(a,b){return this.nativeRange.compareBoundaryPoints(a,b.nativeRange||b)},a.util.isHostMethod(j,"createContextualFragment")&&(c.createContextualFragment=function(a){return this.nativeRange.createContextualFragment(a)}),e.getBody(document).removeChild(i),j.detach(),f.detach()})(),a.createNativeRange=function(a){return a=a||document,a.createRange()};a.features.implementsTextRange&&(d.rangeToTextRange=function(a){if(a.collapsed)return c(new f(a.startContainer,a.startOffset),!0);var b=c(new f(a.startContainer,a.startOffset),!0),d=c(new f(a.endContainer,a.endOffset),!1),a=e.getDocument(a.startContainer).body.createTextRange();return a.setEndPoint("StartToStart",b),a.setEndPoint("EndToEnd",d),a}),d.prototype.getName=function(){return"WrappedRange"},a.WrappedRange=d,a.createRange=function(b){return b=b||document,new d(a.createNativeRange(b))},a.createRangyRange=function(a){return a=a||document,new g(a)},a.createIframeRange=function(b){return a.createRange(e.getIframeDocument(b))},a.createIframeRangyRange=function(b){return a.createRangyRange(e.getIframeDocument(b))},a.addCreateMissingNativeApiListener(function(b){b=b.document,"undefined"==typeof b.createRange&&(b.createRange=function(){return a.createRange(this)}),b=b=null})}),rangy.createModule("WrappedSelection",function(a,b){function c(a){return(a||window).getSelection()}function d(a){return(a||window).document.selection}function e(a,b,c){var d=c?"end":"start",c=c?"start":"end";a.anchorNode=b[d+"Container"],a.anchorOffset=b[d+"Offset"],a.focusNode=b[c+"Container"],a.focusOffset=b[c+"Offset"]}function f(a){a.anchorNode=a.focusNode=null,a.anchorOffset=a.focusOffset=0,a.rangeCount=0,a.isCollapsed=!0,a._ranges.length=0}function g(b){var c;return b instanceof t?(c=b._selectionNativeRange,c||(c=a.createNativeRange(r.getDocument(b.startContainer)),c.setEnd(b.endContainer,b.endOffset),c.setStart(b.startContainer,b.startOffset),b._selectionNativeRange=c,b.attachListener("detach",function(){this._selectionNativeRange=null}))):b instanceof u?c=b.nativeRange:a.features.implementsDomRange&&b instanceof r.getWindow(b.startContainer).Range&&(c=b),c}function h(a){var b,c=a.getNodes();a:if(c.length&&1==c[0].nodeType){b=1;for(var d=c.length;d>b;++b)if(!r.isAncestorOf(c[0],c[b])){b=!1;break a}b=!0}else b=!1;if(!b)throw Error("getSingleElementFromRange: range "+a.inspect()+" did not consist of a single element");return c[0]}function i(a,b){var c=new u(b);a._ranges=[c],e(a,c,!1),a.rangeCount=1,a.isCollapsed=c.collapsed}function j(b){if(b._ranges.length=0,"None"==b.docSelection.type)f(b);else{var c=b.docSelection.createRange();if(c&&"undefined"!=typeof c.text)i(b,c);else{b.rangeCount=c.length;for(var d,g=r.getDocument(c.item(0)),h=0;h<b.rangeCount;++h)d=a.createRange(g),d.selectNode(c.item(h)),b._ranges.push(d);b.isCollapsed=1==b.rangeCount&&b._ranges[0].collapsed,e(b,b._ranges[b.rangeCount-1],!1)}}}function k(a,b){for(var c=a.docSelection.createRange(),d=h(b),e=r.getDocument(c.item(0)),e=r.getBody(e).createControlRange(),f=0,g=c.length;g>f;++f)e.add(c.item(f));try{e.add(d)}catch(i){throw Error("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)")}e.select(),j(a)}function l(a,b,c){this.nativeSelection=a,this.docSelection=b,this._ranges=[],this.win=c,this.refresh()}function m(a,b){for(var c,d=r.getDocument(b[0].startContainer),d=r.getBody(d).createControlRange(),e=0;rangeCount>e;++e){c=h(b[e]);
try{d.add(c)}catch(f){throw Error("setRanges(): Element within the one of the specified Ranges could not be added to control selection (does it have layout?)")}}d.select(),j(a)}function n(a,b){if(a.anchorNode&&r.getDocument(a.anchorNode)!==r.getDocument(b))throw new v("WRONG_DOCUMENT_ERR")}function o(a){var b=[],c=new w(a.anchorNode,a.anchorOffset),d=new w(a.focusNode,a.focusOffset),e="function"==typeof a.getName?a.getName():"Selection";if("undefined"!=typeof a.rangeCount)for(var f=0,g=a.rangeCount;g>f;++f)b[f]=t.inspect(a.getRangeAt(f));return"["+e+"(Ranges: "+b.join(", ")+")(anchor: "+c.inspect()+", focus: "+d.inspect()+"]"}a.requireModules(["DomUtil","DomRange","WrappedRange"]),a.config.checkSelectionRanges=!0;var p,q,r=a.dom,s=a.util,t=a.DomRange,u=a.WrappedRange,v=a.DOMException,w=r.DomPosition,x=a.util.isHostMethod(window,"getSelection"),y=a.util.isHostObject(document,"selection"),z=y&&(!x||a.config.preferTextRange);z?(p=d,a.isSelectionValid=function(a){var a=(a||window).document,b=a.selection;return"None"!=b.type||r.getDocument(b.createRange().parentElement())==a}):x?(p=c,a.isSelectionValid=function(){return!0}):b.fail("Neither document.selection or window.getSelection() detected."),a.getNativeSelection=p;var x=p(),A=a.createNativeRange(document),B=r.getBody(document),C=s.areHostObjects(x,s.areHostProperties(x,["anchorOffset","focusOffset"]));a.features.selectionHasAnchorAndFocus=C;var D=s.isHostMethod(x,"extend");a.features.selectionHasExtend=D;var E="number"==typeof x.rangeCount;a.features.selectionHasRangeCount=E;var F=!1,G=!0;s.areHostMethods(x,["addRange","getRangeAt","removeAllRanges"])&&"number"==typeof x.rangeCount&&a.features.implementsDomRange&&function(){var a=document.createElement("iframe");B.appendChild(a);var b=r.getIframeDocument(a);b.open(),b.write("<html><head></head><body>12</body></html>"),b.close();var c=r.getIframeWindow(a).getSelection(),d=b.documentElement.lastChild.firstChild,b=b.createRange();b.setStart(d,1),b.collapse(!0),c.addRange(b),G=1==c.rangeCount,c.removeAllRanges();var e=b.cloneRange();b.setStart(d,0),e.setEnd(d,2),c.addRange(b),c.addRange(e),F=2==c.rangeCount,b.detach(),e.detach(),B.removeChild(a)}(),a.features.selectionSupportsMultipleRanges=F,a.features.collapsedNonEditableSelectionsSupported=G;var H,I=!1;B&&s.isHostMethod(B,"createControlRange")&&(H=B.createControlRange(),s.areHostProperties(H,["item","add"])&&(I=!0)),a.features.implementsControlRange=I,q=C?function(a){return a.anchorNode===a.focusNode&&a.anchorOffset===a.focusOffset}:function(a){return a.rangeCount?a.getRangeAt(a.rangeCount-1).collapsed:!1};var J;if(s.isHostMethod(x,"getRangeAt")?J=function(a,b){try{return a.getRangeAt(b)}catch(c){return null}}:C&&(J=function(b){var c=r.getDocument(b.anchorNode),c=a.createRange(c);return c.setStart(b.anchorNode,b.anchorOffset),c.setEnd(b.focusNode,b.focusOffset),c.collapsed!==this.isCollapsed&&(c.setStart(b.focusNode,b.focusOffset),c.setEnd(b.anchorNode,b.anchorOffset)),c}),a.getSelection=function(a){var a=a||window,b=a._rangySelection,c=p(a),e=y?d(a):null;return b?(b.nativeSelection=c,b.docSelection=e,b.refresh(a)):(b=new l(c,e,a),a._rangySelection=b),b},a.getIframeSelection=function(b){return a.getSelection(r.getIframeWindow(b))},H=l.prototype,!z&&C&&s.areHostMethods(x,["removeAllRanges","addRange"])){H.removeAllRanges=function(){this.nativeSelection.removeAllRanges(),f(this)};var K=function(b,c){var d=t.getRangeDocument(c),d=a.createRange(d);d.collapseToPoint(c.endContainer,c.endOffset),b.nativeSelection.addRange(g(d)),b.nativeSelection.extend(c.startContainer,c.startOffset),b.refresh()};H.addRange=E?function(b,c){if(I&&y&&"Control"==this.docSelection.type)k(this,b);else if(c&&D)K(this,b);else{var d;F?d=this.rangeCount:(this.removeAllRanges(),d=0),this.nativeSelection.addRange(g(b)),this.rangeCount=this.nativeSelection.rangeCount,this.rangeCount==d+1?(a.config.checkSelectionRanges&&(d=J(this.nativeSelection,this.rangeCount-1))&&!t.rangesEqual(d,b)&&(b=new u(d)),this._ranges[this.rangeCount-1]=b,e(this,b,N(this.nativeSelection)),this.isCollapsed=q(this)):this.refresh()}}:function(a,b){b&&D?K(this,a):(this.nativeSelection.addRange(g(a)),this.refresh())},H.setRanges=function(a){if(I&&a.length>1)m(this,a);else{this.removeAllRanges();for(var b=0,c=a.length;c>b;++b)this.addRange(a[b])}}}else{if(!(s.isHostMethod(x,"empty")&&s.isHostMethod(A,"select")&&I&&z))return b.fail("No means of selecting a Range or TextRange was found"),!1;H.removeAllRanges=function(){try{if(this.docSelection.empty(),"None"!=this.docSelection.type){var a;if(this.anchorNode)a=r.getDocument(this.anchorNode);else if("Control"==this.docSelection.type){var b=this.docSelection.createRange();b.length&&(a=r.getDocument(b.item(0)).body.createTextRange())}a&&(a.body.createTextRange().select(),this.docSelection.empty())}}catch(c){}f(this)},H.addRange=function(a){"Control"==this.docSelection.type?k(this,a):(u.rangeToTextRange(a).select(),this._ranges[0]=a,this.rangeCount=1,this.isCollapsed=this._ranges[0].collapsed,e(this,a,!1))},H.setRanges=function(a){this.removeAllRanges();var b=a.length;b>1?m(this,a):b&&this.addRange(a[0])}}H.getRangeAt=function(a){if(0>a||a>=this.rangeCount)throw new v("INDEX_SIZE_ERR");return this._ranges[a]};var L;if(z)L=function(b){var c;a.isSelectionValid(b.win)?c=b.docSelection.createRange():(c=r.getBody(b.win.document).createTextRange(),c.collapse(!0)),"Control"==b.docSelection.type?j(b):c&&"undefined"!=typeof c.text?i(b,c):f(b)};else if(s.isHostMethod(x,"getRangeAt")&&"number"==typeof x.rangeCount)L=function(b){if(I&&y&&"Control"==b.docSelection.type)j(b);else if(b._ranges.length=b.rangeCount=b.nativeSelection.rangeCount,b.rangeCount){for(var c=0,d=b.rangeCount;d>c;++c)b._ranges[c]=new a.WrappedRange(b.nativeSelection.getRangeAt(c));e(b,b._ranges[b.rangeCount-1],N(b.nativeSelection)),b.isCollapsed=q(b)}else f(b)};else{if(!C||"boolean"!=typeof x.isCollapsed||"boolean"!=typeof A.collapsed||!a.features.implementsDomRange)return b.fail("No means of obtaining a Range or TextRange from the user's selection was found"),!1;L=function(a){var b;b=a.nativeSelection,b.anchorNode?(b=J(b,0),a._ranges=[b],a.rangeCount=1,b=a.nativeSelection,a.anchorNode=b.anchorNode,a.anchorOffset=b.anchorOffset,a.focusNode=b.focusNode,a.focusOffset=b.focusOffset,a.isCollapsed=q(a)):f(a)}}H.refresh=function(a){var b=a?this._ranges.slice(0):null;if(L(this),a){if(a=b.length,a!=this._ranges.length)return!1;for(;a--;)if(!t.rangesEqual(b[a],this._ranges[a]))return!1;return!0}};var M=function(a,b){var c=a.getAllRanges(),d=!1;a.removeAllRanges();for(var e=0,g=c.length;g>e;++e)d||b!==c[e]?a.addRange(c[e]):d=!0;a.rangeCount||f(a)};H.removeRange=I?function(a){if("Control"==this.docSelection.type){for(var b,c=this.docSelection.createRange(),a=h(a),d=r.getDocument(c.item(0)),d=r.getBody(d).createControlRange(),e=!1,f=0,g=c.length;g>f;++f)b=c.item(f),b!==a||e?d.add(c.item(f)):e=!0;d.select(),j(this)}else M(this,a)}:function(a){M(this,a)};var N;!z&&C&&a.features.implementsDomRange?(N=function(a){var b=!1;return a.anchorNode&&(b=1==r.comparePoints(a.anchorNode,a.anchorOffset,a.focusNode,a.focusOffset)),b},H.isBackwards=function(){return N(this)}):N=H.isBackwards=function(){return!1},H.toString=function(){for(var a=[],b=0,c=this.rangeCount;c>b;++b)a[b]=""+this._ranges[b];return a.join("")},H.collapse=function(b,c){n(this,b);var d=a.createRange(r.getDocument(b));d.collapseToPoint(b,c),this.removeAllRanges(),this.addRange(d),this.isCollapsed=!0},H.collapseToStart=function(){if(!this.rangeCount)throw new v("INVALID_STATE_ERR");var a=this._ranges[0];this.collapse(a.startContainer,a.startOffset)},H.collapseToEnd=function(){if(!this.rangeCount)throw new v("INVALID_STATE_ERR");var a=this._ranges[this.rangeCount-1];this.collapse(a.endContainer,a.endOffset)},H.selectAllChildren=function(b){n(this,b);var c=a.createRange(r.getDocument(b));c.selectNodeContents(b),this.removeAllRanges(),this.addRange(c)},H.deleteFromDocument=function(){if(I&&y&&"Control"==this.docSelection.type){for(var a,b=this.docSelection.createRange();b.length;)a=b.item(0),b.remove(a),a.parentNode.removeChild(a);this.refresh()}else if(this.rangeCount){b=this.getAllRanges(),this.removeAllRanges(),a=0;for(var c=b.length;c>a;++a)b[a].deleteContents();this.addRange(b[c-1])}},H.getAllRanges=function(){return this._ranges.slice(0)},H.setSingleRange=function(a){this.setRanges([a])},H.containsNode=function(a,b){for(var c=0,d=this._ranges.length;d>c;++c)if(this._ranges[c].containsNode(a,b))return!0;return!1},H.toHtml=function(){var a="";if(this.rangeCount){for(var a=t.getRangeDocument(this._ranges[0]).createElement("div"),b=0,c=this._ranges.length;c>b;++b)a.appendChild(this._ranges[b].cloneContents());a=a.innerHTML}return a},H.getName=function(){return"WrappedSelection"},H.inspect=function(){return o(this)},H.detach=function(){this.win=this.anchorNode=this.focusNode=this.win._rangySelection=null},l.inspect=o,a.Selection=l,a.selectionPrototype=H,a.addCreateMissingNativeApiListener(function(b){"undefined"==typeof b.getSelection&&(b.getSelection=function(){return a.getSelection(this)}),b=null})});var Base=function(){};Base.extend=function(a,b){var c=Base.prototype.extend;Base._prototyping=!0;var d=new this;c.call(d,a),d.base=function(){},delete Base._prototyping;var e=d.constructor,f=d.constructor=function(){if(!Base._prototyping)if(this._constructing||this.constructor==f)this._constructing=!0,e.apply(this,arguments),delete this._constructing;else if(null!=arguments[0])return(arguments[0].extend||c).call(arguments[0],d)};return f.ancestor=this,f.extend=this.extend,f.forEach=this.forEach,f.implement=this.implement,f.prototype=d,f.toString=this.toString,f.valueOf=function(a){return"object"==a?f:e.valueOf()},c.call(f,b),"function"==typeof f.init&&f.init(),f},Base.prototype={extend:function(a,b){if(1<arguments.length){var c=this[a];if(c&&"function"==typeof b&&(!c.valueOf||c.valueOf()!=b.valueOf())&&/\bbase\b/.test(b)){var d=b.valueOf(),b=function(){var a=this.base||Base.prototype.base;this.base=c;var b=d.apply(this,arguments);return this.base=a,b};b.valueOf=function(a){return"object"==a?b:d},b.toString=Base.toString}this[a]=b}else if(a){var e=Base.prototype.extend;!Base._prototyping&&"function"!=typeof this&&(e=this.extend||e);for(var f={toSource:null},g=["constructor","toString","valueOf"],h=Base._prototyping?0:1;i=g[h++];)a[i]!=f[i]&&e.call(this,i,a[i]);for(var i in a)f[i]||e.call(this,i,a[i])}return this}},Base=Base.extend({constructor:function(a){this.extend(a)}},{ancestor:Object,version:"1.1",forEach:function(a,b,c){for(var d in a)void 0===this.prototype[d]&&b.call(c,a[d],d,a)},implement:function(){for(var a=0;a<arguments.length;a++)"function"==typeof arguments[a]?arguments[a](this.prototype):this.prototype.extend(arguments[a]);return this},toString:function(){return""+this.valueOf()}}),wysihtml5.browser=function(){var a=navigator.userAgent,b=document.createElement("div"),c=-1!==a.indexOf("MSIE")&&-1===a.indexOf("Opera"),d=-1!==a.indexOf("Gecko")&&-1===a.indexOf("KHTML"),e=-1!==a.indexOf("AppleWebKit/"),f=-1!==a.indexOf("Chrome/"),g=-1!==a.indexOf("Opera/");return{USER_AGENT:a,supported:function(){var a=this.USER_AGENT.toLowerCase(),c="contentEditable"in b,d=document.execCommand&&document.queryCommandSupported&&document.queryCommandState,e=document.querySelector&&document.querySelectorAll,a=this.isIos()&&5>(/ipad|iphone|ipod/.test(a)&&a.match(/ os (\d+).+? like mac os x/)||[,0])[1]||-1!==a.indexOf("opera mobi")||-1!==a.indexOf("hpwos/");return c&&d&&e&&!a},isTouchDevice:function(){return this.supportsEvent("touchmove")},isIos:function(){var a=this.USER_AGENT.toLowerCase();return-1!==a.indexOf("webkit")&&-1!==a.indexOf("mobile")},supportsSandboxedIframes:function(){return c},throwsMixedContentWarningWhenIframeSrcIsEmpty:function(){return!("querySelector"in document)},displaysCaretInEmptyContentEditableCorrectly:function(){return!d},hasCurrentStyleProperty:function(){return"currentStyle"in b},insertsLineBreaksOnReturn:function(){return d},supportsPlaceholderAttributeOn:function(a){return"placeholder"in a},supportsEvent:function(a){var c;return(c="on"+a in b)||(b.setAttribute("on"+a,"return;"),c="function"==typeof b["on"+a]),c},supportsEventsInIframeCorrectly:function(){return!g},firesOnDropOnlyWhenOnDragOverIsCancelled:function(){return e||d},supportsDataTransfer:function(){try{return e&&(window.Clipboard||window.DataTransfer).prototype.getData}catch(a){return!1}},supportsHTML5Tags:function(a){return a=a.createElement("div"),a.innerHTML="<article>foo</article>","<article>foo</article>"===a.innerHTML.toLowerCase()},supportsCommand:function(){var a={formatBlock:c,insertUnorderedList:c||g||e,insertOrderedList:c||g||e},b={insertHTML:d};return function(c,d){if(!a[d]){try{return c.queryCommandSupported(d)}catch(e){}try{return c.queryCommandEnabled(d)}catch(f){return!!b[d]}}return!1}}(),doesAutoLinkingInContentEditable:function(){return c},canDisableAutoLinking:function(){return this.supportsCommand(document,"AutoUrlDetect")},clearsContentEditableCorrectly:function(){return d||g||e},supportsGetAttributeCorrectly:function(){return"1"!=document.createElement("td").getAttribute("rowspan")},canSelectImagesInContentEditable:function(){return d||c||g},clearsListsInContentEditableCorrectly:function(){return d||c||e},autoScrollsToCaret:function(){return!e},autoClosesUnclosedTags:function(){var a,c=b.cloneNode(!1);return c.innerHTML="<p><div></div>",c=c.innerHTML.toLowerCase(),a="<p></p><div></div>"===c||"<p><div></div></p>"===c,this.autoClosesUnclosedTags=function(){return a},a},supportsNativeGetElementsByClassName:function(){return-1!==(""+document.getElementsByClassName).indexOf("[native code]")},supportsSelectionModify:function(){return"getSelection"in window&&"modify"in window.getSelection()},supportsClassList:function(){return"classList"in b},needsSpaceAfterLineBreak:function(){return g},supportsSpeechApiOn:function(b){return 11<=(a.match(/Chrome\/(\d+)/)||[,0])[1]&&("onwebkitspeechchange"in b||"speech"in b)},crashesWhenDefineProperty:function(a){return c&&("XMLHttpRequest"===a||"XDomainRequest"===a)},doesAsyncFocus:function(){return c},hasProblemsSettingCaretAfterImg:function(){return c},hasUndoInContextMenu:function(){return d||f||g}}}(),wysihtml5.lang.array=function(a){return{contains:function(b){if(a.indexOf)return-1!==a.indexOf(b);for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return!0;return!1},without:function(b){for(var b=wysihtml5.lang.array(b),c=[],d=0,e=a.length;e>d;d++)b.contains(a[d])||c.push(a[d]);return c},get:function(){for(var b=0,c=a.length,d=[];c>b;b++)d.push(a[b]);return d}}},wysihtml5.lang.Dispatcher=Base.extend({observe:function(a,b){return this.events=this.events||{},this.events[a]=this.events[a]||[],this.events[a].push(b),this},on:function(){return this.observe.apply(this,wysihtml5.lang.array(arguments).get())},fire:function(a,b){this.events=this.events||{};for(var c=this.events[a]||[],d=0;d<c.length;d++)c[d].call(this,b);return this},stopObserving:function(a,b){this.events=this.events||{};var c,d,e=0;if(a){for(c=this.events[a]||[],d=[];e<c.length;e++)c[e]!==b&&b&&d.push(c[e]);this.events[a]=d}else this.events={};return this}}),wysihtml5.lang.object=function(a){return{merge:function(b){for(var c in b)a[c]=b[c];return this},get:function(){return a},clone:function(){var b,c={};for(b in a)c[b]=a[b];return c},isArray:function(){return"[object Array]"===Object.prototype.toString.call(a)}}},function(){var a=/^\s+/,b=/\s+$/;wysihtml5.lang.string=function(c){return c=""+c,{trim:function(){return c.replace(a,"").replace(b,"")},interpolate:function(a){for(var b in a)c=this.replace("#{"+b+"}").by(a[b]);return c},replace:function(a){return{by:function(b){return c.split(a).join(b)}}}}}}(),function(a){function b(a){return a.replace(e,function(a,b){var c=(b.match(f)||[])[1]||"",d=h[c],b=b.replace(f,"");b.split(d).length>b.split(c).length&&(b+=c,c="");var e=d=b;return b.length>g&&(e=e.substr(0,g)+"..."),"www."===d.substr(0,4)&&(d="http://"+d),'<a href="'+d+'">'+e+"</a>"+c})}function c(f){if(!d.contains(f.nodeName)){if(f.nodeType!==a.TEXT_NODE||!f.data.match(e)){for(h=a.lang.array(f.childNodes).get(),g=h.length,i=0;g>i;i++)c(h[i]);return f}var g,h=f.parentNode;g=h.ownerDocument;var i=g._wysihtml5_tempElement;for(i||(i=g._wysihtml5_tempElement=g.createElement("div")),g=i,g.innerHTML="<span></span>"+b(f.data),g.removeChild(g.firstChild);g.firstChild;)h.insertBefore(g.firstChild,f);h.removeChild(f)}}var d=a.lang.array("CODE PRE A SCRIPT HEAD TITLE STYLE".split(" ")),e=/((https?:\/\/|www\.)[^\s<]{3,})/gi,f=/([^\w\/\-](,?))$/i,g=100,h={")":"(","]":"[","}":"{"};a.dom.autoLink=function(a){var b;a:{b=a;for(var e;b.parentNode;){if(b=b.parentNode,e=b.nodeName,d.contains(e)){b=!0;break a}if("body"===e)break}b=!1}return b?a:(a===a.ownerDocument.documentElement&&(a=a.ownerDocument.body),c(a))},a.dom.autoLink.URL_REG_EXP=e}(wysihtml5),function(a){var b=a.browser.supportsClassList(),c=a.dom;c.addClass=function(a,d){return b?a.classList.add(d):(c.hasClass(a,d)||(a.className+=" "+d),void 0)},c.removeClass=function(a,c){return b?a.classList.remove(c):(a.className=a.className.replace(RegExp("(^|\\s+)"+c+"(\\s+|$)")," "),void 0)},c.hasClass=function(a,c){if(b)return a.classList.contains(c);var d=a.className;return 0<d.length&&(d==c||RegExp("(^|\\s)"+c+"(\\s|$)").test(d))}}(wysihtml5),wysihtml5.dom.contains=function(){var a=document.documentElement;return a.contains?function(a,b){return b.nodeType!==wysihtml5.ELEMENT_NODE&&(b=b.parentNode),a!==b&&a.contains(b)}:a.compareDocumentPosition?function(a,b){return!!(16&a.compareDocumentPosition(b))}:void 0}(),wysihtml5.dom.convertToList=function(){function a(a,b){var c=a.createElement("li");return b.appendChild(c),c}return function(b,c){if("UL"===b.nodeName||"OL"===b.nodeName||"MENU"===b.nodeName)return b;var d,e,f,g,h,i=b.ownerDocument,j=i.createElement(c),k=b.querySelectorAll("br"),l=k.length;for(h=0;l>h;h++)for(d=k[h];(e=d.parentNode)&&e!==b&&e.lastChild===d;){if("block"===wysihtml5.dom.getStyle("display").from(e)){e.removeChild(d);break}wysihtml5.dom.insert(d).after(d.parentNode)}for(k=wysihtml5.lang.array(b.childNodes).get(),l=k.length,h=0;l>h;h++)g=g||a(i,j),d=k[h],e="block"===wysihtml5.dom.getStyle("display").from(d),f="BR"===d.nodeName,e?(g=g.firstChild?a(i,j):g,g.appendChild(d),g=null):f?g=g.firstChild?null:g:g.appendChild(d);return b.parentNode.replaceChild(j,b),j}}(),wysihtml5.dom.copyAttributes=function(a){return{from:function(b){return{to:function(c){for(var d,e=0,f=a.length;f>e;e++)d=a[e],"undefined"!=typeof b[d]&&""!==b[d]&&(c[d]=b[d]);return{andTo:arguments.callee}}}}}},function(a){var b=["-webkit-box-sizing","-moz-box-sizing","-ms-box-sizing","box-sizing"],c=function(c){var d;a:for(var e=0,f=b.length;f>e;e++)if("border-box"===a.getStyle(b[e]).from(c)){d=b[e];break a}return d?parseInt(a.getStyle("width").from(c),10)<c.offsetWidth:!1};a.copyStyles=function(d){return{from:function(e){c(e)&&(d=wysihtml5.lang.array(d).without(b));for(var f,g="",h=d.length,i=0;h>i;i++)f=d[i],g+=f+":"+a.getStyle(f).from(e)+";";return{to:function(b){return a.setStyles(g).on(b),{andTo:arguments.callee}}}}}}}(wysihtml5.dom),function(a){a.dom.delegate=function(b,c,d,e){return a.dom.observe(b,d,function(d){for(var f=d.target,g=a.lang.array(b.querySelectorAll(c));f&&f!==b;){if(g.contains(f)){e.call(f,d);break}f=f.parentNode}})}}(wysihtml5),wysihtml5.dom.getAsDom=function(){var a="abbr article aside audio bdi canvas command datalist details figcaption figure footer header hgroup keygen mark meter nav output progress rp rt ruby svg section source summary time track video wbr".split(" ");return function(b,c){var d,c=c||document;if("object"==typeof b&&b.nodeType)d=c.createElement("div"),d.appendChild(b);else if(wysihtml5.browser.supportsHTML5Tags(c))d=c.createElement("div"),d.innerHTML=b;else{if(d=c,!d._wysihtml5_supportsHTML5Tags){for(var e=0,f=a.length;f>e;e++)d.createElement(a[e]);d._wysihtml5_supportsHTML5Tags=!0}d=c,e=d.createElement("div"),e.style.display="none",d.body.appendChild(e);try{e.innerHTML=b}catch(g){}d.body.removeChild(e),d=e}return d}}(),wysihtml5.dom.getParentElement=function(){function a(a,b){return b&&b.length?"string"==typeof b?a===b:wysihtml5.lang.array(b).contains(a):!0}return function(b,c,d){if(d=d||50,c.className||c.classRegExp){a:{for(var e=c.nodeName,f=c.className,c=c.classRegExp;d--&&b&&"BODY"!==b.nodeName;){var g;if((g=b.nodeType===wysihtml5.ELEMENT_NODE)&&(g=a(b.nodeName,e))){g=f;var h=(b.className||"").match(c)||[];g=g?h[h.length-1]===g:!!h.length}if(g)break a;b=b.parentNode}b=null}return b}a:{for(e=c.nodeName,f=d;f--&&b&&"BODY"!==b.nodeName;){if(a(b.nodeName,e))break a;b=b.parentNode}b=null}return b}}(),wysihtml5.dom.getStyle=function(){function a(a){return a.replace(c,function(a){return a.charAt(1).toUpperCase()})}var b={"float":"styleFloat"in document.createElement("div").style?"styleFloat":"cssFloat"},c=/\-[a-z]/g;return function(c){return{from:function(d){if(d.nodeType===wysihtml5.ELEMENT_NODE){var e=d.ownerDocument,f=b[c]||a(c),g=d.style,h=d.currentStyle,i=g[f];if(i)return i;if(h)try{return h[f]}catch(j){}var k,f=e.defaultView||e.parentWindow,e=("height"===c||"width"===c)&&"TEXTAREA"===d.nodeName;if(f.getComputedStyle)return e&&(k=g.overflow,g.overflow="hidden"),d=f.getComputedStyle(d,null).getPropertyValue(c),e&&(g.overflow=k||""),d}}}}}(),wysihtml5.dom.hasElementWithTagName=function(){var a={},b=1;return function(c,d){var e=(c._wysihtml5_identifier||(c._wysihtml5_identifier=b++))+":"+d,f=a[e];return f||(f=a[e]=c.getElementsByTagName(d)),0<f.length}}(),function(a){var b={},c=1;a.dom.hasElementWithClassName=function(d,e){if(!a.browser.supportsNativeGetElementsByClassName())return!!d.querySelector("."+e);var f=(d._wysihtml5_identifier||(d._wysihtml5_identifier=c++))+":"+e,g=b[f];return g||(g=b[f]=d.getElementsByClassName(e)),0<g.length}}(wysihtml5),wysihtml5.dom.insert=function(a){return{after:function(b){b.parentNode.insertBefore(a,b.nextSibling)},before:function(b){b.parentNode.insertBefore(a,b)},into:function(b){b.appendChild(a)}}},wysihtml5.dom.insertCSS=function(a){return a=a.join("\n"),{into:function(b){var c=b.head||b.getElementsByTagName("head")[0],d=b.createElement("style");d.type="text/css",d.styleSheet?d.styleSheet.cssText=a:d.appendChild(b.createTextNode(a)),c&&c.appendChild(d)}}},wysihtml5.dom.observe=function(a,b,c){for(var d,e,b="string"==typeof b?[b]:b,f=0,g=b.length;g>f;f++)e=b[f],a.addEventListener?a.addEventListener(e,c,!1):(d=function(b){"target"in b||(b.target=b.srcElement),b.preventDefault=b.preventDefault||function(){this.returnValue=!1},b.stopPropagation=b.stopPropagation||function(){this.cancelBubble=!0},c.call(a,b)},a.attachEvent("on"+e,d));return{stop:function(){for(var e,f=0,g=b.length;g>f;f++)e=b[f],a.removeEventListener?a.removeEventListener(e,c,!1):a.detachEvent("on"+e,d)}}},wysihtml5.dom.parse=function(){function a(b,e){var f,g=b.childNodes,h=g.length;f=c[b.nodeType];var i=0;if(f=f&&f(b),!f)return null;for(i=0;h>i;i++)(newChild=a(g[i],e))&&f.appendChild(newChild);return e&&1>=f.childNodes.length&&f.nodeName.toLowerCase()===d&&!f.attributes.length?f.firstChild:f}function b(a,b){var c,b=b.toLowerCase();if((c="IMG"==a.nodeName)&&(c="src"==b)){var d;try{d=a.complete&&!a.mozMatchesSelector(":-moz-broken")}catch(e){a.complete&&"complete"===a.readyState&&(d=!0)}c=!0===d}return c?a.src:h&&"outerHTML"in a?-1!=a.outerHTML.toLowerCase().indexOf(" "+b+"=")?a.getAttribute(b):null:a.getAttribute(b)}var c={1:function(a){var c,f,h=g.tags;if(f=a.nodeName.toLowerCase(),c=a.scopeName,a._wysihtml5)return null;if(a._wysihtml5=1,"wysihtml5-temp"===a.className)return null;if(c&&"HTML"!=c&&(f=c+":"+f),"outerHTML"in a&&!wysihtml5.browser.autoClosesUnclosedTags()&&"P"===a.nodeName&&"</p>"!==a.outerHTML.slice(-4).toLowerCase()&&(f="div"),f in h){if(c=h[f],!c||c.remove)return null;c="string"==typeof c?{rename_tag:c}:c}else{if(!a.firstChild)return null;c={rename_tag:d}}f=a.ownerDocument.createElement(c.rename_tag||f);var h={},k=c.set_class,l=c.add_class,m=c.set_attributes,n=c.check_attributes,o=g.classes,p=0,q=[];c=[];var r,s=[],t=[];if(m&&(h=wysihtml5.lang.object(m).clone()),n)for(r in n)(m=i[n[r]])&&(m=m(b(a,r)),"string"==typeof m&&(h[r]=m));if(k&&q.push(k),l)for(r in l)(m=j[l[r]])&&(k=m(b(a,r)),"string"==typeof k&&q.push(k));for(o["_wysihtml5-temp-placeholder"]=1,(t=a.getAttribute("class"))&&(q=q.concat(t.split(e))),l=q.length;l>p;p++)a=q[p],o[a]&&c.push(a);for(o=c.length;o--;)a=c[o],wysihtml5.lang.array(s).contains(a)||s.unshift(a);s.length&&(h["class"]=s.join(" "));for(r in h)try{f.setAttribute(r,h[r])}catch(u){}return h.src&&("undefined"!=typeof h.width&&f.setAttribute("width",h.width),"undefined"!=typeof h.height&&f.setAttribute("height",h.height)),f},3:function(a){return a.ownerDocument.createTextNode(a.data)}},d="span",e=/\s+/,f={tags:{},classes:{}},g={},h=!wysihtml5.browser.supportsGetAttributeCorrectly(),i={url:function(){var a=/^https?:\/\//i;return function(b){return b&&b.match(a)?b.replace(a,function(a){return a.toLowerCase()}):null}}(),alt:function(){var a=/[^ a-z0-9_\-]/gi;return function(b){return b?b.replace(a,""):""}}(),numbers:function(){var a=/\D/g;return function(b){return(b=(b||"").replace(a,""))||null}}()},j={align_img:function(){var a={left:"wysiwyg-float-left",right:"wysiwyg-float-right"};return function(b){return a[(""+b).toLowerCase()]}}(),align_text:function(){var a={left:"wysiwyg-text-align-left",right:"wysiwyg-text-align-right",center:"wysiwyg-text-align-center",justify:"wysiwyg-text-align-justify"};return function(b){return a[(""+b).toLowerCase()]}}(),clear_br:function(){var a={left:"wysiwyg-clear-left",right:"wysiwyg-clear-right",both:"wysiwyg-clear-both",all:"wysiwyg-clear-both"};return function(b){return a[(""+b).toLowerCase()]}}(),size_font:function(){var a={1:"wysiwyg-font-size-xx-small",2:"wysiwyg-font-size-small",3:"wysiwyg-font-size-medium",4:"wysiwyg-font-size-large",5:"wysiwyg-font-size-x-large",6:"wysiwyg-font-size-xx-large",7:"wysiwyg-font-size-xx-large","-":"wysiwyg-font-size-smaller","+":"wysiwyg-font-size-larger"};return function(b){return a[(""+b).charAt(0)]}}()};return function(b,c,d,e){wysihtml5.lang.object(g).merge(f).merge(c).get();for(var d=d||b.ownerDocument||document,c=d.createDocumentFragment(),h="string"==typeof b,b=h?wysihtml5.dom.getAsDom(b,d):b;b.firstChild;)d=b.firstChild,b.removeChild(d),(d=a(d,e))&&c.appendChild(d);return b.innerHTML="",b.appendChild(c),h?wysihtml5.quirks.getCorrectInnerHTML(b):b}}(),wysihtml5.dom.removeEmptyTextNodes=function(a){for(var b=wysihtml5.lang.array(a.childNodes).get(),c=b.length,d=0;c>d;d++)a=b[d],a.nodeType===wysihtml5.TEXT_NODE&&""===a.data&&a.parentNode.removeChild(a)},wysihtml5.dom.renameElement=function(a,b){for(var c,d=a.ownerDocument.createElement(b);c=a.firstChild;)d.appendChild(c);return wysihtml5.dom.copyAttributes(["align","className"]).from(a).to(d),a.parentNode.replaceChild(d,a),d},wysihtml5.dom.replaceWithChildNodes=function(a){if(a.parentNode)if(a.firstChild){for(var b=a.ownerDocument.createDocumentFragment();a.firstChild;)b.appendChild(a.firstChild);a.parentNode.replaceChild(b,a)}else a.parentNode.removeChild(a)},function(a){function b(a){var b=a.ownerDocument.createElement("br");a.appendChild(b)}a.resolveList=function(c){if("MENU"===c.nodeName||"UL"===c.nodeName||"OL"===c.nodeName){var d,e,f,g=c.ownerDocument.createDocumentFragment(),h=c.previousElementSibling||c.previousSibling;for(h&&"block"!==a.getStyle("display").from(h)&&b(g);f=c.firstChild;){for(d=f.lastChild;h=f.firstChild;)e=(e=h===d)&&"block"!==a.getStyle("display").from(h)&&"BR"!==h.nodeName,g.appendChild(h),e&&b(g);f.parentNode.removeChild(f)}c.parentNode.replaceChild(g,c)}}}(wysihtml5.dom),function(a){var b=document,c="parent top opener frameElement frames localStorage globalStorage sessionStorage indexedDB".split(" "),d="open close openDialog showModalDialog alert confirm prompt openDatabase postMessage XMLHttpRequest XDomainRequest".split(" "),e=["referrer","write","open","close"];a.dom.Sandbox=Base.extend({constructor:function(b,c){this.callback=b||a.EMPTY_FUNCTION,this.config=a.lang.object({}).merge(c).get(),this.iframe=this._createIframe()},insertInto:function(a){"string"==typeof a&&(a=b.getElementById(a)),a.appendChild(this.iframe)},getIframe:function(){return this.iframe},getWindow:function(){this._readyError()},getDocument:function(){this._readyError()},destroy:function(){var a=this.getIframe();a.parentNode.removeChild(a)},_readyError:function(){throw Error("wysihtml5.Sandbox: Sandbox iframe isn't loaded yet")},_createIframe:function(){var c=this,d=b.createElement("iframe");return d.className="wysihtml5-sandbox",a.dom.setAttributes({security:"restricted",allowtransparency:"true",frameborder:0,width:0,height:0,marginwidth:0,marginheight:0}).on(d),a.browser.throwsMixedContentWarningWhenIframeSrcIsEmpty()&&(d.src="javascript:'<html></html>'"),d.onload=function(){d.onreadystatechange=d.onload=null,c._onLoadIframe(d)},d.onreadystatechange=function(){/loaded|complete/.test(d.readyState)&&(d.onreadystatechange=d.onload=null,c._onLoadIframe(d))},d},_onLoadIframe:function(f){if(a.dom.contains(b.documentElement,f)){var g=this,h=f.contentWindow,i=f.contentWindow.document,j=this._getHtml({charset:b.characterSet||b.charset||"utf-8",stylesheets:this.config.stylesheets});if(i.open("text/html","replace"),i.write(j),i.close(),this.getWindow=function(){return f.contentWindow},this.getDocument=function(){return f.contentWindow.document},h.onerror=function(a,b,c){throw Error("wysihtml5.Sandbox: "+a,b,c)},!a.browser.supportsSandboxedIframes()){var k,j=0;for(k=c.length;k>j;j++)this._unset(h,c[j]);for(j=0,k=d.length;k>j;j++)this._unset(h,d[j],a.EMPTY_FUNCTION);for(j=0,k=e.length;k>j;j++)this._unset(i,e[j]);this._unset(i,"cookie","",!0)}this.loaded=!0,setTimeout(function(){g.callback(g)},0)}},_getHtml:function(b){var c,d=b.stylesheets,e="",f=0;if(d="string"==typeof d?[d]:d)for(c=d.length;c>f;f++)e+='<link rel="stylesheet" href="'+d[f]+'">';return b.stylesheets=e,a.lang.string('<!DOCTYPE html><html><head><meta charset="#{charset}">#{stylesheets}</head><body></body></html>').interpolate(b)},_unset:function(b,c,d,e){try{b[c]=d}catch(f){}try{b.__defineGetter__(c,function(){return d})}catch(g){}if(e)try{b.__defineSetter__(c,function(){})}catch(h){}if(!a.browser.crashesWhenDefineProperty(c))try{var i={get:function(){return d}};e&&(i.set=function(){}),Object.defineProperty(b,c,i)}catch(j){}}})}(wysihtml5),function(){var a={className:"class"};wysihtml5.dom.setAttributes=function(b){return{on:function(c){for(var d in b)c.setAttribute(a[d]||d,b[d])}}}}(),wysihtml5.dom.setStyles=function(a){return{on:function(b){if(b=b.style,"string"==typeof a)b.cssText+=";"+a;else for(var c in a)"float"===c?(b.cssFloat=a[c],b.styleFloat=a[c]):b[c]=a[c]}}},function(a){a.simulatePlaceholder=function(b,c,d){var e=function(){c.hasPlaceholderSet()&&c.clear(),a.removeClass(c.element,"placeholder")},f=function(){c.isEmpty()&&(c.setValue(d),a.addClass(c.element,"placeholder"))};b.observe("set_placeholder",f).observe("unset_placeholder",e).observe("focus:composer",e).observe("paste:composer",e).observe("blur:composer",f),f()}}(wysihtml5.dom),function(a){var b=document.documentElement;"textContent"in b?(a.setTextContent=function(a,b){a.textContent=b},a.getTextContent=function(a){return a.textContent}):"innerText"in b?(a.setTextContent=function(a,b){a.innerText=b},a.getTextContent=function(a){return a.innerText}):(a.setTextContent=function(a,b){a.nodeValue=b},a.getTextContent=function(a){return a.nodeValue})}(wysihtml5.dom),wysihtml5.quirks.cleanPastedHTML=function(){var a={"a u":wysihtml5.dom.replaceWithChildNodes};return function(b,c,d){var e,f,g,c=c||a,d=d||b.ownerDocument||document,h="string"==typeof b,i=0,b=h?wysihtml5.dom.getAsDom(b,d):b;for(g in c)for(e=b.querySelectorAll(g),d=c[g],f=e.length;f>i;i++)d(e[i]);return h?b.innerHTML:b}}(),function(a){var b=a.dom;a.quirks.ensureProperClearing=function(){var a=function(){var a=this;setTimeout(function(){var b=a.innerHTML.toLowerCase();("<p>&nbsp;</p>"==b||"<p>&nbsp;</p><p>&nbsp;</p>"==b)&&(a.innerHTML="")
},0)};return function(c){b.observe(c.element,["cut","keydown"],a)}}(),a.quirks.ensureProperClearingOfLists=function(){var c=["OL","UL","MENU"];return function(d){b.observe(d.element,"keydown",function(e){if(e.keyCode===a.BACKSPACE_KEY){var f=d.selection.getSelectedNode(),e=d.element;e.firstChild&&a.lang.array(c).contains(e.firstChild.nodeName)&&(f=b.getParentElement(f,{nodeName:c}))&&f==e.firstChild&&1>=f.childNodes.length&&(f.firstChild?""===f.firstChild.innerHTML:1)&&f.parentNode.removeChild(f)}})}}()}(wysihtml5),function(a){a.quirks.getCorrectInnerHTML=function(b){var c=b.innerHTML;if(-1===c.indexOf("%7E"))return c;var d,e,f,g,b=b.querySelectorAll("[href*='~'], [src*='~']");for(g=0,f=b.length;f>g;g++)d=b[g].href||b[g].src,e=a.lang.string(d).replace("~").by("%7E"),c=a.lang.string(c).replace(e).by(d);return c}}(wysihtml5),function(a){var b=a.dom,c="LI P H1 H2 H3 H4 H5 H6".split(" "),d=["UL","OL","MENU"];a.quirks.insertLineBreakOnReturn=function(e){function f(c){if(c=b.getParentElement(c,{nodeName:["P","DIV"]},2)){var d=document.createTextNode(a.INVISIBLE_SPACE);b.insert(d).before(c),b.replaceWithChildNodes(c),e.selection.selectNode(d)}}b.observe(e.element.ownerDocument,"keydown",function(g){var h=g.keyCode;if(!(g.shiftKey||h!==a.ENTER_KEY&&h!==a.BACKSPACE_KEY)){var i=e.selection.getSelectedNode();(i=b.getParentElement(i,{nodeName:c},4))?"LI"!==i.nodeName||h!==a.ENTER_KEY&&h!==a.BACKSPACE_KEY?i.nodeName.match(/H[1-6]/)&&h===a.ENTER_KEY&&setTimeout(function(){f(e.selection.getSelectedNode())},0):setTimeout(function(){var a,c=e.selection.getSelectedNode();c&&((a=b.getParentElement(c,{nodeName:d},2))||f(c))},0):h===a.ENTER_KEY&&!a.browser.insertsLineBreaksOnReturn()&&(e.commands.exec("insertLineBreak"),g.preventDefault())}})}}(wysihtml5),function(a){a.quirks.redraw=function(b){a.dom.addClass(b,"wysihtml5-quirks-redraw"),a.dom.removeClass(b,"wysihtml5-quirks-redraw");try{var c=b.ownerDocument;c.execCommand("italic",!1,null),c.execCommand("italic",!1,null)}catch(d){}}}(wysihtml5),function(a){var b=a.dom;a.Selection=Base.extend({constructor:function(a){window.rangy.init(),this.editor=a,this.composer=a.composer,this.doc=this.composer.doc},getBookmark:function(){var a=this.getRange();return a&&a.cloneRange()},setBookmark:function(a){a&&this.setSelection(a)},setBefore:function(a){var b=rangy.createRange(this.doc);return b.setStartBefore(a),b.setEndBefore(a),this.setSelection(b)},setAfter:function(a){var b=rangy.createRange(this.doc);return b.setStartAfter(a),b.setEndAfter(a),this.setSelection(b)},selectNode:function(c){var d=rangy.createRange(this.doc),e=c.nodeType===a.ELEMENT_NODE,f="canHaveHTML"in c?c.canHaveHTML:"IMG"!==c.nodeName,g=e?c.innerHTML:c.data,g=""===g||g===a.INVISIBLE_SPACE,h=b.getStyle("display").from(c),h="block"===h||"list-item"===h;if(g&&e&&f)try{c.innerHTML=a.INVISIBLE_SPACE}catch(i){}f?d.selectNodeContents(c):d.selectNode(c),f&&g&&e?d.collapse(h):f&&g&&(d.setStartAfter(c),d.setEndAfter(c)),this.setSelection(d)},getSelectedNode:function(a){return a&&this.doc.selection&&"Control"===this.doc.selection.type&&(a=this.doc.selection.createRange())&&a.length?a.item(0):(a=this.getSelection(this.doc),a.focusNode===a.anchorNode?a.focusNode:(a=this.getRange(this.doc))?a.commonAncestorContainer:this.doc.body)},executeAndRestore:function(b,c){var d=this.doc.body,e=c&&d.scrollTop,f=c&&d.scrollLeft,g='<span class="_wysihtml5-temp-placeholder">'+a.INVISIBLE_SPACE+"</span>",h=this.getRange(this.doc);if(h){g=h.createContextualFragment(g),h.insertNode(g);try{b(h.startContainer,h.endContainer)}catch(i){setTimeout(function(){throw i},0)}(caretPlaceholder=this.doc.querySelector("._wysihtml5-temp-placeholder"))?(h=rangy.createRange(this.doc),h.selectNode(caretPlaceholder),h.deleteContents(),this.setSelection(h)):d.focus(),c&&(d.scrollTop=e,d.scrollLeft=f);try{caretPlaceholder.parentNode.removeChild(caretPlaceholder)}catch(j){}}else b(d,d)},executeAndRestoreSimple:function(a){var b,c,d,e=this.getRange(),f=this.doc.body;if(e){b=e.getNodes([3]),f=b[0]||e.startContainer,d=b[b.length-1]||e.endContainer,b=f===e.startContainer?e.startOffset:0,c=d===e.endContainer?e.endOffset:d.length;try{a(e.startContainer,e.endContainer)}catch(g){setTimeout(function(){throw g},0)}a=rangy.createRange(this.doc);try{a.setStart(f,b)}catch(h){}try{a.setEnd(d,c)}catch(i){}try{this.setSelection(a)}catch(j){}}else a(f,f)},insertHTML:function(a){var a=rangy.createRange(this.doc).createContextualFragment(a),b=a.lastChild;this.insertNode(a),b&&this.setAfter(b)},insertNode:function(a){var b=this.getRange();b&&b.insertNode(a)},surround:function(a){var b=this.getRange();if(b)try{b.surroundContents(a),this.selectNode(a)}catch(c){a.appendChild(b.extractContents()),b.insertNode(a)}},scrollIntoView:function(){var b,c=this.doc,d=c.documentElement.scrollHeight>c.documentElement.offsetHeight;if((b=c._wysihtml5ScrollIntoViewElement)||(b=c.createElement("span"),b.innerHTML=a.INVISIBLE_SPACE),b=c._wysihtml5ScrollIntoViewElement=b,d){this.insertNode(b);var d=b,e=0;if(d.parentNode)do e+=d.offsetTop||0,d=d.offsetParent;while(d);d=e,b.parentNode.removeChild(b),d>c.body.scrollTop&&(c.body.scrollTop=d)}},selectLine:function(){a.browser.supportsSelectionModify()?this._selectLine_W3C():this.doc.selection&&this._selectLine_MSIE()},_selectLine_W3C:function(){var a=this.doc.defaultView.getSelection();a.modify("extend","left","lineboundary"),a.modify("extend","right","lineboundary")},_selectLine_MSIE:function(){var a,b=this.doc.selection.createRange(),c=b.boundingTop,d=this.doc.body.scrollWidth;if(b.moveToPoint){for(0===c&&(a=this.doc.createElement("span"),this.insertNode(a),c=a.offsetTop,a.parentNode.removeChild(a)),c+=1,a=-10;d>a;a+=2)try{b.moveToPoint(a,c);break}catch(e){}for(a=this.doc.selection.createRange();d>=0;d--)try{a.moveToPoint(d,c);break}catch(f){}b.setEndPoint("EndToEnd",a),b.select()}},getText:function(){var a=this.getSelection();return a?a.toString():""},getNodes:function(a,b){var c=this.getRange();return c?c.getNodes([a],b):[]},getRange:function(){var a=this.getSelection();return a&&a.rangeCount&&a.getRangeAt(0)},getSelection:function(){return rangy.getSelection(this.doc.defaultView||this.doc.parentWindow)},setSelection:function(a){return rangy.getSelection(this.doc.defaultView||this.doc.parentWindow).setSingleRange(a)}})}(wysihtml5),function(a,b){function c(a,c){return b.dom.isCharacterDataNode(a)?0==c?!!a.previousSibling:c==a.length?!!a.nextSibling:!0:c>0&&c<a.childNodes.length}function d(a,c,e){var f;if(b.dom.isCharacterDataNode(c)&&(0==e?(e=b.dom.getNodeIndex(c),c=c.parentNode):e==c.length?(e=b.dom.getNodeIndex(c)+1,c=c.parentNode):f=b.dom.splitDataNode(c,e)),!f){f=c.cloneNode(!1),f.id&&f.removeAttribute("id");for(var g;g=c.childNodes[e];)f.appendChild(g);b.dom.insertAfter(f,c)}return c==a?f:d(a,f.parentNode,b.dom.getNodeIndex(f))}function e(b){this.firstTextNode=(this.isElementMerge=b.nodeType==a.ELEMENT_NODE)?b.lastChild:b,this.textNodes=[this.firstTextNode]}function f(a,b,c,d){this.tagNames=a||[g],this.cssClass=b||"",this.similarClassRegExp=c,this.normalize=d,this.applyToAnyTagName=!1}var g="span",h=/\s+/g;e.prototype={doMerge:function(){for(var a,b,c=[],d=0,e=this.textNodes.length;e>d;++d)a=this.textNodes[d],b=a.parentNode,c[d]=a.data,d&&(b.removeChild(a),b.hasChildNodes()||b.parentNode.removeChild(b));return this.firstTextNode.data=c=c.join("")},getLength:function(){for(var a=this.textNodes.length,b=0;a--;)b+=this.textNodes[a].length;return b},toString:function(){for(var a=[],b=0,c=this.textNodes.length;c>b;++b)a[b]="'"+this.textNodes[b].data+"'";return"[Merge("+a.join(",")+")]"}},f.prototype={getAncestorWithClass:function(c){for(var d;c;){if(this.cssClass)if(d=this.cssClass,c.className){var e=c.className.match(this.similarClassRegExp)||[];d=e[e.length-1]===d}else d=!1;else d=!0;if(c.nodeType==a.ELEMENT_NODE&&b.dom.arrayContains(this.tagNames,c.tagName.toLowerCase())&&d)return c;c=c.parentNode}return!1},postApply:function(a,b){for(var c,d,f,g=a[0],h=a[a.length-1],i=[],j=g,k=h,l=0,m=h.length,n=0,o=a.length;o>n;++n)d=a[n],(f=this.getAdjacentMergeableTextNode(d.parentNode,!1))?(c||(c=new e(f),i.push(c)),c.textNodes.push(d),d===g&&(j=c.firstTextNode,l=j.length),d===h&&(k=c.firstTextNode,m=c.getLength())):c=null;if((g=this.getAdjacentMergeableTextNode(h.parentNode,!0))&&(c||(c=new e(h),i.push(c)),c.textNodes.push(g)),i.length){for(n=0,o=i.length;o>n;++n)i[n].doMerge();b.setStart(j,l),b.setEnd(k,m)}},getAdjacentMergeableTextNode:function(b,c){var d=b.nodeType==a.TEXT_NODE,e=d?b.parentNode:b,f=c?"nextSibling":"previousSibling";if(d){if((d=b[f])&&d.nodeType==a.TEXT_NODE)return d}else if((d=e[f])&&this.areElementsMergeable(b,d))return d[c?"firstChild":"lastChild"];return null},areElementsMergeable:function(a,c){var d;if((d=b.dom.arrayContains(this.tagNames,(a.tagName||"").toLowerCase()))&&(d=b.dom.arrayContains(this.tagNames,(c.tagName||"").toLowerCase()))&&(d=a.className.replace(h," ")==c.className.replace(h," ")))a:if(a.attributes.length!=c.attributes.length)d=!1;else{d=0;for(var e,f,g=a.attributes.length;g>d;++d)if(e=a.attributes[d],f=e.name,"class"!=f&&(f=c.attributes.getNamedItem(f),e.specified!=f.specified||e.specified&&e.nodeValue!==f.nodeValue)){d=!1;break a}d=!0}return d},createContainer:function(a){return a=a.createElement(this.tagNames[0]),this.cssClass&&(a.className=this.cssClass),a},applyToTextNode:function(a){var c=a.parentNode;1==c.childNodes.length&&b.dom.arrayContains(this.tagNames,c.tagName.toLowerCase())?this.cssClass&&(a=this.cssClass,c.className?(c.className&&(c.className=c.className.replace(this.similarClassRegExp,"")),c.className+=" "+a):c.className=a):(c=this.createContainer(b.dom.getDocument(a)),a.parentNode.insertBefore(c,a),c.appendChild(a))},isRemovable:function(c){return b.dom.arrayContains(this.tagNames,c.tagName.toLowerCase())&&a.lang.string(c.className).trim()==this.cssClass},undoToTextNode:function(a,b,e){if(b.containsNode(e)||(a=b.cloneRange(),a.selectNode(e),a.isPointInRange(b.endContainer,b.endOffset)&&c(b.endContainer,b.endOffset)&&(d(e,b.endContainer,b.endOffset),b.setEndAfter(e)),a.isPointInRange(b.startContainer,b.startOffset)&&c(b.startContainer,b.startOffset)&&(e=d(e,b.startContainer,b.startOffset))),this.similarClassRegExp&&e.className&&(e.className=e.className.replace(this.similarClassRegExp,"")),this.isRemovable(e)){for(b=e,e=b.parentNode;b.firstChild;)e.insertBefore(b.firstChild,b);e.removeChild(b)}},applyToRange:function(b){var c=b.getNodes([a.TEXT_NODE]);if(!c.length)try{var d=this.createContainer(b.endContainer.ownerDocument);return b.surroundContents(d),this.selectNode(b,d),void 0}catch(e){}if(b.splitBoundaries(),c=b.getNodes([a.TEXT_NODE]),c.length){for(var f=0,g=c.length;g>f;++f)d=c[f],this.getAncestorWithClass(d)||this.applyToTextNode(d);b.setStart(c[0],0),d=c[c.length-1],b.setEnd(d,d.length),this.normalize&&this.postApply(c,b)}},undoToRange:function(b){var c,d,e=b.getNodes([a.TEXT_NODE]);e.length?(b.splitBoundaries(),e=b.getNodes([a.TEXT_NODE])):(e=b.endContainer.ownerDocument.createTextNode(a.INVISIBLE_SPACE),b.insertNode(e),b.selectNode(e),e=[e]);for(var f=0,g=e.length;g>f;++f)c=e[f],(d=this.getAncestorWithClass(c))&&this.undoToTextNode(c,b,d);1==g?this.selectNode(b,e[0]):(b.setStart(e[0],0),c=e[e.length-1],b.setEnd(c,c.length),this.normalize&&this.postApply(e,b))},selectNode:function(b,c){var d=c.nodeType===a.ELEMENT_NODE,e="canHaveHTML"in c?c.canHaveHTML:!0,f=d?c.innerHTML:c.data;if((f=""===f||f===a.INVISIBLE_SPACE)&&d&&e)try{c.innerHTML=a.INVISIBLE_SPACE}catch(g){}b.selectNodeContents(c),f&&d?b.collapse(!1):f&&(b.setStartAfter(c),b.setEndAfter(c))},getTextSelectedByRange:function(a,b){var c=b.cloneRange();c.selectNodeContents(a);var d=c.intersection(b),d=d?d.toString():"";return c.detach(),d},isAppliedToRange:function(b){var c,d=[],e=b.getNodes([a.TEXT_NODE]);if(!e.length)return(c=this.getAncestorWithClass(b.startContainer))?[c]:!1;for(var f,g=0,h=e.length;h>g;++g){if(f=this.getTextSelectedByRange(e[g],b),c=this.getAncestorWithClass(e[g]),""!=f&&!c)return!1;d.push(c)}return d},toggleRange:function(a){this.isAppliedToRange(a)?this.undoToRange(a):this.applyToRange(a)}},a.selection.HTMLApplier=f}(wysihtml5,rangy),wysihtml5.Commands=Base.extend({constructor:function(a){this.editor=a,this.composer=a.composer,this.doc=this.composer.doc},support:function(a){return wysihtml5.browser.supportsCommand(this.doc,a)},exec:function(a,b){var c=wysihtml5.commands[a],d=wysihtml5.lang.array(arguments).get(),e=c&&c.exec,f=null;if(this.editor.fire("beforecommand:composer"),e)d.unshift(this.composer),f=e.apply(c,d);else try{f=this.doc.execCommand(a,!1,b)}catch(g){}return this.editor.fire("aftercommand:composer"),f},state:function(a){var b=wysihtml5.commands[a],c=wysihtml5.lang.array(arguments).get(),d=b&&b.state;if(d)return c.unshift(this.composer),d.apply(b,c);try{return this.doc.queryCommandState(a)}catch(e){return!1}},value:function(a){var b=wysihtml5.commands[a],c=b&&b.value;if(c)return c.call(b,this.composer,a);try{return this.doc.queryCommandValue(a)}catch(d){return null}}}),function(a){a.commands.bold={exec:function(b,c){return a.commands.formatInline.exec(b,c,"b")},state:function(b,c){return a.commands.formatInline.state(b,c,"b")},value:function(){}}}(wysihtml5),function(a){function b(b,f){var g,h,i,j=b.doc,k="_wysihtml5-temp-"+ +new Date,l=0;for(a.commands.formatInline.exec(b,c,d,k,/non-matching-class/g),g=j.querySelectorAll(d+"."+k),k=g.length;k>l;l++)for(i in h=g[l],h.removeAttribute("class"),f)h.setAttribute(i,f[i]);l=h,1===k&&(i=e.getTextContent(h),k=!!h.querySelector("*"),i=""===i||i===a.INVISIBLE_SPACE,!k&&i&&(e.setTextContent(h,f.text||h.href),j=j.createTextNode(" "),b.selection.setAfter(h),b.selection.insertNode(j),l=j)),b.selection.setAfter(l)}var c,d="A",e=a.dom;a.commands.createLink={exec:function(a,c,d){var f=this.state(a,c);f?a.selection.executeAndRestore(function(){for(var a,b,c,d=f.length,g=0;d>g;g++)a=f[g],b=e.getParentElement(a,{nodeName:"code"}),c=e.getTextContent(a),c.match(e.autoLink.URL_REG_EXP)&&!b?e.renameElement(a,"code"):e.replaceWithChildNodes(a)}):(d="object"==typeof d?d:{href:d},b(a,d))},state:function(b,c){return a.commands.formatInline.state(b,c,"A")},value:function(){return c}}}(wysihtml5),function(a){var b=/wysiwyg-font-size-[a-z\-]+/g;a.commands.fontSize={exec:function(c,d,e){return a.commands.formatInline.exec(c,d,"span","wysiwyg-font-size-"+e,b)},state:function(c,d,e){return a.commands.formatInline.state(c,d,"span","wysiwyg-font-size-"+e,b)},value:function(){}}}(wysihtml5),function(a){var b=/wysiwyg-color-[a-z]+/g;a.commands.foreColor={exec:function(c,d,e){return a.commands.formatInline.exec(c,d,"span","wysiwyg-color-"+e,b)},state:function(c,d,e){return a.commands.formatInline.state(c,d,"span","wysiwyg-color-"+e,b)},value:function(){}}}(wysihtml5),function(a){function b(b){for(b=b.previousSibling;b&&b.nodeType===a.TEXT_NODE&&!a.lang.string(b.data).trim();)b=b.previousSibling;return b}function c(b){for(b=b.nextSibling;b&&b.nodeType===a.TEXT_NODE&&!a.lang.string(b.data).trim();)b=b.nextSibling;return b}function d(a){return"BR"===a.nodeName||"block"===g.getStyle("display").from(a)?!0:!1}function e(b,c,d,e){if(e)var f=g.observe(b,"DOMNodeInserted",function(b){var c,b=b.target;b.nodeType===a.ELEMENT_NODE&&(c=g.getStyle("display").from(b),"inline"!==c.substr(0,6)&&(b.className+=" "+e))});b.execCommand(c,!1,d),f&&f.stop()}function f(a,d){a.selection.selectLine(),a.selection.surround(d);var e=c(d),f=b(d);e&&"BR"===e.nodeName&&e.parentNode.removeChild(e),f&&"BR"===f.nodeName&&f.parentNode.removeChild(f),(e=d.lastChild)&&"BR"===e.nodeName&&e.parentNode.removeChild(e),a.selection.selectNode(d)}var g=a.dom,h="H1 H2 H3 H4 H5 H6 P BLOCKQUOTE DIV".split(" ");a.commands.formatBlock={exec:function(i,j,k,l,m){var n,o=i.doc,p=this.state(i,j,k,l,m),k="string"==typeof k?k.toUpperCase():k;if(p)i.selection.executeAndRestoreSimple(function(){m&&(p.className=p.className.replace(m,""));var e=!!a.lang.string(p.className).trim();if(e||p.nodeName!==(k||"DIV"))e&&g.renameElement(p,"DIV");else{var e=p,f=e.ownerDocument,h=c(e),i=b(e);h&&!d(h)&&e.parentNode.insertBefore(f.createElement("br"),h),i&&!d(i)&&e.parentNode.insertBefore(f.createElement("br"),e),g.replaceWithChildNodes(p)}});else{if((null===k||a.lang.array(h).contains(k))&&(n=i.selection.getSelectedNode(),p=g.getParentElement(n,{nodeName:h})))return i.selection.executeAndRestoreSimple(function(){if(k&&(p=g.renameElement(p,k)),l){var a=p;a.className?(a.className=a.className.replace(m,""),a.className+=" "+l):a.className=l}}),void 0;i.commands.support(j)?e(o,j,k||"DIV",l):(p=o.createElement(k||"DIV"),l&&(p.className=l),f(i,p))}},state:function(a,b,c,d,e){return c="string"==typeof c?c.toUpperCase():c,a=a.selection.getSelectedNode(),g.getParentElement(a,{nodeName:c,className:d,classRegExp:e})},value:function(){}}}(wysihtml5),function(a){function b(b,e,f){var g=b+":"+e;if(!d[g]){var h=d,i=a.selection.HTMLApplier,j=c[b],b=j?[b.toLowerCase(),j.toLowerCase()]:[b.toLowerCase()];h[g]=new i(b,e,f,!0)}return d[g]}var c={strong:"b",em:"i",b:"strong",i:"em"},d={};a.commands.formatInline={exec:function(a,c,d,e,f){return(c=a.selection.getRange())?(b(d,e,f).toggleRange(c),a.selection.setSelection(c),void 0):!1},state:function(d,e,f,g,h){var e=d.doc,i=c[f]||f;return!a.dom.hasElementWithTagName(e,f)&&!a.dom.hasElementWithTagName(e,i)||g&&!a.dom.hasElementWithClassName(e,g)?!1:(d=d.selection.getRange(),d?b(f,g,h).isAppliedToRange(d):!1)},value:function(){}}}(wysihtml5),function(a){a.commands.insertHTML={exec:function(a,b,c){a.commands.support(b)?a.doc.execCommand(b,!1,c):a.selection.insertHTML(c)},state:function(){return!1},value:function(){}}}(wysihtml5),function(a){a.commands.insertImage={exec:function(b,c,d){var e,d="object"==typeof d?d:{src:d},f=b.doc,c=this.state(b);if(c)b.selection.setBefore(c),d=c.parentNode,d.removeChild(c),a.dom.removeEmptyTextNodes(d),"A"===d.nodeName&&!d.firstChild&&(b.selection.setAfter(d),d.parentNode.removeChild(d)),a.quirks.redraw(b.element);else{c=f.createElement("IMG");for(e in d)c[e]=d[e];b.selection.insertNode(c),a.browser.hasProblemsSettingCaretAfterImg()?(d=f.createTextNode(a.INVISIBLE_SPACE),b.selection.insertNode(d),b.selection.setAfter(d)):b.selection.setAfter(c)}},state:function(b){var c;return a.dom.hasElementWithTagName(b.doc,"IMG")?(c=b.selection.getSelectedNode())?"IMG"===c.nodeName?c:c.nodeType!==a.ELEMENT_NODE?!1:(c=b.selection.getText(),(c=a.lang.string(c).trim())?!1:(b=b.selection.getNodes(a.ELEMENT_NODE,function(a){return"IMG"===a.nodeName}),1!==b.length?!1:b[0])):!1:!1},value:function(a){return(a=this.state(a))&&a.src}}}(wysihtml5),function(a){var b="<br>"+(a.browser.needsSpaceAfterLineBreak()?" ":"");a.commands.insertLineBreak={exec:function(c,d){c.commands.support(d)?(c.doc.execCommand(d,!1,null),a.browser.autoScrollsToCaret()||c.selection.scrollIntoView()):c.commands.exec("insertHTML",b)},state:function(){return!1},value:function(){}}}(wysihtml5),function(a){a.commands.insertOrderedList={exec:function(b,c){var d,e=b.doc,f=b.selection.getSelectedNode(),g=a.dom.getParentElement(f,{nodeName:"OL"}),h=a.dom.getParentElement(f,{nodeName:"UL"}),f="_wysihtml5-temp-"+(new Date).getTime();b.commands.support(c)?e.execCommand(c,!1,null):g?b.selection.executeAndRestoreSimple(function(){a.dom.resolveList(g)}):h?b.selection.executeAndRestoreSimple(function(){a.dom.renameElement(h,"ol")}):(b.commands.exec("formatBlock","div",f),d=e.querySelector("."+f),e=""===d.innerHTML||d.innerHTML===a.INVISIBLE_SPACE,b.selection.executeAndRestoreSimple(function(){g=a.dom.convertToList(d,"ol")}),e&&b.selection.selectNode(g.querySelector("li")))},state:function(b){return b=b.selection.getSelectedNode(),a.dom.getParentElement(b,{nodeName:"OL"})},value:function(){}}}(wysihtml5),function(a){a.commands.insertUnorderedList={exec:function(b,c){var d,e=b.doc,f=b.selection.getSelectedNode(),g=a.dom.getParentElement(f,{nodeName:"UL"}),h=a.dom.getParentElement(f,{nodeName:"OL"}),f="_wysihtml5-temp-"+(new Date).getTime();b.commands.support(c)?e.execCommand(c,!1,null):g?b.selection.executeAndRestoreSimple(function(){a.dom.resolveList(g)}):h?b.selection.executeAndRestoreSimple(function(){a.dom.renameElement(h,"ul")}):(b.commands.exec("formatBlock","div",f),d=e.querySelector("."+f),e=""===d.innerHTML||d.innerHTML===a.INVISIBLE_SPACE,b.selection.executeAndRestoreSimple(function(){g=a.dom.convertToList(d,"ul")}),e&&b.selection.selectNode(g.querySelector("li")))},state:function(b){return b=b.selection.getSelectedNode(),a.dom.getParentElement(b,{nodeName:"UL"})},value:function(){}}}(wysihtml5),function(a){a.commands.italic={exec:function(b,c){return a.commands.formatInline.exec(b,c,"i")},state:function(b,c){return a.commands.formatInline.state(b,c,"i")},value:function(){}}}(wysihtml5),function(a){var b=/wysiwyg-text-align-[a-z]+/g;a.commands.justifyCenter={exec:function(c){return a.commands.formatBlock.exec(c,"formatBlock",null,"wysiwyg-text-align-center",b)},state:function(c){return a.commands.formatBlock.state(c,"formatBlock",null,"wysiwyg-text-align-center",b)},value:function(){}}}(wysihtml5),function(a){var b=/wysiwyg-text-align-[a-z]+/g;a.commands.justifyLeft={exec:function(c){return a.commands.formatBlock.exec(c,"formatBlock",null,"wysiwyg-text-align-left",b)},state:function(c){return a.commands.formatBlock.state(c,"formatBlock",null,"wysiwyg-text-align-left",b)},value:function(){}}}(wysihtml5),function(a){var b=/wysiwyg-text-align-[a-z]+/g;a.commands.justifyRight={exec:function(c){return a.commands.formatBlock.exec(c,"formatBlock",null,"wysiwyg-text-align-right",b)},state:function(c){return a.commands.formatBlock.state(c,"formatBlock",null,"wysiwyg-text-align-right",b)},value:function(){}}}(wysihtml5),function(a){a.commands.underline={exec:function(b,c){return a.commands.formatInline.exec(b,c,"u")},state:function(b,c){return a.commands.formatInline.state(b,c,"u")},value:function(){}}}(wysihtml5),function(a){var b='<span id="_wysihtml5-undo" class="_wysihtml5-temp">'+a.INVISIBLE_SPACE+"</span>",c='<span id="_wysihtml5-redo" class="_wysihtml5-temp">'+a.INVISIBLE_SPACE+"</span>",d=a.dom;a.UndoManager=a.lang.Dispatcher.extend({constructor:function(a){this.editor=a,this.composer=a.composer,this.element=this.composer.element,this.history=[this.composer.getValue()],this.position=1,this.composer.commands.support("insertHTML")&&this._observe()},_observe:function(){var e,f=this,g=this.composer.sandbox.getDocument();if(d.observe(this.element,"keydown",function(a){if(!a.altKey&&(a.ctrlKey||a.metaKey)){var b=a.keyCode,c=90===b&&a.shiftKey||89===b;90!==b||a.shiftKey?c&&(f.redo(),a.preventDefault()):(f.undo(),a.preventDefault())}}),d.observe(this.element,"keydown",function(a){a=a.keyCode,a!==e&&(e=a,(8===a||46===a)&&f.transact())}),a.browser.hasUndoInContextMenu()){var h,i,j=function(){for(var a;a=g.querySelector("._wysihtml5-temp");)a.parentNode.removeChild(a);clearInterval(h)};d.observe(this.element,"contextmenu",function(){j(),f.composer.selection.executeAndRestoreSimple(function(){f.element.lastChild&&f.composer.selection.setAfter(f.element.lastChild),g.execCommand("insertHTML",!1,b),g.execCommand("insertHTML",!1,c),g.execCommand("undo",!1,null)}),h=setInterval(function(){g.getElementById("_wysihtml5-redo")?(j(),f.redo()):g.getElementById("_wysihtml5-undo")||(j(),f.undo())},400),i||(i=!0,d.observe(document,"mousedown",j),d.observe(g,["mousedown","paste","cut","copy"],j))})}this.editor.observe("newword:composer",function(){f.transact()}).observe("beforecommand:composer",function(){f.transact()})},transact:function(){var a=this.history[this.position-1],b=this.composer.getValue();b!=a&&(40<(this.history.length=this.position)&&(this.history.shift(),this.position--),this.position++,this.history.push(b))},undo:function(){this.transact(),1>=this.position||(this.set(this.history[--this.position-1]),this.editor.fire("undo:composer"))},redo:function(){this.position>=this.history.length||(this.set(this.history[++this.position-1]),this.editor.fire("redo:composer"))},set:function(a){this.composer.setValue(a),this.editor.focus(!0)}})}(wysihtml5),wysihtml5.views.View=Base.extend({constructor:function(a,b,c){this.parent=a,this.element=b,this.config=c,this._observeViewChange()},_observeViewChange:function(){var a=this;this.parent.observe("beforeload",function(){a.parent.observe("change_view",function(b){b===a.name?(a.parent.currentView=a,a.show(),setTimeout(function(){a.focus()},0)):a.hide()})})},focus:function(){if(this.element.ownerDocument.querySelector(":focus")!==this.element)try{this.element.focus()}catch(a){}},hide:function(){this.element.style.display="none"},show:function(){this.element.style.display=""},disable:function(){this.element.setAttribute("disabled","disabled")},enable:function(){this.element.removeAttribute("disabled")}}),function(a){var b=a.dom,c=a.browser;a.views.Composer=a.views.View.extend({name:"composer",CARET_HACK:"<br>",constructor:function(a,b,c){this.base(a,b,c),this.textarea=this.parent.textarea,this._initSandbox()},clear:function(){this.element.innerHTML=c.displaysCaretInEmptyContentEditableCorrectly()?"":this.CARET_HACK},getValue:function(b){var c=this.isEmpty()?"":a.quirks.getCorrectInnerHTML(this.element);return b&&(c=this.parent.parse(c)),c=a.lang.string(c).replace(a.INVISIBLE_SPACE).by("")},setValue:function(a,b){b&&(a=this.parent.parse(a)),this.element.innerHTML=a},show:function(){this.iframe.style.display=this._displayStyle||"",this.disable(),this.enable()},hide:function(){this._displayStyle=b.getStyle("display").from(this.iframe),"none"===this._displayStyle&&(this._displayStyle=null),this.iframe.style.display="none"},disable:function(){this.element.removeAttribute("contentEditable"),this.base()},enable:function(){this.element.setAttribute("contentEditable","true"),this.base()},focus:function(b){a.browser.doesAsyncFocus()&&this.hasPlaceholderSet()&&this.clear(),this.base();var c=this.element.lastChild;b&&c&&("BR"===c.nodeName?this.selection.setBefore(this.element.lastChild):this.selection.setAfter(this.element.lastChild))},getTextContent:function(){return b.getTextContent(this.element)},hasPlaceholderSet:function(){return this.getTextContent()==this.textarea.element.getAttribute("placeholder")},isEmpty:function(){var a=this.element.innerHTML;return""===a||a===this.CARET_HACK||this.hasPlaceholderSet()||""===this.getTextContent()&&!this.element.querySelector("blockquote, ul, ol, img, embed, object, table, iframe, svg, video, audio, button, input, select, textarea")},_initSandbox:function(){var a=this;this.sandbox=new b.Sandbox(function(){a._create()},{stylesheets:this.config.stylesheets}),this.iframe=this.sandbox.getIframe();var c=document.createElement("input");c.type="hidden",c.name="_wysihtml5_mode",c.value=1;var d=this.textarea.element;b.insert(this.iframe).after(d),b.insert(c).after(d)},_create:function(){var d=this;this.doc=this.sandbox.getDocument(),this.element=this.doc.body,this.textarea=this.parent.textarea,this.element.innerHTML=this.textarea.getValue(!0),this.enable(),this.selection=new a.Selection(this.parent),this.commands=new a.Commands(this.parent),b.copyAttributes("className spellcheck title lang dir accessKey".split(" ")).from(this.textarea.element).to(this.element),b.addClass(this.element,this.config.composerClassName),this.config.style&&this.style(),this.observe();var e=this.config.name;e&&(b.addClass(this.element,e),b.addClass(this.iframe,e)),(e="string"==typeof this.config.placeholder?this.config.placeholder:this.textarea.element.getAttribute("placeholder"))&&b.simulatePlaceholder(this.parent,this,e),this.commands.exec("styleWithCSS",!1),this._initAutoLinking(),this._initObjectResizing(),this._initUndoManager(),(this.textarea.element.hasAttribute("autofocus")||document.querySelector(":focus")==this.textarea.element)&&setTimeout(function(){d.focus()},100),a.quirks.insertLineBreakOnReturn(this),c.clearsContentEditableCorrectly()||a.quirks.ensureProperClearing(this),c.clearsListsInContentEditableCorrectly()||a.quirks.ensureProperClearingOfLists(this),this.initSync&&this.config.sync&&this.initSync(),this.textarea.hide(),this.parent.fire("beforeload").fire("load")},_initAutoLinking:function(){var d=this,e=c.canDisableAutoLinking(),f=c.doesAutoLinkingInContentEditable();if(e&&this.commands.exec("autoUrlDetect",!1),this.config.autoLink){(!f||f&&e)&&this.parent.observe("newword:composer",function(){d.selection.executeAndRestore(function(a,c){b.autoLink(c.parentNode)})});var g=this.sandbox.getDocument().getElementsByTagName("a"),h=b.autoLink.URL_REG_EXP,i=function(c){return c=a.lang.string(b.getTextContent(c)).trim(),"www."===c.substr(0,4)&&(c="http://"+c),c};b.observe(this.element,"keydown",function(a){if(g.length){var c,a=d.selection.getSelectedNode(a.target.ownerDocument),e=b.getParentElement(a,{nodeName:"A"},4);e&&(c=i(e),setTimeout(function(){var a=i(e);a!==c&&a.match(h)&&e.setAttribute("href",a)},0))}})}},_initObjectResizing:function(){var d=["width","height"],e=d.length,f=this.element;this.commands.exec("enableObjectResizing",this.config.allowObjectResizing),this.config.allowObjectResizing?c.supportsEvent("resizeend")&&b.observe(f,"resizeend",function(b){for(var c,b=b.target||b.srcElement,g=b.style,h=0;e>h;h++)c=d[h],g[c]&&(b.setAttribute(c,parseInt(g[c],10)),g[c]="");a.quirks.redraw(f)}):c.supportsEvent("resizestart")&&b.observe(f,"resizestart",function(a){a.preventDefault()})},_initUndoManager:function(){new a.UndoManager(this.parent)}})}(wysihtml5),function(a){var b=a.dom,c=document,d=window,e=c.createElement("div"),f="background-color color cursor font-family font-size font-style font-variant font-weight line-height letter-spacing text-align text-decoration text-indent text-rendering word-break word-wrap word-spacing".split(" "),g="background-color border-collapse border-bottom-color border-bottom-style border-bottom-width border-left-color border-left-style border-left-width border-right-color border-right-style border-right-width border-top-color border-top-style border-top-width clear display float margin-bottom margin-left margin-right margin-top outline-color outline-offset outline-width outline-style padding-left padding-right padding-top padding-bottom position top left right bottom z-index vertical-align text-align -webkit-box-sizing -moz-box-sizing -ms-box-sizing box-sizing -webkit-box-shadow -moz-box-shadow -ms-box-shadow box-shadow -webkit-border-top-right-radius -moz-border-radius-topright border-top-right-radius -webkit-border-bottom-right-radius -moz-border-radius-bottomright border-bottom-right-radius -webkit-border-bottom-left-radius -moz-border-radius-bottomleft border-bottom-left-radius -webkit-border-top-left-radius -moz-border-radius-topleft border-top-left-radius width height".split(" "),h="width height top left right bottom".split(" "),i=["html             { height: 100%; }","body             { min-height: 100%; padding: 0; margin: 0; margin-top: -1px; padding-top: 1px; }","._wysihtml5-temp { display: none; }",a.browser.isGecko?"body.placeholder { color: graytext !important; }":"body.placeholder { color: #a9a9a9 !important; }","body[disabled]   { background-color: #eee !important; color: #999 !important; cursor: default !important; }","img:-moz-broken  { -moz-force-broken-image-icon: 1; height: 24px; width: 24px; }"],j=function(a){if(a.setActive)try{a.setActive()}catch(e){}else{var f=a.style,g=c.documentElement.scrollTop||c.body.scrollTop,h=c.documentElement.scrollLeft||c.body.scrollLeft,f={position:f.position,top:f.top,left:f.left,WebkitUserSelect:f.WebkitUserSelect};b.setStyles({position:"absolute",top:"-99999px",left:"-99999px",WebkitUserSelect:"none"}).on(a),a.focus(),b.setStyles(f).on(a),d.scrollTo&&d.scrollTo(h,g)}};a.views.Composer.prototype.style=function(){var k=this,l=c.querySelector(":focus"),m=this.textarea.element,n=m.hasAttribute("placeholder"),o=n&&m.getAttribute("placeholder");this.focusStylesHost=this.focusStylesHost||e.cloneNode(!1),this.blurStylesHost=this.blurStylesHost||e.cloneNode(!1),n&&m.removeAttribute("placeholder"),m===l&&m.blur(),b.copyStyles(g).from(m).to(this.iframe).andTo(this.blurStylesHost),b.copyStyles(f).from(m).to(this.element).andTo(this.blurStylesHost),b.insertCSS(i).into(this.element.ownerDocument),j(m),b.copyStyles(g).from(m).to(this.focusStylesHost),b.copyStyles(f).from(m).to(this.focusStylesHost);
var p=a.lang.array(g).without(["display"]);if(l?l.focus():m.blur(),n&&m.setAttribute("placeholder",o),!a.browser.hasCurrentStyleProperty())var q=b.observe(d,"resize",function(){if(b.contains(document.documentElement,k.iframe)){var a=b.getStyle("display").from(m),c=b.getStyle("display").from(k.iframe);m.style.display="",k.iframe.style.display="none",b.copyStyles(h).from(m).to(k.iframe).andTo(k.focusStylesHost).andTo(k.blurStylesHost),k.iframe.style.display=c,m.style.display=a}else q.stop()});return this.parent.observe("focus:composer",function(){b.copyStyles(p).from(k.focusStylesHost).to(k.iframe),b.copyStyles(f).from(k.focusStylesHost).to(k.element)}),this.parent.observe("blur:composer",function(){b.copyStyles(p).from(k.blurStylesHost).to(k.iframe),b.copyStyles(f).from(k.blurStylesHost).to(k.element)}),this}}(wysihtml5),function(a){var b=a.dom,c=a.browser,d={66:"bold",73:"italic",85:"underline"};a.views.Composer.prototype.observe=function(){var e=this,f=this.getValue(),g=this.sandbox.getIframe(),h=this.element,i=c.supportsEventsInIframeCorrectly()?h:this.sandbox.getWindow(),j=c.supportsEvent("drop")?["drop","paste"]:["dragdrop","paste"];b.observe(g,"DOMNodeRemoved",function(){clearInterval(k),e.parent.fire("destroy:composer")});var k=setInterval(function(){b.contains(document.documentElement,g)||(clearInterval(k),e.parent.fire("destroy:composer"))},250);b.observe(i,"focus",function(){e.parent.fire("focus").fire("focus:composer"),setTimeout(function(){f=e.getValue()},0)}),b.observe(i,"blur",function(){f!==e.getValue()&&e.parent.fire("change").fire("change:composer"),e.parent.fire("blur").fire("blur:composer")}),a.browser.isIos()&&b.observe(h,"blur",function(){var a=h.ownerDocument.createElement("input"),b=document.documentElement.scrollTop||document.body.scrollTop,c=document.documentElement.scrollLeft||document.body.scrollLeft;try{e.selection.insertNode(a)}catch(d){h.appendChild(a)}a.focus(),a.parentNode.removeChild(a),window.scrollTo(c,b)}),b.observe(h,"dragenter",function(){e.parent.fire("unset_placeholder")}),c.firesOnDropOnlyWhenOnDragOverIsCancelled()&&b.observe(h,["dragover","dragenter"],function(a){a.preventDefault()}),b.observe(h,j,function(a){var b,d=a.dataTransfer;d&&c.supportsDataTransfer()&&(b=d.getData("text/html")||d.getData("text/plain")),b?(h.focus(),e.commands.exec("insertHTML",b),e.parent.fire("paste").fire("paste:composer"),a.stopPropagation(),a.preventDefault()):setTimeout(function(){e.parent.fire("paste").fire("paste:composer")},0)}),b.observe(h,"keyup",function(b){b=b.keyCode,(b===a.SPACE_KEY||b===a.ENTER_KEY)&&e.parent.fire("newword:composer")}),this.parent.observe("paste:composer",function(){setTimeout(function(){e.parent.fire("newword:composer")},0)}),c.canSelectImagesInContentEditable()||b.observe(h,"mousedown",function(a){var b=a.target;"IMG"===b.nodeName&&(e.selection.selectNode(b),a.preventDefault())}),b.observe(h,"keydown",function(a){var b=d[a.keyCode];(a.ctrlKey||a.metaKey)&&!a.altKey&&b&&(e.commands.exec(b),a.preventDefault())}),b.observe(h,"keydown",function(b){var c=e.selection.getSelectedNode(!0),d=b.keyCode;!c||"IMG"!==c.nodeName||d!==a.BACKSPACE_KEY&&d!==a.DELETE_KEY||(d=c.parentNode,d.removeChild(c),"A"===d.nodeName&&!d.firstChild&&d.parentNode.removeChild(d),setTimeout(function(){a.quirks.redraw(h)},0),b.preventDefault())});var l={IMG:"Image: ",A:"Link: "};b.observe(h,"mouseover",function(a){var a=a.target,b=a.nodeName;!("A"!==b&&"IMG"!==b)&&!a.hasAttribute("title")&&(b=l[b]+(a.getAttribute("href")||a.getAttribute("src")),a.setAttribute("title",b))})}}(wysihtml5),function(a){a.views.Synchronizer=Base.extend({constructor:function(a,b,c){this.editor=a,this.textarea=b,this.composer=c,this._observe()},fromComposerToTextarea:function(b){this.textarea.setValue(a.lang.string(this.composer.getValue()).trim(),b)},fromTextareaToComposer:function(a){var b=this.textarea.getValue();b?this.composer.setValue(b,a):(this.composer.clear(),this.editor.fire("set_placeholder"))},sync:function(a){"textarea"===this.editor.currentView.name?this.fromTextareaToComposer(a):this.fromComposerToTextarea(a)},_observe:function(){var b,c=this,d=this.textarea.element.form,e=function(){b=setInterval(function(){c.fromComposerToTextarea()},400)},f=function(){clearInterval(b),b=null};e(),d&&(a.dom.observe(d,"submit",function(){c.sync(!0)}),a.dom.observe(d,"reset",function(){setTimeout(function(){c.fromTextareaToComposer()},0)})),this.editor.observe("change_view",function(a){"composer"!==a||b?"textarea"===a&&(c.fromComposerToTextarea(!0),f()):(c.fromTextareaToComposer(!0),e())}),this.editor.observe("destroy:composer",f)}})}(wysihtml5),wysihtml5.views.Textarea=wysihtml5.views.View.extend({name:"textarea",constructor:function(a,b,c){this.base(a,b,c),this._observe()},clear:function(){this.element.value=""},getValue:function(a){var b=this.isEmpty()?"":this.element.value;return a&&(b=this.parent.parse(b)),b},setValue:function(a,b){b&&(a=this.parent.parse(a)),this.element.value=a},hasPlaceholderSet:function(){var a=wysihtml5.browser.supportsPlaceholderAttributeOn(this.element),b=this.element.getAttribute("placeholder")||null,c=this.element.value;return a&&!c||c===b},isEmpty:function(){return!wysihtml5.lang.string(this.element.value).trim()||this.hasPlaceholderSet()},_observe:function(){var a=this.element,b=this.parent,c={focusin:"focus",focusout:"blur"},d=wysihtml5.browser.supportsEvent("focusin")?["focusin","focusout","change"]:["focus","blur","change"];b.observe("beforeload",function(){wysihtml5.dom.observe(a,d,function(a){a=c[a.type]||a.type,b.fire(a).fire(a+":textarea")}),wysihtml5.dom.observe(a,["paste","drop"],function(){setTimeout(function(){b.fire("paste").fire("paste:textarea")},0)})})}}),function(a){var b=a.dom;a.toolbar.Dialog=a.lang.Dispatcher.extend({constructor:function(a,b){this.link=a,this.container=b},_observe:function(){if(!this._observed){var c=this,d=function(a){var b=c._serialize();b==c.elementToChange?c.fire("edit",b):c.fire("save",b),c.hide(),a.preventDefault(),a.stopPropagation()};b.observe(c.link,"click",function(){b.hasClass(c.link,"wysihtml5-command-dialog-opened")&&setTimeout(function(){c.hide()},0)}),b.observe(this.container,"keydown",function(b){var e=b.keyCode;e===a.ENTER_KEY&&d(b),e===a.ESCAPE_KEY&&c.hide()}),b.delegate(this.container,"[data-wysihtml5-dialog-action=save]","click",d),b.delegate(this.container,"[data-wysihtml5-dialog-action=cancel]","click",function(a){c.fire("cancel"),c.hide(),a.preventDefault(),a.stopPropagation()});for(var e=this.container.querySelectorAll("input, select, textarea"),f=0,g=e.length,h=function(){clearInterval(c.interval)};g>f;f++)b.observe(e[f],"change",h);this._observed=!0}},_serialize:function(){for(var a=this.elementToChange||{},b=this.container.querySelectorAll("[data-wysihtml5-dialog-field]"),c=b.length,d=0;c>d;d++)a[b[d].getAttribute("data-wysihtml5-dialog-field")]=b[d].value;return a},_interpolate:function(a){for(var b,c,d=document.querySelector(":focus"),e=this.container.querySelectorAll("[data-wysihtml5-dialog-field]"),f=e.length,g=0;f>g;g++)b=e[g],b!==d&&!(a&&"hidden"===b.type)&&(c=b.getAttribute("data-wysihtml5-dialog-field"),c=this.elementToChange?this.elementToChange[c]||"":b.defaultValue,b.value=c)},show:function(a){var c=this,d=this.container.querySelector("input, select, textarea");if(this.elementToChange=a,this._observe(),this._interpolate(),a&&(this.interval=setInterval(function(){c._interpolate(!0)},500)),b.addClass(this.link,"wysihtml5-command-dialog-opened"),this.container.style.display="",this.fire("show"),d&&!a)try{d.focus()}catch(e){}},hide:function(){clearInterval(this.interval),this.elementToChange=null,b.removeClass(this.link,"wysihtml5-command-dialog-opened"),this.container.style.display="none",this.fire("hide")}})}(wysihtml5),function(a){var b=a.dom,c={position:"relative"},d={left:0,margin:0,opacity:0,overflow:"hidden",padding:0,position:"absolute",top:0,zIndex:1},e={cursor:"inherit",fontSize:"50px",height:"50px",marginTop:"-25px",outline:0,padding:0,position:"absolute",right:"-4px",top:"50%"},f={"x-webkit-speech":"",speech:""};a.toolbar.Speech=function(g,h){var i=document.createElement("input");if(a.browser.supportsSpeechApiOn(i)){var j=document.createElement("div");a.lang.object(d).merge({width:h.offsetWidth+"px",height:h.offsetHeight+"px"}),b.insert(i).into(j),b.insert(j).into(h),b.setStyles(e).on(i),b.setAttributes(f).on(i),b.setStyles(d).on(j),b.setStyles(c).on(h),b.observe(i,"onwebkitspeechchange"in i?"webkitspeechchange":"speechchange",function(){g.execCommand("insertText",i.value),i.value=""}),b.observe(i,"click",function(a){b.hasClass(h,"wysihtml5-command-disabled")&&a.preventDefault(),a.stopPropagation()})}else h.style.display="none"}}(wysihtml5),function(a){var b=a.dom;a.toolbar.Toolbar=Base.extend({constructor:function(b,c){this.editor=b,this.container="string"==typeof c?document.getElementById(c):c,this.composer=b.composer,this._getLinks("command"),this._getLinks("action"),this._observe(),this.show();for(var d=this.container.querySelectorAll("[data-wysihtml5-command=insertSpeech]"),e=d.length,f=0;e>f;f++)new a.toolbar.Speech(this,d[f])},_getLinks:function(b){for(var c,d,e,f,g,h=this[b+"Links"]=a.lang.array(this.container.querySelectorAll("[data-wysihtml5-"+b+"]")).get(),i=h.length,j=0,k=this[b+"Mapping"]={};i>j;j++)c=h[j],e=c.getAttribute("data-wysihtml5-"+b),f=c.getAttribute("data-wysihtml5-"+b+"-value"),d=this.container.querySelector("[data-wysihtml5-"+b+"-group='"+e+"']"),g=this._getDialog(c,e),k[e+":"+f]={link:c,group:d,name:e,value:f,dialog:g,state:!1}},_getDialog:function(b,c){var d,e,f=this,g=this.container.querySelector("[data-wysihtml5-dialog='"+c+"']");return g&&(d=new a.toolbar.Dialog(b,g),d.observe("show",function(){e=f.composer.selection.getBookmark(),f.editor.fire("show:dialog",{command:c,dialogContainer:g,commandLink:b})}),d.observe("save",function(a){e&&f.composer.selection.setBookmark(e),f._execCommand(c,a),f.editor.fire("save:dialog",{command:c,dialogContainer:g,commandLink:b})}),d.observe("cancel",function(){f.editor.focus(!1),f.editor.fire("cancel:dialog",{command:c,dialogContainer:g,commandLink:b})})),d},execCommand:function(a,b){if(!this.commandsDisabled){var c=this.commandMapping[a+":"+b];c&&c.dialog&&!c.state?c.dialog.show():this._execCommand(a,b)}},_execCommand:function(a,b){this.editor.focus(!1),this.composer.commands.exec(a,b),this._updateLinkStates()},execAction:function(a){var b=this.editor;switch(a){case"change_view":b.currentView===b.textarea?b.fire("change_view","composer"):b.fire("change_view","textarea")}},_observe:function(){for(var a=this,c=this.editor,d=this.container,e=this.commandLinks.concat(this.actionLinks),f=e.length,g=0;f>g;g++)b.setAttributes({href:"javascript:;",unselectable:"on"}).on(e[g]);b.delegate(d,"[data-wysihtml5-command]","mousedown",function(a){a.preventDefault()}),b.delegate(d,"[data-wysihtml5-command]","click",function(b){var c=this.getAttribute("data-wysihtml5-command"),d=this.getAttribute("data-wysihtml5-command-value");a.execCommand(c,d),b.preventDefault()}),b.delegate(d,"[data-wysihtml5-action]","click",function(b){var c=this.getAttribute("data-wysihtml5-action");a.execAction(c),b.preventDefault()}),c.observe("focus:composer",function(){a.bookmark=null,clearInterval(a.interval),a.interval=setInterval(function(){a._updateLinkStates()},500)}),c.observe("blur:composer",function(){clearInterval(a.interval)}),c.observe("destroy:composer",function(){clearInterval(a.interval)}),c.observe("change_view",function(c){setTimeout(function(){a.commandsDisabled="composer"!==c,a._updateLinkStates(),a.commandsDisabled?b.addClass(d,"wysihtml5-commands-disabled"):b.removeClass(d,"wysihtml5-commands-disabled")},0)})},_updateLinkStates:function(){var c,d,e,f=this.commandMapping,g=this.actionMapping;for(c in f)e=f[c],this.commandsDisabled?(d=!1,b.removeClass(e.link,"wysihtml5-command-active"),e.group&&b.removeClass(e.group,"wysihtml5-command-active"),e.dialog&&e.dialog.hide()):(d=this.composer.commands.state(e.name,e.value),a.lang.object(d).isArray()&&(d=1===d.length?d[0]:!0),b.removeClass(e.link,"wysihtml5-command-disabled"),e.group&&b.removeClass(e.group,"wysihtml5-command-disabled")),e.state!==d&&((e.state=d)?(b.addClass(e.link,"wysihtml5-command-active"),e.group&&b.addClass(e.group,"wysihtml5-command-active"),e.dialog&&("object"==typeof d?e.dialog.show(d):e.dialog.hide())):(b.removeClass(e.link,"wysihtml5-command-active"),e.group&&b.removeClass(e.group,"wysihtml5-command-active"),e.dialog&&e.dialog.hide()));for(c in g)f=g[c],"change_view"===f.name&&(f.state=this.editor.currentView===this.editor.textarea,f.state?b.addClass(f.link,"wysihtml5-action-active"):b.removeClass(f.link,"wysihtml5-action-active"))},show:function(){this.container.style.display=""},hide:function(){this.container.style.display="none"}})}(wysihtml5),function(a){var b={name:void 0,style:!0,toolbar:void 0,autoLink:!0,parserRules:{tags:{br:{},span:{},div:{},p:{}},classes:{}},parser:a.dom.parse,composerClassName:"wysihtml5-editor",bodyClassName:"wysihtml5-supported",stylesheets:[],placeholderText:void 0,allowObjectResizing:!0,supportTouchDevices:!0};a.Editor=a.lang.Dispatcher.extend({constructor:function(c,d){if(this.textareaElement="string"==typeof c?document.getElementById(c):c,this.config=a.lang.object({}).merge(b).merge(d).get(),this.currentView=this.textarea=new a.views.Textarea(this,this.textareaElement,this.config),this._isCompatible=a.browser.supported(),!this._isCompatible||!this.config.supportTouchDevices&&a.browser.isTouchDevice()){var e=this;setTimeout(function(){e.fire("beforeload").fire("load")},0)}else{a.dom.addClass(document.body,this.config.bodyClassName),this.currentView=this.composer=new a.views.Composer(this,this.textareaElement,this.config),"function"==typeof this.config.parser&&this._initParser(),this.observe("beforeload",function(){this.synchronizer=new a.views.Synchronizer(this,this.textarea,this.composer),this.config.toolbar&&(this.toolbar=new a.toolbar.Toolbar(this,this.config.toolbar))});try{console.log("Heya! This page is using wysihtml5 for rich text editing. Check out https://github.com/xing/wysihtml5")}catch(f){}}},isCompatible:function(){return this._isCompatible},clear:function(){return this.currentView.clear(),this},getValue:function(a){return this.currentView.getValue(a)},setValue:function(a,b){return a?(this.currentView.setValue(a,b),this):this.clear()},focus:function(a){return this.currentView.focus(a),this},disable:function(){return this.currentView.disable(),this},enable:function(){return this.currentView.enable(),this},isEmpty:function(){return this.currentView.isEmpty()},hasPlaceholderSet:function(){return this.currentView.hasPlaceholderSet()},parse:function(b){var c=this.config.parser(b,this.config.parserRules,this.composer.sandbox.getDocument(),!0);return"object"==typeof b&&a.quirks.redraw(b),c},_initParser:function(){this.observe("paste:composer",function(){var b=this;b.composer.selection.executeAndRestore(function(){a.quirks.cleanPastedHTML(b.composer.element),b.parse(b.composer.element)},!0)}),this.observe("paste:textarea",function(){this.textarea.setValue(this.parse(this.textarea.getValue()))})}})}(wysihtml5);var Handlebars=function(){var a=function(){"use strict";function a(a){this.string=a}var b;return a.prototype.toString=function(){return""+this.string},b=a}(),b=function(a){"use strict";function b(a){return h[a]||"&amp;"}function c(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}function d(a){return a instanceof g?a.toString():a||0===a?(a=""+a,j.test(a)?a.replace(i,b):a):""}function e(a){return a||0===a?m(a)&&0===a.length?!0:!1:!0}var f={},g=a,h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},i=/[&<>"'`]/g,j=/[&<>"'`]/;f.extend=c;var k=Object.prototype.toString;f.toString=k;var l=function(a){return"function"==typeof a};l(/x/)&&(l=function(a){return"function"==typeof a&&"[object Function]"===k.call(a)});var l;f.isFunction=l;var m=Array.isArray||function(a){return a&&"object"==typeof a?"[object Array]"===k.call(a):!1};return f.isArray=m,f.escapeExpression=d,f.isEmpty=e,f}(a),c=function(){"use strict";function a(){for(var a=Error.prototype.constructor.apply(this,arguments),b=0;b<c.length;b++)this[c[b]]=a[c[b]]}var b,c=["description","fileName","lineNumber","message","name","number","stack"];return a.prototype=new Error,b=a}(),d=function(a,b){"use strict";function c(a,b){this.helpers=a||{},this.partials=b||{},d(this)}function d(a){a.registerHelper("helperMissing",function(a){if(2===arguments.length)return void 0;throw new Error("Missing helper: '"+a+"'")}),a.registerHelper("blockHelperMissing",function(b,c){var d=c.inverse||function(){},e=c.fn;return m(b)&&(b=b.call(this)),b===!0?e(this):b===!1||null==b?d(this):l(b)?b.length>0?a.helpers.each(b,c):d(this):e(b)}),a.registerHelper("each",function(a,b){var c,d=b.fn,e=b.inverse,f=0,g="";if(m(a)&&(a=a.call(this)),b.data&&(c=q(b.data)),a&&"object"==typeof a)if(l(a))for(var h=a.length;h>f;f++)c&&(c.index=f,c.first=0===f,c.last=f===a.length-1),g+=d(a[f],{data:c});else for(var i in a)a.hasOwnProperty(i)&&(c&&(c.key=i),g+=d(a[i],{data:c}),f++);return 0===f&&(g=e(this)),g}),a.registerHelper("if",function(a,b){return m(a)&&(a=a.call(this)),!b.hash.includeZero&&!a||g.isEmpty(a)?b.inverse(this):b.fn(this)}),a.registerHelper("unless",function(b,c){return a.helpers["if"].call(this,b,{fn:c.inverse,inverse:c.fn,hash:c.hash})}),a.registerHelper("with",function(a,b){return m(a)&&(a=a.call(this)),g.isEmpty(a)?void 0:b.fn(a)}),a.registerHelper("log",function(b,c){var d=c.data&&null!=c.data.level?parseInt(c.data.level,10):1;a.log(d,b)})}function e(a,b){p.log(a,b)}var f={},g=a,h=b,i="1.1.2";f.VERSION=i;var j=4;f.COMPILER_REVISION=j;var k={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:">= 1.0.0"};f.REVISION_CHANGES=k;var l=g.isArray,m=g.isFunction,n=g.toString,o="[object Object]";f.HandlebarsEnvironment=c,c.prototype={constructor:c,logger:p,log:e,registerHelper:function(a,b,c){if(n.call(a)===o){if(c||b)throw new h("Arg not supported with multiple helpers");g.extend(this.helpers,a)}else c&&(b.not=c),this.helpers[a]=b},registerPartial:function(a,b){n.call(a)===o?g.extend(this.partials,a):this.partials[a]=b}};var p={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(a,b){if(p.level<=a){var c=p.methodMap[a];"undefined"!=typeof console&&console[c]&&console[c].call(console,b)}}};f.logger=p,f.log=e;var q=function(a){var b={};return g.extend(b,a),b};return f.createFrame=q,f}(b,c),e=function(a,b,c){"use strict";function d(a){var b=a&&a[0]||1,c=m;if(b!==c){if(c>b){var d=n[c],e=n[b];throw new Error("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+d+") or downgrade your runtime to an older version ("+e+").")}throw new Error("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+a[1]+").")}}function e(a,b){if(!b)throw new Error("No environment passed to template");var c;c=b.compile?function(a,c,d,e,f,g){var i=h.apply(this,arguments);if(i)return i;var j={helpers:e,partials:f,data:g};return f[c]=b.compile(a,{data:void 0!==g},b),f[c](d,j)}:function(a,b){var c=h.apply(this,arguments);if(c)return c;throw new l("The partial "+b+" could not be compiled when running in runtime-only mode")};var e={escapeExpression:k.escapeExpression,invokePartial:c,programs:[],program:function(a,b,c){var d=this.programs[a];return c?d=g(a,b,c):d||(d=this.programs[a]=g(a,b)),d},merge:function(a,b){var c=a||b;return a&&b&&a!==b&&(c={},k.extend(c,b),k.extend(c,a)),c},programWithDepth:f,noop:i,compilerInfo:null};return function(c,f){f=f||{};var g,h,i=f.partial?f:b;f.partial||(g=f.helpers,h=f.partials);var j=a.call(e,i,c,g,h,f.data);return f.partial||d(e.compilerInfo),j}}function f(a,b,c){var d=Array.prototype.slice.call(arguments,3),e=function(a,e){return e=e||{},b.apply(this,[a,e.data||c].concat(d))};return e.program=a,e.depth=d.length,e}function g(a,b,c){var d=function(a,d){return d=d||{},b(a,d.data||c)};return d.program=a,d.depth=0,d}function h(a,b,c,d,e,f){var g={partial:!0,helpers:d,partials:e,data:f};if(void 0===a)throw new l("The partial "+b+" could not be found");return a instanceof Function?a(c,g):void 0}function i(){return""}var j={},k=a,l=b,m=c.COMPILER_REVISION,n=c.REVISION_CHANGES;return j.template=e,j.programWithDepth=f,j.program=g,j.invokePartial=h,j.noop=i,j}(b,c,d),f=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c,j=d,k=e,l=function(){var a=new g.HandlebarsEnvironment;return j.extend(a,g),a.SafeString=h,a.Exception=i,a.Utils=j,a.VM=k,a.template=function(b){return k.template(b,a)},a},m=l();return m.create=l,f=m}(d,a,c,b,e);return f}(),glob="undefined"==typeof window?global:window,Handlebars=glob.Handlebars||require("handlebars");this.wysihtml5=this.wysihtml5||{},this.wysihtml5.tpl=this.wysihtml5.tpl||{},this.wysihtml5.tpl.color=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li class="dropdown">\n  <a class="btn btn-default dropdown-toggle ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+='" data-toggle="dropdown" tabindex="-1">\n    <span class="current-color">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.black,typeof g===j?g.apply(b):g))+'</span>\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="black"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="black">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.black,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="silver"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="silver">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.silver,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="gray"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="gray">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.gray,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="maroon"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="maroon">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.maroon,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="red"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="red">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.red,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="purple"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="purple">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.purple,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="green"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="green">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.green,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="olive"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="olive">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.olive,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="navy"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="navy">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.navy,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="blue"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="blue">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.blue,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><div class="wysihtml5-colors" data-wysihtml5-command-value="orange"></div><a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="orange">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.colours,g=null==g||g===!1?g:g.orange,typeof g===j?g.apply(b):g))+"</a></li>\n  </ul>\n</li>\n"}),this.wysihtml5.tpl.emphasis=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li>\n  <div class="btn-group">\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="bold" title="CTRL+B" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.emphasis,g=null==g||g===!1?g:g.bold,typeof g===j?g.apply(b):g))+'</a>\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="italic" title="CTRL+I" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.emphasis,g=null==g||g===!1?g:g.italic,typeof g===j?g.apply(b):g))+'</a>\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="underline" title="CTRL+U" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.emphasis,g=null==g||g===!1?g:g.underline,typeof g===j?g.apply(b):g))+"</a>\n  </div>\n</li>\n"}),this.wysihtml5.tpl["font-styles"]=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li class="dropdown">\n  <a class="btn btn-default dropdown-toggle ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+='" data-toggle="dropdown">\n    <span class="glyphicon glyphicon-font"></span>\n    <span class="current-font">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.normal,typeof g===j?g.apply(b):g))+'</span>\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="div" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.normal,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h1,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h2,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h3" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h3,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h4" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h4,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h5" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h5,typeof g===j?g.apply(b):g))+'</a></li>\n    <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h6" tabindex="-1">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.font_styles,g=null==g||g===!1?g:g.h6,typeof g===j?g.apply(b):g))+"</a></li>\n  </ul>\n</li>\n"}),this.wysihtml5.tpl.html=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li>\n  <div class="btn-group">\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-action="change_view" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.html,g=null==g||g===!1?g:g.edit,typeof g===j?g.apply(b):g))+'" tabindex="-1">\n      <span class="glyphicon glyphicon-pencil"></span>\n    </a>\n  </div>\n</li>\n'}),this.wysihtml5.tpl.image=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li>\n  <div class="bootstrap-wysihtml5-insert-image-modal modal fade">\n    <div class="modal-dialog">\n      <div class="modal-content">\n        <div class="modal-header">\n          <a class="close" data-dismiss="modal">&times;</a>\n          <h3>'+k((g=b&&b.locale,g=null==g||g===!1?g:g.image,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'</h3>\n        </div>\n        <div class="modal-body">\n          <input value="http://" class="bootstrap-wysihtml5-insert-image-url form-control">\n        </div>\n        <div class="modal-footer">\n          <a class="btn btn-default" data-dismiss="modal">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.image,g=null==g||g===!1?g:g.cancel,typeof g===j?g.apply(b):g))+'</a>\n          <a class="btn btn-primary" data-dismiss="modal">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.image,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="insertImage" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.image,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'" tabindex="-1">\n    <span class="glyphicon glyphicon-picture"></span>\n  </a>\n</li>\n'}),this.wysihtml5.tpl.link=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li>\n  <div class="bootstrap-wysihtml5-insert-link-modal modal fade">\n    <div class="modal-dialog">\n      <div class="modal-content">\n        <div class="modal-header">\n          <a class="close" data-dismiss="modal">&times;</a>\n          <h3>'+k((g=b&&b.locale,g=null==g||g===!1?g:g.link,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'</h3>\n        </div>\n        <div class="modal-body">\n          <input value="http://" class="bootstrap-wysihtml5-insert-link-url form-control">\n          <label class="checkbox"> <input type="checkbox" class="bootstrap-wysihtml5-insert-link-target" checked>'+k((g=b&&b.locale,g=null==g||g===!1?g:g.link,g=null==g||g===!1?g:g.target,typeof g===j?g.apply(b):g))+'</label>\n        </div>\n        <div class="modal-footer">\n          <a class="btn btn-default" data-dismiss="modal">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.link,g=null==g||g===!1?g:g.cancel,typeof g===j?g.apply(b):g))+'</a>\n          <a href="#" class="btn btn-primary" data-dismiss="modal">'+k((g=b&&b.locale,g=null==g||g===!1?g:g.link,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="createLink" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.link,g=null==g||g===!1?g:g.insert,typeof g===j?g.apply(b):g))+'" tabindex="-1">\n    <span class="glyphicon glyphicon-share"></span>\n  </a>\n</li>\n'
}),this.wysihtml5.tpl.lists=Handlebars.template(function(a,b,c,d,e){function f(a){var b,c="";return c+="btn-"+k((b=a&&a.options,b=null==b||b===!1?b:b.size,typeof b===j?b.apply(a):b))}this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var g,h,i="",j="function",k=this.escapeExpression,l=this;return i+='<li>\n  <div class="btn-group">\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="insertUnorderedList" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.lists,g=null==g||g===!1?g:g.unordered,typeof g===j?g.apply(b):g))+'" tabindex="-1"><span class="glyphicon glyphicon-list"></span></a>\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="insertOrderedList" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.lists,g=null==g||g===!1?g:g.ordered,typeof g===j?g.apply(b):g))+'" tabindex="-1"><span class="glyphicon glyphicon-th-list"></span></a>\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="Outdent" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.lists,g=null==g||g===!1?g:g.outdent,typeof g===j?g.apply(b):g))+'" tabindex="-1"><span class="glyphicon glyphicon-indent-right"></span></a>\n    <a class="btn ',h=c["if"].call(b,(g=b&&b.options,null==g||g===!1?g:g.size),{hash:{},inverse:l.noop,fn:l.program(1,f,e),data:e}),(h||0===h)&&(i+=h),i+=' btn-default" data-wysihtml5-command="Indent" title="'+k((g=b&&b.locale,g=null==g||g===!1?g:g.lists,g=null==g||g===!1?g:g.indent,typeof g===j?g.apply(b):g))+'" tabindex="-1"><span class="glyphicon glyphicon-indent-left"></span></a>\n  </div>\n</li>\n'}),"object"==typeof exports&&exports&&(module.exports=this.wysihtml5.tpl),!function(a,b){"use strict";var c=function(a,c,d){return b.tpl[a]({locale:c,options:d})},d=function(c,d){this.el=c;var e=d||f;for(var g in e.customTemplates)b.tpl[g]=e.customTemplates[g];this.toolbar=this.createToolbar(c,e),this.editor=this.createEditor(d),window.editor=this.editor,a("iframe.wysihtml5-sandbox").each(function(b,c){a(c.contentWindow).off("focus.wysihtml5").on({"focus.wysihtml5":function(){a("li.dropdown").removeClass("open")}})})};d.prototype={constructor:d,createEditor:function(c){c=c||{},c=a.extend(!0,{},c),c.toolbar=this.toolbar[0];var d=new b.Editor(this.el[0],c);if(c&&c.events)for(var e in c.events)d.on(e,c.events[e]);return d},createToolbar:function(b,d){var e=this,h=a("<ul/>",{"class":"wysihtml5-toolbar",style:"display:none"}),i=d.locale||f.locale||"en";for(var j in f){var k=!1;void 0!==d[j]?d[j]===!0&&(k=!0):k=f[j],k===!0&&(h.append(c(j,g[i],d)),"html"===j&&this.initHtml(h),"link"===j&&this.initInsertLink(h),"image"===j&&this.initInsertImage(h))}if(d.toolbar)for(j in d.toolbar)h.append(d.toolbar[j]);return h.find('a[data-wysihtml5-command="formatBlock"]').click(function(b){var c=b.target||b.srcElement,d=a(c);e.toolbar.find(".current-font").text(d.html())}),h.find('a[data-wysihtml5-command="foreColor"]').click(function(b){var c=b.target||b.srcElement,d=a(c);e.toolbar.find(".current-color").text(d.html())}),this.el.before(h),h},initHtml:function(a){var b='a[data-wysihtml5-action="change_view"]';a.find(b).click(function(){a.find("a.btn").not(b).toggleClass("disabled")})},initInsertImage:function(b){var c,d=this,e=b.find(".bootstrap-wysihtml5-insert-image-modal"),f=e.find(".bootstrap-wysihtml5-insert-image-url"),g=e.find("a.btn-primary"),h=f.val(),i=function(){var a=f.val();f.val(h),d.editor.currentView.element.focus(),c&&(d.editor.composer.selection.setBookmark(c),c=null),d.editor.composer.commands.exec("insertImage",a)};f.keypress(function(a){13==a.which&&(i(),e.modal("hide"))}),g.click(i),e.on("shown",function(){f.focus()}),e.on("hide",function(){d.editor.currentView.element.focus()}),b.find("a[data-wysihtml5-command=insertImage]").click(function(){var b=a(this).hasClass("wysihtml5-command-active");return b?!0:(d.editor.currentView.element.focus(!1),c=d.editor.composer.selection.getBookmark(),e.appendTo("body").modal("show"),e.on("click.dismiss.modal",'[data-dismiss="modal"]',function(a){a.stopPropagation()}),!1)})},initInsertLink:function(b){var c,d=this,e=b.find(".bootstrap-wysihtml5-insert-link-modal"),f=e.find(".bootstrap-wysihtml5-insert-link-url"),g=e.find(".bootstrap-wysihtml5-insert-link-target"),h=e.find("a.btn-primary"),i=f.val(),j=function(){var a=f.val();f.val(i),d.editor.currentView.element.focus(),c&&(d.editor.composer.selection.setBookmark(c),c=null);var b=g.prop("checked");d.editor.composer.commands.exec("createLink",{href:a,target:b?"_blank":"_self",rel:b?"nofollow":""})};f.keypress(function(a){13==a.which&&(j(),e.modal("hide"))}),h.click(j),e.on("shown",function(){f.focus()}),e.on("hide",function(){d.editor.currentView.element.focus()}),b.find("a[data-wysihtml5-command=createLink]").click(function(){var b=a(this).hasClass("wysihtml5-command-active");return b?!0:(d.editor.currentView.element.focus(!1),c=d.editor.composer.selection.getBookmark(),e.appendTo("body").modal("show"),e.on("click.dismiss.modal",'[data-dismiss="modal"]',function(a){a.stopPropagation()}),!1)})}};var e={resetDefaults:function(){a.fn.wysihtml5.defaultOptions=a.extend(!0,{},a.fn.wysihtml5.defaultOptionsCache)},bypassDefaults:function(b){return this.each(function(){var c=a(this);c.data("wysihtml5",new d(c,b))})},shallowExtend:function(b){var c=a.extend({},a.fn.wysihtml5.defaultOptions,b||{},a(this).data()),d=this;return e.bypassDefaults.apply(d,[c])},deepExtend:function(b){var c=a.extend(!0,{},a.fn.wysihtml5.defaultOptions,b||{}),d=this;return e.bypassDefaults.apply(d,[c])},init:function(a){var b=this;return e.shallowExtend.apply(b,[a])}};a.fn.wysihtml5=function(b){return e[b]?e[b].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof b&&b?(a.error("Method "+b+" does not exist on jQuery.wysihtml5"),void 0):e.init.apply(this,arguments)},a.fn.wysihtml5.Constructor=d;var f=a.fn.wysihtml5.defaultOptions={"font-styles":!0,color:!1,emphasis:!0,lists:!0,html:!1,link:!0,image:!0,events:{},parserRules:{classes:{"wysiwyg-color-silver":1,"wysiwyg-color-gray":1,"wysiwyg-color-white":1,"wysiwyg-color-maroon":1,"wysiwyg-color-red":1,"wysiwyg-color-purple":1,"wysiwyg-color-fuchsia":1,"wysiwyg-color-green":1,"wysiwyg-color-lime":1,"wysiwyg-color-olive":1,"wysiwyg-color-yellow":1,"wysiwyg-color-navy":1,"wysiwyg-color-blue":1,"wysiwyg-color-teal":1,"wysiwyg-color-aqua":1,"wysiwyg-color-orange":1},tags:{b:{},i:{},strong:{},em:{},p:{},br:{},ol:{},ul:{},li:{},h1:{},h2:{},h3:{},h4:{},h5:{},h6:{},blockquote:{},u:1,img:{check_attributes:{width:"numbers",alt:"alt",src:"url",height:"numbers"}},a:{check_attributes:{href:"url"},set_attributes:{target:"_blank",rel:"nofollow"}},span:1,div:1,code:1,pre:1}},locale:"en"};"undefined"==typeof a.fn.wysihtml5.defaultOptionsCache&&(a.fn.wysihtml5.defaultOptionsCache=a.extend(!0,{},a.fn.wysihtml5.defaultOptions));var g=a.fn.wysihtml5.locale={}}(window.jQuery,window.wysihtml5),function(a){a.fn.wysihtml5.locale.en=a.fn.wysihtml5.locale["en-US"]={font_styles:{normal:"Normal text",h1:"Heading 1",h2:"Heading 2",h3:"Heading 3",h4:"Heading 4",h5:"Heading 5",h6:"Heading 6"},emphasis:{bold:"Bold",italic:"Italic",underline:"Underline"},lists:{unordered:"Unordered list",ordered:"Ordered list",outdent:"Outdent",indent:"Indent"},link:{insert:"Insert link",cancel:"Cancel",target:"Open link in new window"},image:{insert:"Insert image",cancel:"Cancel"},html:{edit:"Edit HTML"},colours:{black:"Black",silver:"Silver",gray:"Grey",maroon:"Maroon",red:"Red",purple:"Purple",green:"Green",olive:"Olive",navy:"Navy",blue:"Blue",orange:"Orange"}}}(jQuery);
/*
 * metismenu - v2.0.2
 * A jQuery menu plugin
 * https://github.com/onokumus/metisMenu
 *
 * Made by Osman Nuri Okumus
 * Under MIT License
 */

!function(a){"use strict";function b(){var a=document.createElement("mm"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}function c(b){return this.each(function(){var c=a(this),d=c.data("mm"),f=a.extend({},e.DEFAULTS,c.data(),"object"==typeof b&&b);d||c.data("mm",d=new e(this,f)),"string"==typeof b&&d[b]()})}a.fn.emulateTransitionEnd=function(b){var c=!1,e=this;a(this).one("mmTransitionEnd",function(){c=!0});var f=function(){c||a(e).trigger(d.end)};return setTimeout(f,b),this};var d=b();d&&(a.event.special.mmTransitionEnd={bindType:d.end,delegateType:d.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}});var e=function(b,c){this.$element=a(b),this.options=a.extend({},e.DEFAULTS,c),this.transitioning=null,this.init()};e.TRANSITION_DURATION=350,e.DEFAULTS={toggle:!0,doubleTapToGo:!1,activeClass:"active"},e.prototype.init=function(){var b=this,c=this.options.activeClass;this.$element.find("li."+c).has("ul").children("ul").addClass("collapse in"),this.$element.find("li").not("."+c).has("ul").children("ul").addClass("collapse"),this.options.doubleTapToGo&&this.$element.find("li."+c).has("ul").children("a").addClass("doubleTapToGo"),this.$element.find("li").has("ul").children("a").on("click.metisMenu",function(d){var e=a(this),f=e.parent("li"),g=f.children("ul");return d.preventDefault(),f.hasClass(c)?b.hide(g):b.show(g),b.options.doubleTapToGo&&b.doubleTapToGo(e)&&"#"!==e.attr("href")&&""!==e.attr("href")?(d.stopPropagation(),void(document.location=e.attr("href"))):void 0})},e.prototype.doubleTapToGo=function(a){var b=this.$element;return a.hasClass("doubleTapToGo")?(a.removeClass("doubleTapToGo"),!0):a.parent().children("ul").length?(b.find(".doubleTapToGo").removeClass("doubleTapToGo"),a.addClass("doubleTapToGo"),!1):void 0},e.prototype.show=function(b){var c=this.options.activeClass,f=a(b),g=f.parent("li");if(!this.transitioning&&!f.hasClass("in")){g.addClass(c),this.options.toggle&&this.hide(g.siblings().children("ul.in")),f.removeClass("collapse").addClass("collapsing").height(0),this.transitioning=1;var h=function(){f.removeClass("collapsing").addClass("collapse in").height(""),this.transitioning=0};return d?void f.one("mmTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(e.TRANSITION_DURATION).height(f[0].scrollHeight):h.call(this)}},e.prototype.hide=function(b){var c=this.options.activeClass,f=a(b);if(!this.transitioning&&f.hasClass("in")){f.parent("li").removeClass(c),f.height(f.height())[0].offsetHeight,f.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var g=function(){this.transitioning=0,f.removeClass("collapsing").addClass("collapse")};return d?void f.height(0).one("mmTransitionEnd",a.proxy(g,this)).emulateTransitionEnd(e.TRANSITION_DURATION):g.call(this)}};var f=a.fn.metisMenu;a.fn.metisMenu=c,a.fn.metisMenu.Constructor=e,a.fn.metisMenu.noConflict=function(){return a.fn.metisMenu=f,this}}(jQuery);
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.6
 *
 */
(function(e){e.fn.extend({slimScroll:function(g){var a=e.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},g);this.each(function(){function v(d){if(r){d=d||window.event;
    var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);e(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&m(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}}function m(d,e,g){k=!1;var f=d,h=b.outerHeight()-c.outerHeight();e&&(f=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),f=Math.min(Math.max(f,0),h),f=0<d?Math.ceil(f):Math.floor(f),c.css({top:f+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());
    f=l*(b[0].scrollHeight-b.outerHeight());g&&(f=d,d=f/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),h),c.css({top:d+"px"}));b.scrollTop(f);b.trigger("slimscrolling",~~f);w();p()}function x(){u=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),30);c.css({height:u+"px"});var a=u==b.outerHeight()?"none":"block";c.css({display:a})}function w(){x();clearTimeout(B);l==~~l?(k=a.allowPageScroll,C!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;C=l;u>=b.outerHeight()?k=!0:(c.stop(!0,
    !0).fadeIn("fast"),a.railVisible&&h.stop(!0,!0).fadeIn("fast"))}function p(){a.alwaysVisible||(B=setTimeout(function(){a.disableFadeOut&&r||y||z||(c.fadeOut("slow"),h.fadeOut("slow"))},1E3))}var r,y,z,B,A,u,l,C,k=!1,b=e(this);if(b.parent().hasClass(a.wrapperClass)){var n=b.scrollTop(),c=b.closest("."+a.barClass),h=b.closest("."+a.railClass);x();if(e.isPlainObject(g)){if("height"in g&&"auto"==g.height){b.parent().css("height","auto");b.css("height","auto");var q=b.parent().parent().height();b.parent().css("height",
    q);b.css("height",q)}if("scrollTo"in g)n=parseInt(a.scrollTo);else if("scrollBy"in g)n+=parseInt(a.scrollBy);else if("destroy"in g){c.remove();h.remove();b.unwrap();return}m(n,!1,!0)}}else if(!(e.isPlainObject(g)&&"destroy"in g)){a.height="auto"==a.height?b.parent().height():a.height;n=e("<div></div>").addClass(a.wrapperClass).css({position:"relative",overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",width:a.width,height:a.height});var h=e("<div></div>").addClass(a.railClass).css({width:a.size,
    height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),c=e("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,WebkitBorderRadius:a.borderRadius,zIndex:99}),q="right"==a.position?
{right:a.distance}:{left:a.distance};h.css(q);c.css(q);b.wrap(n);b.parent().append(c);b.parent().append(h);a.railDraggable&&c.bind("mousedown",function(a){var b=e(document);z=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);m(0,c.position().top,!1)});b.bind("mouseup.slimscroll",function(a){z=!1;p();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",function(a){a.stopPropagation();a.preventDefault();return!1});
    h.hover(function(){w()},function(){p()});c.hover(function(){y=!0},function(){y=!1});b.hover(function(){r=!0;w();p()},function(){r=!1;p()});b.bind("touchstart",function(a,b){a.originalEvent.touches.length&&(A=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&(m((A-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),A=b.originalEvent.touches[0].pageY)});x();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),
        m(0,!0)):"top"!==a.start&&(m(e(a.start).position().top,null,!0),a.alwaysVisible||c.hide());window.addEventListener?(this.addEventListener("DOMMouseScroll",v,!1),this.addEventListener("mousewheel",v,!1)):document.attachEvent("onmousewheel",v)}});return this}});e.fn.extend({slimscroll:e.fn.slimScroll})})(jQuery);
/**
 * INSPINIA - Responsive Admin Theme
 * 2.2
 *
 * Custom scripts
 */

$(document).ready(function () {

    // Full height of sidebar
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");

        var navbarHeigh = $('nav.navbar-default').height();
        var wrapperHeigh = $('#page-wrapper').height();

        if(navbarHeigh > wrapperHeigh){
            $('#page-wrapper').css("min-height", navbarHeigh + "px");
        }

        if(navbarHeigh < wrapperHeigh){
            $('#page-wrapper').css("min-height", $(window).height()  + "px");
        }

        if ($('body').hasClass('fixed-nav')) {
            $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
        }

    }


    $(window).bind("load resize scroll", function() {
        if(!$("body").hasClass('body-small')) {
            fix_height();
        }
    });

    // Move right sidebar top after scroll
    $(window).scroll(function(){
        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav') ) {
            $('#right-sidebar').addClass('sidebar-top');
        } else {
            $('#right-sidebar').removeClass('sidebar-top');
        }
    });


    setTimeout(function(){
        fix_height();
    })
});

// Minimalize menu when screen is less than 768px
$(function() {
    $(window).bind("load resize", function() {
        if ($(this).width() < 769) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }
    })
})

$(window).load(function() {
	/*! pace 0.5.3 */
	(function(){var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W=[].slice,X={}.hasOwnProperty,Y=function(a,b){function c(){this.constructor=a}for(var d in b)X.call(b,d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},Z=[].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(b in this&&this[b]===a)return b;return-1};for(t={catchupTime:500,initialRate:.03,minTime:500,ghostTime:500,maxProgressPerFrame:10,easeFactor:1.25,startOnPageLoad:!0,restartOnPushState:!0,restartOnRequestAfter:500,target:"body",elements:{checkInterval:100,selectors:["body"]},eventLag:{minSamples:10,sampleCount:3,lagThreshold:3},ajax:{trackMethods:["GET"],trackWebSockets:!0,ignoreURLs:[]}},B=function(){var a;return null!=(a="undefined"!=typeof performance&&null!==performance&&"function"==typeof performance.now?performance.now():void 0)?a:+new Date},D=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame,s=window.cancelAnimationFrame||window.mozCancelAnimationFrame,null==D&&(D=function(a){return setTimeout(a,50)},s=function(a){return clearTimeout(a)}),F=function(a){var b,c;return b=B(),(c=function(){var d;return d=B()-b,d>=33?(b=B(),a(d,function(){return D(c)})):setTimeout(c,33-d)})()},E=function(){var a,b,c;return c=arguments[0],b=arguments[1],a=3<=arguments.length?W.call(arguments,2):[],"function"==typeof c[b]?c[b].apply(c,a):c[b]},u=function(){var a,b,c,d,e,f,g;for(b=arguments[0],d=2<=arguments.length?W.call(arguments,1):[],f=0,g=d.length;g>f;f++)if(c=d[f])for(a in c)X.call(c,a)&&(e=c[a],null!=b[a]&&"object"==typeof b[a]&&null!=e&&"object"==typeof e?u(b[a],e):b[a]=e);return b},p=function(a){var b,c,d,e,f;for(c=b=0,e=0,f=a.length;f>e;e++)d=a[e],c+=Math.abs(d),b++;return c/b},w=function(a,b){var c,d,e;if(null==a&&(a="options"),null==b&&(b=!0),e=document.querySelector("[data-pace-"+a+"]")){if(c=e.getAttribute("data-pace-"+a),!b)return c;try{return JSON.parse(c)}catch(f){return d=f,"undefined"!=typeof console&&null!==console?console.error("Error parsing inline pace options",d):void 0}}},g=function(){function a(){}return a.prototype.on=function(a,b,c,d){var e;return null==d&&(d=!1),null==this.bindings&&(this.bindings={}),null==(e=this.bindings)[a]&&(e[a]=[]),this.bindings[a].push({handler:b,ctx:c,once:d})},a.prototype.once=function(a,b,c){return this.on(a,b,c,!0)},a.prototype.off=function(a,b){var c,d,e;if(null!=(null!=(d=this.bindings)?d[a]:void 0)){if(null==b)return delete this.bindings[a];for(c=0,e=[];c<this.bindings[a].length;)e.push(this.bindings[a][c].handler===b?this.bindings[a].splice(c,1):c++);return e}},a.prototype.trigger=function(){var a,b,c,d,e,f,g,h,i;if(c=arguments[0],a=2<=arguments.length?W.call(arguments,1):[],null!=(g=this.bindings)?g[c]:void 0){for(e=0,i=[];e<this.bindings[c].length;)h=this.bindings[c][e],d=h.handler,b=h.ctx,f=h.once,d.apply(null!=b?b:this,a),i.push(f?this.bindings[c].splice(e,1):e++);return i}},a}(),null==window.Pace&&(window.Pace={}),u(Pace,g.prototype),C=Pace.options=u({},t,window.paceOptions,w()),T=["ajax","document","eventLag","elements"],P=0,R=T.length;R>P;P++)J=T[P],C[J]===!0&&(C[J]=t[J]);i=function(a){function b(){return U=b.__super__.constructor.apply(this,arguments)}return Y(b,a),b}(Error),b=function(){function a(){this.progress=0}return a.prototype.getElement=function(){var a;if(null==this.el){if(a=document.querySelector(C.target),!a)throw new i;this.el=document.createElement("div"),this.el.className="pace pace-active",document.body.className=document.body.className.replace(/pace-done/g,""),document.body.className+=" pace-running",this.el.innerHTML='<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>',null!=a.firstChild?a.insertBefore(this.el,a.firstChild):a.appendChild(this.el)}return this.el},a.prototype.finish=function(){var a;return a=this.getElement(),a.className=a.className.replace("pace-active",""),a.className+=" pace-inactive",document.body.className=document.body.className.replace("pace-running",""),document.body.className+=" pace-done"},a.prototype.update=function(a){return this.progress=a,this.render()},a.prototype.destroy=function(){try{this.getElement().parentNode.removeChild(this.getElement())}catch(a){i=a}return this.el=void 0},a.prototype.render=function(){var a,b;return null==document.querySelector(C.target)?!1:(a=this.getElement(),a.children[0].style.width=""+this.progress+"%",(!this.lastRenderedProgress||this.lastRenderedProgress|0!==this.progress|0)&&(a.children[0].setAttribute("data-progress-text",""+(0|this.progress)+"%"),this.progress>=100?b="99":(b=this.progress<10?"0":"",b+=0|this.progress),a.children[0].setAttribute("data-progress",""+b)),this.lastRenderedProgress=this.progress)},a.prototype.done=function(){return this.progress>=100},a}(),h=function(){function a(){this.bindings={}}return a.prototype.trigger=function(a,b){var c,d,e,f,g;if(null!=this.bindings[a]){for(f=this.bindings[a],g=[],d=0,e=f.length;e>d;d++)c=f[d],g.push(c.call(this,b));return g}},a.prototype.on=function(a,b){var c;return null==(c=this.bindings)[a]&&(c[a]=[]),this.bindings[a].push(b)},a}(),O=window.XMLHttpRequest,N=window.XDomainRequest,M=window.WebSocket,v=function(a,b){var c,d,e,f;f=[];for(d in b.prototype)try{e=b.prototype[d],f.push(null==a[d]&&"function"!=typeof e?a[d]=e:void 0)}catch(g){c=g}return f},z=[],Pace.ignore=function(){var a,b,c;return b=arguments[0],a=2<=arguments.length?W.call(arguments,1):[],z.unshift("ignore"),c=b.apply(null,a),z.shift(),c},Pace.track=function(){var a,b,c;return b=arguments[0],a=2<=arguments.length?W.call(arguments,1):[],z.unshift("track"),c=b.apply(null,a),z.shift(),c},I=function(a){var b;if(null==a&&(a="GET"),"track"===z[0])return"force";if(!z.length&&C.ajax){if("socket"===a&&C.ajax.trackWebSockets)return!0;if(b=a.toUpperCase(),Z.call(C.ajax.trackMethods,b)>=0)return!0}return!1},j=function(a){function b(){var a,c=this;b.__super__.constructor.apply(this,arguments),a=function(a){var b;return b=a.open,a.open=function(d,e){return I(d)&&c.trigger("request",{type:d,url:e,request:a}),b.apply(a,arguments)}},window.XMLHttpRequest=function(b){var c;return c=new O(b),a(c),c},v(window.XMLHttpRequest,O),null!=N&&(window.XDomainRequest=function(){var b;return b=new N,a(b),b},v(window.XDomainRequest,N)),null!=M&&C.ajax.trackWebSockets&&(window.WebSocket=function(a,b){var d;return d=null!=b?new M(a,b):new M(a),I("socket")&&c.trigger("request",{type:"socket",url:a,protocols:b,request:d}),d},v(window.WebSocket,M))}return Y(b,a),b}(h),Q=null,x=function(){return null==Q&&(Q=new j),Q},H=function(a){var b,c,d,e;for(e=C.ajax.ignoreURLs,c=0,d=e.length;d>c;c++)if(b=e[c],"string"==typeof b){if(-1!==a.indexOf(b))return!0}else if(b.test(a))return!0;return!1},x().on("request",function(b){var c,d,e,f,g;return f=b.type,e=b.request,g=b.url,H(g)?void 0:Pace.running||C.restartOnRequestAfter===!1&&"force"!==I(f)?void 0:(d=arguments,c=C.restartOnRequestAfter||0,"boolean"==typeof c&&(c=0),setTimeout(function(){var b,c,g,h,i,j;if(b="socket"===f?e.readyState<2:0<(h=e.readyState)&&4>h){for(Pace.restart(),i=Pace.sources,j=[],c=0,g=i.length;g>c;c++){if(J=i[c],J instanceof a){J.watch.apply(J,d);break}j.push(void 0)}return j}},c))}),a=function(){function a(){var a=this;this.elements=[],x().on("request",function(){return a.watch.apply(a,arguments)})}return a.prototype.watch=function(a){var b,c,d,e;return d=a.type,b=a.request,e=a.url,H(e)?void 0:(c="socket"===d?new m(b):new n(b),this.elements.push(c))},a}(),n=function(){function a(a){var b,c,d,e,f,g,h=this;if(this.progress=0,null!=window.ProgressEvent)for(c=null,a.addEventListener("progress",function(a){return h.progress=a.lengthComputable?100*a.loaded/a.total:h.progress+(100-h.progress)/2}),g=["load","abort","timeout","error"],d=0,e=g.length;e>d;d++)b=g[d],a.addEventListener(b,function(){return h.progress=100});else f=a.onreadystatechange,a.onreadystatechange=function(){var b;return 0===(b=a.readyState)||4===b?h.progress=100:3===a.readyState&&(h.progress=50),"function"==typeof f?f.apply(null,arguments):void 0}}return a}(),m=function(){function a(a){var b,c,d,e,f=this;for(this.progress=0,e=["error","open"],c=0,d=e.length;d>c;c++)b=e[c],a.addEventListener(b,function(){return f.progress=100})}return a}(),d=function(){function a(a){var b,c,d,f;for(null==a&&(a={}),this.elements=[],null==a.selectors&&(a.selectors=[]),f=a.selectors,c=0,d=f.length;d>c;c++)b=f[c],this.elements.push(new e(b))}return a}(),e=function(){function a(a){this.selector=a,this.progress=0,this.check()}return a.prototype.check=function(){var a=this;return document.querySelector(this.selector)?this.done():setTimeout(function(){return a.check()},C.elements.checkInterval)},a.prototype.done=function(){return this.progress=100},a}(),c=function(){function a(){var a,b,c=this;this.progress=null!=(b=this.states[document.readyState])?b:100,a=document.onreadystatechange,document.onreadystatechange=function(){return null!=c.states[document.readyState]&&(c.progress=c.states[document.readyState]),"function"==typeof a?a.apply(null,arguments):void 0}}return a.prototype.states={loading:0,interactive:50,complete:100},a}(),f=function(){function a(){var a,b,c,d,e,f=this;this.progress=0,a=0,e=[],d=0,c=B(),b=setInterval(function(){var g;return g=B()-c-50,c=B(),e.push(g),e.length>C.eventLag.sampleCount&&e.shift(),a=p(e),++d>=C.eventLag.minSamples&&a<C.eventLag.lagThreshold?(f.progress=100,clearInterval(b)):f.progress=100*(3/(a+3))},50)}return a}(),l=function(){function a(a){this.source=a,this.last=this.sinceLastUpdate=0,this.rate=C.initialRate,this.catchup=0,this.progress=this.lastProgress=0,null!=this.source&&(this.progress=E(this.source,"progress"))}return a.prototype.tick=function(a,b){var c;return null==b&&(b=E(this.source,"progress")),b>=100&&(this.done=!0),b===this.last?this.sinceLastUpdate+=a:(this.sinceLastUpdate&&(this.rate=(b-this.last)/this.sinceLastUpdate),this.catchup=(b-this.progress)/C.catchupTime,this.sinceLastUpdate=0,this.last=b),b>this.progress&&(this.progress+=this.catchup*a),c=1-Math.pow(this.progress/100,C.easeFactor),this.progress+=c*this.rate*a,this.progress=Math.min(this.lastProgress+C.maxProgressPerFrame,this.progress),this.progress=Math.max(0,this.progress),this.progress=Math.min(100,this.progress),this.lastProgress=this.progress,this.progress},a}(),K=null,G=null,q=null,L=null,o=null,r=null,Pace.running=!1,y=function(){return C.restartOnPushState?Pace.restart():void 0},null!=window.history.pushState&&(S=window.history.pushState,window.history.pushState=function(){return y(),S.apply(window.history,arguments)}),null!=window.history.replaceState&&(V=window.history.replaceState,window.history.replaceState=function(){return y(),V.apply(window.history,arguments)}),k={ajax:a,elements:d,document:c,eventLag:f},(A=function(){var a,c,d,e,f,g,h,i;for(Pace.sources=K=[],g=["ajax","elements","document","eventLag"],c=0,e=g.length;e>c;c++)a=g[c],C[a]!==!1&&K.push(new k[a](C[a]));for(i=null!=(h=C.extraSources)?h:[],d=0,f=i.length;f>d;d++)J=i[d],K.push(new J(C));return Pace.bar=q=new b,G=[],L=new l})(),Pace.stop=function(){return Pace.trigger("stop"),Pace.running=!1,q.destroy(),r=!0,null!=o&&("function"==typeof s&&s(o),o=null),A()},Pace.restart=function(){return Pace.trigger("restart"),Pace.stop(),Pace.start()},Pace.go=function(){var a;return Pace.running=!0,q.render(),a=B(),r=!1,o=F(function(b,c){var d,e,f,g,h,i,j,k,m,n,o,p,s,t,u,v;for(k=100-q.progress,e=o=0,f=!0,i=p=0,t=K.length;t>p;i=++p)for(J=K[i],n=null!=G[i]?G[i]:G[i]=[],h=null!=(v=J.elements)?v:[J],j=s=0,u=h.length;u>s;j=++s)g=h[j],m=null!=n[j]?n[j]:n[j]=new l(g),f&=m.done,m.done||(e++,o+=m.tick(b));return d=o/e,q.update(L.tick(b,d)),q.done()||f||r?(q.update(100),Pace.trigger("done"),setTimeout(function(){return q.finish(),Pace.running=!1,Pace.trigger("hide")},Math.max(C.ghostTime,Math.max(C.minTime-(B()-a),0)))):c()})},Pace.start=function(a){u(C,a),Pace.running=!0;try{q.render()}catch(b){i=b}return document.querySelector(".pace")?(Pace.trigger("start"),Pace.go()):setTimeout(Pace.start,50)},"function"==typeof define&&define.amd?define(function(){return Pace}):"object"==typeof exports?module.exports=Pace:C.startOnPageLoad&&Pace.start()}).call(this);
});

angular.module('serviceDeskApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/account/confirm/confirm.html',
    "<maq-header></maq-header><div class=\"wrapper row-offcanvas row-offcanvas-left\" ng-controller=NavbarCtrl><maq-navbar></maq-navbar><div class=container><div class=row><div class=col-sm-12><div class=\"alert alert-info\" ng-show=isLoggedIn()&&!confirmToken><h4>Email address confirmation</h4><p>Look in your mail inbox after an <b>activation message</b>. If you don't find one, push this button:</p><a href=\"\" ng-click=sendConfirmationMail() ng-disabled=confirmationMailSend() class=\"btn btn-primary pull-right\">Send new account activation email.</a><p>Just in cas, check your spam folder.</p></div><div class=\"alert alert-danger\" ng-show=errors.message><h4>Email address confirmation failed</h4><p>The validation token is invalid or has expired. You should signin and ask for a new one.</p></div></div></div></div></div>"
  );


  $templateCache.put('app/account/login/login.html',
    "<div class=\"middle-box text-center loginscreen animated fadeInDown\"><div><div><h1 class=logo-name>SD</h1></div><h3>Welcome to Service Desk</h3><form class=\"form m-t\" role=form ng-submit=login(form) name=form novalidate><div class=form-group><input type=\"\" name=email class=form-control ng-model=user.email placeholder=\"Email or Phone Number\" required></div><div class=form-group><input type=password name=password class=form-control ng-model=user.password placeholder=Password required></div><div class=\"form-group has-error\"><p class=help-block ng-show=\"form.email.$error.required && form.password.$error.required && submitted\">Please enter your email/phone number and password.</p><p class=help-block ng-show=\"form.email.$error.email && submitted\">Please enter a valid email.</p><p class=help-block>{{ errors.other }}</p></div><div class=form-group><input type=checkbox name=\"remember_me\"> Remember Me for a Week</div><button class=\"btn btn-block btn-login\" type=submit>Login</button><p><a href=/pwdreset class=text-center><small>Lost or forgotten your password?</small></a></p><a class=\"btn btn-register text-center text-muted\" href=/signup-serviceagent>Register a new membership</a></form><p class=m-t><small>Skhomotech &copy; 2016</small></p></div></div>"
  );


  $templateCache.put('app/account/pwdreset/pwdreset.html',
    "<div class=container ng-show=\"resetStateIs('valid_token')\"><div class=\"bs-callout bs-callout-info\"><h4>Password reset</h4><p>You changed succesfully your password.</p></div></div><div class=container ng-show=\"resetStateIs('invalid_token')\"><div class=\"alert alert-danger\"><h4>Password reset</h4><p>Somthing went wrong. Your attend to reset your password has failed.</p><a href=/pwdreset class=text-right>Try again to change your password</a></div></div><div class=container ng-show=\"resetStateIs('mailsent')\"><div class=\"alert alert-info\"><h4>Almost there</h4><p>A mail with a rest token and some instructions was sent to <b>{{reset.email}}</b>.</p><p>Check your inbox.</p></div></div><div class=\"passwordBox animated fadeInDown\"><div class=row><div class=col-md-12><div class=ibox-content><h2 class=font-bold>Forgot password?</h2><div class=row><div class=col-lg-12><form class=\"form m-t\" name=resetform ng-submit=sendPwdResetMail(resetform) novalidate><div class=\"body bg-gray\"><p class=text-center>No problem, submit your email address and a new password below and we'll mail you recovery instructions.</p><div class=form-group ng-class=\"{'has-error': resetform.email.$invalid && submitted,'has-success': resetform.email.$valid && submitted}\"><label>Email address</label><input type=email name=email class=form-control ng-model=reset.email required mongoose-error></div><div class=\"form-group has-error\"><p class=help-block ng-show=\"resetform.email.$error.email && submitted\">Doesn't look like a valid email.</p><p class=help-block ng-show=\"resetform.email.$error.required && submitted\">Please enter your email.</p><p class=help-block>{{ errors.other }}</p></div><div class=\"help-block has-error\" ng-show=resetform.email.$error.unknownMailAddress><p>The email address you entered is not known.</p><p>Check the address and send it again.</p></div><div class=form-group ng-class=\"{'has-success': resetform.password.$valid && submitted,'has-error': resetform.password.$invalid && submitted }\"><label>New password</label><input type=password name=password class=form-control ng-model=reset.newPassword ng-minlength=3 required mongoose-error><p class=help-block ng-show=\"(resetform.password.$error.minlength || resetform.password.$error.required) && submitted\">Password must be at least 3 characters.</p><p class=help-block ng-show=resetform.password.$error.mongoose>{{ errors.password }}</p></div><button class=\"btn btn-login btn-block\" ng-disabled=pwdResetMailSend type=submit>Send Recovery Email</button> <a class=\"btn-block text-center\" href=/login>Login</a> <a class=\"btn-block text-center\" href=/signup>Register</a></div></form></div></div></div></div></div><p class=m-t><small>Skhomotech &copy; 2016</small></p></div>"
  );


  $templateCache.put('app/account/settings/settings.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Profile</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Profile</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-content><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group ng-class=\"{'has-error': (form.password.$error.mongoose || form.password.$error.required) && submitted}\"><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword required mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p><p class=help-block ng-show=\"form.password.$error.required && submitted\">The current password is required</p></div><div class=form-group ng-class=\"{'has-error':(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted),'has-success':message && (!form.newPassword.$error.minlength || !form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)}\"><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)\">Password must be at least 3 characters.</p><p class=help-block>{{ message }}</p></div><button class=\"btn btn-lg btn-primary\" type=submit>Save changes</button></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup-servicedeskagent.html',
    "<div class=\"passwordBox animated fadeInDown\"><div class=row><div class=col-md-12><div class=ibox-content><h2 class=\"font-bold text-center\">Register Service Desk Agent Account</h2><div class=row><div class=col-lg-12><form class=form name=registerForm ng-submit=registerClient(registerForm) novalidate role=form><div class=\"body bg-gray\"><div class=form-group ng-class=\"{ 'has-success': registerForm.phoneNumber.$valid && submitted, 'has-error': registerForm.phoneNumber.$invalid && submitted }\"><label>Phone Number</label><input name=phoneNumber class=form-control ng-model=user.phoneNumber required ui-mask=9999999999 ui-mask-placeholder ui-mask-placeholder-char=\"-\"><p class=help-block ng-show=\"registerForm.phoneNumber.$error.required && submitted\">A Phone Number is required</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.password.$valid && submitted, 'has-error': registerForm.password.$invalid && submitted }\"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show=\"(registerForm.password.$error.minlength || registerForm.password.$error.required) && submitted\">Password must be at least 3 characters.</p><p class=help-block ng-show=registerForm.password.$error.mongoose>{{ errors.password }}</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.confirmPassword.$dirty && (!registerForm.confirmPassword.$error.passwordsMatch && submitted), 'has-error': registerForm.confirmPassword.$dirty && (registerForm.confirmPassword.$error.passwordsMatch && submitted)}\"><label>Confirm Password</label><input type=password name=confirmPassword class=form-control ng-model=user.confirmPassword ui-validate=\"{passwordsMatch: 'passwordsMatch($value)'}\" ui-validate-watch=\"'user.password'\"><p class=help-block ng-show=\"registerForm.confirmPassword.$dirty && (registerForm.confirmPassword.$error.passwordsMatch && submitted)\">Passwords don't match</p></div></div><button class=\"btn btn-login btn-block\" type=submit>Sign up</button><p class=text-center><a href=/login>I already have an account</a></p></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup.html',
    "<div class=\"passwordBox animated fadeInDown\"><div class=row><div class=col-md-12><div class=ibox-content><h2 class=font-bold>Register Account</h2><div class=row><div class=col-lg-12><form class=form name=registerForm ng-submit=register(registerForm) novalidate role=form><div class=\"body bg-gray\"><div class=form-group ng-class=\"{ 'has-success': registerForm.firstName.$valid && submitted, 'has-error': registerForm.firstName.$invalid && submitted }\"><label>First Name</label><input name=firstName class=form-control ng-model=user.firstName required><p class=help-block ng-show=\"registerForm.firstName.$error.required && submitted\">A First Name is required</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.lastName.$valid && submitted, 'has-error': registerForm.lastName.$invalid && submitted }\"><label>Last Name</label><input name=lastName class=form-control ng-model=user.lastName required><p class=help-block ng-show=\"registerForm.lastName.$error.required && submitted\">A Last Name is required</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.email.$valid && submitted, 'has-error': registerForm.email.$invalid && submitted }\"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show=\"registerForm.email.$error.email && submitted\">Doesn't look like a valid email.</p><p class=help-block ng-show=\"registerForm.email.$error.required && submitted\">What's your email address?</p><p class=help-block ng-show=registerForm.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.password.$valid && submitted, 'has-error': registerForm.password.$invalid && submitted }\"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show=\"(registerForm.password.$error.minlength || registerForm.password.$error.required) && submitted\">Password must be at least 3 characters.</p><p class=help-block ng-show=registerForm.password.$error.mongoose>{{ errors.password }}</p></div><div class=form-group ng-class=\"{ 'has-success': registerForm.confirmPassword.$dirty && (!registerForm.confirmPassword.$error.passwordsMatch && submitted), 'has-error': registerForm.confirmPassword.$dirty && (registerForm.confirmPassword.$error.passwordsMatch && submitted)}\"><label>Confirm Password</label><input type=password name=confirmPassword class=form-control ng-model=user.confirmPassword ui-validate=\"{passwordsMatch: 'passwordsMatch($value)'}\" ui-validate-watch=\"'user.password'\"><p class=help-block ng-show=\"registerForm.confirmPassword.$dirty && (registerForm.confirmPassword.$error.passwordsMatch && submitted)\">Passwords don't match</p></div></div><button class=\"btn btn-login btn-block\" type=submit>Sign up</button><p class=text-center><a href=/login>I already have an account</a></p></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/add.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add User</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/users>Users</a></li><li class=active><strong>Add User</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addUserForm ng-submit=addUser(user,addUserForm,addUserForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': addUserForm.role.$invalid && submitted,'has-success': !addUserForm.role.$invalid && submitted}\"><label>Role</label><select id=role name=role class=form-control ng-model=user.role required><option ng-repeat=\"role in roles\" value={{role.value}}>{{role.name}}</option></select><p ng-show=\"addUserForm.role.$invalid && submitted\" class=help-block>The role is required</p></div><!--<div class=\"form-group\" ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': addUserForm.billingType.$invalid && submitted,'has-success': !addUserForm.billingType.$invalid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label>Billing Type</label>\n" +
    "\t\t\t\t\t\t\t\t<select id=\"billingType\" name=\"billingType\" class=\"form-control\" ng-model=\"user.billingType\" ng-required=\"user.role == 'client'\">\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-repeat=\"type in billingTypes\" value=\"{{type.value}}\">{{type.name}}</option>\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.billingType.$invalid && submitted\" class=\"help-block\">The Billing Type is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-show=\"user.billingType == 'Package'\" ng-class=\"{'has-error': addUserForm.clientPackage.$invalid && submitted,'has-success': !addUserForm.clientPackage.$invalid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label>Package</label>\n" +
    "\t\t\t\t\t\t\t\t<select id=\"clientPackage\" name=\"clientPackage\" class=\"form-control\" ng-model=\"user.clientPackage\" ng-required=\"user.billingType == 'Package'\">\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-repeat=\"pckg in packages\" value=\"{{pckg._id}}\">{{pckg.packageName}}</option>\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.clientPackage.$invalid && submitted\" class=\"help-block\">The Package is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': addUserForm.clientType.$invalid && submitted,'has-success': !addUserForm.clientType.$invalid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label>Client Type</label>\n" +
    "\t\t\t\t\t\t\t\t<select id=\"clientType\" name=\"clientType\" class=\"form-control\" ng-model=\"user.clientType\" ng-required=\"user.role == 'client'\">\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-repeat=\"type in clientTypes\" value=\"{{type.value}}\">{{type.name}}</option>\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.clientType.$invalid && submitted\" class=\"help-block\">The Client Type is required</p>\n" +
    "\t\t\t\t\t\t\t</div>--><div class=form-group ng-if=\"user.role == 'user' || user.clientType == 'Individual'\" ng-class=\"{'has-error': addUserForm.firstName.$error.required && submitted,'has-success': !addUserForm.firstName.$error.required && submitted}\"><label class=control-label for=firstName>First Name:</label><input id=firstName name=firstName ng-model=user.firstName ng-required=\"user.role == 'user' || user.clientType == 'Individual'\" class=\"form-control\"><p ng-show=\"addUserForm.firstName.$error.required  && submitted\" class=help-block>The First Name is required</p></div><!--<div class=\"form-group\" ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': addUserForm.companyName.$error.required && submitted,'has-success': !addUserForm.companyName.$error.required && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"companyName\">Company Name:</label>\n" +
    "\t\t\t\t\t\t\t\t<input type=\"text\" id=\"companyName\" name=\"companyName\" ng-model=\"user.companyName\" ng-required=\"user.clientType == 'Company'\" class=\"form-control\"/>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.companyName.$error.required  && submitted\" class=\"help-block\">The Company Name is required</p>\n" +
    "\t\t\t\t\t\t\t</div>--><div class=form-group ng-if=\"user.role == 'user' || user.clientType == 'Individual'\" ng-class=\"{'has-error': addUserForm.lastName.$error.required && submitted,'has-success': !addUserForm.lastName.$error.required && submitted}\"><label class=control-label for=lastName>Last Name:</label><input id=lastName name=lastName ng-model=user.lastName ng-required=\"user.role == 'user'\" class=\"form-control\"><p ng-show=\"addUserForm.lastName.$error.required  && submitted\" class=help-block>The Last Name is required</p></div><div class=form-group ng-class=\"{'has-error': addUserForm.zone.$invalid && submitted,'has-success': !addUserForm.zone.$invalid && submitted}\"><label>Department</label><ui-select id=zone name=zone ng-model=user.zone theme=bootstrap required><ui-select-match placeholder=\"Select a Department\">{{$select.selected.deliveryZoneArea+' - '+$select.selected.deliveryZoneType}}</ui-select-match><ui-select-choices repeat=\"zone in zones | filter: $select.search\" value={{zone._id}}><div ng-bind-html=\"zone.deliveryZoneArea+' - '+zone.deliveryZoneType | highlight: $select.search\"></div></ui-select-choices></ui-select><p ng-show=\"addUserForm.zone.$invalid && submitted\" class=help-block>The Department is required.</p></div><!--<div class=\"form-group\" ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': addUserForm.contactPerson.$error.required && submitted,'has-success': !addUserForm.contactPerson.$error.required && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"contactPerson\">Contact Person:</label>\n" +
    "\t\t\t\t\t\t\t\t<input type=\"text\" id=\"contactPerson\" name=\"contactPerson\" ng-model=\"user.contactPerson\" ng-required=\"user.clientType == 'Company'\" class=\"form-control\"/>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.contactPerson.$error.required  && submitted\" class=\"help-block\">The Contact Person is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': addUserForm.contactPersonPhoneNumber.$error.required && submitted,'has-success': !addUserForm.contactPersonPhoneNumber.$error.required && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"contactPersonPhoneNumber\">Contact Person Phone Number:</label>\n" +
    "\t\t\t\t\t\t\t\t<input type=\"text\" id=\"contactPersonPhoneNumber\" name=\"contactPersonPhoneNumber\" ng-model=\"user.contactPersonPhoneNumber\" ng-required=\"user.clientType == 'Company'\" class=\"form-control\" ui-mask=\"9999999999\" ui-mask-placeholder ui-mask-placeholder-char=\"-\"/>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.contactPersonPhoneNumber.$error.required  && submitted\" class=\"help-block\">The Contact Person Phone Number is required</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<!--<div class=\"form-group\" ng-show=\"user.role == 'client'\">\n" +
    "\t\t\t\t\t\t\t\t<label for=\"needsWaybill\">Needs Waybill?</label>\n" +
    "\t\t\t\t\t\t\t\t<input type=\"checkbox\" name=\"needsWaybill\" ng-model=\"user.needsWaybill\" value=\"true\"/>\n" +
    "\t\t\t\t\t\t\t</div>--><div class=form-group ng-class=\"{'has-error': addUserForm.email.$invalid && submitted,'has-success': !addUserForm.email.$invalid && submitted}\"><label class=control-label for=email>Email:</label><input type=email id=email name=email type=email ng-model=user.email ng-required=\"user.role == 'user'\" mongoose-error class=\"form-control\"><p ng-show=\"addUserForm.email.$error.email && submitted\" class=help-block>Enter a valid Email Address</p><p ng-show=\"addUserForm.email.$error.required && submitted\" class=help-block>The Email Address is required</p><p class=help-block ng-show=addUserForm.email.$error.mongoose>{{ errors.email }}</p></div><div class=\"form-group phone-number animate-show\" ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': addUserForm.phoneNumber.$invalid && submitted,'has-success': !addUserForm.phoneNumber.$invalid && submitted}\"><label class=control-label for=phoneNumber>Phone Number:</label><input type=phoneNumber id=phoneNumber name=phoneNumber type=phoneNumber ng-model=user.phoneNumber ng-required=\"user.role == 'client'\" class=form-control ui-mask=9999999999 ui-mask-placeholder ui-mask-placeholder-char=\"-\"><p ng-show=\"addUserForm.phoneNumber.$invalid && submitted\" class=help-block>A Phone Number is required</p></div><div class=form-group ng-show=\"user.role == 'client'\"><span maq-add-client-contact></span></div><!--<div class=\"form-group animate-show\" ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': addUserForm.clientLocation.$invalid && submitted,'has-success': !addUserForm.clientLocation.$invalid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"clientLocation\">Client Location:</label>\n" +
    "\t\t\t\t\t\t\t\t<input type=\"clientLocation\" id=\"clientLocation\" name=\"clientLocation\" type=\"clientLocation\" ng-model=\"user.clientLocation\" ng-required=\"user.role == 'client'\" class=\"form-control\"/>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"addUserForm.clientLocation.$invalid && submitted\" class=\"help-block\">A Client Location is required</p>\n" +
    "\t\t\t\t\t\t\t</div>--><div class=\"form-group password animate-show\" ng-show=\"user.role == 'user'\" ng-class=\"{'has-error': (addUserForm.password.$error.minlength || addUserForm.password.$error.maxlength || addUserForm.password.$invalid) && submitted,'has-success': (!addUserForm.password.$error.minlength && !addUserForm.password.$error.maxlength && !addUserForm.password.$invalid) && submitted}\"><label class=control-label for=password>Password:</label><input type=password id=password name=password ng-model=user.password ng-minlength=3 ng-maxlength=20 ng-required=\"user.role == 'user'\" class=\"form-control\"><p ng-show=\"addUserForm.password.$error.minlength && submitted\" class=help-block>Password is too short</p><p ng-show=\"addUserForm.password.$error.maxlength && submitted\" class=help-block>Password is too long</p><p ng-show=\"addUserForm.password.$error.required && submitted\" class=help-block>Password is required</p></div><div class=\"form-group confirm-password animate-show\" ng-show=\"user.role == 'user'\" ng-class=\"{'has-error': addUserForm.confirmPassword.$dirty && (addUserForm.confirmPassword.$error.passwordsMatch && submitted),'has-success': addUserForm.confirmPassword.$dirty && (!addUserForm.confirmPassword.$error.passwordsMatch && submitted)}\"><label class=control-label for=confirmPassword>Confirm Password:</label><input type=password id=confirmPassword name=confirmPassword ng-model=user.confirmPassword ui-validate=\"{passwordsMatch: 'passwordsMatch($value)'}\" ui-validate-watch=\"'user.password'\" ng-required=\"user.role == 'user'\" class=\"form-control\"><p ng-show=\"addUserForm.confirmPassword.$dirty && (addUserForm.confirmPassword.$error.passwordsMatch && submitted)\" class=help-block>Passwords don't match</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div><!-- /.box --></div></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/admin.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Admin</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Users</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=user template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>User</th><th>Phone Number</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"user in users | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=user><td ng-if=\"user.role != 'client' || user.clientType == 'Individual'\">{{user.firstName}} {{user.lastName}}</td><td ng-if=\"user.clientType == 'Company'\">{{user.companyName}}</td><td>{{user.phoneNumber}}</td><td ng-click=open(user)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td ng-if=\"user.role != 'client'\"></td><td ng-if=\"user.role == 'client'\"><a title=\"Add Errand\" href=errands/add/{{user._id}}><span class=\"glyphicon glyphicon-plus\"></span></a></td><td><a href=admin/edit/{{user._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(user) ng-confirm-click=\"Are you sure you want to delete this user?\" ng-if=\"user.role != 'admin'\"><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td><td ng-if=\"user.role != 'admin'\"><a ng-click=deactivate(user) ng-if=\"user.status == 1\" title=Deactivate><span class=\"glyphicon glyphicon-remove\"></span></a> <a ng-click=activate(user) ng-if=\"user.status == 0\" title=Activate><span class=\"glyphicon glyphicon-ok\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/client-dashboard.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-user pull-right\"></i><h5>Admin</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/dashboard>Dashboard</a></li><li><a href=/users>Users</a></li><li><a href=/admin/add>Add User</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-motorcycle pull-right\"></i><h5>Category</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/category>Category Dashboard</a></li><li><a href=/category/add>Add Category</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-motorcycle pull-right\"></i><h5>Issues</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/issues>Issue Dashboard</a></li><li><a href=/issues/add>Add Issue</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-motorcycle pull-right\"></i><h5>Channel</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/channel>Channel Dashboard</a></li><li><a href=/channel/add>Add Channel</a></li></ul></div></div></div><!--\t\t\t<div class=\"col-lg-4\">\n" +
    "\t\t\t\t<div class=\"ibox float-e-margins\">\n" +
    "\t\t\t\t\t<div class=\"ibox-title\">\n" +
    "\t\t\t\t\t\t<i class=\"fa fa-calendar pull-right\"></i>\n" +
    "\t\t\t\t\t\t<h5>Errands</h5>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"ibox-content\">\n" +
    "\t\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t\t<ul class=\"nav nav-dashboard col-lg-6\">\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands\">Errands Dashboard</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/add\">Add Errand</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/status\">Errand Statuses</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/status/add\">Add Errand Status</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/generate-runsheet\">Generate Runsheet</a></li>\n" +
    "\t\t\t\t\t\t\t</ul>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<ul class=\"nav nav-dashboard col-lg-6\">\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/attempted-delivery-reasons\">Attempted Delivery Reasons</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/attempted-delivery-reasons/add\">Add Attempted Delivery Reason</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/delivery-zones\">Delivery Zones</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/delivery-zones/add\">Add Delivery Zone</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/payment-status\">Payment Statuses</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/payment-status/add\">Add Payment Status</a></li>\n" +
    "\t\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>--></div><div class=row><div class=col-md-12><div class=\"ibox float-e-margins\"><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=errand template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-errand hover\"><tr><th><input type=checkbox name=select-all text=\"Select All\" maq-select-all-errands></th><th>Ref Number</th><th>Category</th><th>Description</th><th>Status</th><th>Priority</th><th>Channel</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"issue in issues | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=issue ng-class=\"{'highlighted':issue.issueStatus == 'OnHold' }\"><td><input class=errand-checkbox type=checkbox name={{issue._id}} value={{issue._id}} maq-select-errand></td><td>{{issue.issueRefNumber}}</td><td>{{issue.issueCategory.categoryName}}</td><td>{{issue.issueDescription}}</td><td>{{issue.issueStatus.issueStatusName}}</td><td>{{issue.issuePriority}}</td><td>{{issue.issueChannel.channelName}}</td><!--<td style=\"color:{{errand.status.statusColour}};\" title=\"{{errand.status.statusName}}\">\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Open'\" class=\"fa fa-hand-paper-o\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Attempted Delivery'\" class=\"fa fa-exchange\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Cancelled'\" class=\"fa fa-thumbs-down\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Delivered'\" class=\"fa fa-thumbs-up\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'In Transit'\" class=\"fa fa-motorcycle\"></span>\n" +
    "\t\t\t\t\t\t\t\t</td>--><td ng-click=open(issue)><a title=\"View Details\"><span class=\"fa fa-list\"></span></a></td><td ng-click=comments(issue)><a title=\"View Comments\"><span class=\"fa fa-comments\"></span></a></td><td ng-if=isAdminAsync><a href=issues/edit/{{issue._id}} title=Edit><span class=\"fa fa-pencil\"></span></a></td><td ng-click=delete(issue) ng-confirm-click=\"Are you sure you want to delete this issue?\" ng-if=\"isAdminAsync && errand.role != 'admin'\"><a class=trash title=Delete><span class=\"fa fa-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div><script type=text/ng-template id=myModalContent.html><div class=\"modal-header\">\n" +
    "\t\t\t\t\t<h3 class=\"modal-title\">Errand Details</h3>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"modal-body\">\n" +
    "\t\t\t\t\t<ul>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.client.clientType == 'Individual'\">Client: {{errand.client.firstName}} {{errand.client.lastName}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.client.clientType == 'Company'\">Client: {{errand.client.companyName}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.clientPhoneNumber\">Client Phone Number: {{client.clientPhoneNumber}}</li>\n" +
    "\t\t\t\t\t\t<li>Billing Type: {{errand.client.billingType}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.paymentStatus\">Payment Status: {{errand.paymentStatus.statusName}}</li>\n" +
    "\t\t\t\t\t\t<li>Rider: {{errand.errandRider.riderFirstName}} {{errand.errandRider.riderLastName}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.description\">Description: {{errand.description}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.price\">Price: Kshs. {{errand.price}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.email\">Email: {{errand.email}}</li>\n" +
    "\t\t\t\t\t\t<li ng-if=\"errand.client.phoneNumber\">Phone Number: {{errand.client.phoneNumber}}</li>\n" +
    "\t\t\t\t\t\t<li>Client Location: {{errand.client.clientLocation}}</li>\n" +
    "\t\t\t\t\t\t<li>Added: {{errand.dateOfErrand | date:'mediumDate'}}</li>\n" +
    "\t\t\t\t\t\t<li>Added: {{errand.added | date:'medium'}}</li>\n" +
    "\t\t\t\t\t</ul>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"modal-footer\">\n" +
    "\t\t\t\t\t<button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n" +
    "\t\t\t\t\t<button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n" +
    "\t\t\t\t</div></script><script type=text/ng-template id=updateStatusModal.html><div class=\"modal-header\">\n" +
    "\t\t\t\t\t<h3 class=\"modal-title\">Update Status</h3>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t\t<div class=\"modal-body\">\n" +
    "\t\t\t\t\t<form novalidate=\"novalidate\" role=\"form\" name=\"updateStatusForm\" ng-submit=\"updateStatus(errand,updateStatusForm.$valid)\">\n" +
    "\t\t\t\t\t\t<div class=\"box-body\">\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-class=\"{'has-error': updateStatusForm.status.$invalid && submitted,'has-success': updateStatusForm.status.$valid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"status\">Status:</label>\n" +
    "\t\t\t\t\t\t\t\t<select id=\"status\" name=\"status\" class=\"form-control\" ng-model=\"errand.status._id\" required>\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-repeat=\"status in errandStatuses\" value=\"{{status._id}}\">{{status.statusName}}</option>\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-if=\"status._id == errand.status._id\" ng-repeat=\"status in errandStatuses\" value=\"{{status._id}}\" selected>{{status.statusName}}</option>\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"updateStatusForm.status.$invalid && submitted\" class=\"help-block\">The status is required.</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-if=\"errand.client.billingType == 'Single'\" ng-class=\"{'has-error': updateStatusForm.paymentStatus.$invalid && submitted,'has-success': updateStatusForm.paymentStatus.$valid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"status\">Payment Status:</label>\n" +
    "\t\t\t\t\t\t\t\t<select id=\"paymentStatus\" name=\"paymentStatus\" class=\"form-control\" ng-model=\"errand.paymentStatus._id\">\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-repeat=\"paymentStatus in paymentStatuses\" value=\"{{paymentStatus._id}}\">{{paymentStatus.statusName}}</option>\n" +
    "\t\t\t\t\t\t\t\t\t<option ng-if=\"paymentStatus._id == errand.paymentStatus._id\" ng-repeat=\"paymentStatus in paymentStatuses\" value=\"{{paymentStatus._id}}\" selected>{{paymentStatus.statusName}}</option>\n" +
    "\t\t\t\t\t\t\t\t</select>\n" +
    "\t\t\t\t\t\t\t\t<p ng-show=\"updateStatusForm.paymentStatus.$invalid && submitted\" class=\"help-block\">The Payment Status is required.</p>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"form-group\" ng-class=\"{'has-error': updateStatusForm.statusComment.$invalid && submitted,'has-success': updateStatusForm.statusComment.$valid && submitted}\">\n" +
    "\t\t\t\t\t\t\t\t<label class=\"control-label\" for=\"statusComment\">Status Details:</label>\n" +
    "\t\t\t\t\t\t\t\t<wysiwyg textarea-id=\"statusComment\" textarea-class=\"form-control\"  textarea-height=\"80px\" textarea-name=\"statusComment\" textarea-required ng-model=\"errand.statusComment\" enable-bootstrap-title=\"true\" textarea-menu=\"{{customMenu}}\"></wysiwyg>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<div class=\"box-footer\">\n" +
    "\t\t\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-small btn-primary\">Update Status</button>\n" +
    "\t\t\t\t\t\t\t\t<a ng-click=\"cancel()\" class=\"btn btn-small\">Cancel</a>\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</form>\n" +
    "\t\t\t\t</div></script></div></div></div>"
  );


  $templateCache.put('app/admin/partials/client-details-modal.html',
    "<div><div class=modal-header><h3 class=modal-title>Client Details</h3></div><div class=modal-body><ul><li ng-if=\"user.role != 'client' || user.clientType == 'Individual'\">Name: {{user.firstName}} {{user.lastName}}</li><li ng-if=\"user.clientType == 'Company'\">Name: {{user.companyName}}</li><li>Email: {{user.email}}</li><li ng-if=\"user.role == 'client'\">Phone Number: {{user.phoneNumber}}</li><li ng-if=\"user.role == 'client'\">Client Location: {{user.clientLocation}}</li><li ng-if=\"user.role == 'client'\">Billing Type: {{user.billingType}}</li><li ng-if=user.clientPackage>Package: {{user.clientPackage.packageName}}</li><li>Added: {{user.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/admin/partials/client-invoice.html',
    "<div class=row><div class=col-xs-12><!-- Main content --><section class=content style=\"border: medium none; margin: 0; box-shadow: none\"><!-- title row --><div class=row style=\"margin: 10px 0px 20px; border-bottom: 1px solid #EEE\"><div class=col-xs-6><h2><img src=assets/images/dash-logo.png alt=\"\"></h2><small>Invoice {{ preparedStartDate | date:'mediumDate' }} to {{ preparedEndDate | date:'mediumDate' }}</small><br></div><!-- /.col --><div class=\"col-xs-6 pull-right\"><p class=text-right>Service Delovery Report<br>Rivonia, Sandton<br>Tel: 011 500 3434<br>Email: info@skhomotech.co.za</p></div></div><div class=\"row invoice-info\"><div class=\"col-xs-4 invoice-col invoice-col-bordered\">Invoice To:<address>Client Name<br>Address<br>Phone Number<br></address></div><!-- /.col --><div class=\"col-xs-4 col-xs-offset-4 invoice-col\"><br><b>Invoice ID:</b> {{order._id}}<br></div><!-- /.col --></div><!-- /.row --><div class=row><div class=col-xs-12><table class=\"table table-bordered table-responsive\"><thead><tr><th>Qty</th><th>Description</th><th>Rate</th><th>Amount</th></tr></thead><tbody><tr><td>data</td><td>data</td><td>data</td><td class=text-right>data</td></tr><tr><td colspan=2>Thank you for your business</td><td colspan=2 class=text-right><b>Total: Kshs.</b> 10,000</td></tr></tbody></table></div><!-- /.col --></div><!-- /.row --><div class=row><div class=col-xs-12>ALL INVOICES MUST BE PAID FOURTEEN (14) DAYS FROM DATE OF INVOICE. SERVICES MAY NOT BE RENDERED INCASE THE INVOICE IS NOT PAID IN TIME. CHEQUES SHOULD BE ADDRESSED TO DASH DELIVERY SERVICES, A/C NUMBER 0052091214001, CHASE BANK, HURLINGHAM BRANCH</div></div></section><!-- /.content --></div></div>"
  );


  $templateCache.put('app/admin/partials/clients.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Admin</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Clients</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-xs-12><div class=ibox><div class=ibox-title><div class=row><div class=col-xs-2><label for=with-selected>With Selected:</label><div class=col-xs-10 style=\"padding: 0px\"><select id=bulkAction name=bulkAction class=form-control ng-model=user.bulkAction><option ng-repeat=\"action in bulkActions\" value={{action.value}}>{{action.name}}</option></select></div><div class=col-xs-2><input type=button name=\"\" value=Go ng-click=bulkAction(selectedClients,user.bulkAction) class=\"btn btn-small btn-primary\"></div></div><div class=\"col-xs-2 col-xs-offset-1\"><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-xs-1><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th><input type=checkbox name=select-all text=\"Select All\" maq-select-all-clients></th><th>Client Name</th><th>Phone Number</th><th>Payment Status</th><th>Balance</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"user in users | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=user><td><input class=client-checkbox type=checkbox name={{user._id}} value={{user._id}} maq-select-client></td><td ng-if=\"user.role != 'client' || user.clientType == 'Individual'\">{{user.firstName}} {{user.lastName}}</td><td ng-if=\"user.clientType == 'Company'\">{{user.companyName}}</td><td>{{user.phoneNumber}}</td><td>{{user.paymentStatus}}</td><td ng-if=user.balance>{{user.balance}}</td><td ng-if=!user.balance>--</td><td ng-click=open(user)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><div class=btn-group><button type=button class=\"btn btn-default dropdown-toggle\" data-toggle=dropdown>More Actions <span class=caret></span> <span class=sr-only>Toggle Dropdown</span></button><ul class=dropdown-menu role=menu><li ng-if=\"user.role == 'client'\"><a title=\"Add Errand\" href=errands/add/{{user._id}}>Add Errand</a></li><li><a href=admin/edit/{{user._id}} title=Edit>Edit Client</a></li><li ng-click=delete(user) ng-confirm-click=\"Are you sure you want to delete this user?\" ng-if=\"user.role != 'admin'\"><a class=trash title=Delete>Delete Client</a></li><li ng-if=\"user.role != 'admin'\"><a ng-click=deactivate(user) ng-if=\"user.status == 1\" title=Deactivate>Deactivate Client</a> <a ng-click=activate(user) ng-if=\"user.status == 0\" title=Activate>Activate Client</a></li></ul></div></td></tr></table><div class=row><div class=\"col-xs-3 col-xs-offset-9\"><dir-pagination-controls pagination-id=user template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div></div></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/dashboard.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div ng-if=isAdmin() class=row><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-user pull-right\"></i><h5>Admin</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/dashboard>Dashboard</a></li><li><a href=/users>Users</a></li><li><a href=/admin/add>Add User</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-gift pull-right\"></i><h5>Category</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/category>Category Dashboard</a></li><li><a href=/category/add>Add Category</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-gift pull-right\"></i><h5>Channel</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/category>Channel Dashboard</a></li><li><a href=/category/add>Add Channel</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-gift pull-right\"></i><h5>Divisions</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/division>Divisions Dashboard</a></li><li><a href=/division/add>Add Division</a></li></ul></div></div></div><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-gift pull-right\"></i><h5>Status</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/issuestatus>Status Dashboard</a></li><li><a href=/issuestatus/add>Add Status</a></li></ul></div></div></div><!-- <div class=\"col-lg-2\">\n" +
    "\t\t\t\t<div class=\"ibox float-e-margins\">\n" +
    "\t\t\t\t\t<div class=\"ibox-title\">\n" +
    "\t\t\t\t\t\t<i class=\"fa fa-motorcycle pull-right\"></i>\n" +
    "\t\t\t\t\t\t<h5>Bikes</h5>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"ibox-content\">\n" +
    "\t\t\t\t\t\t<ul class=\"nav nav-dashboard\">\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/bikes\">Bikes Dashboard</a></li>\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/bikes/add\">Add Bike</a></li>\n" +
    "\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div> --><!-- <div class=\"col-lg-2\">\n" +
    "\t\t\t\t<div class=\"ibox float-e-margins\">\n" +
    "\t\t\t\t\t<div class=\"ibox-title\">\n" +
    "\t\t\t\t\t\t<i class=\"fa fa-motorcycle pull-right\"></i>\n" +
    "\t\t\t\t\t\t<h5>Issues</h5>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"ibox-content\">\n" +
    "\t\t\t\t\t\t<ul class=\"nav nav-dashboard\">\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/issues\">Issues Dashboard</a></li>\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/issues/add\">Add Issue</a></li>\n" +
    "\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div> --><div class=col-lg-2><div class=\"ibox float-e-margins\"><div class=ibox-title><i class=\"fa fa-motorcycle pull-right\"></i><h5>Prorities</h5></div><div class=ibox-content><ul class=\"nav nav-dashboard\"><li><a href=/priority>Priorities Dashboard</a></li><li><a href=/priority/add>Add Priority</a></li></ul></div></div></div><!-- <div class=\"col-lg-2\">\n" +
    "\t\t\t\t<div class=\"ibox float-e-margins\">\n" +
    "\t\t\t\t\t<div class=\"ibox-title\">\n" +
    "\t\t\t\t\t\t<i class=\"fa fa-hand-rock-o pull-right\"></i>\n" +
    "\t\t\t\t\t\t<h5>Riders</h5>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"ibox-content\">\n" +
    "\t\t\t\t\t\t<ul class=\"nav nav-dashboard\">\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/riders\">Riders Dashboard</a></li>\n" +
    "\t\t\t\t\t\t\t<li><a href=\"/riders/add\">Add Rider</a></li>\n" +
    "\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"col-lg-4\">\n" +
    "\t\t\t\t<div class=\"ibox float-e-margins\">\n" +
    "\t\t\t\t\t<div class=\"ibox-title\">\n" +
    "\t\t\t\t\t\t<i class=\"fa fa-calendar pull-right\"></i>\n" +
    "\t\t\t\t\t\t<h5>Errands</h5>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"ibox-content\">\n" +
    "\t\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t\t<ul class=\"nav nav-dashboard col-lg-6\">\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands\">Errands Dashboard</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/add\">Add Errand</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/status\">Errand Statuses</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/status/add\">Add Errand Status</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/generate-runsheet\">Generate Runsheet</a></li>\n" +
    "\t\t\t\t\t\t\t</ul>\n" +
    "\n" +
    "\t\t\t\t\t\t\t<ul class=\"nav nav-dashboard col-lg-6\">\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/attempted-delivery-reasons\">Attempted Delivery Reasons</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/attempted-delivery-reasons/add\">Add Attempted Delivery Reason</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/delivery-zones\">Delivery Zones</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/delivery-zones/add\">Add Delivery Zone</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/payment-status\">Payment Statuses</a></li>\n" +
    "\t\t\t\t\t\t\t\t<li><a href=\"/errands/payment-status/add\">Add Payment Status</a></li>\n" +
    "\t\t\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t\t</div> --></div><div class=row><div class=col-md-12><div class=\"ibox float-e-margins\"><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=issue template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-errand hover\"><tr><th><input type=checkbox name=select-all text=\"Select All\" maq-select-all-errands></th><th>Ref Number</th><th>Category</th><th>Description</th><th>Status</th><th>Channel</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"issue in issues | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=issue ng-class=\"{'highlighted':issue.issueStatus == 'OnHold' }\"><td><input class=errand-checkbox type=checkbox name={{issue._id}} value={{issue._id}} maq-select-errand></td><td>{{issue.issueRefNumber}}</td><td>{{issue.issueCategory.categoryName}}</td><td>{{issue.issueDescription}}</td><td>{{issue.issueStatus.issueStatusName}}</td><td>{{issue.issueChannel.channelName}}</td><!--<td style=\"color:{{errand.status.statusColour}};\" title=\"{{errand.status.statusName}}\">\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Open'\" class=\"fa fa-hand-paper-o\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Attempted Delivery'\" class=\"fa fa-exchange\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Cancelled'\" class=\"fa fa-thumbs-down\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'Delivered'\" class=\"fa fa-thumbs-up\"></span>\n" +
    "\t\t\t\t\t\t\t\t\t<span ng-if=\"errand.status.statusName == 'In Transit'\" class=\"fa fa-motorcycle\"></span>\n" +
    "\t\t\t\t\t\t\t\t</td>--><td ng-click=open(issue)><a title=\"View Details\"><span class=\"fa fa-list\"></span></a></td><td ng-click=comments(issue)><a title=\"View Comments\"><span class=\"fa fa-comments\"></span></a></td><td ng-if=isAdminAsync><a href=issues/edit/{{issue._id}} title=Edit><span class=\"fa fa-pencil\"></span></a></td><td ng-click=delete(issue) ng-confirm-click=\"Are you sure you want to delete this issue?\" ng-if=\"isAdminAsync && issue.role != 'admin'\"><a class=trash title=Delete><span class=\"fa fa-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/edit.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit User</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/admin>Users</a></li><li class=active><strong>Edit User</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate role=form name=editUserForm ng-submit=updateUser(user,editUserForm.$valid)><div class=form-group ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': editUserForm.billingType.$invalid && submitted,'has-success': !editUserForm.billingType.$invalid && submitted}\"><label>Billing Type</label><select id=billingType name=billingType class=form-control ng-model=user.billingType ng-required=\"user.role == 'client'\"><option ng-repeat=\"type in billingTypes\" value={{type.value}}>{{type.name}}</option></select><p ng-show=\"editUserForm.billingType.$invalid && submitted\" class=help-block>The Billing Type is required</p></div><div class=form-group ng-show=\"user.billingType == 'Package'\" ng-class=\"{'has-error': editUserForm.clientPackage.$invalid && submitted,'has-success': !editUserForm.clientPackage.$invalid && submitted}\"><label>Package</label><select id=clientPackage name=clientPackage class=form-control ng-model=user.clientPackage._id ng-required=\"user.billingType == 'Package'\"><option ng-repeat=\"pckg in packages\" value={{pckg._id}}>{{pckg.packageName}}</option></select><p ng-show=\"editUserForm.clientPackage.$invalid && submitted\" class=help-block>The Package is required</p></div><div class=form-group ng-show=\"user.role == 'client'\" ng-class=\"{'has-error': editUserForm.clientType.$invalid && submitted,'has-success': !editUserForm.clientType.$invalid && submitted}\"><label>Client Type</label><select id=clientType name=clientType class=form-control ng-model=user.clientType ng-required=\"user.role == 'client'\"><option ng-repeat=\"type in clientTypes\" value={{type.value}}>{{type.name}}</option></select><p ng-show=\"editUserForm.clientType.$invalid && submitted\" class=help-block>The Client Type is required</p></div><div class=form-group ng-if=\"user.role != 'client' || user.clientType == 'Individual'\" ng-class=\"{'has-error': editUserForm.firstName.$error.required && submitted,'has-success': !editUserForm.firstName.$error.required && submitted}\"><label class=control-label for=firstName>First Name:</label><input id=firstName name=firstName ng-model=user.firstName ng-required=\"user.role != 'client' || user.clientType == 'Individual'\" class=\"form-control\"><p ng-show=\"editUserForm.firstName.$error.required  && submitted\" class=help-block>The First Name is required</p></div><div class=form-group ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': editUserForm.companyName.$error.required && submitted,'has-success': !editUserForm.companyName.$error.required && submitted}\"><label class=control-label for=companyName>Company Name:</label><input id=companyName name=companyName ng-model=user.companyName ng-required=\"user.clientType == 'Company'\" class=\"form-control\"><p ng-show=\"editUserForm.companyName.$error.required  && submitted\" class=help-block>The Company Name is required</p></div><div class=form-group ng-if=\"user.role != 'client' || user.clientType == 'Individual'\" ng-class=\"{'has-error': editUserForm.lastName.$error.required && submitted,'has-success': !editUserForm.lastName.$error.required && submitted}\"><label class=control-label for=lastName>Last Name:</label><input id=lastName name=lastName ng-model=user.lastName ng-required=\"user.role != 'client'\" class=\"form-control\"><p ng-show=\"editUserForm.lastName.$error.required  && submitted\" class=help-block>The Last Name is required</p></div><div class=form-group ng-if=\"user.role == 'client'\" ng-class=\"{'has-error': editUserForm.zone.$invalid && submitted,'has-success': !editUserForm.zone.$invalid && submitted}\"><label>Client Office Zone</label><ui-select id=zone name=zone ng-model=user.zone theme=bootstrap ng-required=\"user.role == 'client'\"><ui-select-match placeholder=\"Select a Zone\">{{$select.selected.deliveryZoneArea+' - '+$select.selected.deliveryZoneType}}</ui-select-match><ui-select-choices repeat=\"zone in zones | filter: $select.search\" value={{zone._id}}><div ng-bind-html=\"zone.deliveryZoneArea+' - '+zone.deliveryZoneType | highlight: $select.search\"></div></ui-select-choices></ui-select><p ng-show=\"editUserForm.zone.$invalid && submitted\" class=help-block>The Zone is required.</p></div><div class=form-group ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': editUserForm.contactPerson.$error.required && submitted,'has-success': !editUserForm.contactPerson.$error.required && submitted}\"><label class=control-label for=contactPerson>Contact Person:</label><input id=contactPerson name=contactPerson ng-model=user.contactPerson ng-required=\"user.clientType == 'Company'\" class=\"form-control\"><p ng-show=\"editUserForm.contactPerson.$error.required  && submitted\" class=help-block>The Contact Person is required</p></div><div class=form-group ng-if=\"user.clientType == 'Company'\" ng-class=\"{'has-error': editUserForm.contactPersonPhoneNumber.$error.required && submitted,'has-success': !editUserForm.contactPersonPhoneNumber.$error.required && submitted}\"><label class=control-label for=contactPersonPhoneNumber>Contact Person Phone Number:</label><input id=contactPersonPhoneNumber name=contactPersonPhoneNumber ng-model=user.contactPersonPhoneNumber ng-required=\"user.clientType == 'Company'\" class=form-control ui-mask=9999999999 ui-mask-placeholder ui-mask-placeholder-char=\"-\"><p ng-show=\"editUserForm.contactPersonPhoneNumber.$error.required  && submitted\" class=help-block>The Contact Person Phone Number is required</p></div><div class=\"form-group contact-row\" ng-if=\"user.role == 'client'\"><label>Other Contacts</label><div class=\"input-group col-xs-6\" ng-repeat=\"(index,contact) in user.extraContacts\"><input class=form-control name=person data-index={{index}} placeholder=\"Contact Person Name\" value={{contact.person}} maq-update-extra-contacts> <input class=form-control name=number placeholder=\"Contact Person Number\" value={{contact.number}} maq-update-extra-contacts data-index=\"{{index}}\"> <span maq-remove-client-contact-row class=\"glyphicon glyphicon-remove trash delete-row\" data-index={{index}} title=\"Remove Contact\"></span></div></div><div class=form-group ng-show=\"user.role == 'client'\"><span maq-add-client-contact></span></div><div class=form-group ng-show=\"user.role == 'client'\"><label for=needsWaybill>Needs Waybill?</label><input type=checkbox name=needsWaybill ng-model=user.needsWaybill value=\"true\"></div><div class=form-group ng-class=\"{'has-error': editUserForm.email.$invalid && submitted,'has-success': !editUserForm.email.$invalid && submitted}\"><label class=control-label for=email>Email:</label><input type=email id=email name=email type=email ng-model=user.email ng-required=\"user.role == 'user'\" mongoose-error class=\"form-control\"><p ng-show=\"editUserForm.email.$error.required && submitted\" class=help-block>Enter a valid Email Address</p><p class=help-block ng-show=editUserForm.email.$error.mongoose>{{ errors.email }}</p></div><div ng-if=\"user.role == 'client'\" class=form-group ng-class=\"{'has-error': editUserForm.phoneNumber.$invalid && submitted,'has-success': !editUserForm.phoneNumber.$invalid && submitted}\"><label class=control-label for=phoneNumber>Phone Number:</label><input name=phoneNumber id=phoneNumber ng-model=user.phoneNumber class=form-control ui-mask=9999999999 ui-mask-placeholder ui-mask-placeholder-char=\"-\"><p ng-show=\"editUserForm.phoneNumber.$invalid && submitted\" class=help-block>The Phone Number is required</p></div><div ng-if=\"user.role == 'client'\" class=form-group ng-class=\"{'has-error': editUserForm.clientLocation.$invalid && submitted,'has-success': !editUserForm.clientLocation.$invalid && submitted}\"><label class=control-label for=clientLocation>Client Location:</label><input name=clientLocation id=clientLocation ng-model=user.clientLocation class=\"form-control\"><p ng-show=\"editUserForm.clientLocation.$invalid && submitted\" class=help-block>The Client Location is required</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Update User</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a> <a href=/admin/add class=\"btn btn-small btn-primary\">Create New User</a></div></form></div><!-- /.box --></div></div></div></div></div>"
  );


  $templateCache.put('app/admin/partials/generate-invoices.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>{{axn}}</h3></div><div class=modal-body><form novalidate role=form name=generateInvoicesForm ng-submit=generateInvoices(query,generateInvoicesForm.$valid)><div class=box-body><div class=form-group ng-class=\"{'has-error': generateInvoicesForm.startDate.$invalid && submitted,'has-success': generateInvoicesForm.startDate.$valid && submitted}\"><label class=control-label for=startDate>Start Date:</label><div><div class=col-xs-11 style=\"padding: 0px\"><input name=startDate id=startDate ng-model=query.startDate class=form-control datepicker-popup=dd-MMMM-yyyy is-open=openedStart min-date=minDate max-date=query.endDate datepicker-options=dateOptions date-disabled=\"disabled(date, mode)\" required></div><div class=col-xs-1 style=\"padding: 0px\"><span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=openStart($event)><i class=\"glyphicon glyphicon-calendar\"></i></button></span></div><p ng-show=\"generateInvoicesForm.startDate.$invalid && submitted\" class=help-block>The Start Date is required.</p></div></div><div class=form-group ng-class=\"{'has-error': generateInvoicesForm.endDate.$invalid && submitted,'has-success': generateInvoicesForm.endDate.$valid && submitted}\"><label class=control-label for=endDate>End Date:</label><div><div class=col-xs-11 style=\"padding: 0px\"><input name=endDate id=endDate ng-model=query.endDate class=form-control datepicker-popup=dd-MMMM-yyyy is-open=openedEnd min-date=query.startDate max-date={{today}} datepicker-options=dateOptions date-disabled=\"disabled(date, mode)\" required></div><div class=col-xs-1 style=\"padding: 0px 0px 10px\"><span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=openEnd($event)><i class=\"glyphicon glyphicon-calendar\"></i></button></span></div></div><p ng-show=\"generateInvoicesForm.endDate.$invalid && submitted\" class=help-block>The End Date is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">{{axn}}</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></div></form></div></div>"
  );


  $templateCache.put('app/admin/partials/user-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>User Details</h3></div><div class=modal-body><ul><li ng-if=\"user.role != 'client' || user.clientType == 'Individual'\">Name: {{user.firstName}} {{user.lastName}}</li><li ng-if=\"user.clientType == 'Company'\">Name: {{user.companyName}}</li><li>Email: {{user.email}}</li><li ng-if=\"user.role == 'client'\">Phone Number: {{user.phoneNumber}}</li><li ng-if=\"user.role == 'client'\">Client Location: {{user.clientLocation}}</li><li ng-if=\"user.role == 'client'\">Billing Type: {{user.billingType}}</li><li ng-if=user.clientPackage>Package: {{user.clientPackage.packageName}}</li><li>Added: {{user.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/category/partials/add-category.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Category</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/packages>Categories</a></li><li class=active><strong>Add Category</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addCategoryForm ng-submit=addCategory(category,addCategoryForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': Category.categoryName.$invalid && submitted,'has-success': !Category.categoryName.$invalid && submitted}\"><label class=control-label for=categoryName>Category Name:</label><input id=categoryName name=categoryName ng-model=category.categoryName required class=\"form-control\"><p ng-show=\"addCategoryForm.categoryName.$invalid && submitted\" class=help-block>The Category Name is required</p></div><div class=form-group ng-class=\"{'has-error': addCategoryForm.categoryDescription.$error.required && submitted,'has-success': !addCategoryForm.categoryDescription.$error.required && submitted}\"><label class=control-label for=categoryDescription>Description:</label><textarea type=text id=categoryescription name=categoryDescription ng-model=category.categoryDescription class=form-control></textarea><p ng-show=\"addCategoryForm.categoryDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/category/partials/category-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>Category Details</h3></div><div class=modal-body><ul><li>Name: {{category.categoryName}}</li><li>Description: {{category.categoryDescription}}</li><li>Added: {{category.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/category/partials/category.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Categories</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Categories</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/category/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=category template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Name</th><th>Description</th><th>Status</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"category in categories | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=category><td>{{category.categoryName}}</td><td>{{category.categoryDescription}}</td><td>{{category.status}}</td><td ng-click=open(category)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=category/edit/{{category._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(category) ng-confirm-click=\"Are you sure you want to delete this category?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('app/category/partials/edit-category.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Category</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/category>Packages</a></li><li class=active><strong>Edit Category</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editCategoryForm ng-submit=editCategory(category,editCategoryForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editCategoryForm.categoryName.$invalid && submitted,'has-success': !editCategoryForm.categoryName.$invalid && submitted}\"><label class=control-label for=categoryName>Category Name:</label><input id=categoryName name=categoryName ng-model=category.categoryName required class=\"form-control\"><p ng-show=\"editCategoryForm.categoryName.$invalid && submitted\" class=help-block>The Category Name is required</p></div><div class=form-group ng-class=\"{'has-error': editCategoryForm.categoryDescription.$error.required && submitted,'has-success': !editCategoryForm.categoryDescription.$error.required && submitted}\"><label class=control-label for=categoryDescription>Description:</label><textarea type=text id=categoryDescription name=categoryDescription ng-model=category.categoryDescription class=form-control></textarea><p ng-show=\"editCategoryForm.categoryDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/channel/partials/add-channel.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Channel</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/packages>Channels</a></li><li class=active><strong>Add Channel</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addChannelForm ng-submit=addChannel(channel,addChannelForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': Channel.channelDescription.$invalid && submitted,'has-success': !Channel.channelDescription.$invalid && submitted}\"><label class=control-label for=channelDescription>Channel Description:</label><input id=channelDescription name=channelDescription ng-model=channel.channelDescription required class=\"form-control\"><p ng-show=\"addChannelForm.channelDescription.$invalid && submitted\" class=help-block>The Channel Description is required</p></div><div class=form-group ng-class=\"{'has-error': addChannelForm.channelName.$error.required && submitted,'has-success': !addChannelForm.channelName.$error.required && submitted}\"><label class=control-label for=channelName>Channel Name:</label><textarea type=text id=channelName name=channelName ng-model=channel.channelName class=form-control></textarea><p ng-show=\"addChannelForm.channelName.$error.required  && submitted\" class=help-block>The Channel Name is required.</p></div><div class=form-group ng-class=\"{'has-error': addChannelForm.status.$error.required && submitted,'has-success': !addChannelForm.status.$error.required && submitted}\"><label class=control-label for=status>Status:</label><textarea type=text id=status name=status ng-model=channel.status class=form-control></textarea><p ng-show=\"addChannelForm.status.$error.required  && submitted\" class=help-block>The Status is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/channel/partials/category-details.model.html',
    "<div><div class=modal-header><h3 class=modal-title>Category Details</h3></div><div class=modal-body><ul><li>Name: {{channel.channelName}}</li><li>Description: {{channel.channelDescription}}</li><li>Added: {{channel.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/channel/partials/channel-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>Channel Details</h3></div><div class=modal-body><ul><li>Channel Description: {{channel.channelDescription}}</li><li>Channel Name: {{channel.channelName}}</li><li>Added: {{channel.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/channel/partials/channel.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Channels</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Channels</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/channel/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=channel template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Channel Description</th><th>Channel Name</th><th>Status</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"channel in channels | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=channel><td>{{channel.channelDescription}}</td><td>{{channel.channelName}}</td><td>{{channel.status}}</td><td ng-click=open(channel)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=channel/edit/{{channel._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(channel) ng-confirm-click=\"Are you sure you want to delete this channel?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('app/channel/partials/edit-channel.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Channel</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/channel>Packages</a></li><li class=active><strong>Edit Channel</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editChannelForm ng-submit=editChannel(channel,editChannelForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editChannelForm.channelDescription.$invalid && submitted,'has-success': !editChannelForm.channelDescription.$invalid && submitted}\"><label class=control-label for=channelDescription>Channel Number:</label><input id=channelDescription name=channelDescription ng-model=channel.channelDescription required class=\"form-control\"><p ng-show=\"editChannelForm.channelDescription.$invalid && submitted\" class=help-block>The Channel Description is required</p></div><div class=form-group ng-class=\"{'has-error': editChannelForm.channelName.$error.required && submitted,'has-success': !editChannelForm.channelName.$error.required && submitted}\"><label class=control-label for=channelName>Channel Name:</label><textarea type=text id=channelName name=channelName ng-model=channel.channelName class=form-control></textarea><p ng-show=\"editChannelForm.channelName.$error.required  && submitted\" class=help-block>The Channel Name is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/division/partials/add-division.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Division</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/division>Divisions</a></li><li class=active><strong>Add Division</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate role=form name=addDivisionForm ng-submit=addDivision(division,addDivisionForm.$valid)><div class=form-group ng-class=\"{'has-error': addDivisionForm.divisionName.$invalid && submitted}\"><label>Name:</label><input class=form-control ng-model=division.divisionName name=divisionName id=deliverydivisionArea required><p ng-show=\"addDivisionForm.divisionName.$invalid && submitted\" class=help-block>The Name is required.</p></div><div class=form-group ng-class=\"{'has-error': addDivisionForm.divisionAddress.$invalid && submitted}\"><label>Address:</label><input class=form-control ng-model=division.divisionAddress name=divisionAddress id=divisionAddress required><p ng-show=\"addDivisionForm.divisionAddress.$invalid && submitted\" class=help-block>The Address is required.</p></div><div class=form-group ng-class=\"{'has-error': addDivisionForm.divisionContact.$invalid && submitted}\"><label>Contact:</label><input class=form-control ng-model=division.divisionContact name=divisionContact id=divisionContact required><p ng-show=\"addDivisionForm.divisionContact.$invalid && submitted\" class=help-block>The Contact is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Save</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/division/partials/division.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Divisions</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Division</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/division/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=division template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table><tr><th>Name</th><th>Address</th><th>Contact</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"division in divisions | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=division><td>{{division.divisionName}}</td><td>{{division.divisionAddress}}</td><td>{{division.divisionContact}}</td><td><a href=/division/edit/{{division._id}} class=trash title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(division) ng-confirm-click=\"Are you sure you want to delete this division?\"><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div></div>"
  );


  $templateCache.put('app/division/partials/edit-division.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Division</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/division>Divisions</a></li><li class=active><strong>Edit Division</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate role=form name=editDivisionForm ng-submit=editDivision(division,editDivisionForm.$valid)><div class=form-group ng-class=\"{'has-error': editDivisionForm.divisionName.$invalid && submitted}\"><label>Name:</label><input class=form-control ng-model=division.divisionName name=divisionName id=deliverydivisionArea required><p ng-show=\"editDivisionForm.divisionName.$invalid && submitted\" class=help-block>The Name is required.</p></div><div class=form-group ng-class=\"{'has-error': editDivisionForm.divisionAddress.$invalid && submitted}\"><label>Address:</label><input class=form-control ng-model=division.divisionAddress name=divisionAddress id=divisionAddress required><p ng-show=\"editDivisionForm.divisionAddress.$invalid && submitted\" class=help-block>The Address is required.</p></div><div class=form-group ng-class=\"{'has-error': editDivisionForm.divisionContact.$invalid && submitted}\"><label>Contact:</label><input class=form-control ng-model=division.divisionContact name=divisionContact id=divisionContact required><p ng-show=\"editDivisionForm.divisionContact.$invalid && submitted\" class=help-block>The Contact is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Save</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictasset/partials/add-ictasset.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add ICT Asset</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/packages>ICT Assets</a></li><li class=active><strong>Add ICT Asset Details</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addICTAssetForm ng-submit=addICTAsset(ictasset,addICTAssetForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': ICTAsset.assetConfigNumber.$invalid && submitted,'has-success': !ICTAsset.assetConfigNumber.$invalid && submitted}\"><label class=control-label for=assetConfigNumber>Asset Config Number:</label><input id=assetConfigNumber name=assetConfigNumber ng-model=ictasset.assetConfigNumber required class=\"form-control\"><p ng-show=\"addICTAssetForm.assetConfigNumber.$invalid && submitted\" class=help-block>The Asset Config Number is required</p></div><div class=form-group ng-class=\"{'has-error': addICTAssetForm.itNumber.$error.required && submitted,'has-success': !addICTAssetForm.itNumber.$error.required && submitted}\"><label class=control-label for=itNumber>IT Number:</label><textarea type=text id=itNumber name=itNumber ng-model=ictasset.itNumber class=form-control></textarea><p ng-show=\"addICTAssetForm.itNumber.$error.required  && submitted\" class=help-block>IT Numberis required.</p></div><div class=form-group ng-class=\"{'has-error': addICTAssetForm.assetDescription.$error.required && submitted,'has-success': !addICTAssetForm.assetDescription.$error.required && submitted}\"><label class=control-label for=assetDescription>Asset Description:</label><textarea type=text id=assetDescription name=assetDescription ng-model=ictasset.assetDescription class=form-control></textarea><p ng-show=\"addICTAssetForm.assetDescription.$error.required  && submitted\" class=help-block>The Asset Description is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTAssetForm.assetSerialNumber.$error.required && submitted,'has-success': !addICTAssetForm.assetSerialNumber.$error.required && submitted}\"><label class=control-label for=assetSerialNumber>Asset Serial Number:</label><textarea type=text id=assetSerialNumber name=assetSerialNumber ng-model=ictasset.assetSerialNumber class=form-control></textarea><p ng-show=\"addICTAssetForm.assetSerialNumber.$error.required  && submitted\" class=help-block>The Asset Serial Number is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTAssetForm.assetCategory.$error.required && submitted,'has-success': !addICTAssetForm.assetCategory.$error.required && submitted}\"><label class=control-label for=assetCategory>Asset Category:</label><textarea type=text id=assetCategory name=assetCategory ng-model=ictasset.assetCategory class=form-control></textarea><p ng-show=\"addICTAssetForm.assetCategory.$error.required  && submitted\" class=help-block>The Asset Category is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTAssetForm.assetType.$error.required && submitted,'has-success': !addICTAssetForm.assetType.$error.required && submitted}\"><label class=control-label for=assetType>Asset Type:</label><textarea type=text id=assetType name=assetType ng-model=ictasset.assetType class=form-control></textarea><p ng-show=\"addICTAssetForm.assetType.$error.required  && submitted\" class=help-block>The Asset Type is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictasset/partials/edit-ictasset.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit ICT Asset</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/ictasset>Packages</a></li><li class=active><strong>Edit ICT Asset</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editICTAssetForm ng-submit=editICTAsset(ictasset,editICTAssetForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editICTAssetForm.assetConfigNumber.$invalid && submitted,'has-success': !editICTAssetForm.assetConfigNumber.$invalid && submitted}\"><label class=control-label for=assetConfigNumber>Asset Config Number:</label><input id=assetConfigNumber name=assetConfigNumber ng-model=ictasset.assetConfigNumber required class=\"form-control\"><p ng-show=\"editICTAssetForm.assetConfigNumber.$invalid && submitted\" class=help-block>The Asset Config Number is required</p></div><div class=form-group ng-class=\"{'has-error': editICTAssetForm.itNumber.$error.required && submitted,'has-success': !editICTAssetForm.itNumber.$error.required && submitted}\"><label class=control-label for=itNumber>IT Number:</label><textarea type=text id=itNumber name=itNumber ng-model=ictasset.itNumber class=form-control></textarea><p ng-show=\"editICTAssetForm.itNumber.$error.required  && submitted\" class=help-block>The IT Number is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTAssetForm.assetDescription.$error.required && submitted,'has-success': !editICTAssetForm.assetDescription.$error.required && submitted}\"><label class=control-label for=assetDescription>Asset Description:</label><textarea type=text id=assetDescription name=assetDescription ng-model=ictasset.assetDescription class=form-control></textarea><p ng-show=\"editICTAssetForm.assetDescription.$error.required  && submitted\" class=help-block>The Asset Description is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTAssetForm.assetSerialNumber.$error.required && submitted,'has-success': !editICTAssetForm.assetSerialNumber.$error.required && submitted}\"><label class=control-label for=assetSerialNumber>Asset Serial Number:</label><textarea type=text id=assetSerialNumber name=assetSerialNumber ng-model=ictasset.assetSerialNumber class=form-control></textarea><p ng-show=\"editICTAssetForm.assetSerialNumber.$error.required  && submitted\" class=help-block>The Asset Serial Number is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTAssetForm.assetCategory.$error.required && submitted,'has-success': !editICTAssetForm.assetCategory.$error.required && submitted}\"><label class=control-label for=assetCategory>Asset Category:</label><textarea type=text id=assetCategory name=assetCategory ng-model=ictasset.assetCategory class=form-control></textarea><p ng-show=\"editICTAssetForm.assetCategory.$error.required  && submitted\" class=help-block>The Asset Category is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTAssetForm.assetType.$error.required && submitted,'has-success': !editICTAssetForm.assetType.$error.required && submitted}\"><label class=control-label for=assetType>Asset Type:</label><textarea type=text id=assetType name=assetType ng-model=ictasset.assetType class=form-control></textarea><p ng-show=\"editICTAssetForm.assetType.$error.required  && submitted\" class=help-block>The Asset Type is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictasset/partials/ictasset-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>ICT Asset Details</h3></div><div class=modal-body><ul><li>Asset Config Number: {{ictasset.assetConfigNumber}}</li><li>IT Number: {{ictasset.itNumber}}</li><li>Asset Description: {{ictasset.assetDescription}}</li><li>Asset Serial Number: {{ictasset.assetSerialNumber}}</li><li>Asset Category: {{ictasset.assetCategory}}</li><li>Asset Type: {{ictasset.assetType}}</li><li>Added: {{ictasset.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/ictasset/partials/ictasset.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>ICT Assets</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>ICT Assets</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/ictasset/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=ictstore template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Asset Config Number</th><th>IT Number</th><th>Asset Description</th><th>Asset Serial Number</th><th>Asset Category</th><th>Asset Type</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"ictasset in ictassets | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=ictstore><td>{{ictasset.assetConfigNumber}}</td><td>{{ictasset.itNumber}}</td><td>{{ictasset.assetDescription}}</td><td>{{ictasset.assetSerialNumber}}</td><td>{{ictasset.assetCategory}}</td><td>{{ictasset.assetType}}</td><td ng-click=open(ictasset)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=ictasset/edit/{{ictasset._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(ictasset) ng-confirm-click=\"Are you sure you want to delete this ictasset?\" ng-show=isAdmin()></td><td><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictstore/partials/add-ictstore.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add ICT Store</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/packages>ICT Stores</a></li><li class=active><strong>Add ICT User Details</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addICTStoreForm ng-submit=addICTStore(ictstore,addICTStoreForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': ICTStore.controlNumber.$invalid && submitted,'has-success': !ICTStore.controlNumber.$invalid && submitted}\"><label class=control-label for=controlNumber>Control Number:</label><input id=controlNumber name=controlNumber ng-model=ictstore.controlNumber required class=\"form-control\"><p ng-show=\"addICTStoreForm.controlNumber.$invalid && submitted\" class=help-block>The Controle Number is required</p></div><div class=form-group ng-class=\"{'has-error': addICTStoreForm.nameSurname.$error.required && submitted,'has-success': !addICTStoreForm.nameSurname.$error.required && submitted}\"><label class=control-label for=nameSurname>Name Surname:</label><textarea type=text id=nameSurname name=nameSurname ng-model=ictstore.nameSurname class=form-control></textarea><p ng-show=\"addICTStoreForm.nameSurname.$error.required  && submitted\" class=help-block>The Name Surname is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTStoreForm.location.$error.required && submitted,'has-success': !addICTStoreForm.location.$error.required && submitted}\"><label class=control-label for=location>Location:</label><textarea type=text id=location name=location ng-model=ictstore.location class=form-control></textarea><p ng-show=\"addICTStoreForm.location.$error.required  && submitted\" class=help-block>The Location is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTStoreForm.costCenter.$error.required && submitted,'has-success': !addICTStoreForm.costCenter.$error.required && submitted}\"><label class=control-label for=costCenter>Cost Center:</label><textarea type=text id=costCenter name=costCenter ng-model=ictstore.costCenter class=form-control></textarea><p ng-show=\"addICTStoreForm.costCenter.$error.required  && submitted\" class=help-block>The Cost Center is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTStoreForm.reasonForUse.$error.required && submitted,'has-success': !addICTStoreForm.reasonForUse.$error.required && submitted}\"><label class=control-label for=reasonForUse>Reason for Use:</label><textarea type=text id=reasonForUse name=reasonForUse ng-model=ictstore.reasonForUse class=form-control></textarea><p ng-show=\"addICTStoreForm.reasonForUse.$error.required  && submitted\" class=help-block>The Reason for Use is required.</p></div><div class=form-group ng-class=\"{'has-error': addICTStoreForm.owningCompany.$error.required && submitted,'has-success': !addICTStoreForm.owningCompany.$error.required && submitted}\"><label class=control-label for=owningCompany>Owning Company:</label><textarea type=text id=owningCompany name=owningCompany ng-model=ictstore.owningCompany class=form-control></textarea><p ng-show=\"addICTStoreForm.owningCompany.$error.required  && submitted\" class=help-block>The Owning Company is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictstore/partials/edit-ictstore.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit ICT Store</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/ictstore>Packages</a></li><li class=active><strong>Edit ICT Store</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editICTStoreForm ng-submit=editICTStore(ictstore,editICTStoreForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editICTStoreForm.controlNumber.$invalid && submitted,'has-success': !editCategoryForm.controlNumber.$invalid && submitted}\"><label class=control-label for=controlNumber>Control Number:</label><input id=controlNumber name=controlNumber ng-model=ictstore.controlNumber required class=\"form-control\"><p ng-show=\"editICTStoreForm.controlNumber.$invalid && submitted\" class=help-block>The Control Number is required</p></div><div class=form-group ng-class=\"{'has-error': editICTStoreForm.nameSurname.$error.required && submitted,'has-success': !editICTStoreForm.nameSurname.$error.required && submitted}\"><label class=control-label for=nameSurname>Name Surname:</label><textarea type=text id=nameSurname name=nameSurname ng-model=ictstore.nameSurname class=form-control></textarea><p ng-show=\"editICTStoreForm.nameSurname.$error.required  && submitted\" class=help-block>The Name Surname is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTStoreForm.location.$error.required && submitted,'has-success': !editICTStoreForm.location.$error.required && submitted}\"><label class=control-label for=location>Location:</label><textarea type=text id=location name=location ng-model=ictstore.location class=form-control></textarea><p ng-show=\"editICTStoreForm.location.$error.required  && submitted\" class=help-block>The Location is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTStoreForm.costCenter.$error.required && submitted,'has-success': !editICTStoreForm.costCenter.$error.required && submitted}\"><label class=control-label for=costCenter>Cost Center:</label><textarea type=text id=location name=location ng-model=ictstore.location class=form-control></textarea><p ng-show=\"editICTStoreForm.costCenter.$error.required  && submitted\" class=help-block>The Cost Center is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTStoreForm.reasonForUse.$error.required && submitted,'has-success': !editICTStoreForm.reasonForUse.$error.required && submitted}\"><label class=control-label for=reasonForUse>Reason for Use:</label><textarea type=text id=reasonForUse name=reasonForUse ng-model=ictstore.reasonForUse class=form-control></textarea><p ng-show=\"editICTStoreForm.reasonForUse.$error.required  && submitted\" class=help-block>The Reason for Use is required.</p></div><div class=form-group ng-class=\"{'has-error': editICTStoreForm.owningCompany.$error.required && submitted,'has-success': !editICTStoreForm.owningCompany.$error.required && submitted}\"><label class=control-label for=owningCompany>Owning Company:</label><textarea type=text id=owningCompany name=owningCompany ng-model=ictstore.owningCompany class=form-control></textarea><p ng-show=\"editICTStoreForm.owningCompany.$error.required  && submitted\" class=help-block>The Owning Company is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/ictstore/partials/ictstore-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>ICT Store Details</h3></div><div class=modal-body><ul><li>Control Number: {{ictstore.controlNumber}}</li><li>Name Surname: {{ictstore.nameSurname}}</li><li>Location: {{ictstore.location}}</li><li>Cost Center: {{ictstore.costCenter}}</li><li>Reason for Use: {{ictstore.reasonForUse}}</li><li>Owning Company: {{ictstore.owningCompany}}</li><li>Added: {{ictstore.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/ictstore/partials/ictstore.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>ICT Stores</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>ICT Stores</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/ictstore/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=ictstore template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Control Number</th><th>Name Surname</th><th>Location</th><th>Cost Center</th><th>Reason for Use</th><th>Owning Company</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"ictstore in ictstores | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=ictstore><td>{{ictstore.controlNumber}}</td><td>{{ictstore.nameSurname}}</td><td>{{ictstore.location}}</td><td>{{ictstore.costCenter}}</td><td>{{ictstore.reasonForUse}}</td><td>{{ictstore.owningCompany}}</td><td ng-click=open(ictstore)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=ictstore/edit/{{ictstore._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(ictstore) ng-confirm-click=\"Are you sure you want to delete this ictstore?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('app/issues/partials/add-issue.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Issue</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/issue>Issues</a></li><li class=active><strong>Add Issue</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=\"ibox float-e-margins\"><div class=ibox-content><form name=addIssueForm ng-submit=addIssue(issue,addIssueForm.$invalid) role=form novalidate><div class=form-group ng-class=\"{'has-error': addIssueForm.priority.$invalid && submitted,'has-success': !addIssueForm.priority.$invalid && submitted}\"><label>Priority:</label><ui-select id=priority name=priority ng-model=issue.priority theme=bootstrap required><ui-select-match placeholder=\"Select a Priority\">{{$select.selected.priorityName}}</ui-select-match><ui-select-choices repeat=\"priority in priorities | filter: $select.search\" value={{priority._id}}><div ng-bind-html=\"priority.priorityName | highlight: $select.search\"></div><small>Description: {{priority.priorityDescription}} SLA (Hours): {{priority.prioritySLA}}</small></ui-select-choices></ui-select><p ng-show=\"addIssueForm.priority.$invalid && submitted\" class=help-block>The Priority is required.</p></div><div class=form-group ng-class=\"{'has-error': addIssueForm.category.$invalid && submitted,'has-success': !addIssueForm.category.$invalid && submitted}\"><label>Category:</label><ui-select id=category name=category ng-model=issue.category theme=bootstrap required><ui-select-match placeholder=\"Select a Category\">{{$select.selected.categoryName}}</ui-select-match><ui-select-choices repeat=\"category in categories | filter: $select.search\" value={{category._id}}><div ng-bind-html=\"category.categoryName | highlight: $select.search\"></div><small>Description: {{category.categoryDescription}}</small></ui-select-choices></ui-select><p ng-show=\"addIssueForm.category.$invalid && submitted\" class=help-block>The Category is required.</p></div><div class=form-group ng-class=\"{'has-error': addIssueForm.channel.$invalid && submitted,'has-success': !addIssueForm.channel.$invalid && submitted}\"><label>Channel:</label><ui-select id=channel name=channel ng-model=issue.channel theme=bootstrap required><ui-select-match placeholder=\"Select a Channel\">{{$select.selected.channelName}}</ui-select-match><ui-select-choices repeat=\"channel in channels | filter: $select.search\" value={{channel._id}}><div ng-bind-html=\"channel.channelName | highlight: $select.search\"></div><small>Description: {{channel.channelDescription}}</small></ui-select-choices></ui-select><p ng-show=\"addIssueForm.channel.$invalid && submitted\" class=help-block>The Channel is required.</p></div><div class=form-group ng-class=\"{'has-error': addIssueForm.division.$invalid && submitted,'has-success': !addIssueForm.division.$invalid && submitted}\"><label>Division:</label><ui-select id=division name=division ng-model=issue.division theme=bootstrap required><ui-select-match placeholder=\"Select a Division\">{{$select.selected.divisionName}}</ui-select-match><ui-select-choices repeat=\"division in divisions | filter: $select.search\" value={{division._id}}><div ng-bind-html=\"division.priorityName | highlight: $select.search\"></div><small>Address: {{division.divisionAddress}} Contact: {{division.divisionContact}}</small></ui-select-choices></ui-select><p ng-show=\"addIssueForm.division.$invalid && submitted\" class=help-block>The Division is required.</p></div><div class=form-group ng-class=\"{ 'has-error' : addIssueForm.issueDescription.$invalid && submitted,'has-success': !addIssueForm.issueDescription.$invalid && submitted}\"><label class=control-label for=issueDescription>Description:</label><textarea type=text id=issueDescription name=issueDescription ng-model=issue.issueDescription class=form-control required></textarea><p ng-show=\"addIssueForm.issueDescription.$invalid && submitted\" class=help-block>The Description is required.</p></div><div class=form-group ng-class=\"{'has-error': addIssueForm.contactNumber.$invalid && submitted,'has-success': !addIssueForm.contactNumber.$invalid && submitted}\"><label class=control-label for=contactNumber>Contact Number:</label><input id=contactNumber name=contactNumber ng-model=issue.issueContactNumber class=form-control required><p ng-show=\"addIssueForm.contactNumber.$invalid && submitted\" class=help-block>The Contact Number is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/issues/partials/edit-issue.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Issue</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/issue>Issues</a></li><li class=active><strong>Edit Issue</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=\"ibox float-e-margins\"><div class=ibox-content><form name=editIssueForm ng-submit=editIssue(issue,editIssueForm.$invalid) role=form novalidate><div class=form-group ng-class=\"{'has-error': editIssueForm.priority.$invalid && submitted,'has-success': !editIssueForm.priority.$invalid && submitted}\"><label>Priority:</label><ui-select id=priority name=priority ng-model=issue.issuePriority theme=bootstrap required><ui-select-match placeholder=\"Select a Priority\">{{$select.selected.priorityName}}</ui-select-match><ui-select-choices repeat=\"priority in priorities | filter: $select.search\" value={{priority._id}}><div ng-bind-html=\"priority.priorityName | highlight: $select.search\"></div><small>Description: {{priority.priorityDescription}} SLA (Hours): {{priority.prioritySLA}}</small></ui-select-choices></ui-select><p ng-show=\"editIssueForm.priority.$invalid && submitted\" class=help-block>The Priority is required.</p></div><div class=form-group ng-class=\"{'has-error': editIssueForm.category.$invalid && submitted,'has-success': !editIssueForm.category.$invalid && submitted}\"><label>Category:</label><ui-select id=category name=category ng-model=issue.issueCategory theme=bootstrap required><ui-select-match placeholder=\"Select a Category\">{{$select.selected.categoryName}}</ui-select-match><ui-select-choices repeat=\"category in categories | filter: $select.search\" value={{category._id}}><div ng-bind-html=\"category.categoryName | highlight: $select.search\"></div><small>Description: {{category.categoryDescription}}</small></ui-select-choices></ui-select><p ng-show=\"editIssueForm.category.$invalid && submitted\" class=help-block>The Category is required.</p></div><div class=form-group ng-class=\"{'has-error': editIssueForm.channel.$invalid && submitted,'has-success': !editIssueForm.channel.$invalid && submitted}\"><label>Channel:</label><ui-select id=channel name=channel ng-model=issue.issueChannel theme=bootstrap required><ui-select-match placeholder=\"Select a Channel\">{{$select.selected.channelName}}</ui-select-match><ui-select-choices repeat=\"channel in channels | filter: $select.search\" value={{channel._id}}><div ng-bind-html=\"channel.channelName | highlight: $select.search\"></div><small>Description: {{channel.channelDescription}}</small></ui-select-choices></ui-select><p ng-show=\"editIssueForm.channel.$invalid && submitted\" class=help-block>The Channel is required.</p></div><div class=form-group ng-class=\"{'has-error': editIssueForm.division.$invalid && submitted,'has-success': !editIssueForm.division.$invalid && submitted}\"><label>Division:</label><ui-select id=division name=division ng-model=issue.issueDivision theme=bootstrap required><ui-select-match placeholder=\"Select a Division\">{{$select.selected.divisionName}}</ui-select-match><ui-select-choices repeat=\"division in divisions | filter: $select.search\" value={{division._id}}><div ng-bind-html=\"division.priorityName | highlight: $select.search\"></div><small>Address: {{division.divisionAddress}} Contact: {{division.divisionContact}}</small></ui-select-choices></ui-select><p ng-show=\"editIssueForm.division.$invalid && submitted\" class=help-block>The Division is required.</p></div><div class=form-group ng-class=\"{ 'has-error' : editIssueForm.issueDescription.$invalid && submitted,'has-success': !editIssueForm.issueDescription.$invalid && submitted}\"><label class=control-label for=issueDescription>Description:</label><textarea type=text id=issueDescription name=issueDescription ng-model=issue.issueDescription class=form-control required></textarea><p ng-show=\"editIssueForm.issueDescription.$invalid && submitted\" class=help-block>The Description is required.</p></div><div class=form-group ng-class=\"{'has-error': editIssueForm.contactNumber.$invalid && submitted,'has-success': !editIssueForm.contactNumber.$invalid && submitted}\"><label class=control-label for=contactNumber>Contact Number:</label><input id=contactNumber name=contactNumber ng-model=issue.issueContactNumber class=form-control required><p ng-show=\"editIssueForm.contactNumber.$invalid && submitted\" class=help-block>The Contact Number is required.</p></div><div class=form-group ng-class=\"{'has-error': editIssueForm.issueStatus.$invalid && submitted,'has-success': !editIssueForm.issueStatus.$invalid && submitted}\"><label>Status:</label><ui-select id=issueStatus name=issueStatus ng-model=issue.issueStatus theme=bootstrap required><ui-select-match placeholder=\"Select a Status\">{{$select.selected.issueStatusName}}</ui-select-match><ui-select-choices repeat=\"issuestatus in issuestatuses | filter: $select.search\" value={{issueStatus._id}}><div ng-bind-html=\"issuestatus.issueStatusName | highlight: $select.search\"></div><small>Description: {{issuestatus.issueStatusDescription}}</small></ui-select-choices></ui-select><p ng-show=\"editIssueForm.issueStatus.$invalid && submitted\" class=help-block>The Status is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/issues/partials/issue-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>Issue Details</h3></div><div class=modal-body><ul><li>Ref Number: {{issue.issueRefNumber}} {{issue.lastName}}</li><li>Category: {{issue.issueCategory.categoryName}}</li><li>Description: {{issue.issueDescription}}</li><li>Status: {{issue.issueStatus.issueStatusName}}</li><li>Priority: {{issue.issuePriority}}</li><li>Channel: {{issue.issueChannel}}</li><li>Added: {{issue.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/issues/partials/issues.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Issues</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Issues</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/issues/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-2><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-2><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=col-md-2><label for=search>Status:</label><select class=form-control name=issueStatusName id=issueStatusName ng-model=issuestatus._id ng-options=\"issuestatus._id as issuestatus.issueStatusName for issuestatus in issuestatuses\"></select></div><div class=col-md-2><label for=search>Category:</label><select class=form-control name=categoryName id=categoryName ng-model=category._id ng-options=\"category._id as category.categoryName for category in categories\"></select></div><div class=col-md-2><input type=button name=\"\" value=Go ng-click=searchIssues(category._id,issuestatus._id) class=\"btn btn-small btn-primary\"></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=issue template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Ref Number</th><th>Description</th><th>Category</th><th>Status</th><th>Channel</th><th>Priority</th><th>Date</th><th>Over SLA?</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"issue in issues | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=issue><td>{{issue.issueRefNumber}}</td><td>{{issue.issueDescription}}</td><td>{{issue.issueCategory.categoryName}}</td><td>{{issue.issueStatus.issueStatusName}}</td><td>{{issue.issueChannel.channelName}}</td><td>{{issue.issuePriority.priorityName}}</td><td>{{issue.added | date:'medium'}}</td><td ng-if=isOverSLA(issue.added,issue.issuePriority.prioritySLA)><span class=label style=\"background-color:#e74c3c; color: #ffffff; font-family: sans-serif\">YES</span></td><td ng-if=!isOverSLA(issue.added,issue.issuePriority.prioritySLA)><span class=label style=\"background-color:#16a085; color: #ffffff; font-family: sans-serif\">NO</span></td><td ng-click=open(issue)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=issues/edit/{{issue._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(issue) ng-confirm-click=\"Are you sure you want to delete this issue?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/officeparks/partials/add-officepark.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Office Park</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/users>Office Park</a></li><li class=active><strong>Add Office Park</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addOfficeParkForm ng-submit=addOfficePark(officepark,addOfficeParkForm,addOfficeParkForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': addOfficeParkForm.officeParkName.$error.required && submitted,'has-success': !addOfficeParkForm.officeParkName.$error.required && submitted}\"><label class=control-label for=officeParkName>Office Park Name:</label><input id=officeParkName name=officeParkName ng-model=officepark.officeParkName class=\"form-control\"><p ng-show=\"addOfficeParkForm.officeParkName.$error.required  && submitted\" class=help-block>The Office Park Name is required</p></div><div class=form-group ng-class=\"{'has-error': addOfficeParkForm.officeParkAddress.$error.required && submitted,'has-success': !addOfficeParkForm.officeParkAddress.$error.required && submitted}\"><label class=control-label for=officeParkAddress>Office Park Address:</label><input id=officeParkAddress name=companyAddress ng-model=officepark.officeParkAddress class=\"form-control\"><p ng-show=\"addOfficeParkForm.officeParkAddress.$error.required  && submitted\" class=help-block>The Office Park Address is required</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div><!-- /.box --></div></div></div></div></div>"
  );


  $templateCache.put('app/officeparks/partials/edit-officepark.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Office Park</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/officeparks>Office Parks</a></li><li class=active><strong>Edit Office Park</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editOfficeParkForm ng-submit=editOfficePark(officepark,editOfficeParkForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editOfficeParkForm.officeParkName.$invalid && submitted,'has-success': !editOfficeParkForm.officeParkName.$invalid && submitted}\"><label class=control-label for=officeParkName>Office Park:</label><input id=officeParkName name=officeParkName ng-model=officepark.officeParkName class=\"form-control\"><p ng-show=\"editOfficeParkForm.officeParkName.$invalid && submitted\" class=help-block>The Office Park Name is required</p></div><div class=form-group ng-class=\"{'has-error': editOfficeParkForm.officeParkAddress.$invalid && submitted,'has-success': !editOfficeParkForm.officeParkAddress.$invalid && submitted}\"><label class=control-label for=officeParkAddress>Office Park Address:</label><input id=officeParkAddress name=officeParkAddress ng-model=officepark.officeParkAddress class=\"form-control\"><p ng-show=\"editCompanyForm.officeParkAddress.$invalid && submitted\" class=help-block>The Office Park Address is required</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/officeparks/partials/officeparks.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Office Park</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Office Parks</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/officeparks/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=officepark template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Name</th><th>Address</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"officepark in officeparks | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=officepark><td>{{officepark.officeParkName}}</td><td>{{officepark.officeParkAddress}}</td><td><a title=\"Add Company\" href=companies/add/{{officepark._id}}><span class=\"glyphicon glyphicon-plus\"></span></a></td><td ng-click=open(officepark)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=officeparks/edit/{{officepark._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(officepark) ng-confirm-click=\"Are you sure you want to delete this office park?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/priority/partials/add-priority.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Priority</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/packages>Priorities</a></li><li class=active><strong>Add Priority</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addPriorityForm ng-submit=addPriority(priority,addPriorityForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': Priority.priorityName.$invalid && submitted,'has-success': !Priority.priorityName.$invalid && submitted}\"><label class=control-label for=priorityName>Priority Name:</label><input id=priorityName name=priorityName ng-model=priority.priorityName required class=\"form-control\"><p ng-show=\"addPriorityForm.priorityName.$invalid && submitted\" class=help-block>The Priority Name is required</p></div><div class=form-group ng-class=\"{'has-error': addPriorityForm.priorityDescription.$error.required && submitted,'has-success': !addPriorityForm.priorityDescription.$error.required && submitted}\"><label class=control-label for=priorityDescription>Description:</label><textarea type=text id=priorityDescription name=priorityDescription ng-model=priority.priorityDescription class=form-control></textarea><p ng-show=\"addPriorityForm.priorityDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=form-group ng-class=\"{'has-error': addPriorityForm.prioritySLA.$invalid && submitted,'has-success': !addPriorityForm.prioritySLA.$invalid && submitted}\"><label class=control-label for=prioritySLA>Priority SLA (Hours):</label><input id=prioritySLA name=prioritySLA type=number ng-model=priority.prioritySLA class=\"form-control\"><p ng-show=\"addPriorityForm.prioritySLA.$error.required && submitted\" class=help-block>The SLA is required</p><p ng-show=\"!addPriorityForm.prioritySLA.$error.required && addPriorityForm.prioritySLA.$invalid && submitted\" class=help-block>The SLA must be a number</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/priority/partials/edit-priority.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Priority</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/priority>Priorities</a></li><li class=active><strong>Edit Priority</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editPriorityForm ng-submit=editpriority(priority,editPriorityForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editPriorityForm.priorityName.$invalid && submitted,'has-success': !editPriorityForm.priorityName.$invalid && submitted}\"><label class=control-label for=priorityName>Priority Name:</label><input id=priorityName name=priorityName ng-model=priority.priorityName required class=\"form-control\"><p ng-show=\"editPriorityForm.priorityName.$invalid && submitted\" class=help-block>The Priority Name is required</p></div><div class=form-group ng-class=\"{'has-error': editPriorityForm.priorityDescription.$error.required && submitted,'has-success': !editPriorityForm.priorityDescription.$error.required && submitted}\"><label class=control-label for=priorityDescription>Description:</label><textarea type=text id=priorityDescription name=priorityDescription ng-model=priority.priorityDescription class=form-control></textarea><p ng-show=\"editPriorityForm.priorityDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=form-group ng-class=\"{'has-error': editPriorityForm.prioritySLA.$invalid && submitted,'has-success': !editPriorityForm.prioritySLA.$invalid && submitted}\"><label class=control-label for=prioritySLA>Priority SLA (Hours):</label><input id=prioritySLA name=prioritySLA type=number ng-model=priority.prioritySLA required class=\"form-control\"><p ng-show=\"editPriorityForm.prioritySLA.$error.required && submitted\" class=help-block>The SLA is required</p><p ng-show=\"!editPriorityForm.prioritySLA.$error.required && editPriorityForm.prioritySLA.$invalid && submitted\" class=help-block>The SLA must be a number</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/priority/partials/priority-details.modal.html',
    "<div><div class=modal-header><h3 class=modal-title>Priority Details</h3></div><div class=modal-body><ul><li>Name: {{priority.priorityName}}</li><li>Description: {{priority.priorityDescription}}</li><li>SLA (Hours): {{priority.prioritySLA}}</li><li>Added: {{priority.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/priority/partials/priority.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Priorites</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Priorities</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/priority/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=priority template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Name</th><th>Description</th><th>SLA (Hours)</th><th>Status</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"priority in priorities | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=priority><td>{{priority.priorityName}}</td><td>{{priority.priorityDescription}}</td><td>{{priority.prioritySLA}}</td><td>{{priority.status}}</td><td ng-click=open(priority)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=priority/edit/{{priority._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(priority) ng-confirm-click=\"Are you sure you want to delete this priority?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('app/request-type/partials/add-requesttpe.html',
    "."
  );


  $templateCache.put('app/request-type/partials/edt-requesttype.html',
    ""
  );


  $templateCache.put('app/request-type/partials/requesttype.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>RequestType</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Request Type</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/requesttype/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=requesttype template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table><tr><th>Requesttype Name</th><th>Requesttype Description</th><th>Contact</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"division in divisions | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=division><td>{{requesttype.requesttypeName}}</td><td>{{requesttype.requesttypeDescription}}</td><td><a href=/requesttype/edit/{{requesttype._id}} class=trash title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(requesttype) ng-confirm-click=\"Are you sure you want to delete this division?\"><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div></div>"
  );


  $templateCache.put('app/rfc-calls/partials/add-rfccall.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Log RFC Call</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/rfccall>RFC Calls</a></li><li class=active><strong>Log RFC Call</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=\"ibox float-e-margins\"><div class=ibox-content><form name=addRfccallForm ng-submit=addRfccall(rfccall,addRfccallForm.$invalid) role=form novalidate><div class=form-group ng-class=\"{'has-error': addRfccallForm.callRefNumber.$invalid && submitted,'has-success': !addRfccallForm.callRefNumber.$invalid && submitted}\"><label class=control-label for=callRefNumber>RefNumber:</label><input id=callRefNumber name=callRefNumber ng-model=rfccall.callRefNumber class=form-control required><p ng-show=\"addRfccallForm.callRefNumber.$invalid && submitted\" class=help-block>The Call Ref Number is required.</p></div><div class=form-group ng-class=\"{'has-error': addRfccallForm.callDescription.$invalid && submitted,'has-success': !addRfccallForm.callDescription.$invalid && submitted}\"><label class=control-label for=callDescription>Description:</label><input id=callDescription name=callDescription ng-model=rfccall.callDescription required class=\"form-control\"><p ng-show=\"addRfccallForm.callDescription.$invalid && submitted\" class=help-block>The Call Description is required.</p></div><div class=form-group ng-class=\"{'has-error': addRfccallForm.changeRequestType.$invalid && submitted,'has-success': !addRfccallForm.requesttype.$invalid && submitted}\"><label>Request Type:</label><ui-select id=requesttype name=requesttype ng-model=rfccall.requesttype theme=bootstrap required><ui-select-match placeholder=\"Select a Request Type\">{{$select.selected.requesttypeName}}</ui-select-match><ui-select-choices repeat=\"requesttype in requesttypes | filter: $select.search\" value={{requesttype._id}}><div ng-bind-html=\"requesttype.requesttypeName | highlight: $select.search\"></div><small>Description: {{requesttype.requesttypeDescription}}</small></ui-select-choices></ui-select><p ng-show=\"addRfccallForm.requesttype.$invalid && submitted\" class=help-block>The Request Type is required.</p></div><div class=form-group ng-class=\"{'has-error': addRfccallForm.evaluationoutcome.$invalid && submitted,'has-success': !addRfccallForm.evaluationoutcome.$invalid && submitted}\"><label>Call Evaluation Outcome:</label><ui-select id=evaluationoutcome name=evaluationoutcome ng-model=rfccall.evaluationoutcome theme=bootstrap required><ui-select-match placeholder=\"Select a evaluationoutcome\">{{$select.selected.evaluationoutcomeName}}</ui-select-match><ui-select-choices repeat=\"evaluationoutcome in evaluationoutcomes | filter: $select.search\" value={{evaluationoutcome._id}}><div ng-bind-html=\"evaluationoutcome.evaluationoutcomeName | highlight: $select.search\"></div><small>Description: {{evaluationoutcome.evaluationoutcomeDescription}}</small></ui-select-choices></ui-select><p ng-show=\"addRfccallForm.callEvaluationOutcome.$invalid && submitted\" class=help-block>The call Evaluation Outcome is required.</p></div><div class=form-group ng-class=\"{'has-error': addRfccallForm.actionPlan.$invalid && submitted,'has-success': !addRfccallForm.actionPlan.$invalid && submitted}\"><label class=control-label for=actionPlan>Action Plan:</label><input id=actionPlan name=actionPlan ng-model=rfccall.actionPlan required class=\"form-control\"><p ng-show=\"addRfccallForm.actionPlan.$invalid && submitted\" class=help-block>The action plan is required.</p></div><div class=form-group ng-class=\"{'has-error': addRfccallForm.implementationOutcome.$invalid && submitted,'has-success': !addRfccallForm.implementationOutcome.$invalid && submitted}\"><label class=control-label for=implementationOutcome>Implementation Outcome:</label><input id=implementationOutcome name=implementationOutcome ng-model=rfccall.implementationOutcome required class=\"form-control\"><p ng-show=\"addRfccallForm.implementationOutcome.$invalid && submitted\" class=help-block>The implementation outcome is required.</p></div><!--<div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.callRefNumber.$invalid && submitted,'has-success': !addRfccallForm.callRefNumber.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"callRefNumber\">Call Ref Number:</label>\n" +
    "                                 <input id=\"callRefNumber\" name=\"callRefNumber\" type=\"text\" ng-model=\"rfccall.callRefNumber\" required class=\"form-control\"/>\n" +
    "\n" +
    "                                <p ng-show=\"logRFCCallForm.callRefNumber.$invalid && submitted\" class=\"help-block\">The Priority is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.category.$invalid && submitted,'has-success': !logRFCCallForm.category.$invalid && submitted}\">\n" +
    "                                <label>Category:</label>\n" +
    "                                <ui-select id=\"category\" name=\"category\" ng-model=\"rfccall.category\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Category\">{{$select.selected.categoryName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"category in categories | filter: $select.search\" value=\"{{category._id}}\">\n" +
    "                                        <div ng-bind-html=\"category.categoryName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Description: {{category.categoryDescription}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"addRfccallForm.category.$invalid && submitted\" class=\"help-block\">The Category is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.channel.$invalid && submitted,'has-success': !logRFCCallForm.channel.$invalid && submitted}\">\n" +
    "                                <label>Channel:</label>\n" +
    "                                <ui-select id=\"channel\" name=\"channel\" ng-model=\"rfccall.channel\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Channel\">{{$select.selected.channelName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"channel in channels | filter: $select.search\" value=\"{{channel._id}}\">\n" +
    "                                        <div ng-bind-html=\"channel.channelName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Description: {{channel.channelDescription}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"logRFCCallForm.channel.$invalid && submitted\" class=\"help-block\">The Channel is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.division.$invalid && submitted,'has-success': !logRFCCallForm.division.$invalid && submitted}\">\n" +
    "                                <label>Division:</label>\n" +
    "                                <ui-select id=\"division\" name=\"division\" ng-model=\"rfccall.division\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Division\">{{$select.selected.divisionName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"division in divisions | filter: $select.search\" value=\"{{division._id}}\">\n" +
    "                                        <div ng-bind-html=\"division.priorityName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Address: {{division.divisionAddress}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\tContact: {{division.divisionContact}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"logRFCCallForm.division.$invalid && submitted\" class=\"help-block\">The Division is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{ 'has-error' : addRfccallForm.rfccallDescription.$invalid && submitted,'has-success': !addRfccallForm.rfccallDescription.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"rfccallDescription\">Description:</label>\n" +
    "                                <textarea type=\"text\" id=\"rfccallDescription\" name=\"rfccallDescription\" ng-model=\"rfccall.rfccallDescription\" class=\"form-control\" required></textarea>\n" +
    "                                <p ng-show=\"RfccallForm.rfccallDescription.$invalid && submitted\" class=\"help-block\">The Description is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.contactNumber.$invalid && submitted,'has-success': !addRfccallForm.contactNumber.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"contactNumber\">Contact Number:</label>\n" +
    "                                <input id=\"contactNumber\" name=\"contactNumber\" type=\"text\" ng-model=\"rfccall.contactNumber\" class=\"form-control\" required/>\n" +
    "                                <p ng-show=\"logRFCCallForm.contactNumber.$invalid && submitted\" class=\"help-block\">The Contact Number is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "--><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/rfc-calls/partials/edit-rfccalls.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit RFC Call</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/rfccall>Packages</a></li><li class=active><strong>EditRFCCall</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=\"ibox float-e-margins\"><div class=ibox-content><form name=editRfccallForm ng-submit=editRfccall(rfccall,editRfccallForm.$invalid) role=form novalidate><div class=form-group ng-class=\"{'has-error': editRfccallForm.callRefNumber.$invalid && submitted,'has-success': !editRfccallForm.callRefNumber.$invalid && submitted}\"><label class=control-label for=callRefNumber>Call RefNumber:</label><input id=callRefNumber name=callRefNumber ng-model=rfccall.callRefNumber class=form-control required><p ng-show=\"editRfccallForm.callRefNumber.$invalid && submitted\" class=help-block>The Call Ref Number is required.</p></div><div class=form-group ng-class=\"{'has-error': editRfccallForm.callDescription.$invalid && submitted,'has-success': !editRfccallForm.callDescription.$invalid && submitted}\"><label class=control-label for=callDescription>Call Description:</label><input id=callDescription name=callDescription ng-model=rfccall.callDescription required class=\"form-control\"><p ng-show=\"editRfccallForm.callDescription.$invalid && submitted\" class=help-block>The Call Description is required.</p></div><div class=form-group ng-class=\"{'has-error': editRfccallForm.changeRequestType.$invalid && submitted,'has-success': !editRfccallForm.requesttype.$invalid && submitted}\"><label>Request Type:</label><ui-select id=requesttype name=requesttype ng-model=rfccall.requesttype theme=bootstrap required><ui-select-match placeholder=\"Select a Request Type\">{{$select.selected.requesttypeName}}</ui-select-match><ui-select-choices repeat=\"requesttype in requesttypes | filter: $select.search\" value={{requesttype._id}}><div ng-bind-html=\"requesttype.requesttypeName | highlight: $select.search\"></div><small>Description: {{requesttype.requesttypeDescription}}</small></ui-select-choices></ui-select><p ng-show=\"editRfccallForm.requesttype.$invalid && submitted\" class=help-block>The Request Type is required.</p></div><div class=form-group ng-class=\"{'has-error': editRfccallForm.evaluationoutcome.$invalid && submitted,'has-success': !editRfccallForm.evaluationoutcome.$invalid && submitted}\"><label>Call Evaluation Outcome:</label><ui-select id=evaluationoutcome name=evaluationoutcome ng-model=rfccall.evaluationoutcome theme=bootstrap required><ui-select-match placeholder=\"Select a evaluationoutcome\">{{$select.selected.evaluationoutcomeName}}</ui-select-match><ui-select-choices repeat=\"evaluationoutcome in evaluationoutcomes | filter: $select.search\" value={{evaluationoutcome._id}}><div ng-bind-html=\"evaluationoutcome.evaluationoutcomeName | highlight: $select.search\"></div><small>Description: {{evaluationoutcome.evaluationoutcomeDescription}}</small></ui-select-choices></ui-select><p ng-show=\"editRfccallForm.callEvaluationOutcome.$invalid && submitted\" class=help-block>The call Evaluation Outcome is required.</p></div><div class=form-group ng-class=\"{'has-error': editRfccallForm.actionPlan.$invalid && submitted,'has-success': !editRfccallForm.actionPlan.$invalid && submitted}\"><label class=control-label for=actionPlan>Action Plan:</label><input id=actionPlan name=actionPlan ng-model=rfccall.actionPlan required class=\"form-control\"><p ng-show=\"editRfccallForm.actionPlan.$invalid && submitted\" class=help-block>The action plan is required.</p></div><div class=form-group ng-class=\"{'has-error': editRfccallForm.implementationOutcome.$invalid && submitted,'has-success': !editRfccallForm.implementationOutcome.$invalid && submitted}\"><label class=control-label for=implementationOutcome>Implementation Outcome:</label><input id=implementationOutcome name=implementationOutcome ng-model=rfccall.implementationOutcome required class=\"form-control\"><p ng-show=\"editRfccallForm.implementationOutcome.$invalid && submitted\" class=help-block>The implementation outcome is required.</p></div><!--<div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.callRefNumber.$invalid && submitted,'has-success': !addRfccallForm.callRefNumber.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"callRefNumber\">Call Ref Number:</label>\n" +
    "                                 <input id=\"callRefNumber\" name=\"callRefNumber\" type=\"text\" ng-model=\"rfccall.callRefNumber\" required class=\"form-control\"/>\n" +
    "                                 \n" +
    "                                <p ng-show=\"logRFCCallForm.callRefNumber.$invalid && submitted\" class=\"help-block\">The Priority is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.category.$invalid && submitted,'has-success': !logRFCCallForm.category.$invalid && submitted}\">\n" +
    "                                <label>Category:</label>\n" +
    "                                <ui-select id=\"category\" name=\"category\" ng-model=\"rfccall.category\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Category\">{{$select.selected.categoryName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"category in categories | filter: $select.search\" value=\"{{category._id}}\">\n" +
    "                                        <div ng-bind-html=\"category.categoryName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Description: {{category.categoryDescription}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"addRfccallForm.category.$invalid && submitted\" class=\"help-block\">The Category is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.channel.$invalid && submitted,'has-success': !logRFCCallForm.channel.$invalid && submitted}\">\n" +
    "                                <label>Channel:</label>\n" +
    "                                <ui-select id=\"channel\" name=\"channel\" ng-model=\"rfccall.channel\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Channel\">{{$select.selected.channelName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"channel in channels | filter: $select.search\" value=\"{{channel._id}}\">\n" +
    "                                        <div ng-bind-html=\"channel.channelName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Description: {{channel.channelDescription}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"logRFCCallForm.channel.$invalid && submitted\" class=\"help-block\">The Channel is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.division.$invalid && submitted,'has-success': !logRFCCallForm.division.$invalid && submitted}\">\n" +
    "                                <label>Division:</label>\n" +
    "                                <ui-select id=\"division\" name=\"division\" ng-model=\"rfccall.division\" theme=\"bootstrap\" required>\n" +
    "                                    <ui-select-match placeholder=\"Select a Division\">{{$select.selected.divisionName}}</ui-select-match>\n" +
    "                                    <ui-select-choices repeat=\"division in divisions | filter: $select.search\" value=\"{{division._id}}\">\n" +
    "                                        <div ng-bind-html=\"division.priorityName | highlight: $select.search\"></div>\n" +
    "\n" +
    "                                        <small>\n" +
    "                                            Address: {{division.divisionAddress}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\tContact: {{division.divisionContact}}\n" +
    "\t\t\t\t\t\t\t\t\t\t\t</small>\n" +
    "                                    </ui-select-choices>\n" +
    "                                </ui-select>\n" +
    "                                <p ng-show=\"logRFCCallForm.division.$invalid && submitted\" class=\"help-block\">The Division is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{ 'has-error' : addRfccallForm.rfccallDescription.$invalid && submitted,'has-success': !addRfccallForm.rfccallDescription.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"rfccallDescription\">Description:</label>\n" +
    "                                <textarea type=\"text\" id=\"rfccallDescription\" name=\"rfccallDescription\" ng-model=\"rfccall.rfccallDescription\" class=\"form-control\" required></textarea>\n" +
    "                                <p ng-show=\"RfccallForm.rfccallDescription.$invalid && submitted\" class=\"help-block\">The Description is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "\n" +
    "                            <div class=\"form-group\" ng-class=\"{'has-error': addRfccallForm.contactNumber.$invalid && submitted,'has-success': !addRfccallForm.contactNumber.$invalid && submitted}\">\n" +
    "                                <label class=\"control-label\" for=\"contactNumber\">Contact Number:</label>\n" +
    "                                <input id=\"contactNumber\" name=\"contactNumber\" type=\"text\" ng-model=\"rfccall.contactNumber\" class=\"form-control\" required/>\n" +
    "                                <p ng-show=\"logRFCCallForm.contactNumber.$invalid && submitted\" class=\"help-block\">The Contact Number is required.</p>\n" +
    "                            </div>\n" +
    "\n" +
    "--><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/rfc-calls/partials/rfccall-details.model.html',
    "<div><div class=modal-header><h3 class=modal-title>RFC Call Details</h3></div><div class=modal-body><ul><li>Ref Number: {{rfccall.callRefNumber}} {{rfccall.changeAuthorized}}</li><li>Category: {{rfccall.changeRequestType.requesttypeName}}</li><li>Call Description: {{rfccall.callDescription}}</li><li>Call Evaluation Outcome: {{rfccall.callEvaluationOutcome.evaluationoutcomeName}}</li><li>Action Plan: {{rfccall.actionPlan}}</li><li>Change Authorized: {{rfccall.changeAuthorized}}</li><li>Implementation Outcome: {{rfccall.implementationOutcome}}</li><li>Added: {{rfccall.added | date:'medium'}}</li></ul></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div></div>"
  );


  $templateCache.put('app/rfc-calls/partials/rfccalls.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>RFC Calls</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Change Management</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/rfccalls/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><!--<div class=\"col-md-2\">\n" +
    "\t\t\t\t\t\t\t\t<div class=\"row\">\n" +
    "\n" +
    "\t\t\t\t\t\t\t\t\t<div class=\"col-md-2\" style=\"vertical-align: text-bottom; padding-left: 0; padding-top: 22px; text-align: left;\">\n" +
    "\t\t\t\t\t\t\t\t\t\t<input type=\"button\" name=\"\" value=\"Go\" ng-click=\"bulkAction(selectedErrands,errand.bulkAction)\" class=\"btn btn-small btn-primary\">\n" +
    "\t\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t\t</div>--><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=rfccall template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Call Ref Number</th><th>Call Description</th><th>Change Request Type</th><th>Evaluation Outcome</th><th>Action Plan</th><th>Change Authority</th><th>Implementation Outcome</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"rfccall in rfccalls | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=rfccall><td>{{rfccall.callRefNumber}}</td><td>{{rfccall.callDescription}}</td><td>{{rfccall.changeRequestType.requesttypeName}}</td><td>{{rfccall.callEvaluationOutcome.evaluationoutcomeName}}</td><td>{{rfccall.actionPlan}}</td><td>{{rfccall.changeAuthorized}}</td><td>{{rfccall.implementationOutcome}}</td><td ng-click=open(rfccall)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=rfccalls/edit/{{rfccall._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(rfccall) ng-confirm-click=\"Are you sure you want to delete this rfccall?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div><!-- /.box-body --></div><!-- /.box --></div></div></div></div>"
  );


  $templateCache.put('app/status/partials/add-issuestatus.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Add Job Card Status</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/issuestatus>Issue Statuses</a></li><li class=active><strong>Add Issue Status</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=addIssueStatusForm ng-submit=addIssueStatus(issuestatus,addIssueStatusForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': addIssueStatusForm.issueStatusName.$invalid && submitted,'has-success': !addIssueStatusForm.issueStatusName.$invalid && submitted}\"><label class=control-label for=issueStatusName>Status Name:</label><input id=issueStatusName name=issueStatusName ng-model=issuestatus.issueStatusName required class=\"form-control\"><p ng-show=\"addIssueStatusForm.issueStatusName.$invalid && submitted\" class=help-block>The Status Name is required</p></div><div class=form-group ng-class=\"{'has-error': addIssueStatusForm.issueStatusDescription.$error.required && submitted,'has-success': !addIssueStatusForm.issueStatusDescription.$error.required && submitted}\"><label class=control-label for=issueStatusDescription>Description:</label><textarea type=text id=issueStatusDescription name=issueStatusDescription ng-model=issuestatus.issueStatusDescription class=form-control></textarea><p ng-show=\"addIssueStatusForm.issueStatusDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/status/partials/edit-issuestatus.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-lg-10><h2>Edit Issue Status</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li><a href=/issuestatus>Issue Statuses</a></li><li class=active><strong>Edit Issue Status</strong></li></ol></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-6><div class=ibox><div class=ibox-content><form novalidate name=editIssueStatusForm ng-submit=editIssueStatus(issuestatus,editIssueStatusForm.$valid) role=form><div class=form-group ng-class=\"{'has-error': editIssueStatusForm.issueStatusName.$invalid && submitted,'has-success': !editIssueStatusForm.issueStatusName.$invalid && submitted}\"><label class=control-label for=issueStatusName>Status Name:</label><input id=issueStatusName name=issueStatusName ng-model=issuestatus.issueStatusName required class=\"form-control\"><p ng-show=\"editIssueStatusForm.issueStatusName.$invalid && submitted\" class=help-block>The Status Name is required</p></div><div class=form-group ng-class=\"{'has-error': editIssueStatusForm.issueStatusDescription.$error.required && submitted,'has-success': !editIssueStatusForm.issueStatusDescription.$error.required && submitted}\"><label class=control-label for=issueStatusDescription>Description:</label><textarea type=text id=issueStatusDescription name=issueStatusDescription ng-model=issuestatus.issueStatusDescription class=form-control></textarea><p ng-show=\"editIssueStatusForm.issueStatusDescription.$error.required  && submitted\" class=help-block>The Description is required.</p></div><div class=box-footer><button type=submit class=\"btn btn-small btn-primary\">Submit</button> <a ng-click=cancel() class=\"btn btn-small\">Cancel</a></div></form></div></div></div></div></div></div>"
  );


  $templateCache.put('app/status/partials/issuestatus.html',
    "<maq-inspinia-nav></maq-inspinia-nav><div id=page-wrapper class=gray-bg><maq-inspinia-top-nav></maq-inspinia-top-nav><div class=\"row wrapper border-bottom white-bg page-heading\"><div class=col-md-10><h2>Issue Statuses</h2><ol class=breadcrumb><li><a href=\"/\">Home</a></li><li class=active><strong>Issue Status</strong></li></ol></div><div class=\"col-md-2 page-heading-actions\"><div class=pull-right><a href=/issuestatus/add class=\"btn btn-block btn-success btn-md\"><i class=\"fa fa-plus\"></i> Add New</a></div></div></div><div class=\"wrapper wrapper-content animated fadeIn\"><maq-socket-disconnected></maq-socket-disconnected><maq-danger-alert></maq-danger-alert><maq-info-alert></maq-info-alert><div class=row><div class=col-md-12><div class=ibox><div class=ibox-title><div class=row><div class=col-md-3><label for=search>Search:</label><input ng-model=q id=search class=form-control placeholder=\"Filter text\"></div><div class=col-md-3><label for=search>Items Per Page:</label><input type=number min=1 max=100 class=form-control ng-model=pageSize></div><div class=\"col-md-3 col-md-offset-3\"><dir-pagination-controls pagination-id=issuestatus template-url=components/pagination/dirPagination.tpl.html class=pull-right></dir-pagination-controls></div></div></div><div class=\"ibox-content table-responsive\"><table class=table class=\"row-border hover\"><tr><th>Name</th><th>Description</th><th>Status</th><th colspan=5>Actions</th></tr><tr dir-paginate=\"issuestatus in issuestatuses | filter:q | itemsPerPage: pageSize\" current-page=currentPage pagination-id=issuestatus><td>{{issuestatus.issueStatusName}}</td><td>{{issuestatus.issueStatusDescription}}</td><td>{{issuestatus.status}}</td><td ng-click=open(issuestatus)><a title=\"View Details\"><span class=\"glyphicon glyphicon-list\"></span></a></td><td><a href=issuestatus/edit/{{issuestatus._id}} title=Edit><span class=\"glyphicon glyphicon-pencil\"></span></a></td><td ng-click=delete(issuestatus) ng-confirm-click=\"Are you sure you want to delete this status?\" ng-show=isAdmin()><a class=trash title=Delete><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr></table></div></div></div></div></div></div>"
  );


  $templateCache.put('components/navbar/danger-alert.html',
    "<div class=\"alert alert-danger alert-dismissable maq-alert-danger\"><i class=\"fa fa-warning\"></i> <button type=button class=close data-dismiss=alert aria-hidden=true>×</button><!-- Content goes here --></div>"
  );


  $templateCache.put('components/navbar/info-alert.html',
    "<div class=\"alert alert-info alert-dismissable maq-alert-info\"><i class=\"fa fa-warning\"></i> <button type=button class=close data-dismiss=alert aria-hidden=true>×</button><!-- Content goes here --></div>"
  );


  $templateCache.put('components/navbar/inspinia-navigation.html',
    "<nav class=\"navbar-default navbar-static-side\" role=navigation><div class=sidebar-collapse><ul maq-side-navigation class=\"nav metismenu\" id=side-menu><li class=nav-header><div class=\"dropdown profile-element\"><img src=assets/images/avatar.png class=img-circle alt=\"User Image\" style=\"width:25%\"> <a class=dropdown-toggle data-toggle=dropdown><span class=clear><span class=\"block m-t-xs\"><strong class=font-bold>{{ getCurrentUser().firstName + getCurrentUser().companyName}}</strong></span> <span class=\"text-xs block\">{{ getCurrentUser().role }} <b class=caret></b></span></span></a><ul class=\"dropdown-menu animated fadeInRight m-t-xs\"><li><a href=/settings>Profile Settings</a></li><li><a href=# ng-show=isAdmin() ng-click=restoreDB() ng-confirm-click=\"Are you sure you want to restore the database?\">Restore DB Backup</a></li><li class=divider></li><li><a href=\"\" ng-click=logout()>Sign out</a></li></ul></div><div class=logo-element>BD+</div></li><li class=treeview ng-show=isAdmin() maq-treeview-toggle><a href=/admin maq-sidebar-menu><i class=\"fa fa-user\"></i> <span>Admin</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/dashboard>Dashboard</a></li><li><a href=/users>Users</a></li><li><a href=/admin/add>Add User</a></li></ul></li><li class=treeview ng-show=!isAdmin() maq-treeview-toggle><a href=/admin maq-sidebar-menu><i class=\"fa fa-user\"></i> <span>Admin</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/dashboard>Dashboard</a></li></ul></li><!-- <li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/packages\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-gift\"></i>\n" +
    "\t\t\t\t\t<span>Category</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/category\">Category Dashboard</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li>\n" +
    "\t\t\t<li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/packages\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-gift\"></i>\n" +
    "\t\t\t\t\t<span>Channel</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/channel\">Channel Dashboard</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/channel/add\">Add Channel</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li> --><li class=treeview ng-show=isAdmin()><a href=/packages maq-sidebar-menu><i class=\"fa fa-shopping-bag\"></i> <span>ICT Store</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/ictstore>ICT Store Dashboard</a></li><li><a href=/ictstore/add>Add ICT Store</a></li></ul></li><li class=treeview ng-show=isAdmin()><a href=/packages maq-sidebar-menu><i class=\"fa fa-desktop\"></i> <span>ICT Asset</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/ictasset>ICT Asset Dashboard</a></li><li><a href=/ictasset/add>Add ICT Asset</a></li></ul></li><!-- <li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/bikes\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-motorcycle\"></i>\n" +
    "\t\t\t\t\t<span>Bikes</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/bikes\">Bikes Dashboard</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li> --><li class=treeview ng-show=isAdmin()><a href=/visitors maq-sidebar-menu><i class=\"fa fa-id-card\"></i> <span>Issue</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/issues>Issue Dashboard</a></li><li><a href=/issues/add>Add Issue</a></li></ul></li><li class=treeview ng-show=isAdmin()><a href=/visitors maq-sidebar-menu><i class=\"fa fa-plus-square\"></i> <span>Change Management</span> <span class=\"fa fa-angle-left pull-right\"></span></a><ul class=\"nav nav-second-level\"><li><a href=/rfccalls>Change Management Dashboard</a></li><li><a href=/rfccalls/add>Add RFC Call</a></li></ul></li><!--<li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/officeparks\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-motorcycle\"></i>\n" +
    "\t\t\t\t\t<span>Office Parks</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/officeparks\">Office Parks Dashboard</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li>\n" +
    "\n" +
    "\t\t\t<li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/companies\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-building\"></i>\n" +
    "\t\t\t\t\t<span>Companies</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/companies\">Companies Dashboard</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li>\n" +
    "\n" +
    "\t\t\t<li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/riders\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-hand-rock-o\"></i>\n" +
    "\t\t\t\t\t<span>Riders</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/riders\">Riders Dashboard</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li>\n" +
    "\n" +
    "\t\t\t <li class=\"treeview\" ng-show=\"isAdmin()\">\n" +
    "\t\t\t\t<a href=\"/errands\" maq-sidebar-menu>\n" +
    "\t\t\t\t\t<i class=\"fa fa-calendar\"></i>\n" +
    "\t\t\t\t\t<span>Errands</span>\n" +
    "\t\t\t\t\t<span class=\"fa fa-angle-left pull-right\"></span>\n" +
    "\t\t\t\t</a>\n" +
    "\t\t\t\t<ul class=\"nav nav-second-level\">\n" +
    "\t\t\t\t\t<li><a href=\"/errands\">Errands Dashboard</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/add\">Add Errand</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/status\">Errand Statuses</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/generate-runsheet\">Generate Runsheet</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/attempted-delivery-reasons\">Attempted Delivery Reasons</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/delivery-zones\">Delivery Zones</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/payment-status\">Payment Statuses</a></li>\n" +
    "\t\t\t\t\t<li><a href=\"/errands/reports\">Generate Errand Reports</a></li>\n" +
    "\t\t\t\t</ul>\n" +
    "\t\t\t</li> --></ul></div></nav>"
  );


  $templateCache.put('components/navbar/inspinia-topnavbar.html',
    "<div class=\"row border-bottom\"><nav class=\"navbar navbar-static-top\" role=navigation style=\"margin-bottom: 0\"><div class=navbar-header><span maq-minimise-sidebar></span><!-- <form role=\"search\" class=\"navbar-form-custom\" method=\"post\" action=\"\">\n" +
    "                <div class=\"form-group\">\n" +
    "                    <input type=\"text\" placeholder=\"Search For Something...\" class=\"form-control\" name=\"top-search\" id=\"top-search\">\n" +
    "                </div>\n" +
    "            </form> --></div><ul class=\"nav navbar-top-links navbar-right\"><li><a href=\"\" ng-click=logout()><i class=\"fa fa-sign-out\"></i> Sign out</a></li></ul></nav></div>"
  );


  $templateCache.put('components/navbar/socket-disconnected.html',
    "<div class=\"alert alert-danger alert-dismissable socket-disconnected\"><i class=\"fa fa-warning\"></i> <button type=button class=close data-dismiss=alert aria-hidden=true>×</button> <b>Alert!</b> Connection Lost. You Won't Get Automatic Updates. <a href=\"javascript:window.location.href=window.location.href\">Please Reload Page</a></div>"
  );


  $templateCache.put('components/pagination/dirPagination.tpl.html',
    "<ul class=pagination ng-if=\"1 < pages.length\"><li ng-if=boundaryLinks ng-class=\"{ disabled : pagination.current == 1 }\"><a href=\"\" ng-click=setCurrent(1)>&laquo;</a></li><li ng-if=directionLinks ng-class=\"{ disabled : pagination.current == 1 }\" class=ng-scope><a href=\"\" ng-click=\"setCurrent(pagination.current - 1)\" class=ng-binding>‹</a></li><li ng-repeat=\"pageNumber in pages track by $index\" ng-class=\"{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }\"><a href=\"\" ng-click=setCurrent(pageNumber)>{{ pageNumber }}</a></li><li ng-if=directionLinks ng-class=\"{ disabled : pagination.current == pagination.last }\" class=ng-scope><a href=\"\" ng-click=\"setCurrent(pagination.current + 1)\" class=ng-binding>›</a></li><li ng-if=boundaryLinks ng-class=\"{ disabled : pagination.current == pagination.last }\"><a href=\"\" ng-click=setCurrent(pagination.last)>&raquo;</a></li></ul>"
  );

}]);

