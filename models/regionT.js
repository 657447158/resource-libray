/**
 * Created by Mahm on 2016-2-24.
 */
module.exports = function (sequelize, DataTypes) {
    var RegionT = sequelize.define('RegionT', {
        region:DataTypes.INTEGER,
        name:DataTypes.STRING,
        pregion:DataTypes.INTEGER,
        fullname:DataTypes.STRING,
        address:DataTypes.STRING,
        level:DataTypes.INTEGER
    });
    return RegionT
};
