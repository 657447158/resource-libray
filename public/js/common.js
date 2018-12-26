/**
 * Created by Mr.Zhang on 2018/5/2.
 */

var isLogin;

window.onload = function () {

    /*
     * 浏览器缩放事件
     * */
    $(window).resize(function () {
        var winWidth = $(window).width();
        if (winWidth > 1300 && winWidth < 1700) {
            $('.list-container .list-wrap').css({
                width: winWidth - 100
            })
            $('.list-container .list-wrap ul').css({
                width: winWidth - 100 + 34
            })
        }
        if (winWidth >= 1700) {
            $('.list-container .list-wrap').css({
                width: 1700
            })
            $('.list-container .list-wrap ul').css({
                width: 1734
            })
        }
    })

    /**
     * 导航栏获取默认导航
     */
    var curr = $('nav').data('curr');
    var len = $('nav .item').length;
    for (var i = 0; i < len; i++) {
        if (curr != 0) { // 不为首页
            $('header').addClass('curr');
            $('nav .item').eq(curr-1).addClass('curr');
        }
    }


    /**
     * 导航栏点击登录按钮事件
     */
    $('header .user').click(function () {
        if (userInfo.id) {
            window.location.href = 'per-center-upload.html'
        } else {
            $('#loginTmp').tmpl().appendTo($('body'));

            // login-banner
            $('.left-banner').flexslider({
                slideshow: true,
                animation: 'slide',
                slideshowSpeed: 5000,
                animationLoop: true,
                controlNav: false,
                directionNav: false
            });
        }
    })

    /**
     * 导航栏点击注销按钮事件
     */
    $('header .login-out').click(function () {
        $.ajax({
            type: 'get',
            url: '/member/loginOut',
            success: function (result) {
                if (result.code === 0) {
                    loginFlag = false
                    $('.user-login').hide();
                    $('.icon-user .user').show()
                    setTimeout(function () {
                        window.location.href = 'index.html'
                    }, 1)
                }
            }
        })
    })



    // 登录框关闭事件
    $('body').on('click', '.close-btn', function () {
        $('.login-box-wrap').remove();
    });
    // 登录事件
    $('body').on('click', '.login-btn', function () {
        var params = {
            name: $('#username').val(),
            pwd: $('#password').val()
        }
        $.ajax({
            type: 'post',
            url: '/member/login',
            data: params,
            success: function (result) {
                if (result.code === 0) {
                    window.location.href = 'per-center-upload.html';
                    $('.login-box-wrap').remove();
                } else {
                    $('.login-tips').css({visibility: 'visible'});
                }
            }
        })
    })
    // 登录框回车按钮事件
    $('body').on('keyup', '.login-box-wrap', function(event){
        if(event.keyCode == 13){
            $(".login-btn").trigger("click");
        }
    });


    // 个人中心用户信息
    if ($('.per-header .head-img')) {
        // 添加头像
        $('.head-img img').attr('src', userInfo.avatar);
        $('.head-info .username').html(userInfo.name);
        $('.head-info .position').html(userInfo.position);
    }


    // 列表搜索框点击事件
    $('.list-header').on('click', '.search-icon', function () {
        var $this = $(this);
        var keywords = $this.prev().val();
        // if (!keywords) return;
        window.location.href = 'search-list.html?parentVal='+ parentVal +'&keywords=' + keywords;
    });
    // 列表搜索框回车事件
    $('.list-header').keyup(function(event){
        if(event.keyCode == 13){
            $(".list-header .search-icon").trigger("click");
        }
    });


    // 列表-收藏
    $('body').on('click', '.icon-collect', function () {
        // 先判断是否登录
        if ($.isEmptyObject(userInfo) || !userInfo) {
            $("header .user").trigger("click");
            return;
        };
        var $this = $(this);
        var id = $this.attr('data-id');
        var love = $this.attr('data-love');     /* 0: 已收藏，1：未收藏 */
        $.ajax({
            type: 'post',
            url: '/member/addRecord',
            data: {
                id: id,
                type: 2
            },
            success: function (result) {
                if (result.code === 0) {
                    if (love == 0) {
                        $this.attr('data-love', 1);
                        $('.icon-collect').html('&#xC1110;')
                    } else {
                        $this.attr('data-love', 0);
                        $('.icon-collect').html('&#xC1111;')
                    }
                }
            }
        })
    })
    // 列表-下载
    $('body').on('click', '.icon-download', function () {
        // 先判断是否登录
        if ($.isEmptyObject(userInfo) || !userInfo) {
            $("header .user").trigger("click");
            return;
        };
        var $this = $(this);
        var id = $this.attr('data-id');
        $.ajax({
            type: 'post',
            url: '/member/addRecord',
            data: {
                id: id,
                type: 1
            },
            success: function (result) {

            }
        })
    })
    // 列表-删除
    $('body').on('click', '.icon-delete', function () {
        var id = $(this).attr('data-id')
        $.ajax({
            type: 'post',
            url: '/member/deleteMyfile',
            data: {
                id: id
            },
            success: function (result) {
                if (result.code === 0) {
                    window.location.reload()
                }
            }
        })
    })
    // 详情页-svn弹框
    $('body').on('click', '.icon-svn', function () {
        var place = $(this).attr('data-place');
        var html = '<div class="icon-svn-pop">'+
                        '<span class="ct">'+
                            '<i class="iconfont">&#xC1115;</i>'+
                            '<span>'+ place +'</span>'+
                            '<a href="javascript:;" class="iconfont close-svn">&#xE121;</a>'+
                        '</span>'+
                   '</div>';
        $('body').append(html)
    })
    // 详情页-关闭svn弹框
    $('body').on('click', '.close-svn', function () {
        $('.icon-svn-pop').remove()
    })

    // 详情页-返回顶部
    $('body').on('click', '.side-bar-top', function () {
        $('html, body').animate({
            scrollTop: 0
        }, 'slow')
    })


    /**
     * a标签下载链接时用于判断是否登录
     */
    isLogin = function () {
        if ($.isEmptyObject(userInfo) || !userInfo) {
            $("header .user").trigger("click");
            if (event.preventDefault) {
                event.preventDefault()
            } else {
                event.returnValue = false;
            }
        }
    }

}