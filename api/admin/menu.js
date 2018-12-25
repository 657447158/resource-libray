
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
    var id = req.query.id;
    var pageSize = +req.query.pageSize || 10;
    var currPage = +req.query.currPage || 1;
    var limit = ' LIMIT ' + (0 + pageSize * (currPage - 1)) + ', ' + pageSize;
    var totalSql = 'SELECT count(*) as total FROM menus';
    var sql = 'SELECT * FROM menus' + limit;
    if (id) {
        sql = 'SELECT * FROM menus WHERE scort LIKE "%,'+ id + ',%"' + limit;
        totalSql = 'SELECT count(*) as total FROM menus WHERE scort LIKE "%,'+ id + ',%"';
    }
    sequelize.query(sql)
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: entity[0],
                page: {}
            }
            var page = {};
            sequelize.query(totalSql)
                .then(function (total) {
                    page = {
                        totalPage: Math.ceil(total[0][0].total / pageSize),
                        pageSize: pageSize,
                        currPage: currPage,
                        total: total[0][0].total
                    }
                    result.page = page;
                    res.json(result)
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


// 获取菜单操作权限列表
api.getMenuOperateList = function (req, res, next) {
    var id = req.query.id;
    var name = req.query.name;
    var pageSize = +req.query.pageSize || 10;
    var currPage = +req.query.currPage || 1;
    var sql = 'SELECT * FROM menus';
    if (name) {
        sql = 'SELECT * FROM menus WHERE name LIKE "%'+ name +'%"';
    }
    if (id) {
        sql = 'SELECT * FROM menus WHERE id = ' + id;
    }
    sequelize.query(sql)
        .then(function (entity) {
            var menuList = entity[0];
            var datas = [];
            for (var i = 0; i < menuList.length; i++) {
                if (menuList[i].permission) {
                    var permissionList = menuList[i].permission.slice(1, -1).split(',');
                    for (var j = 0; j < permissionList.length; j++) {
                        var codeName = '';
                        var code = '';
                        var codeId = +permissionList[j];
                        switch (codeId) {
                            case 1:
                                codeName = '列表';
                                code = 'list';
                                break;
                            case 2:
                                codeName = '新增';
                                code = 'add';
                                break;
                            case 3:
                                codeName = '删除';
                                code = 'del';
                                break;
                            case 4:
                                codeName = '编辑';
                                code = 'edit';
                                break;
                            case 5:
                                codeName = '审核';
                                code = 'audit';
                                break;
                        }
                        datas.push({
                            id: menuList[i].id,
                            name: menuList[i].name,
                            codeName: codeName,
                            code: code,
                            codeId: permissionList[j],
                            url: menuList[i].url
                        });
                    }
                }
            }
            var total = datas.length;
            datas = datas.slice(0 + pageSize * (currPage - 1), 0 + pageSize * (currPage - 1) + pageSize);
            res.json({
                code: 0,
                message: 'success',
                datas: datas,
                page: {
                    totalPage: Math.ceil(total / pageSize),
                    pageSize: pageSize,
                    currPage: currPage,
                    total: total
                }
            })
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

// 获取权限列表
api.getOperateList = function (req, res, next) {
    sequelize.query('SELECT * FROM permission')
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: entity[0]
            }
            res.json(result)
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

// 获取菜单树形结构
api.getTreeDatas = function (req, res, next) {
    sequelize.query('SELECT * FROM menus ORDER BY codeId ASC')
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: []
            }
            var list = entity[0];
            var level1 = [];
            var level2 = [];
            list.forEach(function (item, index) {
                var level = item.level;
                if (level == 1) {
                    level1.push(item);
                }
                if (level == 2) {
                    level2.push(item);
                }
            })
            for (var i = 0; i < level1.length; i++) {
                for (var j = 0; j < level2.length; j++) {
                    if (level2[j].parentId == level1[i].id) {
                        if (!level1[i].children) {
                            level1[i].children = [];
                        }
                        level1[i].children.push(level2[j]);
                    }
                }
            }
            result.datas = level1;
            res.json(result)
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
    option.parentId = req.body.parentId || 0;
    option.url = req.body.url;
    option.icon = req.body.icon;
    option.codeId = req.body.codeId;
    option.level = req.body.level || 1;
    option.permission = req.body.permission;
    option.status = 1;
    db.Menus.create(option)
        .then(function (entity) {
            sequelize.query('CALL updateNodeForMenus()')
                .then(function (data) {
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
    sequelize.query('SELECT * FROM menus WHERE id = ' + id)
        .then(function (entity) {
            var result = {};
            // 查询该栏目有没有子菜单
            sequelize.query('SELECT count(*) total FROM menus WHERE parentId = ' + id)
                .then(function (data) {
                    var total = data[0][0].total;
                    if (total != 0) {
                        // 说明有子菜单
                        result = {
                            code: 1,
                            message: '该菜单有子菜单，不能删除！',
                        }
                        res.json(result)
                    } else {
                        db.Menus.destroy({
                            where: {
                                id: id
                            }
                        }).then(function (entity) {
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
        if (!option.paerntId) {
            option.parentId = 0
        }
        db.Menus.update(option, {
            where: {
                id: id
            }
        }).then(function (entity) {
            sequelize.query('CALL updateNodeForMenus()')
                .then(function (datas) {
                    var result = {};
                    if (entity[0] == 1) { // entity 返回 [1] 表示成功
                        result.code = 0;
                        result.message = 'success';
                    } else { // entity 返回 [0] 表示未找到对应id
                        result.code = 1;
                        result.message = 'Can not find this resource id!';
                    }
                    res.json(result)
                })
                .catch(function (err) {
                    res.json({
                        code: 1,
                        message: err
                    })
                })

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
    sequelize.query('SELECT * FROM menus WHERE id = ' + id)
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                data: entity[0][0]
           }
           res.json(result)
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}


module.exports = api;