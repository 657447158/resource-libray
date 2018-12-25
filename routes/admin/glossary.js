/**
 * 后台管理系统-系统设置路由
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
var router = express.Router();
var api = require('../../api/admin/glossary');

/**
 * 动态路由-Start
 */

// 获取系统设置列表
router.get('/getListDatas', function (req, res, next) {
    api.getListDatas(req, res, next)
})

// 获取系统设置树形结构
router.get('/getTreeDatas', function (req, res, next) {
    api.getTreeDatas(req, res, next)
})


// 新增菜单
router.post('/add', function (req, res, next) {
    api.create(req, res, next)
})

// 删除菜单
router.post('/delete', function (req, res, next) {
    api.delete(req, res, next)
})

// 更新菜单信息
router.post('/update', function (req, res, next) {
    api.update(req, res, next)
})

// 获取菜单详情
router.get('/getDetails', function (req, res, next) {
    api.getDetails(req, res, next)
})





module.exports = router;
