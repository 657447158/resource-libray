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
var api = require('../../api/admin/member');

/**
 * 动态路由-Start
 */

// 获取用户管理列表
router.get('/getListDatas', function (req, res, next) {
    api.getListDatas(req, res, next)
})

// 获取所有职位
router.get('/getJobTypes', function (req, res, next) {
    api.getJobTypes(req, res, next)
})

// 头像图片裁剪
router.post('/cut', function (req, res, next) {
    api.cutHeadImg(req, res, next)
})

// 新增用户
router.post('/add', function (req, res, next) {
    api.create(req, res, next)
})

// 更新用户信息
router.post('/update', function (req, res, next) {
    api.update(req, res, next)
})

// 获取用户详情
router.get('/getDetails', function (req, res, next) {
    api.getDetails(req, res, next)
})





module.exports = router;
