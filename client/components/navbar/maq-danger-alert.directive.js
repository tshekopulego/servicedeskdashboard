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
