/*
 * 前台页面API
 * */

var db = require('../../models');
var tools = require('../../utils/tools');
var config = require('../../config.json')[process.env.NODE_ENV || 'development'];
var Sequelize = require('sequelize');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var fs = require('fs');
var __ = require('../../utils/__');
var sequelize = new Sequelize(config.db);
var api = {};


// 首页-获取资源总数
api.getTotalResource = function (req, res, err) {
    sequelize.query('SELECT count(*) as total FROM articles WHERE status=2', {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                total: entity[0].total
            }
            res.json(result)
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            });
        })
}

// 首页-获取资源类别及其总条数(搜索框)
api.getMenusTypeAndCount = function (req, res, next) {
    var sql = 'select c.name,c.val,count(*) total from articles a ,codes c where a.parentVal = c.val and c.isMenu = 1 and parentId = 0 and a.status = 2 group by parentVal';
    var parentVal = req.query.parentVal;
    if (parentVal) {
        sql = 'SELECT COUNT(*) total FROM articles WHERE status = 2 AND parentVal = "' + parentVal + '"';
    }
    sequelize.query(sql, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: entity
            };
            if (parentVal) {
                result = {
                    code: 0,
                    message: 'success',
                    data: entity[0]
                }
            }
            res.json(result);
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            });
        })
}

// 资料-获取一级栏目详情
api.getChannelDetail = function (req, res, next) {
    var val = req.query.val;
    var parentId = 0;
    sequelize.query('SELECT * FROM codes WHERE val="' + val + '" AND parentId = 0 AND isMenu = 1', {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            var resutl = {
                code: 0,
                message: 'success',
                data: entity[0]
            }
            res.json(resutl)
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

// 资料-获取子栏目列表
api.getChannelList = function (req, res, next) {
    var level = req.query.level;
    var id = parseInt(req.query.id) || 0;
    var channelSQL = 'SELECT id, nLevel, name, parentId, scort, type, val, deep FROM codes WHERE scort LIKE "%,' + id + ',%" AND nlevel = ' + level;
    var totalSQL = 'SELECT c.id, c.name,c.scort,count(*) as total FROM articles a LEFT JOIN codes c on a.codeid = c.id WHERE a.status = 2 AND  c.scort LIKE "%,' + id + ',%"  GROUP BY c.scort ORDER BY scort';
    // 1.查出对应一级栏目下的子栏目
    sequelize.query(channelSQL)
        .then(function (channel) {
            var channelList = channel[0];
            // 2.查询对应一级栏目下所有栏目和各自栏目下所挂载资源总数
            sequelize.query(totalSQL)
                .then(function (entity) {
                    var totalList = entity[0];
                    // 3.代码操作：合并同一栏目下的资源总数
                    for (var i = 0; i < channelList.length; i++) {
                        var regObj = new RegExp(channelList[i].scort);
                        channelList[i].total = 0;
                        /**
                         * cLevel等于:
                         *   0 or 1: 没有下级栏目
                         *   其他：有下级栏目
                         */
                        channelList[i].cLevel = 0;
                        channelList[i].codeid = '';
                        for (var j = 0; j < totalList.length; j++) {
                            if (regObj.test(totalList[j].scort)) {
                                channelList[i].cLevel++;
                                channelList[i].total += totalList[j].total;
                                // 给该栏目添加下属所有栏目的id
                                channelList[i].codeid += totalList[j].id + ',';
                            }
                        }
                    }
                    var result = {
                        code: 0,
                        message: 'success',
                        datas: channelList
                    }
                    res.json(result)
                })
        })
}

/**
 * 资料-获取列表数据
 * 查询一级栏目 只需参数parentVal。
 * 查询非一级栏目，传入该栏目下所有子栏目（包括该栏目）的id。用字符串形式，用英文逗号分隔 '2000,2001,2002'
 */
api.getListDatas = function (req, res, next) {
    var page = {
        totalPage: 1,
        pageSize: +req.query.pageSize || 10,
        currentPage: +req.query.currentPage || 1,
        total: 0
    };
    var keywords = req.query.keywords;
    var isScenic = req.query.isScenic; // 是否为景区
    var scenicId = req.query.scenicId; // 景区id
    var codesId = req.query.codesId;
    var parentVal = req.query.parentVal;
    var region = req.query.region;
    var limit = ' LIMIT ' + (0 + page.pageSize * (page.currentPage - 1)) + ', ' + page.pageSize;
    var listSql = 'SELECT * FROM articles WHERE status = 2 ORDER BY createdAt DESC' + limit;
    var totalSql = 'SELECT COUNT(*) as total FROM articles WHERE status = 2';
    if (parentVal) { // 查询一级菜单下的内容
        listSql = 'SELECT * FROM articles WHERE status = 2 AND parentVal = "' + parentVal + '" ORDER BY createdAt DESC' + limit;
        totalSql = 'SELECT COUNT(*) as total FROM articles WHERE status = 2 AND parentVal = "' + parentVal + '"';
    }
    if (codesId) {// 查询非一级菜单下的内容
        listSql = 'SELECT * FROM articles WHERE status = 2 AND FIND_IN_SET(codeId, "' + codesId + '") ORDER BY createdAt DESC' + limit;
        totalSql = 'SELECT count(*) as total FROM articles WHERE status = 2 AND FIND_IN_SET(codeId, "' + codesId + '")';
    }

    if (parentVal === 'picture' && isScenic == 'false') { // 如果是查询图片
        var vagueRegion;
        var reg = /^[0-9]*[1-9][0-9]*$/;
        if (region == 100000) {
            listSql = 'SELECT * FROM articles WHERE status = 2 AND parentVal = "picture" ORDER BY createdAt DESC' + limit;
            totalSql = 'SELECT COUNT(*) as total FROM articles WHERE status = 2 AND parentVal = "picture"';
        } else {
            if (reg.test(region / 10000)) { // 省或直辖市
                vagueRegion = parseInt(region / 10000)
            } else if (reg.test(region / 100)) { // 市
                vagueRegion = parseInt(region / 100)
            } else {
                vagueRegion = region
            }
            listSql = 'SELECT * FROM articles WHERE status = 2 AND regionsId LIKE "' + vagueRegion + '%"' + limit;
            totalSql = 'SELECT COUNT(*) as total FROM articles WHERE status = 2 AND regionsId LIKE "' + vagueRegion + '%"';
        }
    }

    if (parentVal === 'picture' && isScenic == 'true') { // 查询景区
        totalSql = 'SELECT COUNT(*) as total FROM articles WHERE status = 2 AND scenicId = ' + scenicId + ' ORDER BY createdAt DESC';
        listSql = 'SELECT * FROM articles WHERE status = 2 AND scenicId = ' + scenicId;
    }

    if (keywords) {
        var val = '';
        if (parentVal) {
            val = ' AND parentVal = "' + parentVal + '"';
        }
        // 搜索查询
        totalSql = 'SELECT COUNT(*) total FROM articles WHERE status = 2 AND (title LIKE "%' + keywords + '%" OR keyWord LIKE "%' + keywords + '%")' + val;
        listSql = 'SELECT * FROM articles WHERE status = 2 AND (title LIKE "%' + keywords + '%" OR keyWord LIKE "%' + keywords + '%")' + val;
    }
    // 先查总数
    sequelize.query(totalSql, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            page.total = entity[0].total;
            page.totalPage = Math.ceil(page.total / page.pageSize);
            // 再进行分页查询
            sequelize.query(listSql)
                .then(function (entity) {
                    var result = {
                        code: 0,
                        message: 'success',
                        datas: entity[0],
                        page: page
                    }
                    // 这里查询用户的收藏列表
                    if (req.session.member) {
                        var userId = req.session.member.id;
                        sequelize.query('SELECT * FROM loves WHERE type = 2 AND userId = ' + userId)
                            .then(function (loves) {
                                loves = loves[0];
                                articles = entity[0];
                                for (var i = 0; i < articles.length; i++) {
                                    for (var j = 0; j < loves.length; j++) {
                                        if (loves[j].tId == articles[i].id) {
                                            articles[i].love = true
                                        }
                                    }
                                }
                                result.datas = articles;
                                res.json(result)
                            })
                    } else {
                        res.json(result)
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


/*获取城市[前台列表页面筛选使用]*/
api.getRegionList = function (req, res) {
    var coding = req.query.coding,
        level = req.query.level,
        type = req.query.type,
        isScenic = req.query.isScenic,
        l = 6,
        _str = "";
    if (level == 1) {
        l = 2;
        _str = "0000";
    } else if (level == 2) {
        l = 6;
        _str = "";
    }
    if (type == "case" || type == "picture") {
        if (isScenic == 'false') {
            db.RegionT.findOne({
                where: {
                    pregion: coding
                }
            }).then(function (region) {
                if (region) {
                    if (level != region.level) {
                        l = 6;
                        _str = "";
                    }
                    db.sequelize.query('call getRegion (' + l + ',' + coding + ',"' + _str + '","' + type + '");')
                        .then(function (entity) {
                            db.sequelize.query('call getScenic (' + (coding / 100) + ',"' + type + '");')
                                .then(function (scenic) {
                                    var result = {
                                        code: 0,
                                        message: 'success',
                                        data: {
                                            regions: entity,
                                            scenic: scenic
                                        }
                                    }
                                    res.json(result);
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
                } else {
                    db.sequelize.query('call getScenic (' + coding + ',"' + type + '");')
                        .then(function (scenic) {
                            var result = {
                                code: 0,
                                message: 'success',
                                data: {
                                    regions: [],
                                    scenic: scenic
                                }
                            }
                            res.json(result);
                        });
                }
            }).catch(function (err) {
                res.json({
                    code: 1,
                    message: err
                })
            })
        } else {
            db.sequelize.query('call getScenic (' + coding + ',"' + type + '");')
                .then(function (entity) {
                    var result = {
                        code: 0,
                        message: 'success',
                        datas: entity
                    }
                    res.json(result);
                })
                .catch(function (err) {
                    res.json({
                        code: 1,
                        message: err
                    })
                })
        }
    } else {
        db.sequelize.query('call getType ("' + type + '",0);').then(function (entity) {
            res.json({data: {}, scenic: entity});
        });
    }
};


/* 个人中心-上传-获取类型列表 */
api.getTypeList = function (req, res, next) {
    var id = req.query.id;
    var level = req.query.level || 0;
    var sql = '';
    if (level != 0) {
        // 查询下级菜单
        sql = 'SELECT * FROM codes WHERE scort LIKE "%,' + id + ',%" AND nLevel = ' + level;
    } else {
        // 查询一级菜单
        sql = 'SELECT * FROM codes WHERE parentId = 0 AND isMenu = 1';
    }
    sequelize.query(sql)
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


/* 个人中心-上传-获取类型列表-2 */
api.getMenusList = function (req, res, next) {
    var id = req.query.id;
    sequelize.query('SELECT * FROM codes WHERE parentId = ' + id, {type: sequelize.QueryTypes.SELECT})
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

/* 个人中心-上传-修改信息时显示之前类型的层级关系 */
api.getTypeLevelList = function (req, res, next) {
    var id = req.query.id;
    sequelize.query('SELECT * FROM codes WHERE id = ' + id, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            var nLevel = entity[0].nLevel;
            var scorts = entity[0].scort.slice(1, -1).split(',');
            sequelize.query('SELECT * FROM codes WHERE nLevel <= ' + nLevel + ' and type != "地区" and type != "格式" and type != "职位分类" ORDER BY nLevel asc', {type: sequelize.QueryTypes.SELECT})
                .then(function (codes) {
                    var menus = [];
                    getMenuTree(0, codes);

                    // 根据id生成菜单列表
                    function getMenuTree(id, arr) {
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
                            deep: nLevel,
                            scorts: scorts,
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


/* 个人中心-上传-获取codeName */
api.getCodeNameById = function (req, res, next) {
    var id = req.query.id;
    sequelize.query('SELECT name FROM codes WHERE id = ' + id)
        .then(function (entity) {
            res.json({
                code: 0,
                message: 'success',
                data: {
                    codeName: entity[0][0].name
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


/* 获取某类型是否有子菜单 */
api.isThisTypeHasChildren = function (req, res, next) {
    var id = req.query.id;
    // var nLevel = req.query.level;
    // sequelize.query('SELECT count(*) as total FROM codes WHERE scort LIKE "%,'+ id +',%" AND nLevel = '+ nLevel)
    //     .then(function (entity) {
    //         var result = {
    //             code: 0,
    //             message: 'success',
    //             hasChildren: true
    //         }
    //         if (entity[0][0].total == 0) {
    //             result.hasChildren = false
    //         }
    //         res.json(result)
    //     })

    sequelize.query('SELECT * FROM codes WHERE parentId = ' + id, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success'
            }
            if (entity.length == 0) {
                result.code = -1
            }
            res.json(result)
        })

}

/* 获取格式列表 */
api.getFormatList = function (req, res, next) {
    sequelize.query('SELECT * FROM codes WHERE type="格式" AND parentId != 0')
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

/* 获取景区列表 */
api.getScenicList = function (req, res, next) {
    var regionId = req.query.regionId;
    var sql = 'SELECT * FROM codes WHERE type = "地区" AND regionsId = ' + regionId;
    // 处理直辖市
    if (regionId == 110000 || regionId == 120000 || regionId == 310000 || regionId == 500000 || regionId == 710000 || regionId == 810000 || regionId == 820000) {
        regionId = regionId.slice(0, 3);
        sql = 'SELECT * FROM codes WHERE type = "地区" AND regionsId LIKE "' + regionId + '%"'
    }
    sequelize.query(sql)
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

/**
 * 个人中心-获取我要上传文件列表
 * @param userId    用户Id
 * @param status    0: 未提交审核 1.用户已提交审核，后台还未审核 2.审核通过 3未通过  4.批量添加的图片，暂存。
 */
api.getMyFiles = function (req, res, next) {
    var userId = req.query.userId;
    var status = req.query.status;
    if (typeof status === 'object' && status.length > 0) {
        var str = ''
        for (var i = 0; i < status.length; i++) {
            if (i < status.length - 1) {
                str += status[i] + ' OR status = '
            } else {
                str += status[i]
            }
        }
        status = str
    }
    sequelize.query('SELECT * FROM articles WHERE userId = ' + userId + ' AND ( status =' + status + ' )')
        .then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: entity[0]
            };
            res.json(result)
        })
        .catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
}

/**
 * 保存作品编辑内容
 * @param id                   资源ID，不传为新增，反之则为更新
 * @param title                作品名称（必传）
 * @param codeName             作品类型（必传）
 * @param codeId               类型codeId（必传）
 * @param source               作品来源（必传）
 * @param keyWord              关键字（必传）
 * @param coverImg             封面图（除开图片类型，其他都为必传）
 * @param uploadFileSrc        附件地址
 * @param sourceSrc            PPT地址（上传PPT用）
 * @param sourceName           PPT名称（上传PPT用）
 * @param format               附件格式（有附件则必传）
 * @param fieldsSize           附件大小（有附件则必传）
 * @param fileName             附件名称（有附件则必传）
 * @param proContent           作品内容（必传）
 */
api.upsertProduction = function (req, res, next) {
    var params = {};
    params.id = req.body.id;
    params.userId = req.body.userId;
    params.userName = req.body.userName;
    params.title = req.body.title;
    params.codeName = req.body.codeName;
    params.codeId = req.body.codeId;
    params.source = req.body.source;
    params.coverImg = req.body.coverImg;
    if (req.body.status) {
        params.status = req.body.status;
    } else {
        params.status = 0
    }
    if (req.body.uploadFileSrc) {
        params.download = req.body.uploadFileSrc;
    }
    if (req.body.sourceSrc) {
        params.sourceSrc = req.body.sourceSrc;
    }
    if (req.body.sourceName) {
        params.sourceName = req.body.sourceName;
    }
    if (req.body.format) {
        params.format = req.body.format;
    }
    if (req.body.fieldsSize) {
        params.size = req.body.fieldsSize;
    }
    if (req.body.fileName) {
        params.fileName = req.body.fileName;
    }
    if (req.body.proContent) {
        params.content = req.body.proContent;
    }
    if (req.body.regionsId) {
        params.regionsId = req.body.regionsId;
    }
    if (req.body.scenicId) {
        params.scenicId = req.body.scenicId;
    }
    if (req.body.scenic) {
        params.scenic = req.body.scenic;
    }
    if (req.body.timestamp) {
        params.timestamp = req.body.timestamp;
    }
    if (req.body.author) {
        params.author = req.body.author;
    }
    if (req.body.fileMD5) {
        params.fileMD5 = req.body.fileMD5;
    }
    var keyWord = req.body.keyWord;
    if (keyWord) {
        if (keyWord.slice(0, 1) !== ';') {
            keyWord = ';' + keyWord
        }
        if (keyWord.slice(-1) !== ';') {
            keyWord = keyWord + ';'
        }
        params.keyWord = keyWord;
    }
    getParentVal(params.codeId, function (parentVal) {
        params.parentVal = parentVal;
        gm(path.join(__dirname, '../../public/' + params.coverImg)).size(function (err, size) {
            if (!err) {
                params.w = size.width;
                params.h = size.height;
                if (params.id) {
                    // 执行更新操作
                    db.Article.update(params, {
                        where: {
                            id: params.id
                        }
                    }).then(function (entity) {
                        res.json({
                            code: 0,
                            message: 'success'
                        })
                    }).catch(function (err) {
                        res.json({
                            code: 1,
                            message: err
                        })
                    })
                } else {
                    // 执行新增操作
                    db.Article.create(params).then(function (entity) {
                        res.json({
                            code: 0,
                            message: 'success',
                            data: entity
                        })
                    }).catch(function (err) {
                        res.json({
                            code: 1,
                            message: err
                        })
                    })
                }
            } else {
                res.json({
                    code: 1,
                    message: err
                })
            }
        })
    })
}


/**
 * 删除还未提交审核的文件
 * @param id    资源id
 */
api.deleteMyfile = function (req, res, next) {
    var id = req.body.id;
    db.Article.destroy({
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

/**
 * 删除暂存附件
 * @param id    资源id
 */
api.deleteAccessory = function (req, res, next) {
    var id = req.body.id;
    db.Article.findById(id).then(function (entity) {
        if (entity.download) {
            var filePath = path.resolve(__dirname, '../../public' + entity.download);
            fs.unlink(filePath, function (err) {
                if (err) {
                    throw err;
                }
                var option = {
                    fileName: '',
                    download: '',
                    size: 0,
                    format: ''
                }
                db.Article.update(option, {
                    where: {
                        id: id
                    }
                }).then(function (data) {
                    res.json({
                        code: 0,
                        message: 'success'
                    })
                }).catch(function (err) {
                    res.json({
                        code: 1,
                        message: err
                    })
                })
            })
        }
    }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}


/**
 * 获取作品信息详情
 * @param id            资源id
 * @param browseFlag    1:增加浏览次数; 0: 不增加浏览次数（此接口在个人中心编辑作品的时候也会调用，那里不需要增加浏览次数）
 */
api.getProductionDetail = function (req, res, next) {
    var id = req.query.id;
    var browseFlag = req.query.browse;
    var browse;
    // 查资源详情
    sequelize.query('SELECT * FROM articles WHERE id=' + id)
        .then(function (entity) {
            var codeId = entity[0][0].codeId;
            browse = entity[0][0].browse;
            sequelize.query('SELECT nLevel,scort FROM codes WHERE id=' + codeId)
                .then(function (data1) {
                    var result = {
                        code: 0,
                        message: 'success',
                        data: entity[0][0]
                    }
                    var scort = data1[0][0].scort.slice(1, -1).split(',');
                    var nLevel = data1[0][0].nLevel;
                    result.data.scort = scort;
                    result.data.nLevel = nLevel;
                    var keyword = result.data.keyWord.slice(1, -1).split(';');
                    var str = '';
                    for (var i = 0; i < keyword.length; i++) {
                        if (i == keyword.length - 1) {
                            str += keyword[i];
                        } else {
                            str += keyword[i] + ';'
                        }
                    }
                    result.data.keyWord = str;
                    if (entity[0][0].userId) {
                        // 查用户头像
                        sequelize.query('SELECT avatar FROM members WHERE id =' + entity[0][0].userId)
                            .then(function (avatar) {
                                result.data.avatar = avatar[0][0].avatar;
                                // 这里查询用户的收藏列表
                                if (req.session.member) {
                                    var userId = req.session.member.id;
                                    sequelize.query('SELECT * FROM loves WHERE type = 2 AND userId = ' + userId)
                                        .then(function (loves) {
                                            var loves = loves[0];
                                            for (var i = 0; i < loves.length; i++) {
                                                if (loves[i].tId === result.data.id) {
                                                    result.data.love = true
                                                }
                                            }
                                            // 如果browseFlag参数等于1，则增加浏览次数，将该资源的browse字段值加1
                                            if (browseFlag == 1) {
                                                browse += 1;
                                                db.Article.update({
                                                    browse: browse
                                                }, {
                                                    where: {
                                                        id: id
                                                    }
                                                }).then(function () {
                                                    result.data.browse = browse;
                                                    res.json(result)
                                                }).catch(function (err) {
                                                    res.json({
                                                        code: 1,
                                                        message: err
                                                    })
                                                })
                                            } else {
                                                res.json(result)
                                            }
                                        })
                                } else {
                                    res.json(result)
                                }
                            })
                            .catch(function (err) {
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

/**
 * 作品提交审核
 * @param id    资源id
 */
api.submitAudit = function (req, res, next) {
    var id = req.query.id;
    var params = {
        status: 1
    }
    db.Article.update(params, {
        where: {
            id: id
        }
    }).then(function (entity) {
        res.json({
            code: 0,
            message: 'success'
        })
    }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}


/**
 * 个人中心-获取我已上传列表
 * @param id        用户id
 * @param type      资源类型，不传为全部
 * @param status    状态，不传为全部 1：待审核  2：已通过   3：未通过   4：批量上传的图片，但是还未修改信息
 */
api.getAlreadyProduction = function (req, res, next) {
    var page = {
        totalPage: 1,
        pageSize: +req.query.pageSize || 10,
        currentPage: +req.query.currentPage || 1,
        total: 0
    };
    var limit = ' LIMIT ' + (0 + page.pageSize * (page.currentPage - 1)) + ', ' + page.pageSize;
    var id = req.query.id;
    var type = req.query.type;
    var status = req.query.status;
    var totalSql = 'SELECT COUNT(*) as total FROM articles WHERE userId = ' + id + ' AND status != 0 AND status != 4';
    var sql = 'SELECT * FROM articles WHERE userId=' + id + ' AND status != 0 AND status != 4 ORDER BY updatedAt DESC' + limit;
    if (type) {
        sql = 'SELECT * FROM articles WHERE userId=' + id + ' AND status=2 AND parentVal="' + type + '" ORDER BY updatedAt DESC' + limit;
    }
    if (status) {
        sql = 'SELECT * FROM articles WHERE userId=' + id + ' and status=' + status + ' ORDER BY updatedAt DESC' + limit;
        totalSql = 'SELECT COUNT(*) as total FROM articles WHERE userId = ' + id + ' AND status = ' + status;
    }
    sequelize.query(totalSql, {type: sequelize.QueryTypes.SELECT}).then(function (total) {
        page.total = total[0].total;
        page.totalPage = Math.ceil(page.total / page.pageSize);
        sequelize.query(sql).then(function (entity) {
            var result = {
                code: 0,
                message: 'success',
                datas: entity[0],
                page: page
            }
            // 查询收藏/下载
            sequelize.query('SELECT tId, type FROM loves WHERE userId = ' + id + ' AND type = 2')
                .then(function (articles) {
                    if (articles) {
                        articles = articles[0];
                        for (var i = 0; i < result.datas.length; i++) {
                            for (var j = 0; j < articles.length; j++) {
                                if (articles[j].tId == result.datas[i].id) {
                                    result.datas[i].love = true;
                                }
                            }
                        }
                    }
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
    })
}


/**
 * 个人中心-我的收藏/下载
 * @param id            用户id
 * @param parentVal     菜单的val值
 * @param type  1:      下载 2: 收藏
 */
api.getMyCollectFiles = function (req, res, next) {
    var id = req.query.id;
    var type = req.query.type;
    var parentVal = req.query.parentVal;
    var sql = '';
    if (parentVal) {
        sql = 'SELECT a.*,b.codeName,b.download FROM loves a,articles b WHERE a.userId = ' + id + ' AND type = ' + type + ' AND a.tId = b.id AND a.parentVal = "' + parentVal + '"';
    } else {
        sql = 'SELECT a.*,b.codeName,b.download FROM loves a,articles b WHERE a.userId = ' + id + ' AND type = ' + type + ' AND a.tId = b.id';
    }
    sequelize.query(sql).then(function (entity) {
        var result = {
            code: 0,
            message: 'success',
            datas: entity[0]
        }
        if (type == 2) {
            for (var i = 0; i < result.datas.length; i++) {
                result.datas[i].love = true;
            }
            res.json(result)
        } else {
            sequelize.query('SELECT tId, type FROM loves WHERE userId = ' + id + ' AND type = 2')
                .then(function (articles) {
                    if (articles) {
                        articles = articles[0];
                        for (var i = 0; i < result.datas.length; i++) {
                            for (var j = 0; j < articles.length; j++) {
                                if (articles[j].tId == result.datas[i].tId) {
                                    result.datas[i].love = true;
                                }
                            }
                        }
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
    }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}


/**
 * 个人中心-获取我已上传列表
 * @param id            用户id
 * @param oPwd          原密码
 * @param nPwd          新密码
 */
api.editUserInfo = function (req, res, next) {
    var id = req.body.id;
    var oldPassword = req.body.oPwd;
    var newPassword = req.body.nPwd;
    if (newPassword) {
        db.Member.findById(id)
            .then(function (user) {
                if (user.pwd == __.ooxx(oldPassword)) {
                    // 原密码相同，可进行信息修改操作
                    db.Member.update({
                        pwd: __.ooxx(newPassword)
                    }, {
                        where: {
                            id: id
                        }
                    }).then(function (entity) {
                        // req.session.member = null;
                        res.json({
                            code: 0,
                            message: 'success'
                        })
                    }).catch(function (err) {
                        res.json({
                            code: 1,
                            message: err
                        })
                    })
                } else {
                    res.json({
                        code: 1,
                        message: '原密码错误！'
                    })
                }
            }).catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
    } else {
        res.json({
            code: 1,
            message: '新密码不能为空！'
        })
    }
}


/**
 * 列表页-增加或取消收藏记录，增加下载记录
 * @param id            资源id
 * @param type          类型 1：下载 2：收藏
 */
api.addRecord = function (req, res, next) {
    var id = req.body.id;   // 资源id
    var type = req.body.type;   // 资源类型
    var userId;             // 用户id
    if (!req.session.member) {
        res.json({
            code: 1,
            message: '请登录'
        });
        return
    }
    userId = req.session.member.id;
    // 1.找到该资源并添加收藏数量
    db.Article.findOne({
        where: {
            id: id
        }
    }).then(function (article) {
        // 判断此处是下载还是收藏
        if (type == 1) {
            article.updateAttributes({downNum: article.downNum + 1}).then(function () {
            });
        }
        // 2.love表增加收藏数据
        db.Love.findOne({
            where: {
                userId: userId,
                tid: id,
                type: type
            }
        }).then(function (love) {
            // 3.判断是否已经收藏了该条资源，如已收藏，则取消收藏
            if (love) {
                if (type == 2) {
                    love.destroy().then(function () {
                        article.updateAttributes({loveNum: article.loveNum - 1}).then(function () {
                            res.json({
                                code: 0,
                                message: 'success'
                            })
                        });
                    })
                }
            } else {
                if (type == 2) {
                    article.updateAttributes({loveNum: article.loveNum + 1}).then(function () {
                    });
                }
                db.Love.create({
                    userId: userId,
                    tid: id,
                    type: type,
                    title: article.title,
                    coverImg: article.coverImg,
                    parentVal: article.parentVal,
                    w: article.w,
                    h: article.h
                }).then(function () {
                    res.json({
                        code: 0,
                        message: "success"
                    });
                }).catch(function (err) {
                    res.json({
                        code: 1,
                        message: err
                    })
                })
            }
        }).catch(function (err) {
            res.json({
                code: 1,
                message: err
            })
        })
    }).catch(function (err) {
        res.json({
            code: 1,
            message: err
        })
    })
}


/**
 * 设计导航
 * 获取设计导航菜单
 */
api.getDesignMenus = function (req, res, next) {
    var type = req.query.type || 1;
    sequelize.query('SELECT * FROM designs WHERE type = ' + type, {type: sequelize.QueryTypes.SELECT})
        .then(function (entity) {

            var menus = [];
            getMenuTree(0, entity);

            // 根据id生成菜单列表
            function getMenuTree(id, arr) {
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


/**
 * 设计导航
 * 获取列表内容
 */
api.getDesignDataList = function (req, res, next) {
    sequelize.query('SELECT * FROM designs', {type: sequelize.QueryTypes.SELECT})
        .then(function (datas) {
            var menus = [],
                dataList = []
                ;
            for (var i = 0; i < datas.length; i++) {
                var item = datas[i];
                if (item.type == 1 && item.parentId != 0) {
                    menus.push(item);
                } else {
                    dataList.push(item);
                }
            }
            for (var i = 0; i < menus.length; i++) {
                menus[i].children = [];
                for (var j = 0; j < dataList.length; j++) {
                    if (dataList[j].parentId === menus[i].id) {
                        menus[i].children.push(dataList[j])
                    }
                }
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

/* 查找贡献值 */
api.getRws = function (req, res, next) {
    var desc = req.query.desc;
    if (!desc) {
        desc = "totalRws desc";
    } else {
        desc += " desc"
    }
    db.sequelize.query("select m.id,m.name,m.rws as totalRws,ifnull(q.rws,0)  as jrws,ifnull(months.mrws,0) as mrws,avatar,position  from   (select id,name,rws,avatar,position from members  where email<>'' and status=1) m left JOIN  ( SELECT  sum(rws) as rws,uid  FROM rwss WHERE QUARTER(createdAt)=QUARTER(now())  and  DATE_FORMAT(createdAt,'%y') = DATE_FORMAT(now(),'%y')   GROUP BY  uid ) q on(m.id=q.uid)  left join 	(SELECT  id as uid,ifnull(rws,0) as mrws,@rownum := @rownum + 1 AS rownum FROM (select m.id,m.name,obj.rws from members m  LEFT JOIN  (SELECT  sum(rws) as rws,uid FROM rwss  WHERE DATE_FORMAT( createdAt, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' ) GROUP BY  uid ) obj on (m.id=obj.uid) order by rws desc) obj1, (SELECT @rownum := 0) r) months on(m.id=months.uid) order by " + desc).spread(function (entity) {
        res.json({
            code: 0,
            message: 'success',
            datas: entity
        });
    });
}


/* 根据传入的作品类型的codeId，查找对应的parentVal */
function getParentVal(codeId, callback) {
    sequelize.query('SELECT * FROM codes WHERE scort LIKE "%,' + codeId + ',%"')
        .then(function (entity) {
            var parentVal = entity[0][0].val;
            callback(parentVal)
        })
        .catch(function (err) {
            console.log(err)
        })
}


module.exports = api;