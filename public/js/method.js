var jcrop_api;

if ( !Array.prototype.forEach ) {

    Array.prototype.forEach = function forEach( callback, thisArg ) {

        var T, k;

        if ( this == null ) {
            throw new TypeError( "this is null or not defined" );
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if ( typeof callback !== "function" ) {
            throw new TypeError( callback + " is not a function" );
        }
        if ( arguments.length > 1 ) {
            T = thisArg;
        }
        k = 0;

        while( k < len ) {

            var kValue;
            if ( k in O ) {

                kValue = O[ k ];
                callback.call( T, kValue, k, O );
            }
            k++;
        }
    };
}
$(window).resize(function(){
    changeWH();
});
$(function(){
    var editor;
    $("input[name='ch']").click(function(){
        if($(this).attr("checked")=="checked"){
            $("input[name='chs']").attr("checked","checked");
        }else{
            $("input[name='chs']").removeAttr("checked","checked");
        }
    });

   //$(".list_table tbody tr:even").addClass("even_bg");
   // $(".list_table tbody tr:odd").addClass("odd_bg");


    $('input[class="long_input"]').focus(function(){
        $('input').removeClass('che');
        $(this).addClass('che');
    });

    $(".fileBoxUl .edit_img .diyCancel").click(function(){

        var $_src= $(this).prev(".viewThumb").children("img").attr("src");

        var $_id=$(this).attr("data-ipt");
        if($_id=="download_del"){
            $_src=$(this).attr("data-file");
        }
        var $_idVal=$("#"+$_id).val();
        if($_idVal){
            $_idVal=$_idVal+","+$_src;
            $("#"+$_id).val($_idVal);
        }else{
            $("#"+$_id).val($_src);
        }
        $(this).parent(".edit_img").remove();
    });
    $(".list_table tr").live("click",function(e){
        if($(this).find("input[name='chs']").attr("checked")){
          $(this).find("input[name='chs']").removeAttr("checked");
        }else{
          $(this).find("input[name='chs']").attr("checked","checked");
         }
    });
   $(".list_table td input[name='chs']") .live("click",function(event){
       event.stopPropagation(); // 阻止事件冒泡
    });
    $(".list_table tr").live("dblclick",function(e){
        var url=$(".edit_btn").attr("tag");
        if(!url){return;}
        var val=$(this).children("td").children("input[name='chs']").val();
        location.href=url+"?id="+val;
    });

    $(".fileBoxUl .cut_left").live('click',function(){
        var ind=$(this).parents("li").index();
        if(ind<=0){
            return;
        }
       var $fileli_m=   $(this).parents(".fileBoxUl").children("li");
        $(".fileBoxUl").attr("tag","1");
        m_nodeObj = $fileli_m.eq(ind);
        t_nodeObj = $fileli_m.eq(ind-1);
        $(t_nodeObj).animate({ "width": "toggle" }, function () {
            $(this).insertAfter($(m_nodeObj)).animate({ "width": "toggle" })
        });

    });
    $(".fileBoxUl .cut_right").live('click',function(){
        var ind=$(this).parents("li").index();
        var $fileli_m=   $(this).parents(".fileBoxUl").children("li");
        if(ind>=(($($fileli_m).length)-1)){
            return;
        }
        $(".fileBoxUl").attr("tag","1");
        m_nodeObj = $fileli_m.eq(ind);
        t_nodeObj = $fileli_m.eq(ind+1);

        $(m_nodeObj).animate({ "width": "toggle" }, function () {
            $(this).insertAfter($(t_nodeObj)).animate({ "width": "toggle" })
        })
    });
    $(".fileBoxUl>.edit_img .cut_close").live('click',function(){
        var $_src= $(this).parents("li").children(".viewThumb").children("img").attr("src");

        var $_id=$(this).attr("data-ipt");
        if($_id=="download_del"){
            $_src=$(this).attr("data-file");
        }
        var $_idVal=$("#"+$_id).val();
        if($_idVal){
            $_idVal=$_idVal+","+$_src;
            $("#"+$_id).val($_idVal);
        }else{
            $("#"+$_id).val($_src);
        }

        if ( $(this).parents("li").siblings('li').length <= 0 ) {
            $(this).parents('.parentFileBox').remove();
        } else {
            $(this).parents("li").remove();
        }
    });
    changeWH();
    $(".h_bg").on("click",function(){
        var bgDiv = $(this).children(".change_bg");
        if(bgDiv.is(":hidden")){
            bgDiv.stop().fadeIn(200);
            $(this).addClass("cur");
        }else{
            bgDiv.stop().fadeOut(200);
            $(this).removeClass("cur");
        }
    });

    //刷新更换背景
    var i = parseInt(Math.random() * (10 - 1 + 1) + 1);
    $(".home_bg > img").eq(i).stop().fadeIn(100).siblings("img").fadeOut(100);

    //点击更换背景
    $(".change_bg span").on("click",function(){
        var numBg = $(this).index();
        $(".home_bg > img").eq(numBg).fadeIn(100).siblings("img").fadeOut(100);
    });

    $("#addFileInfo input[name='file']").change(function(){
        $("#addFileInfo").ajaxSubmit({
            type:'post',
            url:'/member/coverImg',
            success:function(data){
                if(data.status==0){
                    alert("请上传图片格式的封面图");
                    return;
                }
                $("#avatar").val(data.url);
                $("#head_img").attr("src",data.url).fadeIn(100);
                $("#crop_preview").attr("src",data.url).fadeIn(100);
                $(".head_msg").fadeOut(100);
                $("#preview_box .iconfont").fadeOut(100);
                var i=0;
                $("#head_img").load(function(){
                    if(i>0){
                        jcrop_api.destroy();
                    }
                    i++;
                    var w=$("#head_img").width(),h=$("#head_img").height();
                    $(".jcrop-holder").remove();

                    $("#head_img").removeAttr("style")
                    if(w>=400 || h>=400){
                        if(w>h){
                            $("#head_img").css("width","400px");
                            h=$("#head_img").height();
                            w=400;
                        }else{
                            $("#head_img").css("height","400px");
                            w=$("#head_img").width();
                            h=400;
                        }
                    }
                    $("#new_w").val(w);
                    $("#new_h").val(h);
                    initJcrop();
                    $(".jcrop-holder").css({marginTop:"-"+(h/2)+"px",marginLeft:"-"+(w/2)+"px"})
                });

            },
            error:function(XmlHttpRequest,textStatus,errorThrown){
                console.log(XmlHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    });
});
function winHF(){
    setTimeout(function() {
        var winH = $("body").height();
        $(".list_cont").outerHeight(winH - 122 - 51 - 15-71);
    },2);
}
function winHFE(){
    setTimeout(function(){
        $('.audit_body').outerHeight(($('body').height()-61-71)+'px');
    },2)
}
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function editF(url,dtype){
    if($("input[name='chs']:checked").length<1){
        alert("请选择一项进行操作");
    }else if($("input[name='chs']:checked").length>1){
        if(dtype==1){
            var tempval="";
            for(var i=0;i<$("input[name='chs']:checked").length;i++){
                if(i>0){
                    tempval+=',';
                }
                tempval+=$("input[name='chs']:checked").eq(i).val();
            }
            location.href="/admin/uploadStatus?status=2&id="+tempval;
        }else{
            alert("最多选择一项进行操作");
        }
    }else{
        location.href=url+"?id="+$("input[name='chs']:checked").val();
    }
}
function delF(url,id){

    var _href=window.location.pathname+"?pagesize="+$("#pageSel").val()+"&page="+$("#curr_page").html();

    var _inpt= $(".list_search input[type=text]");
    for(var i=0;i<_inpt.length;i++){
        var _id=$(_inpt).eq(i).attr("id");
        if($("#"+_id).val()){
            _href+="&"+_id+"="+$("#"+_id).val();
        }
    }

    if(id){

        delPopup(function(){
            $.get(url+"?id="+id,function(data){
                alert(data.msg);
                if(data.status == 1){
                    location.href=_href;
                }
            });
        });
        return;
    }
    if(msgPopup("chs")) return ;
    delPopup(function(){
        for(var i=0;i<$("input[name='chs']:checked").length;i++){
            $.get(url+"?id="+$("input[name='chs']:checked").eq(i).val(),function(data){
                if(data.status == 0){
                    alert(data.msg);
                }
                if(i>=$("input[name='chs']:checked").length-1){
                    location.href=_href;
                }
            });
        }
    });

}



function KindEditorFn(t) {
    KindEditor.ready(function (k) {
        editor = k.create('#' + t, {
            resizeMode: 0,
            width: '1050px',
            height: '500px',
            uploadJson: '/admin/upload1',
            allowFileManager: false,
            newlineTag: 'p',
            filterMode: false,
            resizeType:false,
            items:['source', '|', 'undo', 'redo', '|', 'preview',  'template', 'cut', 'copy', 'paste',
                'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
                'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                'anchor', 'link', 'unlink']
        });
        editor.sync();
    });
}

function areaChange(provinceId,cityId,county){
        if(!provinceId){
            provinceId= $("#province").val();
        }

        $.get("/getCity.html?regId="+provinceId,function(citys){
            var _cityTemp="", _areaTemp="";
            $("#city").empty();
            citys.region.forEach(function(city){
                _cityTemp+='<option value="'+city.region+'">'+city.name+'</option>';
            });
            $("#city").append(_cityTemp);
            if(cityId){
                $("#city").val(cityId);
            }else{
                cityId=$("#city").val();
            }
            $.get("/getCity.html?regId="+cityId,function(areas){
                if(areas.region.length<=0){
                    $("#regionsId").css("display","none");
                }else{
                    $("#regionsId").css("display","block");
                }
                $("#regionsId").empty();
                _areaTemp+='<option value="0">请选择</option>';
                areas.region.forEach(function(area){
                    _areaTemp+='<option value="'+area.region+'">'+area.name+'</option>';
                });
                $("#regionsId").append(_areaTemp);
                $("#regionsId").val(county);
            });
        });
}

function cityChange(regionsId){

    var _areaTemp="";
    if(regionsId){
        regionsId=regionsId.substring(0,4)+"00";
    }else{
        regionsId=$("#city").val();
    }

    $.get("/getCity.html?regId="+regionsId,function(areas){
        if(areas.region.length<=0){
            $("#regionsId").css("display","none");
        }else{
            $("#regionsId").css("display","block");
        }
        $("#regionsId").empty();
        _areaTemp+='<option value="0">请选择</option>';
        areas.region.forEach(function(area){
            _areaTemp+='<option value="'+area.region+'">'+area.name+'</option>';
        });
        $("#regionsId").append(_areaTemp);
    });


}

function changeWH(){
    var contH = $(window).height() - 71;
    var mainW = $(window).width() - 201;
    $(".home_cont").css({"height":contH});
    $(".h_main").css({"width":mainW});
};
function changSrc(obj,src){
    $(".h_side li").removeClass("curr");
    $("#home_iframe").attr("src",src);
    $(obj).parents("li").addClass("curr");
}


function codeSel(id,isP,obj,textId){
    var data= {pid:id};
    if(isP){
        data={id:id};
    }
    var parVal=$("#code option").map(function(){return $(this).val();}).get().join(",");
    $.ajax({
        type: 'post',
        url: '/getCode.html',
        data: data,
        success: function (result) {
            if(isP){
                //如果当前ID在首级下拉框中不存在并且不是顶级类型
                if(parVal.indexOf(result.data[0].id)<0  && result.data[0].parentId>0){
                    var _i=parseInt($("#codeId").attr("data-i"));
                    if(!_i){
                        $("#codeId").attr("data-i",1)
                    }else{
                        $("#codeId").attr("data-i",1+_i)
                    }

                    var testId={id:result.data[0].id,i:parseInt($("#codeId").attr("data-i"))};
                    codeSel(result.data[0].parentId,false,null,testId);
                    codeSel(result.data[0].parentId,true,null,testId);
                }else if(result.data[0].parentId==0){ //等于顶级类型
                    var id= $("#code").val();
                    codeSel(id,false,null);
                    $("#codeName").val($("#code option:selected").text());
                    $("#codeId").val($("#code option:selected").val());
                }else{
                    $("#code").val(result.data[0].id);
                    codeSel($("#codeId").val(),false,null);
                }
            }else{
                if(result.data.length>0){
                    var _html = '<select  class="one_sel setMes fl" name="codeIdSel"><option value="0">请选择</option>';
                    result.data.forEach(function (e) {
                        var temp='';
                        if(textId && textId.id== e.id){
                            temp='selected=true';
                        }
                        _html += '<option value="' + e.id + '"  '+temp+'>' + e.name + '</option>';
                    });
                    _html+=' </select>';

                    if(textId && textId.i>1){
                        $(".code_td>.one_sel:last").before(_html);
                    }else {
                        $(".code_td").append(_html);

                    }
                    var _id=$("#code option:selected").val();
                    var _isP=$("#codeId").attr("data-id");

                    if(_id>0 && _isP==undefined){
                        if(obj!=null){
                            $("#codeName").val($(obj).find('option:selected').text());
                            $("#codeId").val($(obj).val());
                        }
                    }else{
                        $(".code_td .one_sel").last().val($("#codeId").val());
                    }
                }else{
                    $(obj).nextAll(".one_sel").remove();
                }
            }
        }
    });
}
function selChange(obj){
    $(obj).nextAll(".one_sel").remove();
    if($(obj).val()>0){
        $("#codeName").val($(obj).find('option:selected').text());
        $("#codeId").val($(obj).val());
        $("#codeId").removeAttr("data-id")
        codeSel($(obj).val(),false,$(obj));
    }else{
        var prev=$(obj).prev(".one_sel");
        $("#codeName").val($(prev).find('option:selected').text());
        $("#codeId").val($(prev).val());
    }
}

function delPopup(todo){
    var temp='<p class="cover" onclick="closeAddBox()" id="cover_p"  style="display: block;"></p>';
    temp+='<div class="glossary_cover" id="cover_box"  style="display:block; width:320px; height:220px; margin-left:-160px; margin-top:-125px;"> <a  class="close" href="javascript:;" onclick="closeAddBox()" title="关闭">&nbsp;</a>';
    temp+='<h4 class="tc glossary_del">你确定要删除该文件？</h4><p class="tc glossary_msg">* 此操作为不可恢复</p> <p class="tc glossary_a">';
    temp+=' <a href="javascript:;" class="confirm">确定</a><a href="javascript:;" class="cancel" onclick="closeAddBox()">取消</a>';
    temp+='</p></div>';
    $("body").append(temp);
    $(".glossary_cover .confirm").click(function(){
        todo($(this));
    });
}
function msgPopup(name,msg){
    if($("input[name='"+name+"']:checked").length<1){
        var temp='<p class="cover" onclick="closeAddBox()" id="cover_p" style="display: block;"></p>';
        temp+='<div class="glossary_cover" id="cover_box"  style="display:block; width:220px; height:120px; margin-left:-130px; margin-top:-75px;"> <a  class="close" href="javascript:;" onclick="closeAddBox()" title="关闭">&nbsp;</a>';
        temp+='<h4 class="tc glossary_del">请至少选中一条数据进行操作</h4> ';
        temp+='</div>';
        $("body").append(temp);
        return true;
    }else if(msg && $("input[name='"+name+"']:checked").length>1){
        var temp='<p class="cover" onclick="closeAddBox()" id="cover_p" style="display: block;"></p>';
        temp+='<div class="glossary_cover" id="cover_box"  style="display:block; width:220px; height:120px; margin-left:-130px; margin-top:-75px;"> <a  class="close" href="javascript:;" onclick="closeAddBox()" title="关闭">&nbsp;</a>';
        temp+='<h4 class="tc glossary_del">'+msg+'</h4> ';
        temp+='</div>';
        $("body").append(temp);
        return true;
    }

}

function tipsMsg(msg) {
    var temp='<p class="cover" onclick="closeAddBox()" id="cover_p" style="display: block;"></p>';
    temp+='<div class="glossary_cover" id="cover_box"  style="display:block; width:220px; height:120px; margin-left:-130px; margin-top:-75px;">';
    temp+='<h4 class="tc glossary_del">'+msg+'</h4> ';
    temp+='</div>';
    $("body").append(temp);
}


function msgCover(title,icon){
    $(".glossary_cover").fadeOut(200);
    $(".cover").fadeOut(200);
    var temp='<p class="msg_popup msg_succee"><span class="iconfont">&#x'+icon+';</span>'+title+'</p>';
    $("body").append(temp);
    setTimeout( function(){$(".msg_popup").fadeOut(100);},1000);
}
function closeAddBox(){
    $(".glossary_cover").fadeOut(200);
    $(".cover").fadeOut(200);
    return false;
    $("#add_tabMgs input[type='hidden']").val("");
    $("#add_tabMgs input[type='text']").val("");
    setTimeout(function(){
        $("#cover_p").remove();
        $("#cover_box").remove();
    },250);

}

function initJcrop(){
    jcrop_api = $.Jcrop("#head_img",{
        onChange:showPreview,
        onSelect:showPreview,
        aspectRatio:1,
        setSelect: [100,100,200,200]
    });
}
function showPreview(coords){
    $("#x").val(coords.x);
    $("#y").val(coords.y);
    $("#w").val(coords.w);
    $("#h").val(coords.h);
    if(parseInt(coords.w) > 0){
        //计算预览区域图片缩放的比例，通过计算显示区域的宽度(与高度)与剪裁的宽度(与高度)之比得到
        var rx = $("#preview_box").width() / coords.w;
        var ry = $("#preview_box").height() / coords.h;
        //通过比例值控制图片的样式与显示
        $("#crop_preview").css({
            width:Math.round(rx * $("#head_img").width()) + "px",	//预览图片宽度为计算比例值与原图片宽度的乘积
            height:Math.round(rx * $("#head_img").height()) + "px",	//预览图片高度为计算比例值与原图片高度的乘积
            marginLeft:"-" + Math.round(rx * coords.x) + "px",
            marginTop:"-" + Math.round(ry * coords.y) + "px"
        });
    }
}


// 处理程序阻止事件的继续进行，可能不是必须的，但是原作者(Kelly Hallman)很喜欢
function nothing(e){
    e.stopPropagation();
    e.preventDefault();
    return false;
}

/**
 * @func getCode
 * @desc 获取类型列表
 * @param {string} id - 页面对象id
 * @param {string} type - code类型名称
 * @param {int} val - 默认值
 */
function getCode(id,type,val){
    $.get("/admin/getCode", {parent:type, pid: val}, function(data) {
        var str = "";
        data.code.forEach(function(code){
            str+='<option '+(val==code.name?'selected':'')+' value="'+code.name+'">'+code.name+'</option>';

        });
        $("#"+id).append(str);
    });
}

/**
 * @func addMember
 * @desc 添加执行人
 * @param {int} pid - 职位编号
 * @param {int} proId - 项目编号
 */
function addMember(pid,proId){
    if(pid<=0) { pid=0; }
    $.get("/admin/getCM",{parent:"职位分类", pid: pid, proId: proId},function(data){
        var ids = '', names = '', time="", sel='', ckLen = $(".member_ck").length;
        //获取此职位选好的人员名称id，给下面判断做铺垫
        if(typeof data.relation.length !== "undefined") {
            data.relation.forEach(function(relation,i) {
                if(i == 0){
                    names += relation.uName;
                }else{
                    names += ',' + relation.uName;
                }
                time = new Date(relation.jobDate).Format("yyyy-MM-dd");
                ids += ',' + relation.uId + ',';
            });
        }
        var str = '<div class="clearfix member_ck" style="margin-top:4px;"> ' +
            '<select name="job" class="one_sel setMes fl" style="width:150px;"> ' ;
        data.code.forEach(function(code, i) {
            if(pid == code.id || i == 0){
                sel = "," + code.id + ","+code.name;
            }
            str += '<option value="'+code.id+'" '+(pid == code.id ? 'selected' : '') + '>'+code.name+'</option>';
        });

        str += '</select> ' +
            '<div class="fl ck_down_box"> ' +
            '<input type="text" name="operator" readonly="readonly" class="long_input fl" value="' + names + '" style="width:600px; margin-right:10px;"/> ' +
            '<ul class="ck_down"> ' ;
        //对应职位人员列表
        if(typeof data.member.length !== "undefined") {
            data.member.forEach(function(member) {
                var cksel="";
                if(ids.indexOf(',' + member.id + ',')>=0) {
                    cksel="checked";
                }
                str += '<li><label><input class="ck_member" ' + cksel + ' name="postTime" type="checkbox" value="'+member.name+',' + member.id + sel + '">'+member.name+'</label></li>';
            });

        }
        str += '</ul> ' +
            '</div> ' +
            '<input type="text" class="long_input fl" style="width:600px; margin-right:10px;" onclick="WdatePicker()" name="time" value="' + time + '"/> ' ;
        if(ckLen <= 0) {
            str += '<input type="button" class="oper_btn add_member" onclick="addMember(0)" value="新增人员">';
        } else {
            str += ' <input type="button" class="oper_btn" onclick="delMember(this)" value="删除人员" style="margin-top:2px;">';
        }
        str += '</di>';
        if(ckLen > 0) {
            $($(".member_ck").get(0)).after(str);
        } else {
            $(".member_list").html(str);
        }
    });
}

/**
 * @func delMember
 * @desc 删除页面节点
 * @param {object} obj - 页面节点对象
 */
function delMember(obj){
    $(obj).parents(".member_ck").remove();
}


/*执行人下拉展示人员列表*/
$(".member_list").on("click",".long_input",function(){
    $(this).next("ul").show();
});


/*执行人下拉隐藏人员列表*/
$(".member_list").on("mouseleave",".ck_down_box",function(){
    $(this).children(".ck_down").hide();
});
/*执行人复选框选值 在文本框中显示*/
$(".member_list").on("click",".ck_member",function(){
    //获取人员名称[人员名称,id]
    var name = $(this).val().split(",")[0];
    var userNameIpt = $(this).parents(".ck_down_box").children(".long_input");
    if($(this).is(':checked')) {
        if(userNameIpt.val()!="") {
            name = ','+name;
        }
        $(userNameIpt).val(userNameIpt.val()+name);
    }else{
        //如去掉一个人员 删除文本框中存在的值
        if($(userNameIpt).val().indexOf(name) >= 0) {
            var start = $(userNameIpt).val().indexOf(name),
                length = name.length;
            if($(userNameIpt).val().substr(start-1,1) == ","){
                start = start-1;
                length = length+1;

            }else if($(userNameIpt).val().substr(start+length,1) == ","){
                start = start;
                length = length+1;
            }
            $(userNameIpt).val($(userNameIpt).val().replace($(userNameIpt).val().substr(start,length),""));
        }

    }
});
/*执行人职位下拉 换执行人员列表*/
$(".member_list").on("change"," select[name='job']",function() {
    var obj = $(this);
    //获取执行人员列表
    $.get("/admin/getMember",{pid:$(this).val()},function(members) {
        var mstr= '';
        members.member.forEach(function(member) {
            mstr += '<li><label><input class="ck_member" name="postTime" type="checkbox" value="'+member.name+','+member.id+','+$(obj).val()+','+$(obj).children("option:selected").text()+'">'+member.name+'</label></li>';
        });
        if(mstr == ''){
            $(obj).siblings(".ck_down_box").children(".ck_down").html("<li>此职位暂无人员</li>");
        }else{
            $(obj).siblings(".ck_down_box").children(".ck_down").html(mstr);
            //如职位有人员则清空之前选择的人员
            $(obj).siblings(".ck_down_box").children("input[name='operator']").val("");
        }
    });
});
