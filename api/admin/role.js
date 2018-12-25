
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



// 获取角色管理列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;
    var limit = ' LIMIT ' + (0 + pageSize * (currPage - 1)) + ', ' + pageSize;
    var where = '';
    if (options.name) {
        where = ' WHERE name LIKE "%' + options.name + '%"';
    }
    // 先查总数
    sequelize.query('SELECT COUNT(*) total FROM roles')
        .then(function (data) {
            var total = data[0][0].total;
            var page = {
                totalPage: Math.ceil(total / pageSize),
                pageSize: pageSize,
                currPage: currPage,
                total: 0
            }
            var result = {
                code: 0,
                message: 'success',
                datas: [],
                page: page
            }
            if (total != 0) {
                sequelize.query('SELECT * FROM roles' + where + limit)
                    .then(function (roles) {
                        page.total = total;
                        result.datas = roles[0];
                        res.json(result)
                    })
                    .catch(function (err) {
                        res.json({
                            code: 1,
                            message: err
                        })
                    })
            } else {
                res.json(result)
            }
        })

}


// 新增
api.create = function (req, res, next) {
    var option = {};
    option.name = req.body.name;
    option.code = req.body.code;
    option.status = 1;
    option.menusIds = req.body.menusIds;
    option.permissionIds = req.body.permissionIds;

    db.Roles.create(option)
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


// 删除
api.delete = function (req, res, next) {
    var id = req.body.id || req.query.id;

    db.Roles.destroy({
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

// 更新
api.update = function (req, res, next) {
    if (req.method === 'POST') {
        var option = {};
        var id = +req.body.id;
        option.name = req.body.name;
        option.code = req.body.code;
        option.status = 1;
        option.menusIds = req.body.menusIds;
        option.permissionIds = req.body.permissionIds;

        db.Roles.update(option, {
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
    db.Roles.findById(id)
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


module.exports = api;