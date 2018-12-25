/**
 * Created by minderce on 2016/12/30.
 *
 */
module.exports=function(sequelize,DataTypes){
    var SignIn=sequelize.define("SignIn",{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        userId:DataTypes.INTEGER,
        userName:DataTypes.STRING,
        beLate: DataTypes.INTEGER,
        ipAddress:DataTypes.STRING
    });
    return SignIn;
};