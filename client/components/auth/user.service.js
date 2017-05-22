'use strict';

angular.module('serviceDeskApp')
.factory('User', function ($resource) {
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
});
