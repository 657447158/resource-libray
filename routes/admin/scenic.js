/**
 * 后台管理系统-景区列表路由
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
var api = require('../../api/admin/scenic');

/**
 * 动态路由-Start
 */

// 获取景区列表数据
router.get('/getListDatas', function (req, res, next) {
    api.getListDatas(req, res, next)
})

// 新增景区
router.post('/add', function (req, res, next) {
    api.create(req, res, next)
})

// 编辑景区
router.post('/update', function (req, res, next) {
    api.update(req, res, next)
})

// 删除景区
router.post('/delete', function (req, res, next) {
    api.delete(req, res, next)
})

module.exports = router;
