/**
 * 项目路由聚合页
 */
var formidable = require("formidable");
var path = require('path');
var uuid = require('node-uuid');
var fs = require('fs');
var tools = require('../utils/tools');
var config = require('../config.json')[process.env.NODE_ENV || 'development'];
var admin = require('./admin');
var front = require('./front');
var db = require('../models');

function fileUpload(res, fields, files, tmp_path, key, fileMD5) {
    var file_name = files[key].name.substring(0, files[key].name.lastIndexOf('.'));
    var file_size = files[key].size;
    var format = files[key].path.substr(tmp_path.lastIndexOf('.') + 1, tmp_path.length).toLocaleUpperCase();
    var ext = path.extname(tmp_path);
    ext = ext ? ext.slice(1) : "";
    var now = new Date();
    var folderName = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    // 指定文件上传后的目录 - 示例为"images"目录。
    var dirPath = path.join(__dirname, '..', '/public/attached/', folderName);
    var target_path = path.join(dirPath, uuid.v1() + "." + ext);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    // 移动文件
    fs.rename(tmp_path, target_path, function (err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function () {
            if (err) throw err;
            var resPath = '/attached/' + folderName + '/' + target_path.substring(target_path.lastIndexOf('\\') + 1);
            res.send({
                error: 0,
                url: resPath,
                fieldsId: fields.id,
                fieldsName: file_name,
                fieldsSize: file_size,
                format: format,
                fileMD5: fileMD5
            });
        });
    });
}

module.exports = function (app) {

    // 文件上传
    app.use('/upload', function (req, res, next) {
        var size = 999999900000 * (1024 * 1024 * 1024 * 1024);
        var picture = "";
        try {
            picture = req.query.type;        //获取值 用来判断是否为上传图片
        } catch (e) {

        }
        var form = new formidable.IncomingForm();
        form.maxFields = size;
        form.maxFieldsSize = size;
        form.keepExtensions = true; //keep .jpg/.png
        form.uploadDir = "public/attached/";
        form.multiples = true;
        form.parse(req, function (err, fields, files) {
            // 获得文件的临时路径
            var keys = Object.keys(files);
            keys.forEach(function (key) {
                var tmp_path = files[key].path;
                if (picture && picture == "picture") {
                    tools.fileMd5(path.join(__dirname, "../" + tmp_path), function (fileMD5) {
                        db.Article.findOne({where: {fileMd5: fileMD5}}).then(function (entity) {
                            if (entity) {
                                res.send({
                                    error: 1,
                                    url: "",
                                    fieldsId: fields.id,
                                    fieldsName: "",
                                    fieldsSize: "",
                                    format: "",
                                    fileMD5: fileMD5,
                                    message: 'repeat'
                                });
                            } else {
                                fileUpload(res, fields, files, tmp_path, key, fileMD5);
                            }
                        });
                    });
                } else {
                    fileUpload(res, fields, files, tmp_path, key, "");
                }
            });Z
        });
    })

    app.get('/', function (req, res, next) {
        res.redirect('/member/index.html')
    })
    app.use('/admin', admin);
    app.use('/member', front);
}