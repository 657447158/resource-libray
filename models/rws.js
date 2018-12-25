/**
 * Created by Mahm on 2016-3-7.
 * 类型（计算平台贡献值）
 */
module.exports=function(sequelize,DataTypes){
    var RWS=sequelize.define("RWS",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        uId: DataTypes.INTEGER,
        uName:DataTypes.STRING,
        aId:DataTypes.INTEGER,
        aTitle: DataTypes.STRING,
	    rws: DataTypes.FLOAT,
        type:DataTypes.STRING  /*操作类型 + -*/
    });
    return RWS;
};

