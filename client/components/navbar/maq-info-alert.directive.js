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
