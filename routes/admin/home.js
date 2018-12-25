/**
 * 后台管理系统-系统首页
 */
var express = require('express');
var db = require('../../models');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);
var router = express.Router();
var api = require('../../api/admin/home');




/**
 * 静态页面路由-Start
 */
router.all('/index.html', function (req, res) {
    res.render('admin/index');
});

/**
 * 静态页面路由-End
 */

router.get('/list', function (req, res, next) {
    api.getItemsList(req, res, next);
})

/* 获取菜单列表 */
router.all('/menuList', function (req, res, next) {
    api.menuList(req, res, next)
})



// 按月统计上传资源
router.get('/sumSourceByMonth', function (req, res, next) {
    api.sumSourceByMonth(req, res, next);
})


module.exports = router;