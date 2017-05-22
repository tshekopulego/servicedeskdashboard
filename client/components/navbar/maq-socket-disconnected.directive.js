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
