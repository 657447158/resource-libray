/**
 * Created by Mahm on 2016-2-26.
 */
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Roles = sequelize.define('Roles', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        code: DataTypes.STRING,         // 角色代码
        name: DataTypes.STRING,         // 角色名称
        status: DataTypes.STRING,       // 状态
        menusIds: DataTypes.STRING,       // 状态
        permissionIds: DataTypes.STRING,       // 状态
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
    return Roles
};