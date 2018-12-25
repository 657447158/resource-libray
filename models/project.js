/**
 * Created by 马宝宝 on 2017/6/2.
 * 项目实体表
 */
module.exports = function (sequelize, DataTypes) {
    var Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        parentId: DataTypes.INTEGER,    //父级
        name: DataTypes.STRING,         //项目名称
        principal: DataTypes.STRING,    //项目负责人
        type:DataTypes.STRING,          //类别
        priority:DataTypes.STRING,     //优先级
        progress:DataTypes.INTEGER,     //当前进度
        planStartDate:DataTypes.STRING, //开始时间
        planEndDate:DataTypes.STRING,    //结束时间
        actualStartDate:DataTypes.STRING,//实际开始时间
        actualEndDate:DataTypes.STRING, //实际结束时间
        operator:DataTypes.STRING,      //执行人
        status:DataTypes.STRING,        //状态
        remark:DataTypes.STRING        //备注

    });
    return Project;
};