;(function () {
    'use strict';

    var $form_add_task = $('.add-task'),
        $anchor_delete,
        $anchor_detail,
        $update_form,
        $task_detail = $('.task-detail'),
        $task_list = $('.task-list'),
        $done_body = $('.done-body'),
        $task_detail_mask = $('.task-detail-mask'),
        $task_detail_content_input,
        $task_detail_content,
        $checkbox_complete,
        task_list = [],
        current_index;

    init();

    $form_add_task.on('submit', on_add_task);
    $task_detail_mask.on('click', hide_task_detail);

    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length) {
            render_task_list();
            task_remind_check()
        }
    }

    function task_remind_check() {
        var current_timestamp;
        var interval =setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i),task_timestamp;
                if (!item && !item.remind_date||item.informed) continue;
                current_timestamp = (new Date().getTime());
                task_timestamp = (new Date(item.remind_date).getTime());
                if(current_timestamp-task_timestamp>=1){
                    update_task(i,{informed:true});
                    show_notify(item.content);
                }
            }
        },300);
    }

    function show_notify(msg) {
        alert("计划事项："+msg+"已到时间")
    }

    function on_add_task(e) {
        var new_task = {},
            $input;
        //禁用默认行为
        e.preventDefault();
        $input = $('#content');
        new_task.content = $input.val();
        if (!new_task.content) {
            return null
        } else {
            if (add_task(new_task)) {
                render_task_list();
                $input.val(null)
            }
        }
    }

    function listen_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = $(this).data('index');
            show_task_detail(index);
        });
        $anchor_detail.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detail(index);

        })
    }


    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }

    function update_task(index, data) {
        if (index==undefined || !task_list[index]) return null;
        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
        render_task_list();
    }

    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide()
    }

    function listen_task_delete() {
        $anchor_delete.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            //自定义confirm
            $.confirm({
                content:'确定删除"'+get(index).content+'"？',
                title:false,
                ok:{
                    action:function(){
                        delete_task(index)
                    }
                },
                close:{
                    action:function () {
                        return null
                    }
                }
            })
        });
    }

    function listen_task_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            // var is_complete = $this.is(':checked');
            var index = $this.parent().parent().data('index');
            var item = get(index);
            if (item.complete) {
                update_task(index, {complete: false});
            } else {
                update_task(index, {complete: true});
            }
        })
    }

    function get(index) {
        return store.get('task_list')[index]
    }

    function add_task(new_task) {
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }

    function refresh_task_list() {
        store.set('task_list', task_list)
    }

    function delete_task(index) {
        if (index === undefined || !task_list[index]) return null;
        task_list.splice(index,1);
        refresh_task_list();
        render_task_list();
    }

    function render_task_list() {
        $task_list.html('');
        $done_body.html('');
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete) {
                complete_items[i] = item
            } else {
                var $task = render_task_item(item, i);
                $task_list.prepend($task)
            }
        }

        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $done_body.append($task)
        }

        $checkbox_complete = $('.complete');
        $anchor_delete = $('.delete');
        $anchor_detail = $('.detail');
        listen_task_delete();
        listen_task_detail();
        listen_task_complete();
    }

    function render_task_item(e, index) {
        if (!e) return null;
        var list_item_html = '<div class="task-item" data-index="' + index + '">' +
            '<div class="check-container"><input class="complete" id="'+index+'" type="checkbox" ' + (e.complete ? 'checked' : '') + '><label for="'+index+'"></label></div>' +
            '<span class="task-content">' + e.content + '</span>' +
            '<div class="action fr">' +
            '<span class="anchor delete fa fa-minus"></span>' +
            '<span class="anchor detail fa fa-ellipsis-h"></span>' +
            '</div>' +
            '</div>';
        return $(list_item_html);
    }

    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return null;
        $task_detail.html(null);
        var item = task_list[index];
        var detail_html = '<form class="task-detail-form"><div class="content input-item">' + (item.content || '') + '</div>' +
            '<div class="input-item"><input style="display: none" name="content" type="text" value="' + item.content + '"></div>' +
            '</div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc" cols="30" rows="10">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<label>提醒时间:</label>' +
            '<input class="form_datetime" name="remind_date" value="' + (item.remind_date || '') + '" type="text">' +
            '<div class="input-item"><button type="submit">更新</button></div>' +
            '</div></form>';
        $task_detail.append(detail_html);
        $('.form_datetime').datetimepicker();
        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');
        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide()
        });
        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();
            data.informed=false;
            update_task(index, data);
            hide_task_detail()
        });
    }
})();
