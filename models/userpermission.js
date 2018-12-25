/**
 * Created by Mahm on 2016-2-26.
 */
module.exports = function (sequelize, DataTypes) {
    var Userpermission = sequelize.define('Userpermission', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        userId: DataTypes.STRING,
        permissionId: DataTypes.STRING
    });
    return Userpermission
};