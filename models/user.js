/**
 * Created by Mahm on 2016-2-26.
 */
var moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        pwd: DataTypes.STRING,
        NickName: DataTypes.STRING,
        roleCode: DataTypes.STRING,
        status: DataTypes.STRING,       // 状态 0：启用 1：禁用
        createdAt: {
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    });
    return User
};