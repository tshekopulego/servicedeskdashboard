'use strict';

angular.module('serviceDeskApp')
.directive('maqSidebarMenu', [
    '$location',
    function(location){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs){
                /*
                 * SIDEBAR MENU
                 * ------------
                 * This is a custom plugin for the sidebar menu. It provides a tree view.
                 *
                 * Usage:
                 * $(".sidebar).tree();
                 *
                 * Note: This plugin does not accept any options. Instead, it only requires a class
                 *       added to the element that contains a sub-menu.
                 *
                 * When used with the sidebar, for example, it would look something like this:
                 * <ul class='sidebar-menu'>
                 *      <li class="treeview active">
                 *          <a href="#>Menu</a>
                 *          <ul class='treeview-menu'>
                 *              <li class='active'><a href=#>Level 1</a></li>
                 *          </ul>
                 *      </li>
                 * </ul>
                 *
                 * Add .active class to <li> elements if you want the menu to be open automatically
                 * on page load. See above for an example.
                 */
                var btn = element;
                var menu = element.next("ul.treeview-menu");
                var isActive = element.is('.active');
                var path = element.attr('href');

                if(location.path().substr(0, path.length) == path) {
                    //menu.slideDown();
                    btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                    btn.parent("li").addClass("active");
                }

                //Slide open or close the menu on link click
                btn.click(function(e) {
                    e.preventDefault();
                    if (isActive) {
                        //Slide up to close menu
                        //menu.slideUp();
                        isActive = false;
                        btn.children(".fa-angle-down").first().removeClass("fa-angle-down").addClass("fa-angle-left");
                        //btn.parent("li").removeClass("active");
                    } else {
                        //Slide down to open menu
                        //menu.slideDown();
                        isActive = true;
                        btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
                        //btn.parent("li").addClass("active");
                    }
                });
            }
        }
    }
]);
