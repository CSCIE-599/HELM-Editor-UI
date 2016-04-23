'use strict';

/**
 * @ngdoc directive
 * @name helmeditor2App.directive:ngContextMenu
 * @description
 * ngContextMenu
 */

/**
 * context menu for right-click on canvas
 * package: https://github.com/Templarian/ui.bootstrap.contextMenu
 * copied from: http://codepen.io/templarian/pen/VLKZLB
 */
angular.module('helmeditor2App')
    .directive('contextMenu', ["$parse", "$q", function ($parse, $q) {
        /* global $ */
        var contextMenus = [];

        //clear context menus
        var removeContextMenus = function (level) {
            while (contextMenus.length && (!level || contextMenus.length > level)) {
                contextMenus.pop().remove();
            }
            if (contextMenus.length === 0 && $currentContextMenu) {
                $currentContextMenu.remove();
            }
        };

        var $currentContextMenu = null;

        var renderContextMenu = function ($scope, event, options, model, level) {

            if (!level) { level = 0; }
            if (!$) {$ = angular.element; }
            $(event.currentTarget).addClass('context');
            var $contextMenu = $('<div>');
            if ($currentContextMenu) {              //if nested list
                $contextMenu = $currentContextMenu;

            } else {
                $currentContextMenu = $contextMenu;
            }

            //make list
            $contextMenu.addClass('dropdown clearfix');

            var $ul = $('<ul>');
            $ul.addClass('dropdown-menu');
            $ul.attr({ 'role': 'menu' });
            $ul.css({
                display: 'block',
                position: 'absolute',
                left: event.pageX + 'px',
                top: event.pageY + 'px',
                "z-index": 10000
            });

            //add list items
            angular.forEach(options, function (item) {
                var $li = $('<li>');

                if (item === null) {
                    $li.addClass('divider');
                } else {
                    var nestedMenu = angular.isArray(item[1]) ? item[1] :
                    angular.isArray(item[2]) ? item[2] :
                    angular.isArray(item[3]) ? item[3] :
                    angular.isArray(item[4]) ? item[4] :
                    angular.isArray(item[5]) ? item[5] :
                    angular.isArray(item[6]) ? item[6] :
                    angular.isArray(item[7]) ? item[7] :
                    angular.isArray(item[8]) ? item[8] :
                    angular.isArray(item[9]) ? item[9] :
                                               null;
                    var $a = $('<a>');
                    $a.css("padding-right", "8px");
                    $a.attr({ tabindex: '-1', href: '#' });
                    var text = typeof item[0] === 'string' ? item[0] : item[0].call($scope, $scope, event, model);
                    $q.when(text).then(function (text) {
                        $a.text(text);
                        if (nestedMenu) {
                            $a.css("cursor", "default");
                            $a.append($('<strong style="font-family:monospace;font-weight:bold;float:right;">&gt;</strong>'));
                        }
                    });
                    $li.append($a);

                    //for nested menu, add mouse events to list items
                    var enabled = angular.isFunction(item[2]) ? item[2].call($scope, $scope, event, model, text) : true;
                    if (enabled) {
                        //shows nested menu items
                        var openNestedMenu = function () {
                            removeContextMenus(level + 1);
                            var ev = {
                                pageX: event.pageX + $ul[0].offsetWidth - 1,
                                pageY: $ul[0].offsetTop + $li[0].offsetTop - 3
                            };
                            renderContextMenu($scope, ev, nestedMenu, model, level + 1);
                        };

                        $li.on('click', function ($event) {
                            $event.preventDefault();
                            $scope.$apply(function () {
                                if (nestedMenu) {
                                    openNestedMenu($event);
                                } else { //calls function in nested list item in main.js
                                    $(event.currentTarget).removeClass('context');
                                    removeContextMenus();
                                    item[1].call($scope, $scope, event, model);
                                }
                            });
                        });

                        $li.on('mouseover', function ($event) {

                            $scope.$apply(function () {
                                if (nestedMenu) {
                                    openNestedMenu($event);
                                }
                            });
                        });
                    } else {
                        $li.on('click', function ($event) {
                            $event.preventDefault();
                        });
                        $li.addClass('disabled');
                    }
                }
                $ul.append($li);
            });

            //format context menu
            $contextMenu.append($ul);
            var height = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
            $contextMenu.css({
                width: '100%',
                height: height + 'px',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9999
            });

            //add mouse events to contextMenu
            $(document).find('body').append($contextMenu);
            $contextMenu.on("mousedown", function (e) {
                if ($(e.target).hasClass('dropdown')) {
                    $(event.currentTarget).removeClass('context');
                    removeContextMenus();
                }
            }).on('contextmenu', function (event) {
                $(event.currentTarget).removeClass('context');
                event.preventDefault();
                removeContextMenus(level);
            });
            $scope.$on("$destroy", function () {
                removeContextMenus();
            });

            contextMenus.push($ul);
        };


        return function ($scope, element, attrs) {
            element.on('contextmenu', function (event) {
                event.stopPropagation();
                $scope.$apply(function () {
                    event.preventDefault();
                    var options = $scope.$eval(attrs.contextMenu);
                    var model = $scope.$eval(attrs.model);
                    if (options instanceof Array) {
                        if (options.length === 0) { return; }
                        renderContextMenu($scope, event, options, model);
                    } else {
                        throw '"' + attrs.contextMenu + '" not an array';
                    }
                });
            });
        };
    }]);
