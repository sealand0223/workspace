(function ($,window) {
    "use strict";

    var Zconfirm;


    $.confirm = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string') {
            options = {
                content: options,
                title: (option2) ? option2 : false
            };
        }

        var pluginOptions = $.extend(true, {}, Zconfirm.pluginDefaults);
        pluginOptions = $.extend(true, {}, pluginOptions, options);
        return new Zconfirm(pluginOptions);
    };

    Zconfirm = function (pluginOptions) {
        this.$box='';
        this.dfd = $.Deferred();
        this._init(pluginOptions);
    };


    Zconfirm.pluginDefaults={
        ok: {
            action: function(){

            }
        },
        close: {
            action: function(){

            }
        },
        title:'信息',
        content: 'Are you sure to continue?',
        color:'#444',
        width: 330,
        height: 'auto',
        background: '#fff',
        watchInterval:100
    };

    Zconfirm.prototype._init = function (pluginOptions) {

        this._buildHTML(pluginOptions);
        this._listen_event(pluginOptions)
    };

    Zconfirm.prototype._listen_event=function (f) {
        var that = this;
        var confirmed;
        var $confirm = $('button.confirm');
        var $cancel = $('button.cancel');
        this.timer=setInterval(function () {
            if(confirmed!==undefined){
                that.dfd.resolve(confirmed);
                clearInterval(that.timer);
                that.close_confirm()
            }
        },100);
        $confirm.on('click',function () {
            confirmed=true;
            f.ok.action();
            that._hide_mask()
        });
        $cancel.on('click',function () {
            confirmed=false;
            that._hide_mask();
            f.close.action()
        });
    };

    Zconfirm.prototype.close_confirm=function () {
        this.$box.remove();
    };

    Zconfirm.prototype._buildHTML = function (pluginOptions) {
        var that = this;
        this.$mask=$('<div class="box-mask"></div>');
        this.$box = $('<div class="confirm-box">' +
            '<div class="box-title">'+pluginOptions.title+'</div>' +
            '<div class="box-content">'+pluginOptions.content+'</div>' +
            '<div class="buttons"><button class="confirm btn-info">确定</button><button class="cancel btn-default">取消</button></div>' +
            '</div>')
            .css(pluginOptions);
        this.$box.appendTo($('body'));
        this.$mask.appendTo($('body'));
        if(pluginOptions.title===false)this.$box.find('.box-title').hide();
        this._set_box_positon(this.$box);
        $(window).on('resize',function () {
            that._set_box_positon(that.$box)
        });
        return this.dfd.promise();
    };

    Zconfirm.prototype._hide_mask=function () {
      this.$mask.remove()
    };

    Zconfirm.prototype._set_box_positon=function ($box) {
        var window_width = $(window).width(),
            window_height = $(window).height(),
            box_width = $box.width(),
            box_height = $box.height(),
            move_x,
            move_y;

        move_x = (window_width-box_width)/2;
        move_y=(window_height-box_height)/8;

        $box.css({
            left:move_x ,
            top:move_y
        })

    };



})(jQuery,window);