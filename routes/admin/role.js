/**
 * 后台管理系统-用户管理路由
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
var api = require('../../api/admin/role');

/**
 * 动态路由-Start
 */

// 获取角色管理列表
router.get('/getListDatas', function (req, res, next) {
    api.getListDatas(req, res, next)
})


// 新增角色
router.post('/add', function (req, res, next) {
    api.create(req, res, next)
})

// 删除角色
router.post('/delete', function (req, res, next) {
    api.delete(req, res, next)
})

// 更新角色信息
router.post('/update', function (req, res, next) {
    api.update(req, res, next)
})

// 获取角色详情
router.get('/getDetails', function (req, res, next) {
    api.getDetails(req, res, next)
})





module.exports = router;
