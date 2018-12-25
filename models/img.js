/**
 * Created by Mahm on 2016-3-7.
 * 图片库
 */
module.exports=function(sequelize,DataTypes){
    var Img=sequelize.define("Img",{
        Id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        tbName:DataTypes.STRING,
        tdId:DataTypes.INTEGER,
        type:DataTypes.STRING,
        url:DataTypes.STRING,
        sort:DataTypes.INTEGER
    });
    return Img;
};
