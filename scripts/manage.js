/**
 * Created by Don on 2/18/2015.
 */

var intervalEvent = setInterval(function () {
    if (losses.data.categories) {
        losses.scope.manage.categories = losses.data.categories;
        losses.scope.manage.$digest();

        setTimeout(function () {
            sSelect('.select_transform');
        }, 100);
        clearInterval(intervalEvent);
    }
}, 500);

$(document).ready(function () {
        var newCategloryElement = $('.add_new')
            , newCategloryClasses = newCategloryElement.attr('class');

        $('.delete').click(function () {
            $('.delete_warp').addClass('need_confirm')
                .one('mouseleave', function () {
                    $(this).removeClass('need_confirm');
                });
        });

        function manageAction(event) {
            var action = $(event.target).attr('data-manage-action')
                , actionContent = {};

            actionContent.action = action;
            if ((losses.global.router.postId && (losses.multiSelect.length === 0))
                || ($.inArray(losses.global.router.postId, losses.multiSelect) !== -1)
                || (losses.global.router.postId && ($.inArray(action, ['sage', 'trans']) !== -1))) {
                actionContent.target = [losses.global.router.postId];
            } else
                actionContent.target = losses.multiSelect;

            if (action === 'trans')
                actionContent.category = $('input[name="manage_transform"]').val();

            $.post('api/?manage', actionContent, function (data) {
                    var response;
                    try {
                        response = JSON.parse(data);
                    } catch (e) {
                        publicWarning(data);
                        return;
                    }

                    if (response.code == 200) {
                        if (action == 'delete') {
                            if (losses.global.router.postId
                                && $.inArray(losses.global.router.postId, losses.multiSelect) !== -1) {
                                publicWarning('操作成功');
                                magicalLocation('#/');
                            } else {
                                for (var i = 0; i < losses.multiSelect.length; i++) {
                                    $('#post-' + losses.multiSelect[i]).slideUp(300);
                                }
                            }
                        } else {
                            location.reload(true);
                        }
                        losses.multiSelect = [];
                    } else {
                        publicWarning(response.message);
                    }
                }
            );

        }

        $('.confirm_delete').click(manageAction);
        $('.confirm_transport').click(manageAction);
        $('.confirm_sage').click(manageAction);

        $('.transport_select_warp').delegate('li', 'click', function () {
            var warp = $('.transport_warp')
                , menu = $('#new_post');

            warp.addClass('need_confirm');

            menu.addClass('extend');

            $('.transport_confirm').click(function (event) {
                if ($(event.target).hasClass('confirm_transport')) {
                    /*发送数据*/
                }

                warp.removeClass('need_confirm');
                menu.removeClass('extend');
            })
        });

        $('.color_picker').mouseover(function (event) {
            if ($(event.target).prop('tagName') === 'BUTTON') {
                $('.add_new').attr('class', newCategloryClasses + ' ' + $(event.target).attr('class'));
            }
        })
            .delegate('button', 'click', function () {
                var inputElement = $('input[name="new_category_name"]');

                $.post('api/?manage', {
                    'action': 'add_cate',
                    'theme': $(this).attr('class'),
                    'name': inputElement.val()
                }, function (data) {
                    var response = {};
                    try {
                        response = JSON.parse(data);
                    } catch (e) {
                        publicWarning(data);
                    }

                    if (response && (response.code == 200)) {
                        inputElement.val('');
                        publicWarning('添加成功');
                        losses.global.reloadCate();
                    } else {
                        publicWarning(response.message);
                    }
                })
            });

        function manageCate(event) {
            var condition = {};

            condition.target = $(this).attr('data-category');
            condition.action = $(this).attr('data-manage-action');

            if (condition.action == 'rename_cate') {
                event.preventDefault();

                condition.name = $(this).children('input').val();
            }

            console.log(condition);

            $.post('api/?manage', condition, function (data) {
                var response;
                try {
                    response = JSON.parse(data);
                } catch (e) {
                    publicWarning(data);
                }

                if (response && response.code == 200) {
                    var actionClass = null;
                    switch (condition.action) {
                        case 'mute_cate':
                            actionClass = 'mute';
                            break;
                        case 'hide_cate':
                            actionClass = 'hide';
                            break;
                        case 'rename_cate':
                            losses.global.reloadCate();
                    }
                    if (actionClass)
                        $(this).parents('.category_warp').toggleClass(actionClass);
                } else {
                    if (response)
                        publicWarning(response.message);
                    else
                        publicWarning('操作失败，原因未知');
                }
            });
        }

        $('.category').delegate('.edit_category', 'click', function () {
            var thisCate = $(this).attr('data-category')
                , thisParent = $('.cate-' + thisCate);
            thisParent.addClass('rename');

            $('.cancel-' + thisCate).one('click', function () {
                thisParent.removeClass('rename');
            })
        })
            .delegate('.mute_category', 'click', manageCate)
            .delegate('.hide_category', 'click', manageCate)
            .delegate('.category_rename', 'submit', manageCate);
    }
)
;