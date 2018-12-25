/**
 * Created by chengwb on 2016/11/14.
 */
var fs = require('fs');
var crypto = require('crypto');
var JSZip = require("jszip");
var path = require('path');
var Thenjs = require('thenjs');
var uuid = require('node-uuid');
var captchapng = require("captchapng");  /*生成验证码图片*/
var db = require('../models');
var config = require('../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);

var batchDownloadDir = path.join(__dirname, '../public', config.batchDownloadDir);
var nodemailer = require('nodemailer');
var  gm = require('gm').subClass({imageMagick: true});
var images = require('images');
var _ = require('lodash');

var tools = {};
tools.execute = function (func, params) {
    if (func && typeof func === 'function') {
        func(params);
    }
};

/*文件加密*/
tools.fileMd5 = function (fileName, completed) {
    var md5 = null;
    try {
        var md5sum = crypto.createHash('md5');
        var stream = fs.createReadStream(fileName);
        stream.on('data', function (chunk) {
            md5sum.update(chunk);
        });
        stream.on('end', function () {
            md5 = md5sum.digest('hex');
            if (completed && typeof completed) {
                completed(md5);
            }
        });
    } catch (e) {
        if (completed && typeof completed) {
            completed(e);
        }
    }
};

tools.zipResources = function (option) {
    var files = option.files;
    var zip = new JSZip();

    //检查目录是否存在，不存在则创建
    if (!fs.existsSync(batchDownloadDir)) {
        fs.mkdirSync(batchDownloadDir);
    }

    Thenjs.each(files, function (cont, file) {
        var path = __dirname + '/../public/' + file;
        var dirs = file.split('/');
        var fileName = dirs[dirs.length - 1];

        fs.readFile(path, function (err, data) {
            if (data) {
                zip.file(fileName, data, {base64: true});
                cont(null);
            } else {
                cont(null, file);
            }
        });
    }).then(function (cont, result) {
        var zipName = uuid.v1() + '.zip';
        var absolutePath = path.join(batchDownloadDir, zipName);
        var relativePath = path.join('/', config.batchDownloadDir, zipName);

        zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
            .pipe(fs.createWriteStream(absolutePath))
            .on('finish', function () {
                // JSZip generates a readable stream with a "end" event,
                // but is piped here in a writable stream which emits a "finish" event.
                //获取打包失败的文件列表
                var failed = result.filter(function (file) {
                    return file;
                });

                if (failed.length !== result.length) {
                    tools.execute(option.complete, {
                        failed: failed,
                        path: relativePath
                    });

                    //何时删除
                    setTimeout(function () {
                        fs.unlink(absolutePath, function (error) {
                            if (error) {
                                console.log('删除临时文件失败，请手动删除临时文件：' + absolutePath);
                            }
                        });
                    }, 5000);
                } else {
                    tools.execute(option.error, new Error('打包资源失败'));

                    //虽然资源打包失败了，但还还是生成了一个空压缩文件
                    fs.unlink(absolutePath, function (error) {
                        if (error) {
                            console.log('删除临时文件失败，请手动删除临时文件：' + absolutePath);
                        }
                    });
                }
            });
    }).fail(function (cont, err) {
        tools.execute(option.error, err);
    });
};

/**
 * 解压zip文件
 * @param option
 */
tools.unzip = function (option) {
    if (!fs.existsSync(option.targetDir)) {
        fs.mkdirSync(option.targetDir);
    }

    // 1.this is like Object.values(zip.files) which is not yet implemented everywhere
    var entries = Object.keys(option.zip.files).map(function (name) {
        return option.zip.files[name];
    });

    // 2.
    var listOfPromises = entries.map(function (entry) {
        var names = entry.name.split('.');
        var type = names[names.length - 1];
        var fileType = 'binarystring';

        return entry.async(fileType).then(function (u8) {
            // we bind the two together to be able to match the name and the content in the last step
            return [entry.name, entry.dir, u8, fileType];
        });
    });

    // 3.
    var promiseOfList = Promise.all(listOfPromises);

    // 4.
    promiseOfList.then(function (list) {
        // here, list is a list of [name, content]
        // let's transform it into an object for easy access
        var result = list.reduce(function (accumulator, current) {
            var currentName = current[0];
            var currentType = current[1];
            var currentValue = current[2];
            var type = 'binary';
            switch (current[3]) {
                case 'text':
                    type = 'binary';
                    break;
                case 'base64':
                    type = 'base64';
                    break;
                case 'binarystring':
                    type = 'binary';
                    break;
                case 'unit8array':
                    type = 'base64';
                    break;
                default:
                    break;
            }

            var fileName = path.join(option.targetDir, currentName);
            if (currentType) {
                if (!fs.existsSync(fileName)) {
                    fs.mkdirSync(fileName);
                }
            } else {
                fs.writeFile(fileName, currentValue, type);
            }

            accumulator[currentName] = currentValue;
            return accumulator;
        }, {} /* initial value */);

        if (option.success && typeof option.success === 'function') {
            option.success();
        }
    }).catch(function (e) {
        if (option.error && typeof option.error === 'function') {
            option.error(e);
        }
    });
};

/**
 * 清空文件夹
 * */
tools.emptyDir = function (dir) {
    if (!fs.existsSync(dir)) {
        return;
    }
    var files = fs.readdirSync(dir);//读取该文件夹
    files.forEach(function (file) {
        var targetFile = path.join(dir, file);
        var stats = fs.statSync(targetFile);
        if (stats.isDirectory()) {
            tools.emptyDir(targetFile);
            fs.rmdirSync(targetFile);
        } else {
            fs.unlinkSync(targetFile);
        }
    });
};


/**
 *分页
 * table 表名
 * fields 字段
 * where 查询的条件
 * order 排序
 * currPage 当前页
 * pageSize 每页显示多少条数据
 * search 搜索文字
 * */
tools.page=function(params){
        var startRow =params.pageSize*(params.currPage -1);
        var strsql ="select  "+params.fields+" from " +params.table;
        if(params.where){
            strsql+=" where "+params.where;
        }
        if(params.group){
            strsql+=" group by "+params.group;
        }
        if(params.order){
            strsql+=" order by "+params.order;
        }
        strsql+=" limit "+startRow+","+params.pageSize;
        db.sequelize.query(strsql).spread(function (entity) {
            if(entity.length>=params.pageSize ||  params.currPage>1){
                var count_sql="select count(0) as count from "+params.table;
	            if(params.where){
		            count_sql+=" where "+params.where;
	            }
                db.sequelize.query(count_sql).spread(function (count_val) {
                    var pagecount=count_val[0].count;
                    pagecount=(pagecount % params.pageSize > 0 )==true?Math.floor(pagecount / params.pageSize) + 1:Math.floor(pagecount / params.pageSize);
                    params.res.json({
                        entitys: entity,
                        curr_page:parseInt(params.currPage),
                        pagecount:pagecount,
                        search: params.search,
                        pagesize: params.pageSize,
                        numcount: count_val[0].count
                    });
                });
            }else{
                params.res.json({
                    entitys: entity,
                    curr_page:parseInt(params.currPage),
                    pagecount:1,
                    search: params.search,
                    pagesize: params.pageSize,
                    numcount:entity.length
                });
            }
        });
}

/**
 * 生成封面图
 *
 * */
tools.disposeImg = function (params) {
    var isNews = params.isNews || false;
    var coverImg = params.coverImg;
    var w1 = 0;
    var w = 500;
    var temps = coverImg.substring(coverImg.lastIndexOf('/') + 1);
    var ext = coverImg.substring(coverImg.lastIndexOf('.') + 1);
    if(ext.toLowerCase()=="tif"){
        ext="png";
        temps = uuid.v1() + ".png";
    }else{
        if (isNews) {
            temps = uuid.v1() + "." + ext;
        }
    }
    var now = new Date();
    var folderName = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    // 指定文件上传后的目录
    var dirPath = path.join(__dirname, '..', '/public/attached/', folderName);
    var target_path = path.join(dirPath, temps);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    gm(path.join(__dirname, "../public/" + coverImg)).size(function (err, size) {
        if (!err) {
            w1=size.width;
            var _himg=size.height;
            var temp=_himg/(w1/500);
            if (w1 < w)  w = w1;
            if (w1 > 1280)  w1 = 1280;
            if(temp<300){
                gm(path.join(__dirname, "../public/" + coverImg)).resize(null,300).autoOrient()
                    .write(target_path, function(err){
                        if (err) {
                            console.log(err);
                        }
                    });
            }else{
                gm(path.join(__dirname, "../public/" + coverImg)).resize(w,null).autoOrient()
                    .write(target_path, function(err){
                        if (err) {
                            console.log(err);
                        }
                    });
            }
            gm(path.join(__dirname, "../public/" + coverImg)).resize(w1,null).autoOrient()
                .write(target_path + "1280_w." + ext, function(err){
                    if (err) {
                        console.log(err);
                    }
                });
        }
    });
    return  {coverImg: "/attached/" + folderName + "/" + temps};
}

/**
 * 获取城市
 * region 城市编码
 * */
tools.getPreRegion = function (region) {
    var number = parseInt(region);
    if (number === 0) {
        return {preRegion: region, type: 'county'};
    } else if (number === 100000) {
        return 0;
    }

    var third = number % 100;
    var second = number % 10000;
    if (second === 0) {
        //省
        return {preRegion: Math.floor(number / 10000), type: 'province'};
    } else if (third === 0) {
        //市
        return {preRegion: Math.floor(number / 100), type: 'city'};
    } else {
        //县
        return {preRegion: number, type: 'county'};
    }
};

/**
 * 生成验证码
 * @returns {{code: string, base64: *}} code为验证码数字，base64为验证码图片
 */
tools.verificationCode = function () {
    var code = ~~(Math.random() * 9000 + 1000) + '';
    var png = new captchapng(50, 28, code);// 宽,高,数字验证码
    png.color(250, 250, 250, 0);
    png.color(250, 250, 250, 255);

    return {
        code: code,
        base64: png.getBase64()
    };
};

/**
 * megNum 错误提示页面定义
 * */

tools.Hint=function(megNum){
    var obj={};
    switch (megNum){
        case "404":
            obj.msg="抱歉，您查找的页面不存在，可能已被删除或转移请点击以下链接继续浏览网站其他信息！";
            break;
        case "500":
            obj.msg="服务器出问题啦！<br>工程师们正在努力抢修，请稍后再试!";
            break;
        case  "555":
            obj.msg="接口出现问题了！";
            break;
        default:
            obj.msg="无此错误码，无法给出提示，请联系管理员！";
        break;
    }
    obj.num=megNum;
    return obj;
}

tools.deleteFolder = module.exports.deleteFolder = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);

        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse

                deleteFolder(curPath);
            } else { // delete file

                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(path);
    }
}
tools.getBelateDate=function(){
    var date=new Date(),getDate=date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate();
    var date3=date.getTime()-new Date(getDate+" 09:05").getTime();
    var leave1=date3%(24*3600*1000);    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000));
    //计算相差分钟数
    var leave2=leave1%(3600*1000);       //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000));
    //计算相差分钟数
    var leave2=leave1%(3600*1000);        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000));
    if(hours<=0 && minutes<=0){
        return "";
    }else if(hours<=0 ){
        return minutes;
    }else{
        return hours+":"+minutes;
    }
};

/**
 * params.tid  资源编号
 * params.title 资源名称
 * params.coverImg  资源封面图
 * */
tools.updateLove=function(params){
    if(!params) return;
    if(!params.tid) return;
    db.Love.find({where:{tid:params.tid}}).then(function(entity){
        if(entity){
            var strsql="update loves set ",isT=false ;
            if(params.coverImg){
                if(params.coverImg!=entity.coverImg){
                    isT=true;
                    strsql+="coverImg='"+params.coverImg+"',w="+params.w+",h="+params.h;
                }
            }
            if(params.title){
                if(params.title!=entity.title){
                    if(isT){
                        strsql+=' ,'
                    }
                    isT=true;
                    strsql+="title='"+params.title+"'";
                }
            }
            if(!isT) return;
            strsql+=' where tid='+params.tid;

            db.sequelize.query(strsql).spread(function (result) {});
        }else{
            console.log("没有此资源的收藏或者下载");
        }
    });
};

//发送邮件
tools.Email=function(params){
    // var transporter = nodemailer.createTransport({
    //     service: 'exmail.qq.com',
    //     secureConnection: true, // 使用ssl加密
    //     port: 465,
    //     auth: {
    //         user: 'ued@daqsoft.com',
    //         pass: 'Ued0721'
    //     }
    // });
    // var _html= '<div style="font-size:14px; line-height:20px; font-family:SimSun">';
    // var nickName="咱们的小伙伴";
    // var end='一起去看看吧，没准你离大牛又进了一步呢。';
    //
    // if(!params.isSendOut){
    //     nickName="你的小宝贝";
    //     end='请移动你的小鼠标去审核！你的小宝贝一直在等着你哟';
    //     _html+= '<p>亲爱的管理员:</p>';
    //
    // }else{
    //     _html+='<p>亲爱的小伙伴:</p>';
    //
    // }
    // if(params.intro && params.intro.trim() !== ''){
    //     _html+='<p style="text-indent:2em;">你好，'+nickName+params.userName+'在UED部资源共享平台给大家分享了《<a href="http://182.151.214.57:15020'+params.url+'" style="color:#868ef7;font-weight:bold;text-decoration: underline;">'+params.subject+'</a>》，内容大致如下：</p>'+
    //         '<p style="margin-left:2em; padding:15px 10px; border:solid 1px #f5e5e5; background-color:#fff6f6;border-radius:5px;">'+params.intro+'</p>';
    // }else{
    //     _html+='<p style="text-indent:2em;">你好，'+nickName+params.userName+'在UED部资源共享平台给大家分享了《<a href="http://182.151.214.57:15020'+params.url+'" style="color:#868ef7;font-weight:bold;text-decoration: underline;">'+params.subject+'</a>》</p>';
    // }
    // _html+='<div style="margin-left:2em;padding-bottom:20px; border-bottom:dashed 1px #bbadad; ">'+end+'<br/><img src="cid:00000001"/></div>' +
    //     '<p style="text-indent:2em;">共享产生价值，平台版权所有：大旗软件UED部，仅限大旗软件内部员工使用</p></div>';
    //
    // var mailOptions = {
    //     from: 'UED部资源管理中心<ued@daqsoft.com>' ,
    //     to: "小小徐<xul@daqsoft.com>",
    //     subject: params.userName+"分享了《"+params.subject+"》",
    //     html: _html,
    //     attachments: [{
    //         filename:"succeed",
    //         path: path.join(__dirname,"../public/images/succeed.gif"),
    //         cid: '00000001'
    //     }]
    // };
    // if(!params.isSendOut){
    //     mailOptions.attachments= [{
    //         filename:"succeed",
    //         path: path.join(__dirname,"../public/images/love.gif"),
    //         cid: '00000001'
    //     }];
    //     transporter.sendMail(mailOptions, function(error, info){
    //         if(error){
    //             console.error(error);
    //         }else{
    //             console.error('Message sent: ' + info.response);
    //         }
    //     });
    // }else{
    //
    //     db.Member.findAll({where:{email:{$ne:""}}}).then(function(entity){
    //         var recName="";
    //         entity.forEach(function(e){
    //             if(e.email.indexOf("@")>=0){
    //                 recName+= e.name+"<"+ e.email+">,";
    //             }
    //         });
    //         mailOptions.bcc=recName;
    //         mailOptions.to="";
    //         transporter.sendMail(mailOptions, function(error, info){
    //             if(error){
    //                 console.error(error);
    //             }else{
    //                 console.error('Message sent: ' + info.response);
    //             }
    //         });
    //     });
    // }
};

/**
 * 处理图片水印
 * @param imagePath 图片地址
 * @param position 水印位置
 * {
 *  x: 水平位置，数字时单位为像素；字符串可以为‘left’‘center’‘right’，默认为center
 *  y: 垂直位置，数字时单位为像素；字符串可以为‘top’‘center’‘bottom’，默认为center
 * }
 * @param repeat 水印是否重复，true则position无效
 * @param callback function (Buffer image){} 参数为图片buffer
 */
tools.addWatermark = function (imagePath, position, repeat, callback) {
    repeat = repeat || false;
    var watermarkPosition = _.extend({}, {
        x: 'center',
        y: 'center'
    }, position);

    //不是水印图片的真实高宽，为了让水印斜在一条线上
    var watermarkImage = {
        width: 370,
        height: 200
    };

    //获取目标图片的高宽
    gm(imagePath).size(function (err, size) {
        var width = size.width;
        var height = size.height;

        try {
            var targetImage = images(imagePath);
            var coverImage = images(path.join(__dirname, './watermark.png'));

            if (repeat) {
                // 重复水印
                var x = Math.ceil(width / watermarkImage.width); //水平方向循环次数
                var y = Math.ceil(height / watermarkImage.height); //垂直方向循环次数
                for (var i = 0; i < x; i++) {
                    var yStart = 0;

                    if (i % 2 === 1) {
                        yStart = 1;
                    }

                    for (var j = yStart; j < y;) {
                        targetImage.draw(coverImage, i * watermarkImage.width + 10, j * watermarkImage.height);

                        j += 2;
                    }
                }
            } else {
                var horizontal = 0;
                var vertical = 0;
                //指定位置

                if (typeof watermarkPosition.x === 'number') {
                    horizontal = watermarkPosition.x;
                } else if (_.isString(watermarkPosition.x)) {
                    switch (watermarkPosition.x) {
                        case 'left':
                            horizontal = 0;
                            break;
                        case 'center':
                            horizontal = (width - watermarkImage.width) / 2;
                            break;
                        case 'right':
                            horizontal = width - watermarkImage.width;
                            break;
                        default:
                            throw new Error('error');
                            break;
                    }
                } else {
                    throw new Error('error');
                }

                if (typeof watermarkPosition.y === 'number') {
                    vertical = watermarkPosition.y;
                } else if (_.isString(watermarkPosition.y)) {
                    switch (watermarkPosition.y) {
                        case 'top':
                            vertical = 0;
                            break;
                        case 'center':
                            vertical = (height - watermarkImage.height) / 2;
                            break;
                        case 'bottom':
                            vertical = height - watermarkImage.height;
                            break;
                        default:
                            throw new Error('error');
                            break;
                    }
                }

                targetImage.draw(coverImage, horizontal, vertical);
            }

            callback(null, targetImage.encode(imagePath.toLowerCase().indexOf('.png') >= 0 ? 'png' : 'jpg'));
        } catch (e) {
            callback(e, null);
        }
    });
};



module.exports = tools;
