/**
 * Created by Mahm on 2016-2-26.
 */
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Menus = sequelize.define('Menus', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        codeName: DataTypes.STRING,
        level: DataTypes.STRING,
        status: DataTypes.STRING,
        url: DataTypes.STRING,
        icon: DataTypes.STRING,
        parentId: DataTypes.STRING,
        codeId: DataTypes.STRING,
        permission: DataTypes.STRING,
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
    return Menus
};