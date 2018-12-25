/**
 * Created by Mahm on 2016-3-24.
 */
module.exports=function(sequelize,DataTypes){
    var Love=sequelize.define("Love",{
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        userId:DataTypes.INTEGER,
        tid:DataTypes.INTEGER,
        type:DataTypes.INTEGER, /*1：下载，2：收藏*/
        title:DataTypes.STRING,
        coverImg:DataTypes.STRING,
        parentVal:DataTypes.STRING,
        w:DataTypes.INTEGER,
        h:DataTypes.INTEGER
    });
    return Love;
};