'use strict';

angular.module('serviceDeskApp')
.directive('maqSelectAllClients', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {

            element.bind('click',function() {

                var checkboxes = element.parents('.table').find('input.client-checkbox');

                if(element.is(':checked')) {
                    _.each(checkboxes,function(checkbox) {

                        var client = checkbox.name;
                        checkbox.checked = true;

                        if(_.indexOf(scope.selectedClients,client))
                            scope.selectedClients[client] = {client:client};
                        else
                            delete scope.selectedClients[client];
                    });
                } else {
                    _.each(checkboxes,function(checkbox) {

                        var client = checkbox.name;
                        checkbox.checked = false;

                        delete scope.selectedClients[client];
                    });
                }
            });
        }
    };
});
