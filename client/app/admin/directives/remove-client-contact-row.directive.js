'use strict';

angular.module('serviceDeskApp')
.directive('maqRemoveClientContactRow', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('click',function() {
                var index = attrs.index;
                element.parents('.input-group').slideUp('slow');
                element.parents('.input-group').find('input').val('');
                console.log(scope.extraContacts[index]);
                delete scope.extraContacts[index];
                console.log(scope.extraContacts);
            });
        }
    };
});
