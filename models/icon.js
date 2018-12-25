/**
 * Created by Mahm on 2016-2-24.
 */
module.exports = function (sequelize, DataTypes) {
    var Icon = sequelize.define('Icon', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: DataTypes.STRING,
        i_group: DataTypes.STRING,
        coding: DataTypes.STRING,
        svg_url: DataTypes.STRING,
        uploadDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        eps: DataTypes.STRING
    });
    return Icon
};
