/**
 * Created by Mahm on 2016-3-7.
 * 操作日志
 */
module.exports=function(sequelize,DataTypes){
    var Operation=sequelize.define("Operation",{
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
       action:DataTypes.STRING,
        table:DataTypes.STRING,
       aName:DataTypes.STRING
    });
    return Operation;
};