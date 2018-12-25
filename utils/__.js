var crypto = require('crypto');
var config = require('../config.json')[process.env.NODE_ENV || 'development'];
var __ = {};
__.isGET = function (req) {
    return req.method === "GET";
};

__.isPOST = function (req) {
    return req.method === "POST";
};

__.ooxx = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

__.encrypt = function (str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

__.decrypt = function (str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};


__.getSession = function (name, password) {
    return this.encrypt(name + '\t' + password, config.session_secret);
};

__.getSessions = function (name, password) {
    return this.encrypt(name + '\t' + password, config.session_share);
};
__.pojo = function (body, arg) {
    var obj = {};

    for (var i in arg) {
        try {
            if (typeof  body[arg[i]] !== 'undefined') {
                obj[arg[i]] = body[arg[i]];
            }
        } catch (e) {

        }
    }

    return obj;
};
/*截取字符串*/
__.stripscript=function(s)
{
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
    var rs = "";
    for (var i = 0; i < s.length; i++) {
        rs = rs+s.substr(i, 1).replace(pattern, '');
    }
    return rs;
}

module.exports = __;