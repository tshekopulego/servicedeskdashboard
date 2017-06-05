'use strict';

angular.module('serviceDeskApp')
.config(function ($routeProvider) {
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
});
