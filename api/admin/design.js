
var db = require('../../models');
var tools = require('../../utils/tools');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var sequelize = new Sequelize(config.db);
var resource = {};
var api = {};


// 获取设计导航列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;
    var where = {
        type: 2
    };
    if (options.parentId && options.parentId != '0') {
        where.scort = {
            $like: '%,' + options.parentId +',%'
        }
    }
    if (options.name) {
        where.name = {
            $like: '%' + options.name + '%'
        }
    }
    db.Designs.findAndCountAll({
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


// 获取设计导航树形结构
api.getTreeDatas = function (req, res, next) {
    sequelize.query('SELECT * FROM designs WHERE type = 1 ORDER BY nLevel ASC',{type: sequelize.QueryTypes.SELECT})
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


// 获取设计导航文件分类 type: 1.查询菜单; 2.查询link链接
api.getType = function (req, res, next) {
    var parentId = req.query.parentId || 0;
    var type = req.query.type || 1;
    sequelize.query('SELECT * FROM designs WHERE parentId = ' + parentId +' AND type = ' + type, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            res.json({
                code: 0,
                message: 'success',
                datas: entity
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
// type: 1.新增菜单 2：新增link链接
api.create = function (req, res, next) {
    var option = {};
    option.name = req.body.name;
    option.parentId = req.body.parentId || 0;
    option.link = req.body.link;
    option.cover = req.body.cover;
    option.info = req.body.info;
    option.sort = req.body.sort;
    option.type = req.body.type;

    db.Designs.create(option)
        .then(function (entity) {
            sequelize.query('call updateNodeForDesign()')
                .then(function () {
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
    sequelize.query('SELECT COUNT(*) total FROM designs WHERE parentId = ' + id)
        .then(function (total) {
            total = total[0][0].total;
            if (total != 0) {
                res.json({
                    code: 1,
                    message: '该菜单有子菜单，不能删除！'
                })
            } else {
                db.Designs.destroy({
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
    db.Designs.findById(id)
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


// 删除上传图片
api.deletePic = function (req, res, next) {

}

module.exports = api;