
var db = require('../../models');
var tools = require('../../utils/tools');
// var Thenjs = require('../thenjs');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);
var resource = {};
var api = {};


// 获取地域文化下属菜单
api.getMenusType = function (req, res, next) {
    var name = req.query.name;
    sequelize.query('SELECT * FROM codes WHERE name = "'+ name + '"')
        .then(function (parent) {
            if (parent[0][0]) {
                db.Code.findAll({
                    where: {
                        parentId: parent[0][0].id
                    }
                }).then(function (menus) {
                    var result = {
                        code: 0,
                        message: 'success',
                        datas: menus
                    }
                    res.json(result);
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

// 获取资源管理列表数据
api.getListDatas = function (req, res, next) {
    var options = req.query;
    var pageSize = +options.pageSize || 10;
    var currPage = +options.currPage || 1;

    // 先按审核状态进行升序排序，确保未审核排在最前面。再按创建时间降序排序，确保最新的数据再最前面。
    var order = [['status','ASC'],['createdAt','DESC']];
    var where = {
        status: {
            $gt: 0
        }
    };
    if (options.parentVal) {
        where.parentVal = options.parentVal
    }
    if (options.username) {
        where.username = {
            $like: '%' + options.username + '%'
        }
    }
    if (options.title) {
        where.title = {
            $like: '%' + options.title + '%'
        }
    }
    db.Article.findAndCountAll({
        where: where,
        limit: pageSize * 1,//转换为数字
        offset: pageSize * (currPage - 1),
        order: order
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

// 获取资源详情
api.getDetails = function (req, res, next) {
    var id = req.query.id;
    db.Article.findById(id)
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                data: entity
            };
            res.json(result)
        }).catch(function (err) {
            console.log(err)
    })
}

// 获取类型菜单(详情)
api.getDetailsMenusType = function (req, res, next) {
    /**
     * 1.查询该资源的详情。（某条资源的详情数据）
     * 2.获取该资源的parentVal值，在Code表里查找parentId=0且val为parentVal的值。（有且只有一个）
     * 3.最后查parentId和上面所查值对应的数据
     */
    db.Article.find({
        where: {
            id: req.query.id
        }
    }).then(function (entity) {
        var codeId = entity.codeId;
        var parentVal = entity.parentVal;
        db.Code.findById(codeId).then(function (deep) {
            var parentId = deep.parentId;
            deep = deep.deep;   // deep 取值 1 2 3
            db.Code.find({
                where: {
                    parentId: 0,
                    val: parentVal
                }
            }).then(function (parent) {
                db.Code.findAll({
                    where: {
                        parentId: parent.id,
                    }
                }).then(function (menus) {
                    if (deep == 2) { // 为2级菜单，即在详情页类型的第一个下拉选择框里。
                        var result = {
                            code: 0,
                            message: 'success',
                            datas: [menus]
                        }
                        res.json(result);
                    } else if (deep == 3) { // 为3级菜单，即在详情页类型的第二个下拉选择框里。
                        db.Code.findAll({
                            where: {
                                parentId: parentId
                            }
                        }).then(function (submenus) {
                            res.json({
                                code: 0,
                                message: 'success',
                                datas: [menus, submenus]
                            })
                        }).catch(function (err) {
                            res.json({
                                code: 1,
                                message: err
                            })
                        })
                    }
                }).catch(function (err) {
                    var result = {
                        code: 1,
                        message: err
                    }
                    res.json(result);
                })
            });

        })
    });
}

// 获取类型菜单子菜单(详情)
api.getDetailsSubMenus = function (req, res, next) {
    var parentId = req.query.parentId
    db.Code.findAll({
        where: {
            parentId: parentId
        }
    }).then(function (entity) {
        var result = {
            code: 0,
            message: 'success',
            datas: entity
        }
        res.json(result)
    }).catch(function (err) {
        console.log(err)
    })
}

/**
 * 保存更新
 * @param req 请求参数 (title, codeName, codeId, keyWord, coverImg, content, sort)
 * @param res
 * @param next
 */
api.update = function (req, res, next) {
    if (req.method === 'POST') {
        var option = req.body;
        option.keyWord = ';' + option.keyWord + ';';
        db.Article.update(option, {
            where: {
                id: option.id
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

// 审核 status 1 通过，0 不通过
api.audit = function (req, res, next) {
    var statusOrg = +req.body.status;
    var id = req.body.id;
    var status;
    if (statusOrg != 1 && statusOrg != 0) {
        res.json({
            code: 1,
            message: '状态码有误！'
        });
        return
    }
    if (statusOrg == 1) { // 通过
        status = 2
    }
    if (statusOrg == 0) { // 不通过
        status = 3
    }
    db.Article.update({
        status: status
    }, {
        where: {
            id: id
        }
    }).then(function (entity) {
        var result = {}
        if (entity[0] == 1) { // 成功
            result = {
                code: 0,
                message: 'success'
            }
        } else if (entity[0] == 0) { // 更新为成功，id未匹配
            result = {
                code: 1,
                message: 'Can not find this resource id!'
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