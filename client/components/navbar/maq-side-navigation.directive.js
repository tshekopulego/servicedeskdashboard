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
