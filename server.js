var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./models');
var _ = require('lodash');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var router = require('./routes');
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var app = express();
var util = require('./utils/tools.js');
var fs = require('fs');

app.enabled('trust proxy');

// 用.html文件来替换.ejs文件
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('view cache', config['view_cache']);

app.use(logger('dev'));
app.use(bodyParser.json({limit:'500mb'}));  /*设置文本输入的值的大小*/
app.use(bodyParser.urlencoded({limit:'500mb',extended:true}));
app.use(cookieParser());

var dbOption = config.session_option;
var sessionStoreOption = {
    host: dbOption.host || 'localhost',
    port: dbOption.port || 3306,
    user: dbOption.user || 'root',
    password: dbOption.password || 'root' ,
    database: dbOption.database || 'ued-material',
    checkExpirationInterval: 60 * 1000,
    expiration: 7 * 24 * 60 * 60 * 1000,
    createDatabaseTable: true,
    useConnectionPooling: true
};

/**
 * session说明，本来一个系统一个浏览器只能允许一个用户登录，
 * 目前是同一个浏览器允许普通用户和管理员用户同时登陆，使用同一个sessinid，
 * 普通用户用member区分，管理员使用user区分，退出时互不影响。
 * @type {*|exports|module.exports}
 */
var sessionStore = new SessionStore(sessionStoreOption);
app.use(session({
    name: config.appCookieName || 'material',//cookie名称，默认为connect.id
    secret: config.session_secret,
    store: sessionStore,
    resave: false,//有touch方法
    saveUninitialized: false//不保存为初始化的sessiozn
}));

app.locals.moment = moment;
app.locals.moment.locale = 'zh-cn';
app.locals.global = global.global;
app.locals.global_url = "";
app.locals._super =config.super;
app.locals._ = _;
app.locals.setting = global.setting;

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

//记录原画资源id，下一次不用再去查询
global.originalClassification = global.originalClassification || [];

// 处理原画cover水印
app.get('/attached/*', function (req, res, next) {
    var imageAbsolutePath = ''; //绝对路径
    var imageRelativePath = req.originalUrl; //相对路径
    //检测是否是请求图片
    var suffix = /[.jpg|.jpeg|.png]$/;
    if (!suffix.test(imageRelativePath.toLowerCase())) {
        next();
        return;
    }

    imageAbsolutePath = path.join(__dirname, 'public', imageRelativePath);
    fs.exists(imageAbsolutePath, function (exists) {
        if (exists) {//28452原创手绘
            //判断是否是大图，大图则去掉扩展名查数据库存的路径
            var extraPathIndex = imageRelativePath.indexOf('1280_w');
            if (extraPathIndex >= 0) {
                imageRelativePath = imageRelativePath.slice(0, extraPathIndex);
            }

            //查询请求的图片是否在数据库中存在，如果在则查询父类链，判断是否包含原创分类
            db.Article.find({
                where: {
                    coverImg: imageRelativePath
                }
            }).then(function (result) {
                //资源为原创手绘
                if (result) {
                    var resouceCodeId = result.codeId;

                    //属于原画直接加水印
                    if (global.originalClassification.indexOf(resouceCodeId) >= 0) {
                        util.addWatermark(
                            imageAbsolutePath,
                            null,
                            true,
                            function (error, image) {
                                if (!error) {
                                    res.write(image);
                                    res.end();
                                } else {
                                    res.status(500).json({
                                        code: 1,
                                        message: 'server error'
                                    });
                                }
                            }
                        );
                    } else {
                        var classificationIds = [];
                        //查询分类链
                        function getChain(id, cb) {
                            classificationIds.push(id);
                            db.Code.findById(id).then(function (result) {
                                if (result && result.parentId !== 0) {
                                    getChain(result.parentId, cb);
                                } else {
                                    cb();
                                }
                            });
                        }

                        getChain(resouceCodeId, function () {
                            //查看链中是否包含28452
                            if (classificationIds.indexOf(28452) < 0) {
                                next();
                                return;
                            }

                            //记录原画分类id
                            global.originalClassification.push(resouceCodeId);
                            util.addWatermark(
                                imageAbsolutePath,
                                null,
                                true,
                                function (error, image) {
                                    if (!error) {
                                        res.write(image);
                                        res.end();
                                    } else {
                                        res.status(500).json({
                                            code: 1,
                                            message: 'server error'
                                        });
                                    }
                                }
                            );
                        });
                    }
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'json')));

router(app);
process.on('uncaughtException', function (err) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});
if ("development1" === app.get('env') || "production" === app.get('env')) {

    app.use(function (req, res, next) {
        res.status(404).redirect('/hint/404.html');
    });
    app.use(function (err, req, res, next) {
        if(err.message.indexOf("Failed to lookup view")>=0){
            res.status(404).redirect('/hint/404.html');
        }else{
            res.status(500).redirect('/hint/500.html');
        }
    });
}

app.set('port', config.port);

module.exports = app;

// app.set('port', config.port);
// var server = http.createServer(app);
// server.listen(config.port);
// console.log('visit http://localhost:'+config.port);
