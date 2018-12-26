;
(function ($) {
    /**
     * @param element jQuery对象
     * @param config: {
     *     data: 接口返回的列表数据,
     *     buttons: [{
     *          icons: '字体图标',
     *          icons2: '字体图标'                          是否已经有该类数据（如已收藏）
     *          download: true || false                    是否可以下载
     *          onclick: function(){//这里是图标点击回调}
     *     }] 显示下载、购物、收藏栏  最多3个图标
     * }
     * @constructor
     */
    function Music (element, config) {
        this.ele = element;
        this.config = {
            // 是否显示下载、购物、收藏栏
            buttons: [],
            callback: config.callback ? config.callback : function () {}
        };
        // 默认参数扩展
        if (config && $.isPlainObject(config)) {
            $.extend(this.config, config);
        }
        this.intervalTimer = null;
    };
    Music.prototype = {
        init: function () {
            this.template();
            this.eventBind();
            this.config.callback()
        },
        template: function () {
            var _this = this,
                datas = _this.config.data,
                buttons = _this.config.buttons,
                html = ''
            ;
            for (var i = 0; i < datas.length; i++) {
                var source = '';
                if (datas[i].source == 1) {
                    source = '原创'
                } else if (datas[i].source == 2) {
                    source = '网络'
                } else if (datas[i].source == 3) {
                    source = '第三方授权'
                }
                var btnHtml = '';
                var love = 1;
                if (datas[i].love) {
                    love = 0
                }
                for (var j = 0; j < buttons.length; j++) {
                    var className = '';
                    var download = 'javascript:;';
                    var downloadFlag = 'download="'+ datas[i].title +'"';
                    var icons = buttons[j].icons;
                    if (buttons[j].download) {
                        className = 'icon-download';
                        if (datas[i].download) {
                            download = datas[i].download;
                            if (!datas[i].loginFlag) {
                                download = 'javascript:;'
                                downloadFlag = '';
                            }
                        }
                    }
                    if (buttons[j].icons2) {
                        className = 'icon-collect';
                        downloadFlag = '';
                        if (datas[i].love) {
                            icons = buttons[j].icons2;
                        }
                    }
                    btnHtml += '<a href="'+ download +'"' + downloadFlag +' class="iconfont '+ className +'" data-id="'+ datas[i].id +'" data-love="'+ love +'">'+ icons +'</a>';
                }
                // $('.icons').append(btnHtml);
                html += '<li class="list-box music-list hover">'+
                            '<div class="music-info clearfix">'+
                                '<a href="music-detail.html?id='+ datas[i].id +'" class="img-box" target="_blank">'+
                                    '<img class="rotate-360 rotate-pause" src="'+ datas[i].coverImg +'" alt="'+ datas[i].title +'" />'+
                                '</a>'+
                                '<div class="info-box">'+
                                    '<a href="music-detail.html?id='+ datas[i].id +'" class="title" target="_blank">'+ datas[i].title +'</a>'+
                                    '<p class="format"><span>格式：'+ datas[i].format +'</span><span>来源：'+ source +'</span></p>'+
                                    '<div class="icons">'+ btnHtml +
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="music-control">'+
                                '<a href="javascript:;" class="icon-play" data-second="0" data-minute="0" data-stay="" data-play="false" data-time=""></a>'+
                                '<span class="time-s">0:00</span>'+
                                '<audio crossorigin="anonumous" class="audio">'+
                                    '<source src="'+ datas[i].download +'">'+
                                '</audio>'+
                                '<a href="javascript:;" class="time-bar">'+
                                    '<img src="/images/member/shengbo.png" alt="" />'+
                                    '<i class="bg-color"></i>'+
                                    '<i class="move-color"></i>'+
                                '</a>'+
                                '<span class="time-e"></span>'+
                            '</div>'+
                        '</li>';
            }
            _this.ele.html(html);

            // 这里获取音频时长
            $('.music-control').each(function(index, value){
                var $this = $(this);
                $this.find('.audio').on('loadedmetadata',function(){
                    var minute = parseInt($(this)[0].duration / 60);
                    var second = parseInt(($(this)[0].duration / 60 - minute) * 60);
                    if (second < 10) {
                        second = '0' + second
                    }
                    var time  = minute + ':' + second;
                    $this.find('.icon-play').attr('data-stay',($(this)[0].duration)).attr('data-time',($(this)[0].duration));
                    $this.find('.time-e').text(time);
                })
            });

        },
        eventBind: function () {
            var _this = this;
            // 播放按钮事件
            $(this.ele).on('click', '.icon-play', function () {
                var $this = $(this);
                var $parent = $this.parent();
                var status = $this.attr('data-play');
                var duraionTime = $this.attr('data-stay') * 1000;
                var audio = $parent.find('audio')[0];
                var allAudio = $('audio');
                // 暂停播放中的音频
                for (var i = 0; i < allAudio.length; i++) {
                    // 将播放中音频的data-flag属性置为false
                    if ($(allAudio[i]).parent().find('.icon-play').attr('data-play') == 'true') {
                        $(allAudio[i]).parent().find('.icon-play').attr('data-play', false);
                        $(allAudio[i]).parent().find('.icon-play').removeClass('icon-pause');
                        $(allAudio[i])[0].pause();
                    }
                }
                // 停止所有碟片旋转
                $('.rotate-360').addClass('rotate-pause');
                // 停止所有动画
                $('.move-color').stop();
                // 停止所有的定时器
                clearInterval(_this.intervalTimer);

                // 改变播放按钮样式
                if (status == 'true') {
                    // flag为true 表示正在播放, 这里进行暂停时候的操作。
                    $this.removeClass('icon-pause');
                    $this.attr('data-play', false);
                    audio.pause();
                } else {
                    /**
                     * 这里进行播放的操作
                     */
                    $this.addClass('icon-pause');
                    $this.attr('data-play', true);
                    // 碟片旋转
                    $this.parents('li').find('img').removeClass('rotate-pause');
                    $parent.find('.move-color').animate({
                        width: '100%'
                    }, duraionTime, function () {
                        // 音乐结束回调
                        $parent.find('.move-color').css({
                            width: 0
                        });
                        $this.attr('data-play', false);
                        $parent.find('.icon-play').removeClass('icon-pause');
                        $this.parents('li').find('img').addClass('rotate-pause');
                        $parent.find('.time-s').text('0:00');
                        $this.attr('data-second', 0);
                        $this.attr('data-minute', 0);
                        clearInterval(_this.intervalTimer)
                    });
                    // 播放时间增加
                    _this.intervalTimer = setInterval(function () {
                        var second = $this.attr('data-second');
                        var minute = $this.attr('data-minute');
                        var tmpTime = $this.attr('data-stay');
                        second++;
                        tmpTime--;
                        if (second < 10) {
                            second = '0' + second
                        }
                        if (second == 60) {
                            minute++;
                            second = 0;
                        }
                        // 将分秒更新至play上面的data属性上
                        $this.attr('data-second', second);
                        $this.attr('data-minute', minute);
                        $this.attr('data-stay', tmpTime);
                        $parent.find('.time-s').text(minute + ':' + second);
                    }, 1000)
                    audio.play();
                }
            })

            // 三个图标点击事件
            $(this.ele).on('click', '.icons a', function () {
                var $this = $(this);
                if ($this.index() === 0) {
                    _this.config.buttons[0].onclick ? _this.config.buttons[0].onclick($this) : function () {};
                }
                if ($this.index() === 1) {
                    _this.config.buttons[1].onclick ? _this.config.buttons[1].onclick($this) : function () {};
                }
                if ($this.index() === 2) {
                    _this.config.buttons[2].onclick ? _this.config.buttons[2].onclick($this) : function () {};
                }
            })
        }
    };
    // 添加到window对象上
    window.Music = Music;
    // 封装到jquery对象上
    $.fn.daqMusic = function (config) {
        return this.each(function () {
            var daqMusic = new Music($(this), config);
            daqMusic.init();
        })
    }
})(window.jQuery || $)