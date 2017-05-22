'use strict';

angular.module('serviceDeskApp')
.directive('maqTreeviewToggle', ['$location',
    function(location){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs) {
                var isActive = element.is('.active');
                var menu = element.children("ul.treeview-menu");
                var path = location.path().split('/')[1];
                if(path === 'clients' || path === 'invoices' || path === 'users' || path === 'dashboard') {
                    menu.slideDown();
                    element.children('a').children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                    element.addClass("active");
                }
            }
        }
    }
]);
