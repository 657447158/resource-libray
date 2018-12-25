var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    var Link = sequelize.define("Link", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        url: DataTypes.STRING,
        img: DataTypes.STRING,
        sort: DataTypes.INTEGER,
        updatedAt: {
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
    });
    return Link;
};