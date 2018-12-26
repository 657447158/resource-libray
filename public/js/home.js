(function () {
    getMenu();

    /**
     * S 批量下载事件
     * */
    /*显示批量下载列表*/
    $(".cat,.menu_r>.cat_li").click(function () {
        $(".cart_box").animate({right: 0}, 500);
        $(".cover").fadeIn(200);
        $("html,body").css("overflow", "hidden");
    });
    /*隐藏批量下载列表*/
    $(".close,.cover").click(function () {
        $("html,body").removeAttr("style");
        $(".cart_box").animate({right: -285}, 500);
        $(".cover").fadeOut(200);
    });
    /*批量下载*/
    $(".down_btn").click(function () {
        var cont = parseInt($(".total_sp em").html());
        if (cont > 0) {
            shoppingCart();
        }
    });
    /**
     * E 批量下载事件
     * */

    /*搜索框*/
    $(".pic_search").click(function(){
        if($(".search_ipt").val()=="") return;
        window.location.href=location.pathname+"?search="+ encodeURI($(".search_ipt").val());
    });
    $(".search_pic .search_ipt").keyup(function (e) {
        e.stopPropagation();
        var keyCode = -1;
        if (window.event) {
            keyCode = window.event.keyCode;
        } else {
            keyCode = e.which;
        }
        if (keyCode == 13) {

            if($(".search_ipt").val()=="") return;
            window.location.href=location.pathname+"?search="+ encodeURI($(".search_ipt").val());
        }
    });
    $(".search_box .search_ipt").keyup(function (e) {
        e.stopPropagation();
        var keyCode = -1;
        if (window.event) {
            keyCode = window.event.keyCode;
        } else {
            keyCode = e.which;
        }

        var _size = $(".search_list li").length;
        var _curr = $(".search_list li.curr").index() || 0;
        if (keyCode == 38 && _size > 0) {
            _curr = _curr - 1;
            $(".search_list li").eq(_curr).addClass("curr").siblings("li").removeClass("curr");
            $(".search_ipt").val($(".search_list li").eq(_curr).children("a").text());
        } else if (keyCode == 40 && _size > 0) {
            _curr = _curr + 1;
            if ($(".search_list li").length <= _curr) {
                _curr = 0;
            }
            $(".search_list li").eq(_curr).addClass("curr").siblings("li").removeClass("curr");
            $(".search_ipt").val($(".search_list li").eq(_curr).children("a").text());
        } else if (keyCode == 13) {
            location.href = "/all-list.html?search=" + encodeURI($(".search_ipt").val());
        } else {
            if(!$(this).hasClass("inner_search")){
                getSearchList($(this).val());
            }
        }

    });

    /*
     * 返回顶部
     * */
    $(".back_top").live("click", function () {
        $("body,html").animate({
            scrollTop: "0"
        }, 600);
        setTimeout(function(){
            var num=$(".plot_list>.item1").length;
            if($("#pagination").length<=0 && ($(".plot_list>.item").length>100 || num>100)){
                $(".plot_list>.pageMax").remove();
                page=2;
                if(num>100){
                    $('.plot_list').attr("data-page",2);
                    waterfall('plot_list','item1',true);
                }
            }
        },500);

    });

    /*设置购物车高度*/
    setCatH();


})(jQuery);

/*显示右边菜单*/
$(window).scroll(function () {
    var float_W = $(".menu_r");
    var $scrollTop = $(this).scrollTop();
    var bodyT=$("body").attr("scrolltop");
    if(bodyT){
        if ($scrollTop > 950) {

            float_W.fadeIn(200);
        } else {
            float_W.fadeOut(200);
        }
    }else{
        if ($scrollTop > 250) {

            float_W.fadeIn(200);
        } else {
            float_W.fadeOut(200);
        }
    }
});
$(window).resize(function () {
    setCatH();
    setHeight();
});

/*设置高度*/
function setHeight(){
    var _h=$(window).height();
    var _th=$(".top_box").outerHeight();
    var filterH=$(".cen_box").outerHeight();
    if(_th>304 && filterH<=58){
        _th=304;
    }
    var _outerH=_th+$(".foot").outerHeight()+10;
    if(filterH){
        _outerH=_th+$(".foot").outerHeight()+45;
    }
    var test=_h-_outerH;
    $(".warp_box").css("minHeight",test) ;

}

/*获取收藏列表ID*/
function getCollectId() {
    $.get("/getMyLoveId", function (data) {});
}

/*设置购物车高度*/
function setCatH() {
    var _h = $(window).height() - $(".cart_tit").outerHeight() - $(".down_oper").outerHeight();
    $(".cart_cont").height(_h);
}
/*获取菜单*/
function getMenu() {
    if( $(".menu_r>li").length>1){
        var _type= $("body").attr("data-type"),val=$(".menu_list>li[data-type='"+_type+"']>a").html();
        $(".cent .tit").attr("href",_type+"-list.html").html(val==undefined?"全部素材":val);
        return;
    }
    var type = $("body").attr("data-type");
    $.post("/getMenu.html", function (data) {
        var temp='<li class="c_bg"><a href="javascript:;"><i class="iconfont">&#xC1113;</i><span class="font_sp">购物车</span><span class="icon_car_count">0</span></a></li>';
        var _nav = "", _right = temp, _inner = '';
        data.menus.forEach(function (menu, i) {
            var temp = "", _licla = "";
            if (menu.val == type) {
                _licla = "curr";
                $(".cent .tit").html(menu.name);
            }
            if ((data.menus.length - 1) <= i) {
                temp = 'nav_last';
            }
            _right += '<li class="c_bg"><a href="' + menu.val + '-list.html" ><i class="iconfont">&#' + menu.icon + ';</i><span class="font_sp">' + menu.name + '</span></a></li>';
            _nav += '<li class="' + temp + '"><a href="' + menu.val + '-list.html" > <i class="iconfont  c_bg">&#' + menu.icon + ';</i><span>' + menu.name + '</span></a>';
            _inner += ' <li class="' + _licla + '" data-type="' + menu.val + '"><a href="' + menu.val + '-list.html" >' + menu.name + '</a></li>';
        });
        _right += '<li class="c_bg"><a class="iconfont back_top" href="###">&#xE111;</a></li>';
        $(".menu_r").html(_right);
        $(".menu").html(_nav);
        $(".menu_list").html(_inner);
    });
}
function error(tag) {
    var that = tag.type === undefined ? tag : this;
    var data_img = $(tag).attr("data-img");
    if (data_img) {
        $(tag).remove();
    } else {

        that.src = "/images/default.jpg";
        $(tag).css("height", "379");
    }
    that.onerror = null;
}
var page = 1;
/*获取案例，素材，图片*/
var loadMaterial = (function () {
    setHeight();
    var loading = false,
        pagesize = 100,
        nomore = false,
        search = $(".search_ipt").val(),
        isSearch = true,
        type = $("body").attr("data-type");
    return function (pages,isT) {
        if(!isT){
            if (loading) return;
            if (nomore) return;
        }
        var regionts = $(".load_cent").attr("data-regionts"),
            scenId = $(".load_cent").attr("data-scenId");
        loading = true;
        page = pages || page;
        if(search){
            $(".cen_box").parents(".filtrate").remove();
        }
        $.get("/getMaterial", {
            type: type,
            regionts: regionts,
            scenId: scenId,
            page: page,
            search: search,
            pagesize: pagesize
        }, function (data) {
            var data_user=$(".foot").attr("data-user");

            if (data.numcount <= 0) {
                $(".more_a").html("暂无数据").addClass("noData").removeAttr("onclick");
                return;
            }
            if (isSearch) {
                if($(".search_ipt").attr("placeholder")=="在0个资源里发现......"){
                    $(".search_ipt").attr("placeholder", "在" + data.numcount + "个资源里发现......");
                }
                isSearch = false;
            }
            $(".load_cent .file_num").html("共"+data.numcount+"个资源");
            var _list = innerHtml(data.entitys,myLoves,data_user,page);
            /*更新页码*/
            page = data.curr_page + 1;
            if(isT){
                $('.plot_list').html(_list).find('img').lazyload({effect: "fadeIn", threshold: 10});
            }else{
                $(_list).appendTo('.plot_list').find('img').lazyload({effect: "fadeIn", threshold: 10});
            }
            var bodyType=$("body").attr("data-type");
            if(bodyType=="picture"){
                $('#plot_list').daqImg({rowHeight: 320});
            }else{
                var ul_w=Math.floor( $(window).width()/$(".item1").width())*$(".item1").width();
                $("#plot_list").css({"width":ul_w,"marginLeft":"auto","marginRight":"auto"});

                waterfall('plot_list','item1',true);
            }
            $(".plot_list").css("marginTop",15);

            if (data.curr_page >= data.pagecount) {
                nomore = true;
                $(".more_a").html("没有更多了").addClass("noData").removeAttr("onclick");
            }
            //设置页面最小高度

            $('.plot_list').attr("data-page",page);
            loading = false;
        });
    };
})();

/*获取地区和数量*/
var loadRegionts = (function () {
    return function (coding, level, isScenic,parame) {
        var type = $("body").attr("data-type");
        if(level>7){
            if($(".load_cent").attr("data-regionts")==undefined){
                $(".cen_box").html("<span>暂无数据</span>");
            }else{
                if(parame){
                    var obj=parame.obj,top=parame.top,isFlow= parame.isFlow;
                    filtrate(obj,top,isFlow,true);
                    if(!top){ $(".cen_box").html("<span>暂无数据</span>");}
                }
            }
            return;
        }
        $.get("/getRegion.html", {type: type, coding: coding, level: level, isScenic: isScenic}, function (data) {
            var _cen = "";
            if (data.data.length > 0) {
                data.data.forEach(function (region) {
                    if(region.name==null){
                        return;
                    }
                    _cen += '<a class="filtrate_a" href="javascript:;" data-name="' + region.name+ '" data-region="' + region.region + '" data-level="' + region.level + '">' + region.name + '<i>' + region.total + '</i></a>';
                });
            }
            if (data.scenic.length > 0) {
                if(data.scenic.length>=1){
                  /*  if(data.scenic.length>=1 && (data.scenic[0].id+1)!=parseInt($(".load_cent").attr("data-scenid"))){*/
                    data.scenic.forEach(function (region) {
                        region.name=region.name==undefined?region.codeName:region.name;
                        region.region=region.region==undefined?0:region.region;
                        region.level=region.level==undefined?region.codeId:region.level;
                        if(region.name==null){
                            return;
                        }
                        _cen += '<a class="filtrate_a scenic_a" href="javascript:;" data-name="' + region.name + '" data-region="' + region.region + '" data-level="' + region.level + '">' + region.name + '<i>' + region.total + '</i></a>';
                    });
                }
            }

            if (_cen != "") {
                if(parame){
                    var obj=parame.obj,top=parame.top,isFlow= parame.isFlow;
                    filtrate(obj,top,isFlow);
                }
                $(".cen_box").html(_cen);
            }else{
                if($(".load_cent").attr("data-regionts")==undefined){
                    $(".cen_box").html("<span>暂无数据</span>");
                }else{
                    if(parame){
                        var obj=parame.obj,top=parame.top,isFlow= parame.isFlow;
                        filtrate(obj,top,isFlow,true);
                        if(!top){ $(".cen_box").html("<span>暂无数据</span>");}
                    }
                }
            }
        });
    };
})();

/*获取（除案例，素材，图片）外的素材*/
function getMaterial(page) {
    var search = $(".search_ipt").val(), type = $("body").attr("data-type"), page = page || 1, scenId = $(".load_cent").attr("data-regionts");
    if(search){
        $(".cen_box").parents(".filtrate").remove();
    }
    $.get("/getMaterial", {type: type, page: page, search: search, pagesize: 28,scenId:scenId}, function (data) {
        var data_user=$(".foot").attr("data-user");
        _list = '';
        $(".load_cent .file_num").html("共"+data.numcount+"个资源");
        data.entitys.forEach(function (entity) {
            var coverImg = entity.coverImg;
            if (!coverImg) {
                coverImg = "";
            }
            _list += '<li class="pro_li"  data-id="' + entity.id + '" data-download="' + entity.download + '"> <p class="pro_img_p" >' +
                '<img class="li_img" src="/images/lazy.png" data-original="' + coverImg + '" nerror="error(this)" alt="' + entity.title + '">' +
                '<a class="pro_str" target="_blank" href="/' + entity.parentVal + '-desc-' + entity.id + '.html"></a> ' +
                '<span class="water_icon plot_icon clearfix"> ';
            if (myLoves && myLoves.indexOf("," + entity.id + ",") >= 0) {
                _list += '<i class="iconfont " onclick="AddRecord(2,' + entity.id + ',this)">&#xC1111;</i>';
            } else {
                _list += '<i data-s="' + entity.id + '" class="iconfont" onclick="AddRecord(2,' + entity.id + ',this)">&#xC1110;</i> ';
            }

            if (entity.download) {
                _list += '<a class="iconfont" onclick="AddRecord(1,' + entity.id + ',this)" href="/file/'+entity.id+'">&#xC1112;</a> ';

                if (batchIds && batchIds.indexOf("," + entity.id + ",") >= 0) {
                    _list += '<i class="iconfont curr" onclick="batch(this)">&#xC1114;</i> ';
                } else {
                    _list += '<i class="iconfont" onclick="batch(this)">&#xC1113;</i> ';
                }

            }
            if(data_user){
                var extractive='';
                if(entity.isTop==1){
                    extractive='class="iconfont curr" onclick="extractive(this,0)"';
                }else{
                    extractive='class="iconfont" onclick="extractive(this,1)"';
                }
                _list += '<i '+extractive+'>&#xC1124; </i> ';
                _list += '<i class="iconfont" onclick="removeLi(this)">&#xA104;</i> ';
            }else if(entity.isTop==1){
                _list += '<i class="iconfont">&#xC1124;</i> ';
            }
            _list +='</span></p> ' +
                '<a class="tit_sp" target="_blank" href="/' + entity.parentVal + '-desc-' + entity.id + '.html" >' + entity.title + '</a>' +
                '</li>';
        });


        if (_list != "") {
            $(".pro_list").html(_list).find('img').lazyload({effect: "fadeIn", threshold: 10});
            $("#pagination").attr("curr_page",page)
            $(".search_ipt").attr("placeholder","在"+data.numcount+"个资源里发现......");
            $("#pagination").pagination(data.pagecount);
            $(".more_a").hide();
        } else if(_list=="" && page==1){
            $(".pro_list").html("");
            $(".noData").html("<span>暂无数据</span>").show();
        }else if(page>data.numcount){
            $(".pro_list").html("");
            $(".noData").html("<span>页面多大，加载不出来</span>").show();
        }
        setHeight();
        SetliWidth();
    });
}
function SetliWidth(){
    var _w=  parseInt($(window).width()/(420))*420;
    $(".pro_list").width(_w);
}

/*列表筛选分类（除地区外）*/
function getType(obj,top,isF) {
    var type = $("body").attr("data-type");
    $.get("/getType.html", {type: type,id:$(obj).attr("data-region")}, function (data) {
        var _cen = "";
        if (data.data.length > 0) {
            data.data.forEach(function (data_type) {
                if (data_type.total > 0) {
                    _cen += '<a class="filtrate_a" href="javascript:;"  data-codeId="'+data_type.level+'" data-level="'+data_type.level.split(',').length+'" data-name="' + data_type.codeName + '"   data-region="' + data_type.codeId + '" >' + data_type.codeName + '<i>' + data_type.total + '</i></a>';
                }
            });
        }
        if (_cen != "") {
            if(obj){
                filtrate1(obj,top,isF);
            }
            $(".cen_box").html(_cen);
        }else {
            if(obj){
                $(obj).attr("data-level",1);
                filtrate1(obj,top,isF);
            }else{
                $(".cen_box").html("<span>暂无数据</span>");
            }
        }
    });
}

/*获取下拉列表*/
function getSearchList(search) {

    if (!search) {
        $(".search_list").fadeOut(100);
        return;
    }
    $.get("/getSearch.html", {search: search}, function (data) {
        var _html = '', j = 0, obj = [];
        data.material.forEach(function (material) {
            var temp = material.keyWord.substring(1, material.keyWord.length - 1).split(';');
            for (var i = 0; i < temp.length; i++) {
                if (temp[i].indexOf(search) >= 0 && i < 10 && obj.indexOf(temp[i]) < 0) {
                    obj[j] = temp[i];
                    _html += '<li class="clearfix"><a href="/all-list.html?search='+encodeURI(temp[i])+'">' + temp[i] + '</a></li>';
                    j++;
                }
            }
        });

        $(".search_list").html(_html);
        if (data.material.length > 0) {
            $(".search_list").fadeIn(100);
        } else {
            $(".search_list").fadeOut(100);
        }
    });
}

/*首页banner高度*/
function resizeImg() {
    var imgwidth = 1920;
    var imgheight = 840;
    var winwidth = $(window).width();
    var winheight = $(window).height() - $(".nav_box").height();
    var widthratio = winwidth / imgwidth;//window宽度与图片宽度之比
    var heightratio = winheight / imgheight;//window高度与图片高度之比
    var widthdiff = heightratio * imgwidth;
    var heightdiff = widthratio * imgheight;
    $(".head_box").height(winheight);

    if (heightdiff > winheight) {
        $("#bannerImg").css({
            width: '100%',
            height: heightdiff + 'px'
        });
    } else {
        $("#bannerImg").css({
            width: widthdiff + 'px',
            height: winheight + 'px'
        });
    }
}

/*加入收藏，取消收藏*/
function AddRecord(type, tid, obj) {
    $.post("/addRecord.html", {type: type, tid: tid}, function (data) {
        if (data.msg == "请登陆") {
            location.href = "/member/login.html?url="+data.url;
            return;
        }
        if (data.status == 2 && type != 1) {
            if (obj.localName == "i") {
                $(obj).html("&#xC1110;");
                $(obj).removeClass("curr");
            } else {
                $(".opera_a .collect").html("&#xC1110;");
                $(".collect").parents(".opera_a").removeClass("curr");
                $(obj).removeClass("curr");
                $(obj).children("i").html("&#xC1110;");
            }
        } else {
            if (type != 1) {
                if (obj.localName == "i") {
                    $(obj).html("&#xC1111;");
                    $(obj).addClass("curr");
                } else {
                    $(".opera_a .collect").html("&#xC1111;");
                    $(".collect").parents(".opera_a").addClass("curr");
                    $(obj).addClass("curr");
                    $(obj).children("i").html("&#xC1111;");
                }
            }
        }

    });
}

/*加入购物车*/
function batch(objE, isDesc) {
    var isD = isDesc | false, type = 1;
    obj = {};
    $(".icon_car_count").addClass("count_ani1");
    if (isD) {  //详细页面加入购物车
        objE = $(objE).children(".iconfont");
        $(objE).addClass("count_ani");
        setTimeout(function () {
            $(objE).removeClass("count_ani");
            $(".icon_car_count").removeClass("count_ani1");
        }, 900);  /*圆圈扩散*/

        var _dobj = $(".base_info");
        obj = {
            id: $(_dobj).attr("data-id"),
            img: $(_dobj).attr("data-src"),
            title: $(_dobj).find(".desc_tit").html(),
            download: $(_dobj).attr("data-download"),
            type: type
        }

    } else {
        setTimeout(function () {
            $(".icon_car_count").removeClass("count_ani1");
        }, 900);
        var _liobj = $(objE).parents("li");
        obj = {
            id: $(_liobj).attr("data-id"),
            img: $(_liobj).find(".li_img").attr("src"),
            title: $(_liobj).find(".tit_sp").html() || $(_liobj).find(".tit_itme").html(),
            download: $(_liobj).attr("data-download"),
            type: type
        };
    }
    /*从购物车中删除素材*/
    if ($(objE).hasClass("remove")) {
        $.post("/batchDown", {id: obj.id, type: 2}, function (data) {
            $('.cart_list li[data-id="' + obj.id + '"]').remove();
            $(".total_sp>em").html($(".cart_list li").length);
            $(".icon_car_count").html($(".cart_list li").length);
        });
        return;
    }

    $(objE).html("&#xC1114;");
    $(".batch").parent("a").addClass("curr");
    $(".batch").html("&#xC1114;");
    if ($(".cart_list li").length > 0) {
        for (var i = 0; i < $(".cart_list li").length; i++) {
            /*如果购物车中存在素材就从购物车中删除*/
            if ($(".cart_list li").eq(i).attr("data-id") == obj.id) {
                $(".cart_list li").eq(i).remove();
                $(objE).html("&#xC1113;");
                $(".batch").html("&#xC1113;");
                $(".batch").parent("a").removeClass("curr");
                type = 2;
                break;
            }
        }
    }
    obj.type = type;
    var _cont = 0;
    if (type == 1) {
        _cont = parseInt($(".cart_list li").length) + 1;
    } else {
        _cont = parseInt($(".cart_list li").length);
    }
    $(".total_sp>em").html(_cont);
    $(".icon_car_count").html(_cont);
    $.post("/batchDown", obj, function (data) {
        if (data.state == 1 && type == 1) {
            $(".cart_list").append('<li data-id="' + obj.id + '" data-url="' + obj.download + '"><a class="cart_img"><img src="' + obj.img + '" data-img="/images/logo.png" onerror="error(this)"></a> <span class="cart_name">' + obj.title + '</span> <i class="iconfont remove" onclick="batch(this)">&#xA104;</i> </li>');
        }
    });
}

/*购物车下载*/
function shoppingCart() {
    var files = [];
    $('.cart_list > li').each(function (index, li) {
        var url = $(li).attr('data-url'),tid=$(li).attr('data-id');
        if (url) {files.push(url);}
        $.post("/addRecord.html", {type: 1, tid: tid}, function (data) {});
    });
    $.post("/resourcesZip", {files: files}, function (result) {
        if (!result.error && result.data.path) {
            window.location.href = result.data.path;
        } else {
            alert('下载失败，请重试！');
        }
    });

}

/*清空购物车*/
function batchEmpty() {
    $(".cart_list li").remove();
    $.post("/batchEmpty", function () {
        $(".total_sp>em").html("0");
        $(".icon_car_count").html("0");
    });
}
/*前台删除素材[最高管理员才能执行，后期如不需要可删除]*/
function removeLi(obj){
    $.get("/admin/del-interface",{id:$(obj).parents("li").attr("data-id")},function(data){
        if(data.status==1){
            $(obj).parents("li").remove();
            if( $('.plot_list>li').length>0){
                $('.plot_list').daqImg({rowHeight: 350});
            }
        }else{
            alert(data.error);
        }
    });
}

function extractive(obj,num){
    $.post("/admin/top-interface",{id:$(obj).parents("li").attr("data-id"),status:num},function(data){
        if(data.status==1){
            if(num==1){
                $(obj).addClass("curr");
            }else{
                $(obj).removeClass("curr");
            }

        }else{
            alert(data.error);
        }
    });
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(callback, thisArg) {
        var T, k;

        if (this == null) {
            throw new TypeError("this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;

        while (k < len) {

            var kValue;
            if (k in O) {

                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}


/**
 *obj：当前点击的对象
 *top:筛选分两行(true第一行，flase为第二行)
 * isFlow前台列表分两种，一种是true瀑布了，一种是普通列表页面
 * */
function filtrate(obj,top,isFlow,isLevel){
    var coding=parseInt($(obj).attr("data-region"));
    var name=$(obj).attr("data-name");
    var level=parseInt($(obj).attr("data-level"))+1;
    if(top){
        var str=$(".cen_box").html();
        if(isLevel){
            if($(".filtrate .scenic").length>0){
                $(".filtrate .scenic").prev(".iconfont").remove();
                $(".filtrate .scenic").remove();
            }
            var temp='<i class="iconfont fl">&#xE119;</i><div class="curr select fl scenic"><span class="sp_tit" >'+name+'<i class="iconfont close">&#xE121;</i></span></div>';
            $(".load_cent").append(temp);
        }else{
            if(level<10){
                if(coding== $(".load_cent").attr("data-regionts")){
                    return;
                }
                if($(".load_cent>.scenic").length>0){
                    $(".load_cent>.scenic").prev(".iconfont").remove();
                    $(".load_cent>.scenic").remove();
                    $(".load_cent").removeAttr("data-scenId");
                }
                var temp='<i class="iconfont fl">&#xE119;</i> ' +
                    '<div class="select fl"> ' +
                    '<span class="sp_tit" data-region="'+coding+'" data-level="'+(level-1)+'">'+name+'<i class="iconfont">&#xE119;</i></span> ' +
                    '<p class="down"> ' +str
                '</p> ' +
                '</div>';
                $(".load_cent").append(temp);
            }else{
                if($(".filtrate .scenic").length>0){
                    $(".filtrate .scenic").prev(".iconfont").remove();
                    $(".filtrate .scenic").remove();
                }
                var temp='<i class="iconfont fl">&#xE119;</i><div class="curr select fl scenic"><span class="sp_tit">'+name+'<i class="iconfont close">&#xE121;</i></span></div>';
                $(".load_cent").append(temp);
            }
        }
    }else{
        $(obj).parents(".down").prev(".sp_tit").html(name+'<i class="iconfont">&#xE119;</i>');
        $(obj).parents(".select").nextAll("div").remove();
        $(obj).parents(".select").nextAll(".iconfont").remove();
    }
    $(".load_cent").removeAttr("data-scenId");
    $(".load_cent").attr("data-level",level);
    if(isFlow){
        if(level>4){
            $(".load_cent").attr("data-scenId",level);
            loadRegionts(coding,level,true);
        }else{
            $(".load_cent").attr("data-regionts",coding);
            //  loadRegionts(coding,level,false);
        }
        loadMaterial(1,true);
    }else{
        $(".load_cent").attr("data-regionts",coding);
        getMaterial(1,true);
    }
}

/**
 *obj：当前点击的对象
 *top:筛选分两行(true第一行，flase为第二行)
 * isFlow前台列表分两种，一种是true瀑布了，一种是普通列表页面
 * */
function filtrate1(obj,top,isF){
    var coding=$(obj).attr("data-codeid");
    var name=$(obj).attr("data-name");
    var level=parseInt($(obj).attr("data-level"));

    if(top){
        var str=$(".cen_box").html();
        if(level>1){
            if($(".filtrate .curr").length>0){
                $(".filtrate .curr").prev(".iconfont").remove();
                $(".filtrate .curr").remove();
            }
            if(coding== $(".load_cent").attr("data-regionts")){
                return;
            }
            var temp='<i class="iconfont fl">&#xE119;</i> ' +
                '<div class="select fl"> ' +
                '<span class="sp_tit" data-region="'+coding+'" data-level="'+(level-1)+'">'+name+'<i class="iconfont">&#xE119;</i></span> ' +
                '<p class="down"> ' +str
            '</p> ' +
            '</div>';
            $(".load_cent").append(temp);
        }else{
            if($(".filtrate .scenic").length>0){
                $(".filtrate .scenic").prev(".iconfont").remove();
                $(".filtrate .scenic").remove();
            }
            var temp='<i class="iconfont fl">&#xE119;</i><div class="curr select fl scenic"><span class="sp_tit" >'+name+'<i class="iconfont close">&#xE121;</i></span></div>';
            $(".load_cent").append(temp);
        }

    }else{
        if(level<=1){
            $(obj).parents(".select").prev(".iconfont").remove();
            $(obj).parents(".select").remove();
            $(".filtrate .curr").prev(".iconfont").remove();
            $(".filtrate .curr").remove();
            var temp='<i class="iconfont fl">&#xE119;</i><div class="curr select fl scenic"><span class="sp_tit">'+name+'<i class="iconfont close">&#xE121;</i></span></div>';
            $(".load_cent").append(temp);
            getType(null,null,isF);
        }else{
            $(obj).parents(".down").prev(".sp_tit").html(name+'<i class="iconfont">&#xE119;</i>');
            $(obj).parents(".select").nextAll("div").remove();
            $(obj).parents(".select").nextAll(".iconfont").remove();
        }
    }
    $(".load_cent").removeAttr("data-scenId");
    $(".load_cent").attr("data-level",level);
    $(".load_cent").attr("data-regionts",coding);
    if(isF){
        loadMaterial(1,true);
    }else{
        getMaterial(1,true);
    }


}

function innerHtml(entitys,myLoves,data_user,page){
    var bodyType=$(".innerY").attr("data-type"),
        _list='',
        tempClass='item1',sty='',sty1='',spClass='tit_sp plot_icon';
    if(bodyType=="picture"){
        tempClass="item";
    }
    if(page>=2){
        tempClass+=' pageMax';
    }
    entitys.forEach(function (entity) {
        var coverImg = entity.coverImg;
        if (!coverImg) {
            coverImg = "";
        }
        var _imgW= 0,_imgH=0;
        if(entity.w>500){
            _imgW=500;
            _imgH=Math.ceil(entity.h/(entity.w/500)) ;

        }else{
            _imgW= entity.w;
            _imgH=entity.h;
        }
        _list += '<li class="'+tempClass+'" data-w="' + _imgW+ '" data-h="' + _imgH + '"  data-id="' + entity.id + '" data-download="' + entity.download + '">';
        if(bodyType!="picture"){
            sty='style="height:'+(_imgH/_imgW*333)+'px"';
            spClass='tit_itme';
            _list+='<div class="water_box">';
        }
        _list+= '<a class="img_a" href="/' + entity.parentVal + '-desc-' + entity.id + '.html" target="_blank" '+sty+'><img class="li_img" src="/images/lazy.png" data-original="' + coverImg + '" onerror="error(this)" alt="' + entity.title + '" '+sty+'> ' ;
        if(bodyType=="picture"){
            _list+= '<span class="'+spClass+'">' + entity.title + '</span> ';
        }

        _list+=  '</a> ' ;
        if(bodyType!="picture"){
            _list+= '<a class="'+spClass+'" href="/' + entity.parentVal + '-desc-' + entity.id + '.html" target="_blank" >' + entity.title + '</a> ';
        }
        _list+= '<span class="water_icon plot_icon clearfix"> ';
        if (entity.download) {
            _list += '<a class="iconfont" onclick="AddRecord(1,' + entity.id + ',this)" href="/file/'+entity.id+'" >&#xC1112;</a> ';

            if (batchIds && batchIds.indexOf("," + entity.id + ",") >= 0) {
                _list += '<i class="iconfont curr" onclick="batch(this)">&#xC1114;</i> ';
            } else {
                _list += '<i class="iconfont" onclick="batch(this)">&#xC1113;</i> ';
            }

        }
        if (myLoves && myLoves.indexOf("," + entity.id + ",") >= 0) {
            _list += '<i class="iconfont curr" onclick="AddRecord(2,' + entity.id + ',this)">&#xC1111;</i> ';
        } else {
            _list += '<i data-s="' + entity.id + '" class="iconfont" onclick="AddRecord(2,' + entity.id + ',this)">&#xC1110;</i>';
        }
        if(data_user){
            var extractive='';
            if(entity.isTop==1){
                extractive='class="iconfont curr" onclick="extractive(this,0)"';
            }else{
                extractive='class="iconfont" onclick="extractive(this,1)"';
            }
            _list += '<i '+extractive+'>&#xC1124; </i> ';
            _list += '<i class="iconfont" onclick="removeLi(this)">&#xA104;</i> ';

        }else if(entity.isTop==1){
            _list += '<i class="iconfont">&#xC1124;</i> ';
        }
        _list += '</span>';
        if(bodyType!="picture"){_list+='</div>'; }
        _list+='</li>';

    });
    return _list;
}

function isScroll(bottom){
    var scrollHeight = $(document).scrollTop();
    var windowH = $(window).height();
    var loadLine = $('.'+bottom).offset().top;

    if ($(".plot_list li").length>0 && scrollHeight + windowH >= loadLine + $('.'+bottom).height()) {
        return true;
    }
    return false;
}