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
var api = require('../../api/front');


// 判断当前是否登陆。(应用的每个请求都会执行该中间件)
router.use(function (req, res, next) {
    res.locals.userInfo = {};
    if (req.session.member) {
        res.locals.userInfo = req.session.member;
        next();
    } else {
        var url = req.url.split('.')[0];
        url = url.split('-')[0] + '-' + url.split('-')[1];
        // 这里还要进行处理，当直接访问个人中心页面的时候，应判断是否登录，未登录则不能访问
        if (url === '/per-center') {
            res.redirect('./index.html');
        } else {
            next();
        }
    }
});


/**
 * 静态页面路由统一入口
 */

router.get('/:type.html', function (req, res, next) {
    var type = req.params.type;
    res.render('front/' + type);
})




/*用户登录 start*/
router.post('/login', function (req, res) {
    var user = {
        name: req.body.name || req.query.name,
        pwd: req.body.pwd || req.query.pwd
    };
    //参数检测，密码强度检测（待处理）
    user.pwd = __.ooxx(user.pwd);
    db.Member.find({
        where: {
            name: user.name,
            pwd: user.pwd,
            status: 1
        }
    }).then(function (member) {
        if (member) {
            //保存用户 session
            req.session.member = member;
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;//有效期为一周
            req.session.cookie.httpOnly = true;
            res.json({
                code: 0,
                message: 'success'
            });
        } else {
            //用户名密码错误
            res.json({
                code: 1,
                message: '用户名或密码错误'
            });
        }
    }).catch(function (err) {
        res.status(500).json({code: 1, message: "服务器错误！"});
    });
});

/* 退出登录 */
router.get('/loginOut', function (req, res) {
    if (req.session.user) {
        req.session.member = null;
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


/*
* 首页数据接口-
* 查询资源总数
* */
router.get('/getTotalResource', function (req, res, err) {
    api.getTotalResource(req, res, err);
})

/*
 * 首页数据接口-
 * 获取资源类别及其总条数(搜索框)
 * */
router.get('/getMenusTypeAndCount', function (req, res, err) {
    api.getMenusTypeAndCount(req, res, err);
})


/*
 * 列表页数据接口-
 * 获取一级栏目详情
 * */
router.get('/getChannelDetail', function (req, res, err) {
    api.getChannelDetail(req, res, err);
})

/*
 * 列表页数据接口-
 * 获取子栏目列表
 * */
router.get('/getChannelList', function (req, res, err) {
    api.getChannelList(req, res, err);
})

/*
 * 列表页数据接口-
 * 获取地区
 * */
router.get('/getRegionList', function (req, res, err) {
    api.getRegionList(req, res, err);
})

/*
 * 列表页数据接口-
 * 获取列表内容数据
 * */
router.get('/getListDatas', function (req, res, err) {
    api.getListDatas(req, res, err);
})


/*
 * 个人中心-作品编辑
 * 获取作品类型
 * */
router.get('/getTypeList', function (req, res, next) {
    api.getTypeList(req, res, next);
})

/*
 * 个人中心-作品编辑
 * 获取作品类型---2
 * */
router.get('/getMenusList', function (req, res, next) {
    api.getMenusList(req, res, next);
})

/*
 * 个人中心-信息修改
 * 获取作品类型层级关系列表
 * */
router.get('/getTypeLevelList', function (req, res, next) {
    api.getTypeLevelList(req, res, next);
})

/*
 * 个人中心-信息修改
 * 获取codeName
 * */
router.get('/getCodeNameById', function (req, res, next) {
    api.getCodeNameById(req, res, next);
})


/*
 * 个人中心-作品编辑
 * 获取某类型是否有子菜单
 * */
router.get('/isThisTypeHasChildren', function (req, res, next) {
    api.isThisTypeHasChildren(req, res, next)
})

/*
 * 个人中心-作品编辑
 * 获取格式
 * */
router.get('/getFormatList', function (req, res, next) {
    api.getFormatList(req, res, next)
})

/*
 * 个人中心-作品编辑
 * 获取地区列表
 * */
router.get('/getScenicList', function (req, res, next) {
    api.getScenicList(req, res, next)
})

/*
 * 个人中心-作品编辑
 * 新增作品
 * */
router.post('/upsertProduction', function (req, res, next) {
    api.upsertProduction(req, res, next)
})

/*
 * 个人中心
 * 获取我的作品列表
 * */
router.get('/getMyFiles', function (req, res, next) {
    api.getMyFiles(req, res, next)
})

/*
 * 个人中心
 * 删除未提交审核的作品
 * */
router.post('/deleteMyfile', function (req, res, next) {
    api.deleteMyfile(req, res, next)
})

/*
 * 个人中心
 * 删除暂存附件
 * */
router.post('/deleteAccessory', function (req, res, next) {
    api.deleteAccessory(req, res, next)
})

/*
 * 个人中心
 * 获取作品详情
 * */
router.get('/getProductionDetail', function (req, res, next) {
    api.getProductionDetail(req, res, next)
})

/*
 * 个人中心
 * 提交审核
 * */
router.get('/submitAudit', function (req, res, next) {
    api.submitAudit(req, res, next)
})


/*
 * 个人中心
 * 获取我已上传列表
 * */
router.get('/getAlreadyProduction', function (req, res, next) {
    api.getAlreadyProduction(req, res, next)
})

/*
 * 个人中心
 * 我的收藏/下载
 * */
router.get('/getMyCollectFiles', function (req, res, next) {
    api.getMyCollectFiles(req, res, next)
})

/*
 * 个人中心
 * 修改个人信息
 * */
router.post('/editUserInfo', function (req, res) {
    api.editUserInfo(req, res)
})


/*
 * 列表页
 * 增加或取消收藏记录，增加下载记录
 * */
router.post('/addRecord', function (req, res, next) {
    api.addRecord(req, res, next)
})


/**
 * 设计导航
 * 获取列表内容
 */
router.get('/getDesignDataList', function (req, res, next) {
    api.getDesignDataList(req, res, next)
})

/**
 * 设计导航
 * 获取设计导航菜单
 */
router.get('/getDesignMenus', function (req, res, next) {
    api.getDesignMenus(req, res, next)
})

/**
 * 贡献值
 */
router.get('/getRws', function (req, res, next) {
    api.getRws(req, res, next)
})



module.exports = router;