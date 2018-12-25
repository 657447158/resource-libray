var db = require('../../models');
var tools = require('../../utils/tools');
// var Thenjs = require('../thenjs');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var __ = require('../../utils/__');
var sequelize = new Sequelize(config.db);
var resource = {};
var api = {};


// 获取用户管理列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;
    var where = {};
    if (options.name) {
        where.name = {
            $like: '%' + options.name + '%'
        }
    }
    db.User.findAndCountAll({
        where: where,
        limit: pageSize * 1,//转换为数字
        offset: pageSize * (currPage - 1)
    }).then(function (entity) {
        var result = {
            code: 0,
            message: 'success',
            datas: entity.rows,
            page: {
                total: entity.count,
                currPage: currPage,
                pageSize: pageSize,
                totalPage: Math.ceil(entity.count / pageSize)
            }
        }
        res.json(result)
    }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}

// 新增
api.create = function (req, res, next) {
    var option = {};
    option.name = req.body.username;
    option.pwd = __.ooxx(req.body.password);
    option.NickName = req.body.NickName;
    option.roleCode = req.body.roleCode;
    option.status = req.body.status;

    db.User.create(option)
        .then(function (entity) {
            res.json({
                code: 0,
                message: 'success'
            })
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

// 更新
api.update = function (req, res, next) {
    if (req.method === 'POST') {
        var option = {};
        var id = +req.body.id;
        option.name = req.body.username;
        option.NickName = req.body.NickName;
        option.roleCode = req.body.roleCode;
        option.status = req.body.status;
        if (req.body.password) {
            option.pwd = __.ooxx(req.body.password);
        }
        db.User.update(option, {
            where: {
                id: id
            }
        }).then(function (entity) {
            var result = {};
            if (entity[0] == 1) { // entity 返回 [1] 表示成功
                result.code = 0;
                result.message = 'success';
            } else { // entity 返回 [0] 表示未找到对应id
                result.code = 1;
                result.message = 'Can not find this resource id!';
            }
            res.json(result)
        }).catch(function (err) {
            var result = {
                code: 1,
                message: err
            }
            res.json(result)
        })
    } else {
        res.json({
            code: 1,
            message: 'request type error'
        })
    }
}

// 获取用户详情
api.getDetails = function (req, res, next) {
    var id = req.query.id;
    db.User.findById(id)
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                data: entity
            };
            res.json(result)
        }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}

// 删除
api.delete = function (req, res, next) {
    var id = req.body.id || req.query.id;

    db.User.destroy({
        where: {
            id: id
        }
    }).then(function (entity) {
        res.json({
            code: 0,
            message: 'success'
        })
    })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}


module.exports = api;