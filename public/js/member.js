var editor;
$(function(){
    $('body').on('click', '.radio_wrap', function(e){
        radio($(this));
    })
    ;$(".pro_li").live("mouseenter",function(){
        $(this).addClass("brick_item_active");
    });
    $(".pro_li").live("mouseleave",function(){
        $(this).removeClass("brick_item_active");
    });

});

function radio($cur){
    var radioName = $cur.find('.radio').attr('name');
    $('label[name="'+ radioName +'"]').removeClass('active').siblings('input[name="'+ radioName +'"]').removeAttr('checked','checked');
    $cur.find('.radio').addClass('active').siblings('input[name="'+ radioName +'"]').attr('checked', 'checked');
    $cur.parent().addClass('active').siblings().removeClass('active');
}
function addImgMgs(obj){
    var type=$(obj).parents("li").attr("data-parentval");
    if(!type){
        type= $("body").attr("type")
    }
    var data_id=$(obj).parents("li").attr("data-id");
    var id=$(obj).parents("li").attr("id");
    var name=$(obj).parents("li").attr("name");
    var format=$(obj).parents("li").attr("format");
    var temp='<p class="cover"  onclick="closeAddBox()"></p>';
    temp+='<div class="add_mesBox">' +
        '<h2 class="clearfix add_mes">' +
        '<span class="fl">编辑文件信息</span>' +
        '<i class="iconfont fr" onclick="closeAddBox()">&#xE120;</i>' +
        '</h2>' +
        '<div class="messages">' +
        '<form id="addFileInfo"><table class="add_tabMgs">' +
        '<tr>' +
        '<td class="td_name">名称：<input type="hidden" class="fl setMes" name="id" value="'+data_id+'"><input type="hidden" class="fl setMes" name="scenic"><input type="hidden" class="fl setMes" name="status"></td>' +
        '<td class="td_ipt"><input type="text" class="fl setMes" name="title" value="'+name+'" placeholder="请填写上传文件的标题"></td>' +
        '</tr>' ;
    if(type!="picture"){
        temp+='<tr>' +
            '<td class="td_name">预览图：</td>' +
            '<td class="td_ipt">' +
            '<input type="text"  value="" name="coverImg" class="fl upPic" placeholder="请上传预览图并小于500KB" readonly="readonly"><input type="file" name="file" style="display:none;" />' +
            '<img id="imgPre" src="" style="display: none; height:150px;"/>' +
            '<input type="button" name="selfile"  class="upJd" id="imgOne" value="选择上传">' +
            '</td>' +
            '</tr>' ;
        if(type=="material"){
            temp+='<tr>' +
                '<td class="td_name">尺寸：</td>' +
                '<td class="td_ipt">' +
                '<input type="text " name="measure" class="fl setMes" placeholder="请必须填写格式为PSD文件的尺寸（如：1920*1200像素）">' +
                '</td>' +
                '</tr>' ;
        }

        if(type=="material" || type=="tool" || type=="case"){
            temp+= '<tr>' +
                '<td class="td_name">分类：</td>' +
                '<td class="td_ipt code_td">' +
                '<input type="hidden" name="codeId" id="codeId"/><input type="hidden" name="codeName" id="codeName"/>'+
                '</td>' +
                '</tr>';
        }else{
            temp+= '<tr>' +
                '<td class="td_name">分类：</td>' +
                '<td class="td_ipt">' +
                '<select class="one_sel setMes fl" id="province"></select>' +
                '<select class="two_sel setMes fl" id="city" name="city"></select>' +
                '<select class="four_sel setMes fl" id="scenicId" name="scenicId" style="width:286px;"></select>' +
                '</td>' +
                '</tr>';
        }

    }else{
        temp+= '<tr>' +
            '<td class="td_name">分类：</td>' +
            '<td class="td_ipt">' +
            '<select class="one_sel setMes fl" id="province"></select>' +
            '<select class="two_sel setMes fl" id="city" name="city"></select>' +
            '<select class="four_sel setMes fl" id="scenicId" name="scenicId" style="width:286px;"></select>' +
            '</td>' +
            '</tr>';
    }
    if(type=="material" || type=="case") {
        temp += '<td class="td_name">格式：</td>' +
            '<td class="td_ip">' +
            '<p class="fonts0 radio_p" >' +
            '<span class="radio_wrap"><input class="deRadio" type="radio" name="format" value="JPG"><label class="radio" name="format"></label>JPG</span>' +
            '<span class="radio_wrap"><input class="deRadio" type="radio" name="format" value="PNG"><label class="radio" name="format"></label>PNG</span>' +
            '<span class="radio_wrap"><input class="deRadio" type="radio" name="format" value="GIF"><label class="radio" name="format"></label>GIF</span>' +
            '</p>' +
            '</td>' +
            '</tr>';
    }
    if(type=="case") {
        temp += '<tr>' +
            '<td class="td_name">SVN：</td>' +
            '<td class="td_ipt"> ' +
            '<input type="text " name="place" class="fl setMes" placeholder="请填写上传文件所在110服务器SVN地址">' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="td_name">访问：</td>' +
            '<td class="td_ipt">' +
            '<input type="text" name="url" class="fl setMes" placeholder="请填写已上线案例访问地址"> ' +
            '</td>' +
            '</tr>';
    }
    temp+= '<tr>' +
        '<td class="td_name">关键字：</td>' +
        '<td class="td_ipt">' +
        '<input type="text" name="keyWord" class="fl setMes" placeholder="请填写文件关键字，以方便查找，每个关键字用“;”(;为英文字符)隔开">' +
        '</td>' +
        '</tr>' ;
    if(type=="case" || type=="tool") {
        temp += '<tr>' +
            '<td class="td_name">内容：</td>' +
            '<td class="td_ipt">' +
            '<textarea class="fl setMes" id="content" name="content"  style="resize:none; height:150px;"></textarea>' +
            '</td>' +
            '</tr>';
    }
    temp+='<tr>' +
        '<td class="td_name">&nbsp;</td>' +
        '<td class="td_ipt">' +
        '<input id="ajaxSubmit" type="button" class="que_btn" value="确认无误并保存" onclick="saveFile(\''+id+'\')">' +
        '</td>' +
        '</tr>' ;
    temp+=  '</table></form>' +
        '</div>' +
        '<p class="write_warm">&nbsp;</p>' +
        '</div>';
    $("body").append(temp);

    if(type=="case"  || type=="tool"){
        editor = KindEditor.create('#content' , {
            resizeMode: 0,
            width: '400px',
            height: '250px',
            display:"none",
            uploadJson: '/upload',
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
                'anchor', 'link', 'unlink','code']
        });
        editor.sync();
    }
    if(type!=""){
        $.post("/member/getFormat",function(data){
            var _format='';
            if(data.codes.length>0){
                data.codes.forEach(function(code){
                    _format+='<span class="radio_wrap  format'+code.name+'"><input   class="deRadio" type="radio" name="format"  value="'+code.name+'"><label class="radio" name="format" ></label>'+code.name+'</span>';
                });
            }
            $(".radio_p").html(_format);
        });
        setTimeout(function(){
            var format_2=$(".radio_p").attr("format");
            if(!format_2){
                format_2=format;
            }
            $(".format"+format_2).children(".deRadio").attr("checked","checked");
            $(".format"+format_2).children(".radio").addClass("active");
        },250)
    }

    if(type=="picture"){
        $.get("/getCity.html?regId=",function(provinces){
            var _region='';
            $("#province").empty();
            provinces.region.forEach(function(province){
                _region+='<option value="'+province.region+'">'+province.name+'</option>';
            });
            $("#province").append(_region);

            /*默认选四川*/
            $("#province").val("510000");
            getFile(data_id,type);
        });
    }else{
        $.ajax({
            type: 'get',
            url: '/subTypes',
            data: {
                codeVal:type
            },
            success: function (result) {
                var _html = '<select class="one_sel setMes fl" name="codeIdSel" id="code" >';
                result.data.forEach(function (e) {
                    _html += '<option value="' + e.id + '" data-txt="'+ e.id+'">' + e.name + '</option>';
                });
                _html+=' </select>';
                $(".code_td").append(_html);
                var _id=$("#code option:selected").val();
                if(_id>0){
                    $("#codeName").val($("#code option:selected").text());
                    $("#codeId").val($("#code option:selected").val());
                }
                getFile(data_id,type);
            }
        });
    }

    $(".cover").fadeIn(700);
    $(".add_mesBox").fadeIn(1000);
    setTimeout(function(){
        $(".add_mesBox").css("marginTop","-"+parseInt($(".add_mesBox").height()/2)+"px");
    },100);
    $(".code_td").on("change","select[name='codeIdSel']",function(){
        selChange($(this));
    });
    $("#province").on("change",function(){
        areaChange($("#province").val(),"","");
    })
    $("#city").on("change",function(){
        getScenic($("#city").val(),"","");
    })

    $("#scenicId").on("change",function(){
        $('input[name="scenic"]').val($("#scenicId option:selected").text());
    })
    $("#imgOne").click(function(){
        $(".add_tabMgs input[name='file']").click();
    });
    $(".add_tabMgs input[name='file']").change(function(){
        $("#addFileInfo").ajaxSubmit({
            type:'post',
            url:'/member/coverImg',
            success:function(data){
                if(data.status==0){
                     alert("请上传图片格式的封面图");
                     return;
                }
                var isAdd= $("#imgPre").attr("src");
                if(isAdd==""){
                    var t=parseInt( $(".add_mesBox").css("marginTop").substr(1,$(".add_mesBox").css("marginTop").length))+45;
                    $(".add_mesBox").css("marginTop","-"+t+"px")
                }
                $("#imgPre").attr("src",data.url).show();
                $("input[name='coverImg']").attr("value",data.url);
                $(".upPic").hide();
                $(".add_mesBox").attr("isAdd",1);
            },
            error:function(XmlHttpRequest,textStatus,errorThrown){
                console.log(XmlHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    });

}

function closeAddBox(){
    $(".cover").fadeOut(600);
    $(".add_mesBox").fadeOut(500);
    $(".hint_load").fadeOut(500);
    setTimeout(function(){

        $(".cover").remove();
        $(".add_mesBox").remove();
        $(".hint_load").remove();
    },500);
}

function KindEditorFn(t) {
    KindEditor.ready(function (k) {
        editor = k.create('#'+t, {
            resizeMode: 0,
            width: '1000px',
            height: '500px',
            uploadJson: '/admin/upload1',
            allowFileManager: false,
            newlineTag: 'p',
            filterMode: false,
            resizeType:false,
            items:['source', '|', 'undo', 'redo', '|', 'preview',  'template', 'cut', 'copy', 'paste',
                'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                'superscript', 'clearhtml',   'selectall', '|', 'fullscreen', '/',
                'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
                'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                'anchor', 'link', 'unlink']
        });
        editor.sync();
    });

}

function areaChange(provinceId,cityId,county){

    $.get("/getCity.html?regId="+provinceId,function(citys){

        var _cityTemp="";
        $("#city").empty();
        var level="";
        citys.region.forEach(function(city){
            level=city.level;
            _cityTemp+='<option value="'+city.region+'">'+city.name+'</option>';
        });

        $("#city").append(_cityTemp);
        county=county==""?$("#city").val():county;

        $("#city").val(county);
        $("#scenicId").show();
        getScenic(county);

    });
}

//获取景区
function getScenic(county){
    if(!county){
        county=$("#city option:selected").val();
    }
    if(county%100<=0){
        county=county/100;
    }
    $.get("/getScenic.html?regId="+county,function(scenics){

        var  _scenic='';
        $("#scenicId").empty();
        if(scenics.scenics.length<=0){
            _scenic+='<option value="0">暂无选项</option>'
            return;
        }else{
            $("#scenicId").css("display","block");
        }
        _scenic+='<option value="0">请选择</option>'
        scenics.scenics.forEach(function(scenic){
            _scenic+='<option value="'+scenic.id+'">'+scenic.name+'</option>';
        });
        $("#scenicId").append(_scenic);

        $("#scenicId").val($("#province").attr("scenicId"));
        $('input[name="scenic"]').val($("#scenicId option:selected").text());
    });
}
function saveFile(btnId){
    if(!$("input[name='id']").val() ||$("input[name='id']").val()=="undefined"){
        $("input[name='id']").val($("#"+btnId).attr("data-id"));
    }
    if(editor){
        $("#content").val(editor.html());
    }
    var _name=$("input[name='title']").val();
    var _keyWord=$("input[name='keyWord']").val();
    if(!_name){
        $(".write_warm").html("文件名称不能为空！").css("backgroundColor","#ffe9c6").fadeIn(100);
        return;
    }
    if($("input[name='coverImg']").length>0 && !$("input[name='coverImg']").val()){
        $(".write_warm").html("请上传封面图！").css("backgroundColor","#ffe9c6").fadeIn(100);
        return;
    }
    if($("input[name='codeIdSel']").length>0 && !$("input[name='codeIdSel']").val()){
        $(".write_warm").html("请联系管理员添加素材类型！").css("backgroundColor","#ffe9c6").fadeIn(100);
        return;
    }
    if($("input[name='format']:checked").val()=="PSD" && $("input[name='measure']").val()==""){
        $(".write_warm").html("格式为PSD必须填写文件尺寸！").css("backgroundColor","#ffe9c6").fadeIn(100);
        return;
    }
    if(!_keyWord){
        $(".write_warm").css("backgroundColor","#ffe9c6").html("关键字不能为空！").fadeIn(100);
        return;
    }
    $("input[name='keyWord']").val(_keyWord.replace(/；/g,";"));
    $(".write_warm").html('').css("backgroundColor","#fff");
    var options = {
        url: '/member/EditArticle',
        type: 'post',
        dataType: 'text',
        data: $("#addFileInfo").serialize(),
        success: function (data) {
            data=eval("("+data+")");
            if(data.error=="1"){
                if($("#"+btnId+" .addWord").length>0){
                    $("#"+btnId).addClass("txt_diy_bg0");
                    $("#"+btnId+" .addWord").addClass("already").html("已添加信息");
                    closeAddBox();
                }else if($(".col_choice .curr").attr("data-status")==2){
                    loadMaterial(1,true,$(".personal_name").html(),status);
                    closeAddBox();
                }else{
                    var id=$("input[name='id']").val();
                    $(".water_li[data-id="+id+"] .tit_p").html(_name);
                    if($("input[name='coverImg']").val()){
                        $(".water_li[data-id="+id+"] .material_img>img").attr("src",$("input[name='coverImg']").val())
                    }
                    closeAddBox();
                }
            }else{
                $(".write_warm").html(data.msg);
            }
        }
    };
    $.ajax(options);
}
function getFile(id,type){
    $.post("/member/getFile",{id:id},function(data){
        if(data.error=="1"){
            var _keyWord="",_status=data.entity.status;
            if(data.entity.keyWord){
                _keyWord=data.entity.keyWord.substring(1,data.entity.keyWord.length-1);
            }
            $("input[name='title']").val(data.entity.title);
            $("input[name='place']").val(data.entity.place);
            $("input[name='url']").val(data.entity.url);
            $("input[name='codeId']").val(data.entity.codeId);
            $("input[name='codeName']").val(data.entity.codeName);
            $("input[name='keyWord']").val(_keyWord);
            if(data.entity.status==2){
                _status=1;
            }
            $("input[name='status']").val(_status);
            $("input[name='content']").val(data.entity.content);
            $("input[name='measure']").val(data.entity.measure);
            var provinceId="";
            var cityId="";
            var county="";

            if(type=="picture" ){
                if(data.entity.regionsId>0){
                    provinceId=(data.entity.regionsId+"").substring(0,2)+"0000";
                    cityId=(data.entity.regionsId+"").substring(0,4)+"00";
                    county=(data.entity.regionsId+"");
                    $("#province").val(provinceId);
                    areaChange(provinceId,cityId,county);
                    $("#province").attr("scenicId", data.entity.scenicId);
                }else{
                    provinceId=$("#province").val()
                    areaChange(provinceId,cityId,county);
                }
            }else{
                $("#codeId").attr("data-id",data.entity.codeId);
                codeSel(data.entity.codeId,true,null);

            }
            if(data.entity.content){
                editor.html(data.entity.content)
            }
            if(type!="picture"){
                if(data.entity.coverImg){
                    $(".upPic").attr("value",data.entity.coverImg).hide();
                    $("#imgPre").attr("src",data.entity.coverImg).show();
                }else{
                    $(".radio_p").attr("format",data.entity.format);
                }
            }
        }else{
            provinceId=$("#province").val()
            areaChange(provinceId,cityId,county);
        }
    });
}
/*提交审核*/
function EditFile(){
    var id="";
    var $li=$(".txt_diy_bg0");
    if($li.length<=0){
        alert("当前没有可提交审核的文件");
        return;
    }
    for(var i=0;i<$li.length;i++){
        if(i>0){id+=",";}
        id+=$($li[i]).attr("data-id");
    }
    $.post("/member/updateStatus",{id:id},function(data){
        if(data.error=="1"){
            alert("提交审核成功，请耐心等待");
            location.href="/member/my-upload.html";
        }else{
            location.href= location.href;
        }
    })
}
/*删除*/
function delMaterial(id){
    var _html=' <p class="cover none"></p>';
    _html+='<div class="my_warm none">';
    _html+='<p class="clearfix ad_warm"> <span class="fl">删除</span><i class="iconfont fr">&#xE120;</i></p>';
    _html+='<p class="query_up"><span>你确定要删除该文件？</span> <span>* 此操作为不可恢复</span></p>';
    _html+='<p class="btn_box"><input type="button" class="btn_query" value="确认"> <input type="button" class="btn_close" value="取消"></p></div>';
    $("body").append(_html);
    $(".cover").fadeIn(100);
    $(".my_warm").fadeIn(100);
    $(".my_warm").attr("data-id",id);
}

$(".btn_close,.cover,.ad_warm .iconfont").live("click",function(){
    $(".cover,.my_warm").fadeOut(300);
    setTimeout(function(){
        $(".cover,.my_warm").remove();
    },400);
});

/*确定删除*/
$(".btn_query").live("click",function(){
    var id=$(".my_warm").attr("data-id");
    $.post("/member/delFile",{id:id},function(data){
        $(".water_li[data-id="+id+"]").remove();
        $(".cover,.my_warm").fadeOut(100);
        $(".water_fall").removeClass("waterfall_box");
        if($("#flow_box>.water_li").length>=1){
            waterfall('flow_box','water_li');
            $(".cover,.my_warm").fadeOut(300);
            setTimeout(function(){
                $(".cover,.my_warm").remove();
            },400);
        }else{
            $(".col_choice .curr").click();
        }
    });
});
/*取消收藏*/
function cancelCollect(id){
    $.get("/member/cancelCollect",{id:id},function(data){
        $(".water_li[data-id="+id+"]").remove();
        $(".water_fall").removeClass("waterfall_box");
        if($("#flow_box>.water_li").length>=1){
            waterfall('flow_box','water_li');
        }else{ 
            $(".col_choice .curr").click();
        }

    });
}

function getIcon(format){
    var icon="", clas="";
    switch (format) {
        case "psd":
            icon="&#xA001;";
            clas="psd";
            break;
        case "cdr":
            icon="&#xA002;";
            clas="cdr";
            break;
        case "eps":
            clas="eps";
            icon="&#xA003;";
            break;
        case "ai":
            clas="ai";
            icon="&#xA004;";
            break;
        case "rar":
            clas="rar";
            icon="&#xA005;";
            break;
        case "zip":
            clas="rar";
            icon="&#xA006;";
            break;
        case "pdf":
            clas="pdf";
            icon="&#xA007;";
            break;
        case "ppt":
            clas="doc";
            icon="&#xA008;";
            break;
        case "doc":
            clas="doc";
            icon="&#xA009;";
            break;
        case "xlsx":
            icon="&#xA010;";
            clas="cdr";
            break;
        case "xls":
            icon="&#xA010;";
            clas="cdr";
            break;
        case "txt":
            icon="&#xA011;";
            clas="psd";
            break;
        case "avi":
            icon="&#xA012;";
            clas="avi";
            break;
        case "mp4":
            icon="&#xA013;";
            clas="avi";
            break;
        case "jpg":
            icon="&#xA014;";
            clas="eps";
            break;
        case "tif":
            icon="&#xC1117;";
            clas="eps";
            break;
        default:
            icon="&#xE112;";
            clas="";
            break;
    }
    return icon+","+clas;
}
var loadMaterial = (function() {
    var loading =false ,
        page    = 1,
        pagesize=10,
        nomore  = false ;
    return function(pages,isT,userName,status,url,type) {
        var urls="/getMaterial";
        if(!isT){
            if(loading) return;
            if(nomore){
                return;
            }
        }
        loading = true;
        page=pages||page;
        var obj={status:status,userName:userName,page:page,pagesize:pagesize,type:"all"};
        if(url){
            urls=url;
            type=type||1;
            var obj={status:status,userName:userName,page:page,pagesize:pagesize,types:type};
        }
        if($("#search_ipt").val()!=""){
            obj.search=$("#search_ipt").val();
        }
        $.get(urls,obj,function(data){
            /*更新页码*/
            page=data.curr_page+1;
            if(data.numcount<=0 && data.curr_page==1){
                var temp='<img src="/images/hint.gif"/><p>多多参与呀！！</p>';

                if(status!="" && status==3){
                    temp='<img src="/images/succeed.gif"/><p>给美貌与智慧并存的我赞一个</p>';
                }else if(status!="" &&  status<3){
                    temp='<img src="/images/hint.gif"/><p>请积极提交你的聪明才智</p>';
                }
                if($(".hint_box").length<=0){
                    $("#water_box").prepend("<div class='hint_box'>"+temp+"</div>");
                }else{
                    $(".hint_box").html(temp);
                }
                $('#flow_box').html('');
                $('#flow_box').removeAttr("style");
                $("#loading").html("").hide();
                return;
            }
            $('.hint_box').remove();
            if(isT){
                $('#flow_box').html(template('resourceTemp', { list: data.entitys }))
                    .find('.water_li[style="float:left;"]').find("img").lazyload({ effect: "fadeIn", threshold :10 });
            }else{

                $('#flow_box').append(template('resourceTemp', { list: data.entitys }))
                    .find('.water_li[style="float:left;"]').find("img").lazyload({ effect: "fadeIn", threshold :10 });
            }
            if($('#flow_box li').length>0){
                 waterfall('flow_box','water_li');
            }
            if(data.curr_page>=data.numcount){
                nomore = true;
                $("#loading").html("没有更多了").show();
            }else{
                nomore=false;
                $("#loading").html('<img src="/images/loading.gif"/>  向下滑动即可加载...').show("");
            }
            loading=false;
        });
    };
})();

function isLoadPicture() {
    var scrollHeight = $(document).scrollTop();
    var windowH = $(window).height();
    var loadLine = $('#loading').offset().top;
    if (scrollHeight + windowH >= loadLine + $('#loading').height()) {
        return true;
    }
    return false;
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
