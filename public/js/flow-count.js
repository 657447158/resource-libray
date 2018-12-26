require.config({
    paths: {
        echarts: '/js/echarts'
    }

});
require(
    [
        'echarts',
        'echarts/chart/line'
    ],
    function (ec) {

        var chartOption ={
            tooltip : {
                show:true

            },
            grid: {
                x:40,
                y:40,
                x2:20,
                y2:50,
                borderColor:'rgba(255,255,255,.2)'
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    axisLine : {
                        lineStyle :{
                            width: 0
                        }
                    },
                    nameTextStyle:{
                      color:'#fff'
                    },
                    splitLine:{
                        lineStyle:{
                            color:'rgba(255,255,255,.2)'
                        }
                    },

                    axisLabel : {
                        show : true,
                        textStyle : {
                            color : '#fff',
                            align : 'center'
                        }
                    },
                    axisTick: { show : true, length: 5, lineStyle : { color:'rgba(255,255,255,.2)'}},
                    data : ['11月','02月','03月','04月','05月','06月','07月','08月','09月','10月','11月','12月']
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLine : {
                        lineStyle :{
                            width: 0
                        }
                    },splitLine:{
                        lineStyle:{
                            color:'rgba(255,255,255,.2)'
                        }
                    },
                    axisLabel : {
                        show : true,
                        textStyle : {
                            color : '#fff'
                        }
                    }
                }
            ],
            series : [
                {
                    name:'',
                    type:'line',
                    smooth:false,
                    symbol:'emptyCircle',
                    itemStyle: {
                        normal: {
                            color:'#fff',
                            areaStyle: {type: 'default',color:'rgba(255,255,255,.25)'},
                            label:{
                                show:false,
                                textStyle:{color:'#fff'}
                            }
                        }
                    },
                    data:[100, 140, 100, 118, 180, 120, 100,140,100,148,100,140]
                }
            ]
        };

        var chartLine = ec.init(document.getElementById('chart'));
        $(function(){
            setH();
            $.get("/admin/getCount",function(data){
                chartLine = ec.init(document.getElementById('chart'));
                chartOption.xAxis[0].data=data.xVal;
                chartOption.series[0].data=data.yVal;
                chartLine.setOption(chartOption);

            });

        });
        window.onresize = function () {
            setH();
            chartLine.resize();

        }
    })

function setH(){
    var _cout=$(".classify").children("a").length,_w=$(".classify").width();
    var _mr=(_cout*28),_liW=(_w-_mr)/_cout;
    $(".classify a").css({width:_liW+"px",height:_liW+"px",marginRight:"28px"});
    $(".chart").height($(".h_main").height()-$(".classify a").height()-80);
}