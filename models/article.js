/**
 * Created by Mahm on 2016-3-7.
 */
var moment = require('moment');
module.exports=function(sequelize,DataTypes){

    var Article=sequelize.define("Article",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        codeId:DataTypes.INTEGER,         /*类型编号*/
        codeName:DataTypes.STRING,        /*类型编号*/
        title:DataTypes.STRING,           /*标题，名称*/
        content:DataTypes.TEXT,           /*内容*/
        intro:DataTypes.STRING,           /*简介*/
        keyWord: DataTypes.STRING(100),    /*关键字*/
        format:DataTypes.STRING,           /*格式*/
        size:DataTypes.INTEGER,           /*大小*/
        url:DataTypes.STRING,             /*连接地址*/
        browse:DataTypes.INTEGER,         /*浏览次数*/
        download:DataTypes.STRING,        /*下载地址*/
        sourceSrc:DataTypes.STRING,       /*PPT地址*/
        sourceName:DataTypes.STRING,       /*PPT名称*/
        sourceFormat:DataTypes.STRING,     /*PPT格式*/
        downNum:DataTypes.INTEGER,        /*下载次数*/
        coverImg:DataTypes.STRING,        /*封面地址*/
        imgNum:DataTypes.INTEGER,         /*图片个数*/
        erwm:DataTypes.STRING,            /*二维码*/
        userName:DataTypes.STRING,        /*用户名*/
        userId:DataTypes.INTEGER,        /*用户名*/
        place:DataTypes.STRING,           /*地址svn*/
        loveNum:DataTypes.INTEGER,         /*收藏个数*/
        numbered:DataTypes.INTEGER,        /*编号*/
        parentVal:DataTypes.STRING,         /*顶级类型val*/
        status:DataTypes.INTEGER,        /*状态 -1：删除,0：未发布，1：待审核，2：审核通过，3：未通过*/
        regionsId:DataTypes.INTEGER,        /*城市编号*/
        scenicId:DataTypes.INTEGER,         /*景区编号*/
        scenic:DataTypes.STRING ,            /*景区名称*/
        w:DataTypes.INTEGER,         /*封面图片宽（必须有，否则前台无法正常显示瀑布流）*/
        h:DataTypes.INTEGER,         /*封面图片高(必须有，否则前台无法正常显示瀑布流)*/
        measure:DataTypes.STRING,     /*真实尺寸*/
        sort:DataTypes.INTEGER,
        isTop:DataTypes.INTEGER         /*1=精华，0=普通*/,
        fileMD5:DataTypes.STRING,
        fileName:DataTypes.STRING,
        source:DataTypes.STRING,           /* 作品来源 1：原创 2：网络 3：第三方授权 */
        timestamp:DataTypes.STRING,        /* 时间戳认证 1：已认证 2：未认证 */
        author:DataTypes.STRING,           /* 作者姓名 */
        createdAt: {
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            get: function () {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        }

    });
    return Article;
};