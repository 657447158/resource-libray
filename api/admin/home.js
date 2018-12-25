/**
 * 后台管理系统-API集合
 */

var db = require('../../models');
var tools = require('../../utils/tools');
// var Thenjs = require('thenjs');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);
var pageSize = 10;
var api = {};


// 获取首页栏目列表
api.getItemsList = function (req, res, next) {
    db.sequelize.query('call getTypeAll();')
        .then(function (entity) {
            res.json({
                code: 0,
                message: 'success',
                datas: entity
            })
        }
    ).catch (function (err) {
        res.json({
            code: 1,
            message: 'fail',
            datas: []
        })
    })
}



// 获取子栏目
api.getSubTypes = function (req, res, next, params) {
    db[params.model].findAll({
        where: {
            parentId: params.parentId
        }
    }).then(function (entity) {
        res.json(entity)
    }).catch (function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}



// 获取菜单列表,并按权限显示菜单列表
// flag: 1 获取全部菜单
api.menuList = function (req, res, next) {
    var flag = req.query.flag;
    // 查找所有菜单
    sequelize.query('SELECT * FROM menus')
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: []
            }
            if (flag == 1) {
                result.datas = entity[0];
                res.json(result);
                return;
            }
            // 查找账号菜单权限
            var userId = req.session.user.id;
            sequelize.query('SELECT * FROM (SELECT * FROM users WHERE id = '+ userId +') AS a, (SELECT * FROM roles) AS b WHERE a.roleCode = b.code')
                .then(function (user) {
                    var menusIds = user[0][0].menusIds.slice(1,-1).split(',');
                    var permissionIds = user[0][0].permissionIds.slice(1, -1).split(';');
                    var arr = entity[0];
                    var list = [];
                    var level1 = [];
                    var level2 = [];
                    list.push(arr[0]);
                    // 返回页面可以直接用的icon图标
                    arr.forEach(function (item, index) {
                        item.icon = '&#' + item.icon + ';'
                    });

                    for (var i = 0; i < arr.length; i++) {
                        for (var j = 0; j < menusIds.length; j++) {
                            if (menusIds[j] == arr[i].codeId) {
                                list.push(arr[i]);
                                list[list.length-1].rolePermission = permissionIds[j];
                            }
                        }
                    }
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
                                if (!level1[i].subMenus) {
                                    level1[i].subMenus = [];
                                }
                                level1[i].subMenus.push(level2[j]);
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
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}


// 按月统计上传资源
api.sumSourceByMonth = function (req, res, next) {
    var year = req.query.year;
    sequelize.query('SELECT COUNT(*) total,DATE_FORMAT(createdAt,"%m") month FROM articles WHERE createdAt LIKE "%'+ year +'%" GROUP BY DATE_FORMAT(createdAt,"%m")')
        .then(function (entity) {
            res.json({
                code: 0,
                message: 'success',
                datas: entity[0]
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