'use strict';

angular.module('serviceDeskApp')
.directive('maqUpdateExtraContacts', function () {
    return {
        template: '<div></div>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('input',function() {
                var value = element.val();
                var index = attrs.index;
                var field = attrs.name;
                if(value.length > 0) {
                    if(scope.extraContacts[index]) {
                        if(field === 'person')
                            scope.extraContacts[index].person = value;
                        else
                            scope.extraContacts[index].number = value;
                    } else {
                        if(field === 'person')
                            scope.extraContacts[index] = {person:value};
                        else
                            scope.extraContacts[index] = {number:value};
                    }
                } else {
                    delete scope.extraContacts[index];
                }
                console.log(scope.extraContacts);
            });
        }
    };
});
