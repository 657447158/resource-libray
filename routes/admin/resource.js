/**
 * 后台管理系统-资源管理路由
 */
var express = require('express');
var __ = require('../../utils/__');
var tools = require('../../utils/tools');
var db = require('../../models');
var fs = require('fs');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var path = require('path');
var uuid = require('node-uuid');
var moment = require('moment');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);
var gm = require('gm').subClass({imageMagick: true});
var router = express.Router();
var fs = require('fs');
var api = require('../../api/admin/resource');


/**
 * 动态路由-Start
 */

// 获取资源管理列表数据
router.get('/getList', function (req, res, next) {
    api.getListDatas(req, res, next);
});

// 获取资源管理分类(列表)
router.get('/getMenusType', function (req, res, next) {
    api.getMenusType(req, res, next)
});

// 获取资源详情
router.get('/getDetails', function (req, res, next) {
    api.getDetails(req, res, next)
})

// 获取类型下拉菜单(详情)
router.get('/getDetailsMenusType', function (req, res, next) {
    api.getDetailsMenusType(req, res, next)
})

// 获取类型下拉子菜单(详情)
router.get('/getDetailsSubMenus', function (req, res, next) {
    api.getDetailsSubMenus(req, res, next)
})

// 保存更新
router.post('/update', function (req, res, next) {
    api.update(req, res, next)
})

// 审核
router.post('/audit', function (req, res, next) {
    api.audit(req, res, next)
})




module.exports = router;