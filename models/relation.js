/**
 * Created by 马宝宝 on 2017/6/6.
 * 人员安排
 */
module.exports = function (sequelize, DataTypes) {
    var Relation = sequelize.define('Relation', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        pId: DataTypes.INTEGER,    //项目编号
        pName: DataTypes.STRING,         //项目名称
        uId:DataTypes.INTEGER,     //用户编号
        uName:DataTypes.STRING,     //用户名称
        jobId:DataTypes.INTEGER,
        jobName:DataTypes.STRING,
        actualStartDate:DataTypes.STRING,//实际开始时间
        actualEndDate:DataTypes.STRING, //实际结束时间
        jobDate:DataTypes.STRING,
        priority:DataTypes.STRING,     //优先级
        status:DataTypes.STRING         //状态
    });
    return Relation;
};