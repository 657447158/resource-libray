/**
 * Created by Mahm on 2016-3-7.
 * 数据库备份
 */
module.exports=function(sequelize,DataTypes){
    var Backup=sequelize.define("Backup",{
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        title:DataTypes.STRING,
    });
    return Backup;
};