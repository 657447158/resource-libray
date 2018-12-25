/**
 * Created by Mahm on 2016-3-7.
 * 类型
 */
var moment = require('moment');

module.exports=function(sequelize,DataTypes){
    var Code=sequelize.define("Code",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        parentId: DataTypes.INTEGER,
        name:DataTypes.STRING,
        type:DataTypes.STRING,
        regionsId: DataTypes.INTEGER,
        sort: DataTypes.INTEGER,
        isMenu:DataTypes.INTEGER,
        val:DataTypes.STRING,
        icon:DataTypes.STRING,
        deep:DataTypes.INTEGER,
	    rws: DataTypes.FLOAT, //贡献值
        nLevel: DataTypes.INTEGER,
        scort: DataTypes.STRING,
        createdAt:{
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        updatedAt:{
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
    });
    return Code;
};

