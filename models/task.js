/**
 * Created by 马宝宝 on 2017/6/2.
 * 任务
 */

module.exports = function (sequelize, DataTypes) {
    var Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        taskName:DataTypes.STRING,  //任务名称
        project:DataTypes.STRING,   //项目名称
        projectId:DataTypes.INTEGER,    //项目编号
        progress:DataTypes.INTEGER,     //当前进度
        title:DataTypes.STRING,     //任务名称
        duration:DataTypes.INTEGER, //时长
        startDate:DataTypes.STRING,
        endDate:DataTypes.STRING,
        operator:DataTypes.STRING,  //执行人
        operatorId:DataTypes.INTEGER,  //执行人ID
        explain:DataTypes.STRING,  //执行人完成工作后备注
        remark:DataTypes.STRING,    //备注
        assigner:DataTypes.STRING //分配人

    });
    return Task
};