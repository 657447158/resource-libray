/**
 * Created by Mahm on 2016-2-26.
 */
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Designs = sequelize.define('Designs', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        parentId: DataTypes.INTEGER,
        type: DataTypes.INTEGER,        // 1.菜单 2.link外链数据
        link: DataTypes.STRING,
        cover: DataTypes.STRING,
        info: DataTypes.STRING,
        sort: DataTypes.INTEGER,
        nLevel: DataTypes.STRING,
        scort: DataTypes.STRING,
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
    return Designs
};