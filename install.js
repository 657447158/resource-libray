var Service = require('node-windows').Service;
var path = require('path');
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var svc = new Service({
    name: config.svc_name || 'UEDMaterial',
    description: config.svc_desc || '中科大旗软件有限公司UED部素材库服务',
    script: path.join(__dirname, "app.js"),
    wait: 0,
    grow: .5,
    env: {
        name: "NODE_ENV",
        value: "production"
    }
});

// 监听安装
svc.on('install', function () {
    svc.start();
});

//以防执行两次
svc.on('alreadyinstalled', function () {
    console.log('以防执行两次');
});

// 监听"start",知道流程工作已开始
svc.on('start', function () {
    console.log(svc.name + ' started!\nVisit http://localhost:' + config.port + ' to see it in action.');
});

svc.install();
