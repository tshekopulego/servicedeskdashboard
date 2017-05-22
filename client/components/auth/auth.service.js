'use strict';

angular.module('serviceDeskApp')
.factory('Auth', function Auth($location, $rootScope, $http, User, Local, $cookieStore, $q) {
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
});
