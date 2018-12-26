/**
 * Created by chengwb on 2016/8/6.
 * 备注：
 *  命名规则：函数的名称应该使用动词+名词，变量名则最好使用名词。
 *      常量区变量请全部用大写字母,且单词间用下划线链接；
 *      方法名、普通变量名请使用小驼峰命名规则，即除了第一个单词的首字母外其余单词首字母大写。
 */
(function (global, $) {
    global.tools = global.tools || {};

    /***********************************************************
     *********************** 常量区 *****************************
     **********************************************************/
        //暂无数据
    global.tools.NO_DATA = '<p class="no_data">暂无数据！</p>';
    global.tools.NO_DATA1 = '<p class="no_data1">暂无数据！</p>';
    //获取数据失败，刷新页面
    global.tools.TRY_REFRESH = '<p class="try_refresh">获取数据失败，请尝试刷新浏览器页面！</p>';

    /***********************************************************
     *********************** 方法区 *****************************
     **********************************************************/
    /**
     * 正在加载中提示
     * @param option
     *  可以是对象
     *  {
     *      selector: '',//选择器
     *      position: ''//插入的位置（相对于选择器而言）before/in/after,前、中、后
    *  }
     *  也可以是字符串(表示selector，插入位置默认为in)
     * @param custom 回调函数，可以加工loadTip也可以自定义提示
     * @returns {{clean: clean}} 如果自定义loadTip则clean可能无效，需要自己根据自定义的tip进行清空处理（先使用着，待完善处理）
     */
    global.tools.loading = function (option, custom) {
        var loadTip = '<div class="loading_tips"><img src="/images/loading_max.gif"><p>数据加载中...</p></div>';
        if (custom && $.isFunction(custom)) {
            loadTip = custom(loadTip);
        }

        if(typeof option === 'string') {
            $(option).append(loadTip);
        } else {
            switch (option.position) {
                case 'in':
                    $(option.selector).append(loadTip);
                    break;
                case 'after':
                    $(option.selector).after(loadTip);
                    break;
                case 'before':
                    $(option.selector).before(loadTip);
                    break;
                default:
                    $(option.selector).append(loadTip);
                    break;
            }
        }

        function clean() {
            if(typeof option === 'string') {
                $(option + ' .loading_tips').remove();
            } else {
                switch (option.position) {
                    case 'in':
                        $(option.selector + ' .loading_tips').remove();
                        break;
                    case 'after':
                    case 'before':
                        $(option.selector).siblings('.loading_tips').remove();
                        break;
                    default:
                        $(option.selector + ' .loading_tips').remove();
                        break;
                }
            }
        }

        return {
            clean: clean
        };
    };

    /**
     * 内容长度限制，转换为省略号结尾
     * @param content 目标内容
     * @param length 限制的长度
     * @returns {*} 超过限制长度的数据则返回限制长度的字符串加上...，没超过则原文返回
     */
    global.tools.ellipsisContent = function (content, length) {
        var result;

        if (!content || typeof content !== 'string' ||
            typeof length !== 'number' || content.length <= length || length <= 0) {
            result = content;
        } else {
            result = content.substr(0, length) + "...";
        }

        return result;
    };

    /**
     * 图片加载异常时调用，一般用于img中的onerror
     * @param tag
     */
    global.tools.errImg = function (tag) {
        var that = tag.type === undefined ? tag : this;
        that.src = "/images/default.jpg";
        that.onerror = null;
    };

    global.tools.errHead = function (tag) {
        var img=$(tag).attr("data-img");
        $(tag).attr("src",img);
        tag.onerror = null;
    };

    /**


    /**
     *百度分享
     */
    global.tools.share = function () {
        window._bd_share_config = {
            "common": {
                "bdSnsKey": {},
                "bdText": "",
                "bdMini": "2",
                "bdDesc": "",
                "bdMiniList": false,
                "bdPic": "",
                "bdUrl": "",
                "bdStyle": "2",
                "bdSize": "16"/*,
                "bdPopupOffsetLeft": "30"*/
            },
            "share": {}
        };
        with (document)0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];
    };

    /**
     * 日期处理，
     * @param dataStr 需要处理的日期字符串，如果不传递则默认为当前时间
     * @returns {{getCurrentYear: getCurrentYear, getCurrentMonth: getCurrentMonth, renderYears: renderYears, renderMonths: renderMonths}}
     */
    global.tools.date = function (time) {
        var year = 1970;
        var month = 1;
        var day = 1;
        var date = new Date();
        //var reg = new RegExp("-");//火狐不兼容RegExp;低版本IE不支持'/'

        if (time) {
            date = new Date(time);
            //if (typeof time === 'string') {
            //    date = new Date(time.replace(/-/g, "/"));
            //}

            if(!date) {
                return {};
            }
        }

        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var week = date.getDay();

        function getCurrentYear() {
            return year;
        }

        function getCurrentMonth() {
            return month;
        }

        function getDay() {
            return day;
        }

        function getHour() {
            return hours;
        }

        function getDate(separator) {
            return year + separator + month + separator + day;
        }

        function getTime() {
            return (hours < 10 ? ('0' + hours) : hours) + ':' +
                (minutes < 10 ? ('0' + minutes) : minutes) + ':' +
                (seconds < 10 ? ('0' + seconds) : seconds);
        }

        function getWeek() {
            var weekDesc = '星期';

            switch (week) {
                case 1:
                    weekDesc += '一';
                    break;
                case 2:
                    weekDesc += '二';
                    break;
                case 3:
                    weekDesc += '三';
                    break;
                case 4:
                    weekDesc += '四';
                    break;
                case 5:
                    weekDesc += '五';
                    break;
                case 6:
                    weekDesc += '六';
                    break;
                case 0:
                    weekDesc += '日';
                    break;
                default:
                    break;
            }
            return weekDesc;
        }

        /**
         * 渲染select的选项
         * @param select select的选择器
         * @param from 从哪一年开始，不设置默认是1970
         * @param to   到那一年，不设置默认为当前年份
         */
        function renderYears(select, from, to) {
            var options = '';
            var startYear = 1970;
            var endYear = year;
            var $select = $(select);

            if (from && $.isNumeric(from)) {
                startYear = from;
            }
            if (to && $.isNumeric(to)) {
                endYear = to;
            }

            var i = endYear;
            for (i; i >= startYear; i--) {
                options += '<option value="' + i + '">' + i + '年</option>';
            }

            $select.empty();
            $select.append(options);
        }

        /**
         * 渲染select的选项
         * @param select select的选择器
         * @param from 从哪一年开始，不设置默认是1970
         * @param to   到那一年，不设置默认为当前年份
         */
        function renderSpecialYears(select, years) {
            var options = '';
            var $select = $(select);

            var i = 0;
            var length = years.length;
            for (i = 0; i < length; i++) {
                options += '<option value="' + years[i] + '">' + years[i] + '年</option>';
            }

            $select.empty();
            $select.append(options);
        }

        /**
         * 渲染select中月份选项
         * @param select select的选择器
         * @param assignYear 指定那一年，没指定则1-12月
         */
        function renderMonths(select, assignYear) {
            var options = '';
            var startMonth = 1;
            var endMonth = 12;
            var $select = $(select);

            if (assignYear && $.isNumeric(assignYear)) {
                if (year == assignYear) {
                    endMonth = month;
                }
            }

            var i = startMonth;
            for (i; i <= endMonth; i++) {
                options += '<option value="' + i + '">' + i + '月</option>';
            }

            $select.empty();
            $(select).append(options);

            if (assignYear && $.isNumeric(assignYear)) {
                if (year == assignYear) {
                    $select.val(month);
                }
            }
        }

        /**
         * 格式化时间
         * @param format 默认为'yyyy-MM-dd hh:mm'
         * @returns {*}
         */
        function format(format) {
            if(!format) {
                format = 'yyyy-MM-dd hh:mm';
            }
            var time = {
                "M+": month,
                "d+": day,
                "h+": hours,
                "m+": minutes,
                "s+": seconds,
                "q+": Math.floor((month + 2) / 3),
                "S+": date.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (year + '').substr(4 - RegExp.$1.length));
            }
            for (var k in time) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ?
                        time[k] : ("00" + time[k]).substr(("" + time[k]).length));
                }
            }
            return format;
        }

        return {
            format: format,
            getYear: getCurrentYear,
            getMonth: getCurrentMonth,
            getDay: getDay,
            getTime: getTime,
            getDate: getDate,
            getHour: getHour,
            getWeek: getWeek,
            renderYears: renderYears,
            renderSpecialYears: renderSpecialYears,
            renderMonths: renderMonths
        };
    };

    /**
     * 格式化数字，例如：12300400格式化为12,300,400
     * @param number
     */
    global.tools.formatDigital = function (number) {
        var result = number;

        if (!number || !$.isNumeric(number)) {
            return result;
        }

        var numberStr = number.toString();
        var pointIndex = numberStr.indexOf('.');
        var lastIndex = numberStr.length - 1;

        if (pointIndex >= 0) {
            lastIndex = pointIndex - 1;
        }

        result = '';
        var count = 1;
        for (var i = lastIndex; i >= 0; i--, count++) {
            var temp = numberStr[i];

            result = temp + result;
            if (count % 3 === 0 && i !== 0) {
                result = ',' + result;
            }
        }

        return result;
    };

    /**
     * 初始定位侧边悬浮导航。注意使用时，侧边导航栏高度请设置为auto。
     * @param options
     * {
	 *  wrapper: 外框选择器（包含侧边栏和内容区）
	 *  head：头部，没有则设置为空；
	 *  foot: 底部，没有则设置为空；
	 *  contentStartIndex: 内容列表有效起始索引；
	 *  navStartIndex: 导航栏列表有效起始索引;
	 *  sideNav: 导航栏选择器，例子id:'#nav',class:'.nav'
	 *  sideNavEntry: 导航栏列表选择器，例子li元素：'li',class:'.entry'；（与sideNav是父子关系）
	 *  content: 内容区选择器
	 *  contentEntry: 内容区列表选择器（与sideNav是父子关系）;
	 *  selectClass: 选中的侧边导航栏的选项class，如：'curr';
	 *  currIndex: 设置默认选中的导航栏索引,-1表示不设置；
	 *  scrollAnimate: true则使用动画，false为不使用，默认为使用动画;
	 *  position: 侧边导航栏原始定位方式，absolute(float布局)，relative（非float布局）
	 * }
     */
    global.tools.sideNavInit = function (options) {
        //待检查参数
        var animate = !!options.scrollAnimate || true;
        var headHeight = options.head ? $(options.head).height() : 0;
        var footHeight = options.foot ? $(options.foot).height() : 0;
        var windowHeight = $(window).height();
        var sideNavHeight = windowHeight - headHeight;
        var clickIndex = -1; //导航栏鼠标点击的元素的索引
        var contentStartIndex = options.contentStartIndex;//内容列表起始索引
        var navStartIndex = options.navStartIndex;//导航栏列表起始索引
        var $sideNav = $(options.sideNav);
        var sideNavInitHeight = $sideNav.height();
        var $sideNavLi = $(options.sideNav + ' > ' + options.sideNavEntry);
        var $contentLi = $(options.content + ' > ' + options.contentEntry);
        var selectClass = options.selectClass;
        var defaultIndex = options.currIndex;

        var nav2HeadDistance = $sideNav.offset().top - headHeight;//侧边导航栏到头部的距离
        var scrollDistance = 0;//滚动条滚动的距离

        //设置左边导航的高度,
        if (sideNavHeight > sideNavInitHeight) {
            $sideNav.css("height", sideNavHeight);
        } else {
            sideNavHeight = sideNavInitHeight + footHeight;
            $sideNav.css("height", sideNavHeight);
        }

        /**
         * 窗口自动定位
         */
        function clickPosition() {
            var targetIndex = clickIndex - navStartIndex + contentStartIndex;
            var entryTop = $contentLi.eq(targetIndex).offset().top;

            scrollWindow(entryTop, function () {
                if (clickIndex > -1) {
                    $sideNavLi.eq(clickIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
                    clickIndex = -1;
                }
            });
        }

        /**
         * 滚动窗口
         * @param scrollTop 窗口滚动的距离
         * @param done 滚动完成后的回调
         */
        function scrollWindow(scrollTop, done) {
            if (animate) {
                $('html, body').stop(true).animate({
                    scrollTop: scrollTop - headHeight
                }, {
                    duration: 100,
                    always: done //动画不管完没完成总是会执行这个回调
                });
            } else {
                //不使用动画
                $('html, body').scrollTop(scrollTop - headHeight);
                done();
            }
        }

        /**
         * 图片加载过程中，定位校正
         */
        function regulatePosition() {
            var selectedNavIndex = $sideNav.find('.' + selectClass).index();
            var length = $contentLi.length;
            var absIndex = selectedNavIndex - navStartIndex;
            var sideNavTop = $sideNav.offset().top;
            var mistake = 5;//误差范围，浏览器滚动一次长度不一致

            var currContentTop = $contentLi.eq(absIndex + contentStartIndex).offset().top;
            var nextContentTop = absIndex < length - 1 ? $contentLi.eq(absIndex + 1 + contentStartIndex).offset().top : 99999;

            if (sideNavTop >= currContentTop - mistake &&
                sideNavTop < nextContentTop - mistake) {

                return;
            }

            scrollWindow(currContentTop, function () {
                $sideNavLi.eq(selectedNavIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
            });
        }

        //导航栏点击事件
        $sideNav.on("click", options.sideNavEntry, function () {
            clickIndex = $(this).index();

            //如果点击的导航栏条目的index小于有效的导航栏起始index则不处理，即不是有效的栏目就不处理事件
            if (clickIndex < navStartIndex) {
                return;
            }

            //自动对齐导航栏和内容
            clickPosition();
        });

        //窗口大小变化事件，动态修改侧边栏位置
        $(window).on('resize', function () {
            //如果侧边导航栏是处于悬浮状态则动态修改位置
            if ($sideNav.css('position') === 'fixed') {
                var left = $(options.wrapper).offset().left;
                $sideNav.css({left: left + 'px'});
            }
        });

        $(window).on("scroll", function () {
            scrollDistance = $(document).scrollTop();

            //如果窗口的滚动距离大于了侧边导航栏到头部的距离则悬浮侧边导航栏
            if (scrollDistance > nav2HeadDistance) {
                var left = $(options.wrapper).offset().left;
                var footTop = footHeight === 0 ? $('html').height() : $(options.foot).offset().top;

                //左侧导航栏数据区域的底部抵达foot的时候，如果用户继续往下滚动则保持左侧导航栏数据区底部与foot相切
                var distance = (scrollDistance + headHeight + sideNavInitHeight) - footTop;
                if (distance > 0) {
                    $sideNav.css({position: "fixed", top: (headHeight - distance) + "px", left: left + 'px'});
                } else {
                    $sideNav.css({position: "fixed", top: headHeight + "px", left: left + 'px'});
                }
            } else {
                if ($sideNav.css('position') !== 'absolute') {
                    $sideNav.css({position: 'absolute', top: "0", left: '0'});
                }
            }

            //根据窗口滚动情况动态设置左边导航栏的选中项
            autoSelectNav();
        });

        /**
         * 左侧导航栏根据窗口滚动情况自动选择选项
         */
        function autoSelectNav() {
            var length = $contentLi.length;
            var sideNavTop = $sideNav.offset().top;
            var mistake = 5;//误差范围，浏览器滚动一次长度不一致

            //当左侧导航栏的位置在右边内容列表的某个条目内，则设置侧边导航栏选中该条目对应的选项（通过index对应）
            for (var i = 0; i < length; i++) {
                var currContentTop = $contentLi.eq(i + contentStartIndex).offset().top;
                var nextContentTop = i < length - 1 ? $contentLi.eq(i + 1 + contentStartIndex).offset().top : 99999;

                if (sideNavTop >= currContentTop - mistake &&
                    sideNavTop < nextContentTop - mistake) {

                    if (clickIndex > -1 && clickIndex !== i + navStartIndex) {
                        return;
                    }

                    $sideNavLi.eq(i + navStartIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
                    break;
                }
            }
        }

        /**
         * 图片加载过程中校正被影响的定位。每加载完一张就校正定位（待优化为每正在加载一张就校正定位，难度较大）。
         * 此方法使用在进入页面就有默认定位时，如果没有默认定位则不必调用。
         */
        function perImgLoadPosition() {
            $contentLi.find('img').each(function (index) {
                //之前用deferred是想到等所有图片加载完后才校正位置；
                //后来经过优化每张图片加载完成就校正，发现deferred用在这儿就已经失去了意义
                //var deferred = $.Deferred();
                //$(this).load(deferred.resolve);
                //
                //images.push(deferred);
                //$.when(images[index]).done(function () {
                //	regulatePosition();
                //});

                $(this).load(regulatePosition);
            });
        }

        //刚进入页面，如果设置了默认定位则定位
        if (defaultIndex >= 0) {
            $sideNavLi.eq(defaultIndex).click();
            perImgLoadPosition();
        }
    };

    /**
     * 使用方法：
     *  请用在页面渲染后，且需要聚焦效果的元素要加上class：wait-focus
     */
    global.tools.focus = function() {
        $('body .wait-focus').each(function(index, input){
            var $input = $(input);
            var defaultValue = $input.val();

            $input.on('focus', function() {
                var $this = $(this);
                $this.addClass("compl_border");

                var value = $this.val();
                if(defaultValue === value) {
                    $this.val('');
                }
            });

            $input.on('blur', function () {
                var $this = $(this);
                $this.removeClass("compl_border");

                var value = $this.val();
                if(value.trim() === '') {
                    $this.val(defaultValue);
                }
            });
        });
    };

    global.tools.getStatus = function(statusCode) {
        var status = '未知';
        switch (statusCode) {
            case -1:
                status = '删除';
                break;
            case 0:
                status = '待发布';
                break;
            case 1:
                status = '待审核';
                break;
            case 2:
                status = '已通过';
                break;
            case 3:
                status = '未通过';
                break;
            default:
                break;
        }

        return status;
    };

    /**
     * ajax 统一处理，如有变动只需改这一个地方
     * @param options url路由必须有；type为请求方法，默认为get；data为参数结构
     * @param todo 结果回调处理
     */
    global.tools.request = function (options, todo) {
        $.ajax({
            url: options.url,
            type: options.type || "get",
            "Content-Type": options.contentType || 'application/octet-stream',
            data: options.data || null,
            complete: function (jqXHR, textStatus) {
                if (textStatus === 'success') {
                    var result = $.parseJSON(jqXHR.responseText);
                    todo(result);
                } else if (textStatus === 'timeout') {
                    //是否跳转向504？
                    todo({
                        error: true,
                        msg: '服务器响应超时'
                    });
                } else {
                    todo({
                        error: true,
                        msg: '服务器错误'
                    });
                }
            }
        });
    };

    tools.getRegionType = function(region) {
        var number = parseInt(region);
        if(number === 100000) {
            return 'country';
        }

        var third = number % 100;
        var second = number % 10000;
        if(second === 0) {
            //省
            return 'province';
        } else if(third === 0) {
            //市
            return 'city';
        } else {
            //县
            return 'county';
        }
    };

    /**
     * 获取url参数
     * @AuthorHTL
     * @param     name 参数名称
     * @return    value
     */
    global.tools.getUrlParams = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2]);
        } else {
            return null;
        }
    };

    /**
     * 根据下级地区region获取完整地区
     */
    global.tools.getParentsRegions = function (region, callback) {
        region = region.toString();
        var obj = {};
        $.get('http://filealiyun.geeker.com.cn/ued/map/city.js', function (city) {
            city = JSON.parse(city.split('=')[1]);
            if (city[region]) {
                if (region == '710000' || region == '810000' || region == '820000') { // 港澳台
                    obj.province = {
                        region: region,
                        name: city[region].name
                    }
                    callback(obj);
                    return;
                }
                var reg = region.slice(0, 2);
                if (reg == '11' || reg == '12' || reg == '31' || reg == '50') { // 直辖市
                    if (city[region].parent != '000000') { // 直辖市的区县
                        obj.province = {
                            region: city[region].parent,
                            name: city[city[region].parent].name
                        }
                        obj.city = {
                            region: city[region],
                            name: city[region].name
                        }
                    } else {
                        obj.province = {
                            region: city[region],
                            name: city[region].name
                        }
                    }
                } else {
                    if (city[region].childs.length === 0) { // 传入region为区县
                        obj.province = {
                            region: city[city[region].parent].parent,
                            name: city[city[city[region].parent].parent].name
                        }
                        obj.city = {
                            region: city[region].parent,
                            name: city[city[region].parent].name
                        };
                        obj.country = {
                            region: region,
                            name: city[region].name
                        };
                    } else {
                        if (city[region].parent === '000000') { // 传入region为省
                            obj.province = {
                                region: region,
                                name: city[region].name
                            };
                        } else {
                            obj.province = {
                                region: city[region].parent,
                                name: city[city[region].parent].name
                            };
                            obj.city = {
                                region: region,
                                name: city[region].name
                            };
                        }
                    }
                }
            }
            callback(obj);
        });
    }


    /**
     * 封装增删查改后的处理消息
     */
    global.tools.alertTips = function (result, sucDom, failDom, url) {
        if (result.code === 0) {
            var content = $(sucDom);
            $.daqDialog({
                title: '成功',
                content: content.html(),
                mask: true,
                width: 400,
                height: 250,
                model: 'fadeInDown',
                closeFn: function () {
                    window.location.href = url;
                }
            });
        } else {
            var content = $(failDom);
            $.daqDialog({
                title: '失败',
                content: content.html(),
                mask: true,
                width: 400,
                height: 250,
                model: 'fadeInDown',
                closeFn: function () {
                    window.location.href = url;
                }
            });
        }
    }


    /**
     * 处理footer定位
     */
    global.tools.footerFixed = function () {
        var winH = $(window).height();
        var bodyH = $('body').height();
        if (bodyH < winH) {
            $('footer').css({
                position: 'fixed',
                bottom: 0
            })
        } else {
            $('footer').css({
                position: 'initial'
            })
        }
    }

    /*
    * 查找指定codeId的codeName
    * */
    global.tools.getCodeNameById = function (codeId, callback) {
        $.ajax({
            type: 'get',
            url: '/member/getCodeNameById?id=' + codeId,
            success: function (result) {
                if (result.code === 0) {
                    if ($.isFunction(callback)) {
                        callback(result.data.codeName)
                    }
                }
            }
        })
    }


    /*
    * city.js
    * */
    global.tools.getCityObj = function (region) {
        if (!region) return;
        var cityObj = {};
        var parent = city[region].parent;
        if (parent && parent == '000000') {
            cityObj.regionId = region;
            cityObj.name = city[region].name
        }
        if (parent && parent != '000000') {
            cityObj.provinceRegion = parent;
            cityObj.provinceName = city[parent].name;
            cityObj.cityRegion = region;
            cityObj.cityName = city[region].name;
        }
        return cityObj
    }


    /**
     * 自定义弹窗
     *
     */
    global.tools.popUpWin = function (text, callback) {
        if (!text) return;
        var html =  '<div class="pop-up-mask">' +
                        '<div class="popUp-box">' +
                            '<p class="title"><i></i>'+ text +'</p>' +
                            '<div class="btn-box">' +
                                '<a class="pop-confirm-btn" href="javascript:;">确定</a>' +
                                '<a class="pop-cancel-btn" href="javascript:;">取消</a>' +
                            '</div>'
                        '</div>' +
                    '</div>';
        $('body').append(html);
        $('.pop-cancel-btn').click(function () {
            $('.pop-up-mask').remove();
        });
        $('.pop-confirm-btn').click(function () {
            if (callback && $.isFunction(callback)) {
                callback()
            }
        })
    }


    global.tools.initListWidth = function () {
        var winWidth = $(window).width();
        if (winWidth > 1300 && winWidth < 1700) {
            $('.list-container .list-wrap').css({
                width: winWidth - 100
            })
            $('.list-container .list-wrap ul').css({
                width: winWidth - 100 + 34
            })
        }
    }


})(window, jQuery);