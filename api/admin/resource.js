
var db = require('../../models');
var tools = require('../../utils/tools');
// var Thenjs = require('../thenjs');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.db);
var moment = require('moment');
var resource = {};
var api = {};


// 获取类型菜单(列表)
api.getMenusType = function (req, res, next) {
    db.Code.findAll({
        where: {
            parentId: 0,
            isMenu: 1
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
    var id = req.query.id;
    sequelize.query('SELECT a.codeId, c.* FROM articles a, codes c WHERE a.codeId = c.id AND a.id = ' + id, {type: sequelize.QueryTypes.SELECT})
        .then(function (codes) {
            var scorts = codes[0].scort.slice(1,-1);
            var deep = codes[0].deep;
            sequelize.query('SELECT * FROM codes WHERE parentId in('+ scorts +') OR (parentId = 0 AND isMenu = 1) ORDER BY nLevel ASC', {type: sequelize.QueryTypes.SELECT})
                .then(function (entity) {
                    var menus = [];
                    getMenuTree(0, entity);

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
                        data: {
                            scorts: scorts,
                            deep: deep,
                            menus: menus
                        }
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
        res.json({
            code: 1,
            message: err
        })
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

/**
 * 审核 status 1 通过，0 不通过
 * 分值：上传图库：0.1；上传素材：0.2；上传资料：0.2；上传案例\模板：1；上传资料（原创）：2；
 */
api.audit = function (req, res, next) {
    var statusOrg = +req.body.status;
    var id = req.body.id;
    var userId = req.body.userId;
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
    // 先查资源数据
    db.Article.find({
        where: {
            id: id
        }
    }).then(function (entity) {
        var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        // 添加贡献值
        sequelize.query('call operRws (' + entity.userId + ',"' + entity.userName + '",' + entity.id + ',"' + entity.title + '",' + entity.codeId + ',"+","' + time + '")').spread(function () {});
        // 更新资源状态
        entity.updateAttributes({status: status}).then(function (e) {
            if (status === 2) {
                result = {
                    code: 0,
                    message: 'success'
                }
            } else if (status === 3) {
                // 审核未通过
                result = {
                    code: 2,
                    message: 'success'
                }
            }
            res.json(result)
        });
    })
}

module.exports = api;