/*
 *	jQuery文件上传插件,封装UI,上传处理操作采用Baidu WebUploader;
 */
(function ($) {
    $.fn.extend({
        /*
         *	上传方法 opt为参数配置;
         *	serverCallBack回调函数 每个文件上传至服务端后,服务端返回参数,无论成功失败都会调用 参数为服务器返回信息;
         */
        diyUpload: function (opt, serverCallBack) {
            if (typeof opt != "object") {
                alert('参数错误!');
                return;
            }


            var $fileInput = $(this);
            var $fileInputId = $fileInput.attr('id');

            //组装参数;
            if (opt.url) {
                opt.server = opt.url;
                delete opt.url;
            }

            if (opt.success) {
                var successCallBack = opt.success;
                delete opt.success;
            }

            if (opt.error) {
                var errorCallBack = opt.error;
                delete opt.error;
            }


            //迭代出默认配置
            $.each(getOption('#' + $fileInputId), function (key, value) {
                opt[key] = opt[key] || value;
            });

            if (opt.buttonText) {
                opt['pick']['label'] = opt.buttonText;
                delete opt.buttonText;
            }

            var webUploader = getUploader(opt);

            if (!WebUploader.Uploader.support()) {
                alert(' 上传组件不支持您的浏览器！');
                return false;
            }

            //绑定文件加入队列事件;
            webUploader.on('fileQueued', function (file) {
                createBox($fileInput, file, webUploader);
            });

            //进度条事件
            webUploader.on('uploadProgress', function (file, percentage) {
                var $fileBox = $('#fileBox_' + file.id);
                var $diyBar = $fileBox.find('.diyBar');
                $diyBar.show();
                percentage = percentage * 100;
                showDiyProgress(percentage.toFixed(2), $diyBar);
            });

            //全部上传结束后触发;
            webUploader.on('uploadFinished', function () {
                $fileInput.next('.parentFileBox').children('.diyButton').remove();
            });

            //绑定发送至服务端返回后触发事件;
            webUploader.on('uploadAccept', function (object, data) {
                if (serverCallBack) serverCallBack(data);
            });

            //上传成功后触发事件;
            webUploader.on('uploadSuccess', function (file, response) {

                var $fileBox = $('#fileBox_' + file.id);
                var $diyBar = $fileBox.find('.diyBar');
                $fileBox.removeClass('diyUploadHover');
                $diyBar.fadeOut(1000, function () {
                    $fileBox.children('.diySuccess').show();
                });
                if (successCallBack) {
                    successCallBack(response);
                }
            });

            //上传失败后触发事件;
            webUploader.on('uploadError', function (file, reason) {
                var $fileBox = $('#fileBox_' + file.id);
                var $diyBar = $fileBox.find('.diyBar');
                showDiyProgress(0, $diyBar, '上传失败!');
                var err = '上传失败! 文件:' + file.name + ' 错误码:' + reason;
                if (errorCallBack) {
                    errorCallBack(err);
                }
            });

            //选择文件错误触发事件;
            webUploader.on('error', function (code) {
                var text = '';
                switch (code) {
                    case  'F_DUPLICATE' :
                        text = '该文件已经被选择了!';
                        break;
                    case  'Q_EXCEED_NUM_LIMIT' :
                        text = '上传文件数量超过限制!';
                        break;
                    case  'F_EXCEED_SIZE' :
                        text = '文件大小超过限制!';
                        break;
                    case  'Q_EXCEED_SIZE_LIMIT' :
                        text = '所有文件总大小超过限制!';
                        break;
                    case 'Q_TYPE_DENIED' :
                        text = '文件类型不正确或者是空文件!';
                        break;
                    default :
                        text = '未知错误!';
                        break;
                }
                alert(text);
            });

            return webUploader;
        }
    });

    //Web Uploader默认配置;
    function getOption(objId) {
        /*
         *	配置文件同webUploader一致,这里只给出默认配置.
         *	具体参照:http://fex.baidu.com/webuploader/doc/index.html
         */
        return {
            //按钮容器;
            pick: {
                id: objId,
                label: "上传图片"
            },
            //类型限制;
            accept: {
                title: "Images",
                extensions: "gif,jpg,jpeg,bmp,png",
                mimeTypes: "image/*"
            },
            //配置生成缩略图的选项
            thumb: {
                width: 170,
                height: 150,
                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: 100,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,
                // 是否允许裁剪。
                crop: true,
                // 为空的话则保留原有图片格式。
                // 否则强制转换成指定的类型。
                type: "image/jpeg"
            },
            //文件上传方式
            method: "POST",
            //服务器地址;
            server: "",
            //是否已二进制的流的方式发送文件，这样整个上传内容php://input都为文件内容
            sendAsBinary: false,
            //最大上传的文件数量, 总文件大小,单个文件大小(单位字节);
            fileNumLimit: 50,
            fileSizeLimit: 0
        };
    }

    //实例化Web Uploader
    function getUploader(opt) {
        return new WebUploader.Uploader(opt);

    }

    //操作进度条;
    function showDiyProgress(progress, $diyBar, text) {

        if (progress >= 100) {
            progress = progress + '%';
            text = text || '上传完成';
        } else {
            progress = progress + '%';
            text = text || progress;
        }

        var $diyProgress = $diyBar.find('.diyProgress');
        var $diyProgressText = $diyBar.find('.diyProgressText');
        $diyProgress.width(progress);
        $diyProgressText.text(text);

    }

    //取消事件;
    function removeLi($li, file_id, webUploader) {
        webUploader.removeFile(file_id);
    }


    //创建文件操作div;
    function createBox($fileInput, file, webUploader) {
        var _fileInput=   $fileInput.parent("ul");

        if (file.type.split("/")[0] ) {
            var _ext=file.ext.toLowerCase();
            var img_ext=',jpg,gif,png,bmp,jpeg';
            if($fileInput.selector=="#face_img" && img_ext.indexOf(_ext)<0){
                alert("请选择图片进行上传");
                return;
            }
        }
        var file_id = file.id;
        _fileInput.find('.default').css('display', 'none');

        var _div="";
        var _file_len=_fileInput.children("li").length;

        //添加子容器;
        var li = '<li id="fileBox_' + file_id + '" class="diyUploadHover" style="z-index: 8;"> \
					<div class="viewThumb"></div> \
					<div class="diyCancel none"></div> \
					<div class="diySuccess"></div> \
					<p class="diyCut">\
						<span class="close_upload cut_close"><i class="iconfont">&#xE120;</i></span>\
					</p>\
					<div class="diyBar"> \
							<div class="diyProgress">0%</div> \
							<div class="diyProgressText"></div> \
					</div><p></p>\
				</li>';

        _fileInput.prepend(li);

        $("#fileBox_"+file_id).fadeIn(250);

        //开始上传文件
/*        setTimeout(function(){
            webUploader.upload();
        },100);*/

        //父容器宽度;
        var $width = $('.fileBoxUl>li').length * 180;
        var $maxWidth = $fileInput.parent().width();
        $width = $maxWidth > $width ? $width : $maxWidth;


        var $fileBox =$('#fileBox_' + file_id);

        //绑定取消事件;
        $fileBox.find(".cut_close").on('click', function () {

            var id=$(this).parents('li').eq(0).attr("data-id");
            //removeFiles(id);
            removeLi($(this).parents('li'), file_id, webUploader);
            $(this).parents('li').eq(0).remove();
            _fileInput.find('.default').css('display', 'block');
        });
        if (file.type.split("/")[0] ) {
            var _ext=file.ext.toLowerCase();
            var img_ext=',jpg,gif,png,bmp,jpeg';
            var liClassName = getFileTypeClassName(file.name.split(".").pop());
            if(img_ext.indexOf(_ext)<0){
                var icons=  getIcon(_ext).split(',');
                var sty='';
                if(icons[0]=="&#xE112;"){
                    sty='style="font-size:57px; padding-top:80px;"';
                }
                $fileBox.addClass(icons[1]);
                $fileBox.append('<i class="iconfont chanSize" '+sty+'>'+icons[0]+'</i>');
                $fileBox.addClass(liClassName);
                return;
            }
        }
        //生成预览缩略图;
        webUploader.makeThumb(file, function (error, dataSrc) {
            if (!error) {
                $fileBox.find('.viewThumb').append('<img src="' + dataSrc + '" >');
            }
        });


    }
//获取文件类型;
    function getFileTypeClassName(type) {
        var fileType = {};
        var suffix = '_diy_bg';
        fileType['psd'] = 'psd';
        fileType['cdr'] = 'cdr';
        fileType['eps'] = 'eps';
        fileType['ai'] = 'ai';
        fileType['rar'] = 'rar';
        fileType['zip'] = 'zip';
        fileType['pdf'] = 'pdf';
        fileType['ppt'] = 'ppt';
        fileType['doc'] = 'doc';
        fileType['xls'] = 'xls';
        fileType['txt'] = 'txt';
        fileType['avi'] = 'avi';
        fileType['mp4'] = 'mp4';
        fileType['jpg'] = 'jpg';
        fileType['png'] = 'png';
        fileType['gif'] = 'gif';
        fileType = fileType[type] || 'txt';

        return fileType + suffix;
    }
    function removeFiles(id){
        $.post("/member/delFile",{id:id},function(data){});
    }
})(jQuery);
