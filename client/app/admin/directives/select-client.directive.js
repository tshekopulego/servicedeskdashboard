'use strict';

angular.module('serviceDeskApp')
.directive('maqSelectClient', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {

            element.bind('click',function() {

                var client = element.attr('name');

                if(element.is(':checked')) {
                    if(_.indexOf(scope.selectedClients,client))
                        scope.selectedClients[client] = {client:client};
                    else
                        delete scope.selectedClients[client];
                } else {
                    delete scope.selectedClients[client];
                }
                //console.log(scope.selectedClients);
            });
        }
    };
});
