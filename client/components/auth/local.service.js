'use strict';

angular.module('serviceDeskApp')
  .factory('Local', function ($resource) {
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
  });
