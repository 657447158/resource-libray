var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var app = require('./server.js');

//主进程
if (cluster.isMaster) {
    var counts = 0;
    // for (var i = 0; i < numCPUs; i++) {
        var worker_process = cluster.fork();
        //侦听子进程的message事件
        worker_process.on('message', function(msg) {
            if (msg.content && msg.content == 'counter') {
                counts++;
            }
        });
    // }
    cluster.on('listening',function(worker, address){
        console.log('启动成功...');
        console.log('进程id: ' + worker.process.pid);
    });
    cluster.on('exit', function(worker, code, signal) {
        //重启一个worker进程
        console.log('进程异常中断...');
        console.log('正在重启中...');
        cluster.fork();
    });
    process.on('message', function(msg) {
        process.send('from worker: hi there');
    });
} else {
    //子进程

    //通知记录进程修复次数
    process.send({ content: 'counter' });

    var server = http.createServer(app);
    var port = app.get('port');
    server.listen(port);
    console.log('visit http://localhost:' + port);
}
