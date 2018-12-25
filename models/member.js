/**
 * Created by Mahm on 2016-5-10.
 */
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Member = sequelize.define('Member', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        pwd: DataTypes.STRING,
        position:DataTypes.STRING, //职位名称
        pId:DataTypes.INTEGER,  //职位Id
        avatar:DataTypes.STRING,
        phone:DataTypes.STRING,
        email:DataTypes.STRING,
        joinDate:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get: function () {
                return moment(this.getDataValue('joinDate')).format('YYYY-MM-DD');
            }
        },
        updatedAt:{
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        status:DataTypes.INTEGER,
	    rws: DataTypes.FLOAT, //贡献值
        oaName:DataTypes.STRING,        //oa账号
        oaPwd:DataTypes.STRING          //oa密码
    });
    return Member
};