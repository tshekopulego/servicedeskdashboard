'use strict';

angular.module('serviceDeskApp')
.directive('maqAddClientContact', ['$document', '$compile',
    function ($document, $compile) {
    return {
        template: '<a title="Add Another Contact" href="#">Add Another Contact</a>',
        restrict: 'EA',
        transclude: true,
        link: function (scope, element, attrs) {
            element.bind('click',function() {
                var index = Math.floor(Math.random() * (100 - 1) +1) + 1;
                var div = $compile('<div class="form-group contact-row"><label></label><div class="input-group col-xs-6"><input class="form-control" type="text" name="person" data-index="'+index+'" placeholder="Contact Person Name" maq-update-extra-contacts/><input class="form-control" type="text" name="number" ng-model="num'+index+'" placeholder="Contact Person Number" maq-update-extra-contacts data-index="'+index+'" ui-mask="9999999999" ui-mask-placeholder ui-mask-placeholder-char="-"/><span maq-remove-client-contact-row class="glyphicon glyphicon-remove trash delete-row" data-index="'+index+'" title="Remove Contact"></span></div></div>')(scope);
                element.parents(".form-group").prepend(div);
            });
        }
    };
}]);
