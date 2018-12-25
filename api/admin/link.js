
var db = require('../../models');
var tools = require('../../utils/tools');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var path = require('path');
var sequelize = new Sequelize(config.db);
var resource = {};
var api = {};


// 获取友情链接列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;
    var where = {};
    if (options.name) {
        where.name = {
            $like: '%' + options.name + '%'
        }
    };
    db.Link.findAndCountAll({
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

// 新增友情链接
api.create = function (req, res, next) {
    if (req.method === 'POST') {
        var option = req.body;
        db.Link.create(option)
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
    } else {
        res.json({
            code: 1,
            message: 'request type error'
        })
    }
}

// 更新友情链接数据
api.update = function (req, res, next) {
    if (req.method === 'POST') {
        var option = req.body;
        if (option.id) {
            db.Link.update(option, {
                where: {
                    id: +option.id
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
                message: '请传入景区id'
            })
        }
    } else {
        res.json({
            code: 1,
            message: 'request type error'
        })
    }
}

// 删除友情链接数据
api.delete = function (req, res, next) {
    var id = req.body.id || req.query.id;
    db.Link.destroy({
        where: {
            id: id
        }
    }).then(function (entity) {
        var result = {}
        if (entity === 1) {
            result = {
                code: 0,
                message: 'success'
            }
        } else {
            result = {
                code: 1,
                message: 'Can not find the scenery id!'
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


module.exports = api;