var Service = require('node-windows').Service;
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var path = require('path');
var svc = new Service({
    name: config.svc_name || 'UEDMaterial',
    script: path.join(__dirname, "app.js")
});
// 监听"uninstall"事件，知道何时完成
svc.on('uninstall', function () {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});

// 卸载服务
svc.uninstall();
