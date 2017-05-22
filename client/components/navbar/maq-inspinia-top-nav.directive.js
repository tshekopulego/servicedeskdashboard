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
