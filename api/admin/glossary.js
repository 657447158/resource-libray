
var db = require('../../models');
var tools = require('../../utils/tools');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var sequelize = new Sequelize(config.db);
var resource = {};
var api = {};


// 获取系统设置列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;
    var where = {
        parentId: {
            $ne: 0
        },
        type: {
            $ne: '地区'
        }
    };
    if (options.name) {
        where.name = {
            $like: '%' + options.name + '%'
        }
    }

    if (options.parentId) {
        var parentId = options.parentId;
        // 查询出选中元素下所有元素的id
        db.sequelize.query("select queryChildrenAreaInfo(" + parentId + ") as pid").spread(function (entity) {
            var arr = entity[0].pid.split(',')
            where.id = {
                $in: arr
            };
            db.Code.findAndCountAll({
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
        })
    } else {
        db.Code.findAndCountAll({
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

}

// 获取系统设置树形结构
api.getTreeDatas = function (req, res, next) {
    sequelize.query('SELECT * FROM codes WHERE type != "地区" ORDER BY nLevel ASC',{type: sequelize.QueryTypes.SELECT})
        .then(function (codes) {
            var menus = [];
            getMenuTree(0, codes);
            // 根据id生产菜单列表
            function getMenuTree (id, arr) {
                var childArry = getChildArry(id, arr);
                if (id == 0) {
                    menus = childArry
                }
                if (childArry.length > 0) {
                    for (var i = 0; i < childArry.length; i++) {
                        var newArry = getChildArry(childArry[i].id, arr);
                        childArry[i].children = newArry;
                        getMenuTree(childArry[i].id, arr)
                    }
                }
            }
            // 根据id获取下级菜单
            function getChildArry(id, arr) {
                var newArray = new Array();
                for (var i in arr) {
                    if (arr[i].parentId == id) {
                        newArray.push(arr[i])
                    }
                }
                return newArray;
            }
            res.json({
                code: 0,
                message: 'success',
                datas: menus
            })
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

// 新增
api.create = function (req, res, next) {
    var option = {};
    option.name = req.body.name;
    option.type = req.body.type;
    option.parentId = req.body.parentId;
    option.sort = req.body.sort;
    option.deep = req.body.deep;
    option.isMenu = req.body.ismenu;
    option.icon = req.body.icon;
    option.val = req.body.val;
    option.rws = req.body.rws;
    if (req.body.menu) { //0 不是添加的菜单 1 表示添加菜单
        option.isMenu = +req.body.menu
    }

    db.Code.create(option)
        .then(function (entity) {
            db.query('CALL updateNodeForCodes()').then(function () {
                res.json({
                    code: 0,
                    message: 'success'
                })
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
    db.Code.destroy({
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
                message: 'Can not find the menu id!'
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

// 更新
api.update = function (req, res, next) {
    if (req.method === 'POST') {
        var option = req.body;
        var id = +req.body.id;
        db.Code.update(option, {
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
                message: err.message
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

// 获取菜单详情
api.getDetails = function (req, res, next) {
    var id = req.query.id;
    db.Code.findById(id)
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