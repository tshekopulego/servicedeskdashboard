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
