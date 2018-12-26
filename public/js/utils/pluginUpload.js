((function(window, $) {
	window.tools = window.tools || {};

    window.tools.uploadPlugin = function(option) {
        var $wrap = $('#uploader');

        // 图片容器
        var	$queue = $('<ul class="filelist rar upload_desc"></ul>')
            .appendTo( $wrap.find('.queueList') );

        // 状态栏，包括进度和控制按钮
        var	$statusBar = $wrap.find('.statusBar');

        // 文件总体选择信息。
        var	$info = $statusBar.find('.info');

        // 上传按钮
        var	$upload = $wrap.parents('.plugin_wrap').find('.uploadBtn');

        // 没选择文件之前的内容。
        var	$placeHolder = $wrap.find('.placeholder');

        // 总体进度条
        var	$progress = $statusBar.find('.progress').hide();

        // 添加的文件数量
        var	fileCount = 0;

        // 添加的文件总大小
        var	fileSize = 0;

        // 优化retina, 在retina下这个值是2
        var	ratio = window.devicePixelRatio || 1;

        // 缩略图大小
        var	thumbnailWidth = 110 * ratio;
        var	thumbnailHeight = 110 * ratio;

        // 可能有pedding, ready, uploading, confirm, done.
        var	state = 'pedding';

        // 所有文件的进度信息，key为file id
        var	percentages = {};

        var	supportTransition = (function(){
            var s = document.createElement('p').style,
                r = 'transition' in s ||
                    'WebkitTransition' in s ||
                    'MozTransition' in s ||
                    'msTransition' in s ||
                    'OTransition' in s;
            s = null;
            return r;
        })();

        // WebUploader实例
        var	uploader;

        var defaultOpt= {
            pick: {
                id: '#filePicker',
                label: '请选择组件'
            },
            dnd: '#uploader .queueList',
            paste: document.body,
            accept: {
                //title: '压缩文件',
                //extensions: 'zip',
                //mimeTypes: 'application/zip'
            },
            method: 'POST',
            // swf文件路径
            swf: '/upload/Uploader.swf',
            disableGlobalDnd: true,
            chunked: true,
            // server: 'http://webuploader.duapp.com/server/fileupload.php',
            //server: 'http://2betop.net/fileupload.php',
            server: '/component',
            fileNumLimit: 1,
            fileSizeLimit: 50 * 1024 * 1024,    // 50M
            fileSingleSizeLimit: 15 * 1024 * 1024    // 15M
        };

        if ( !WebUploader.Uploader.support() ) {
            alert( 'Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
            throw new Error( 'WebUploader does not support the browser you are using.' );
        }

        // 实例化
        uploader = WebUploader.create(defaultOpt);

        // 添加“添加文件”的按钮，
        //uploader.addButton({
        //	id: '#filePicker2',
        //	label: '继续添加'
        //});

        // 当有文件添加进来时执行，负责view的创建
        function addFile( file ) {
            var $li = $( '<li id="' + file.id + '">' +
                '<i class="iconfont chanSize" >&#xA006;</i>' +
                '<p class="imgWrap "></p>'+
                '<p class="progress"><span></span></p>' +
                '</li>' );

            var	$btns = $('<p class="diyCut"><span class="close_upload cut_close"><i class="iconfont"></i></span></p>'/* +
             '<span class="rotateRight">向右旋转</span>' +
             '<span class="rotateLeft">向左旋转</span></div>'*/).appendTo( $li );
            var	$prgress = $li.find('p.progress span');
            var	$wrap = $li.find( 'p.imgWrap' );
            var	$info = $('<p class="error"></p>');
            var text = '';

            var	showError = function( code ) {
                switch( code ) {
                    case 'exceed_size':
                        text = '文件大小超出';
                        break;

                    case 'interrupt':
                        text = '上传暂停';
                        break;

                    default:
                        text = '上传失败，请重试';
                        break;
                }

                $info.text( text ).appendTo( $li );
            };

            if ( file.getStatus() === 'invalid' ) {
                showError( file.statusText );
            } else {
                // @todo lazyload
                $wrap.text( '预览中' );
                uploader.makeThumb( file, function( error, src ) {
                    if ( error ) {
                        $wrap.text(file.name);
                        return;
                    }

                    var img = $('<img src="'+src+'">');
                    $wrap.empty().append( img );
                }, thumbnailWidth, thumbnailHeight );

                percentages[ file.id ] = [ file.size, 0 ];
                file.rotation = 0;
            }

            file.on('statuschange', function( cur, prev ) {
                if ( prev === 'progress' ) {
                    $prgress.hide().width(0);
                } else if ( prev === 'queued' ) {
                    $li.off( 'mouseenter mouseleave' );
                    $btns.remove();
                }

                // 成功
                if ( cur === 'error' || cur === 'invalid' ) {
                    console.log( file.statusText );
                    showError( file.statusText );
                    percentages[ file.id ][ 1 ] = 1;
                } else if ( cur === 'interrupt' ) {
                    showError( 'interrupt' );
                } else if ( cur === 'queued' ) {
                    percentages[ file.id ][ 1 ] = 0;
                } else if ( cur === 'progress' ) {
                    $info.remove();
                    $prgress.css('display', 'block');
                } else if ( cur === 'complete' ) {
                    $li.append( '<span class="success"></span>' );
                }

                $li.removeClass( 'state-' + prev ).addClass( 'state-' + cur );
            });

            $li.on( 'mouseenter', function() {
                $btns.stop().animate({height: 30});
            });

            $li.on( 'mouseleave', function() {
                $btns.stop().animate({height: 0});
            });

            $btns.on( 'click', 'span', function() {
                var index = $(this).index(),
                    deg;

                switch ( index ) {
                    case 0:
                        uploader.removeFile( file );
                        return;

                    case 1:
                        file.rotation += 90;
                        break;

                    case 2:
                        file.rotation -= 90;
                        break;
                }

                if ( supportTransition ) {
                    deg = 'rotate(' + file.rotation + 'deg)';
                    $wrap.css({
                        '-webkit-transform': deg,
                        '-mos-transform': deg,
                        '-o-transform': deg,
                        'transform': deg
                    });
                } else {
                    $wrap.css( 'filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ (~~((file.rotation/90)%4 + 4)%4) +')');
                    // use jquery animate to rotation
                    // $({
                    //     rotation: rotation
                    // }).animate({
                    //     rotation: file.rotation
                    // }, {
                    //     easing: 'linear',
                    //     step: function( now ) {
                    //         now = now * Math.PI / 180;

                    //         var cos = Math.cos( now ),
                    //             sin = Math.sin( now );

                    //         $wrap.css( 'filter', "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (-sin) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')");
                    //     }
                    // });
                }


            });

            $li.appendTo( $queue );
        }

        // 负责view的销毁
        function removeFile( file ) {
            var $li = $('#'+file.id);

            delete percentages[ file.id ];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }

        function updateTotalProgress() {
            var loaded = 0,
                total = 0,
                spans = $progress.children(),
                percent;

            $.each( percentages, function( k, v ) {
                total += v[ 0 ];
                loaded += v[ 0 ] * v[ 1 ];
            } );

            percent = total ? loaded / total : 0;

            spans.eq( 0 ).text( Math.round( percent * 100 ) + '%' );
            spans.eq( 1 ).css( 'width', Math.round( percent * 100 ) + '%' );
            updateStatus();
        }

        function updateStatus() {
            var text = '', stats;

            if ( state === 'ready' ) {
                text = '选中' + fileCount + '个组件，共' +
                    WebUploader.formatSize( fileSize ) + '。';
            } else if ( state === 'confirm' ) {
                stats = uploader.getStats();
                if ( stats.uploadFailNum ) {
                    text = '已成功上传' + stats.successNum+ '个组件至服务器，'+
                        stats.uploadFailNum + '个组件上传失败，<a class="retry" href="#">重新上传</a>失败组件或<a class="ignore" href="#">忽略</a>'
                }

            } else {
                stats = uploader.getStats();
                text = '共' + fileCount + '个（' +
                    WebUploader.formatSize( fileSize )  +
                    '），已上传' + stats.successNum + '个';

                if ( stats.uploadFailNum ) {
                    text += '，失败' + stats.uploadFailNum + '个';
                }
            }

            $info.html( text );
        }

        function setState( val ) {
            var file, stats;

            if ( val === state ) {
                return;
            }

            $upload.removeClass( 'state-' + state );
            $upload.addClass( 'state-' + val );
            state = val;

            switch ( state ) {
                case 'pedding':
                    $placeHolder.removeClass( 'element-invisible' );
                    $queue.parent().removeClass('filled');
                    $queue.hide();
                    $statusBar.addClass( 'element-invisible' );
                    uploader.refresh();
                    break;

                case 'ready':
                    $placeHolder.addClass( 'element-invisible' );
                    $( '#filePicker2' ).removeClass( 'element-invisible');
                    $queue.parent().addClass('filled');
                    $queue.show();
                    $statusBar.removeClass('element-invisible');
                    uploader.refresh();
                    break;

                case 'uploading':
                    $( '#filePicker2' ).addClass( 'element-invisible' );
                    $progress.show();
                    $upload.text( '暂停上传' );
                    break;

                case 'paused':
                    $progress.show();
                    $upload.text( '继续上传' );
                    break;

                case 'confirm':
                    $progress.hide();
                    $upload.text( '开始上传' ).addClass( 'disabled' );

                    stats = uploader.getStats();
                    if ( stats.successNum && !stats.uploadFailNum ) {
                        setState( 'finish' );
                        return;
                    }
                    break;
                case 'finish':
                    stats = uploader.getStats();
                    if ( stats.successNum ) {
                        //alert( '上传成功' );
                    } else {
                        // 没有成功的图片，重设
                        state = 'done';
                        location.reload();
                    }
                    break;
            }

            updateStatus();
        }

        uploader.onUploadProgress = function( file, percentage ) {
            var $li = $('#'+file.id),
                $percent = $li.find('.progress span');

            $percent.css( 'width', percentage * 100 + '%' );
            percentages[ file.id ][ 1 ] = percentage;
            updateTotalProgress();
        };

        uploader.onFileQueued = function( file ) {
            fileCount++;
            fileSize += file.size;

            if ( fileCount === 1 ) {
                $placeHolder.addClass( 'element-invisible' );
                $statusBar.show();
            }

            addFile( file );
            setState( 'ready' );
            updateTotalProgress();
        };

        uploader.onFileDequeued = function( file ) {
            fileCount--;
            fileSize -= file.size;

            if ( !fileCount ) {
                setState( 'pedding' );
            }

            removeFile( file );
            updateTotalProgress();

        };

        uploader.on( 'all', function( type, file, response ) {
            var stats;
            switch( type ) {
                case 'uploadFinished'://所有文件上传结束时触发
                    setState( 'confirm' );
                    break;
                case 'uploadSuccess'://单个上传完成时触发
                    if(option.complete && typeof option.complete === 'function') {
                        $upload.removeClass('disabled');
                        option.complete(file, response);
                    }
                    break;

                case 'startUpload':
                    setState( 'uploading' );
                    break;

                case 'stopUpload':
                    setState( 'paused' );
                    break;

                case 'beforeFileQueued':
                    if(option.checkFile && typeof option.checkFile) {
                        if(!option.checkFile(file)){
                            return false;
                        }
                    }
                    break;
            }
        });

        uploader.onError = function( code ) {
            var text = '';
            switch( code ) {
                case  'F_DUPLICATE' : text = '该文件已经被选择了!' ;
                    break;
                case  'Q_EXCEED_NUM_LIMIT' : text = '上传文件数量超过限制!' ;
                    break;
                case  'F_EXCEED_SIZE' : text = '文件大小超过限制!';
                    break;
                case  'Q_EXCEED_SIZE_LIMIT' : text = '所有文件总大小超过限制!';
                    break;
                case 'Q_TYPE_DENIED' : text = '文件类型不正确或者是空文件!';
                    break;
                default : text = '未知错误：' + code;
                    break;
            }
            alert( text );
        };

        //$upload.on('click', function() {
        //    if ( $(this).hasClass( 'disabled' ) ) {
        //        return false;
        //    }
        //
        //    $(this).addClass('disabled');
        //
        //    if ( state === 'ready' ) {
        //        uploader.upload();
        //    } else if ( state === 'paused' ) {
        //        uploader.upload();
        //    } else if ( state === 'uploading' ) {
        //        uploader.stop();
        //    }
        //});

        $info.on( 'click', '.retry', function() {
            uploader.retry();
        } );

        $info.on( 'click', '.ignore', function() {
            alert( 'todo' );
        } );

        $upload.addClass( 'state-' + state );
        updateTotalProgress();


        return uploader;
    }
}))(window, jQuery);