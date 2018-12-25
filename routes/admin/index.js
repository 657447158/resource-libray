/**
 * 后台管理系统-路由聚合页
 */

var express = require('express');
var router = express.Router();
var __ = require('../../utils/__');
var tools = require('../../utils/tools');

var db = require('../../models');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);

var home = require('./home');
var resource = require('./resource');
var member = require('./member');
var user = require('./user');
var scenic = require('./scenic');
var link = require('./link');
var glossary = require('./glossary');
var menu = require('./menu');
var regional = require('./regional');
var role = require('./role');
var design = require('./design');
var adminInfo = {};




// 判断当前是否登陆。(应用的每个请求都会执行该中间件)
router.use(function (req, res, next) {
    if (req.session.user) {
        adminInfo = req.session.user;
        //session存在，如果不是登陆则继续，是则直接跳转到主页
        if (req.url !== config.adminLoginPath) {
            next();
        } else {
            res.redirect('/admin');
        }
    } else {
        adminInfo = {}
        next();
    }
});

/* 查权限 */
router.use(function (req, res, next) {
    var user = req.session.user;
    if (!user) {
        next()
    } else {
        var sql = 'SELECT * FROM (SELECT * FROM users WHERE id = '+ user.id +') AS a, (SELECT * FROM roles) AS b WHERE a.roleCode = b.code';
        sequelize.query(sql)
            .then(function (entity) {
                var data = entity[0][0];
                var permission = data.permissionIds.slice(1,-1).split(';');
                var menus = data.menusIds.slice(1,-1).split(',');
                var operation  = {};
                sequelize.query('SELECT codeId, codeName, name FROM menus', {type: sequelize.QueryTypes.SELECT})
                    .then(function (dataList) {
                        for (var i = 0; i < dataList.length; i++) {
                            for (var j = 0; j < menus.length; j++) {
                                if (menus[j] == dataList[i].codeId) {
                                    var menu = dataList[i].codeName;
                                    operation[menu] = {
                                        add: false,
                                        del: false,
                                        edit: false,
                                        audit: false
                                    }
                                    var per = permission[j].split(',')
                                    for (var k = 0; k < per.length; k++) {
                                        switch (+per[k]) {
                                            case 2:
                                                operation[menu].add = true;
                                                break;
                                            case 3:
                                                operation[menu].del = true;
                                                break;
                                            case 4:
                                                operation[menu].edit = true;
                                                break;
                                            case 5:
                                                operation[menu].audit = true;
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                        user.operation = operation;
                        next();
                    })
                    .catch(function (err) {
                        res.json({
                            code: 1,
                            message: err
                        })
                    })
            })
            .catch(function (err) {
                res.json({
                    code: 1,
                    message: err
                })
            })

    }

})


// 框架加载
router.get('/', function (req, res, next) {
    res.render('admin/home', {adminInfo: adminInfo});
});

// 登录页面 (沿用之前的)
router.get('/login.html', function (req, res, next) {
    //生成验证码以及验证码图片
    var verifyCode = tools.verificationCode();
    req.session.captcha = verifyCode.code;//数字
    res.render('admin/login', {verifyCode: verifyCode.base64});
});


/**
 * 静态页面路由统一入口
 */

router.get('/:type/:subType.html', function (req, res, next) {
    var type = req.params.type;
    var subType = req.params.subType;
    res.render('admin/' + type + '/' + subType, {adminInfo: adminInfo});
})


/*登陆 start*/
router.post('/login', function (req, res) {
    var obj = __.pojo(req.body, ["name", 'pwd', "verification"]);
    obj.pwd = __.ooxx(obj.pwd);
    var _coding = req.session.captcha.toString();
    if (obj.verification != _coding) {
        res.json({error: -2, msg: "验证码错误"});
    } else {
        db.User.find({where: {name: obj.name, pwd: obj.pwd}}).then(function (user) {
            if (user) {
                //保存用户 session
                req.session.user = user;
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;//有效期为一周
                req.session.cookie.httpOnly = true;
                res.json({error: 0});
            } else {
                //用户名密码错误
                res.json({error: -1, msg: "用户名或密码错误"});
            }
        });
    }
});

/* 退出登录 */
router.get('/loginOut', function (req, res) {
    if (req.session.member) {
        req.session.user = null;
    } else {
        //用户退出，删除会话
        req.sessionStore.destroy(req.sessionID, function (error) {
            if (error) {
                //删除失败，则重置
                req.session.destroy();
            }
        });
    }
    res.json({
        code: 0,
        message: 'success'
    })
})







router.use('/', home);
router.use('/resource', resource);
router.use('/user', user);
router.use('/member', member);
router.use('/scenic', scenic);
router.use('/link', link);
router.use('/glossary', glossary);
router.use('/menu', menu);
router.use('/regional', regional);
router.use('/role', role);
router.use('/design', design);

module.exports = router;