/*
 parend 父级id
 pin 元素id
 */
function waterfall(parent, pin, isCalculate) {
    var oParent = document.getElementById(parent);// 父级对象
    var parentW = oParent.offsetWidth;
    var aPin = getClassObj(oParent, pin);// 获取存储块框pin的数组aPin


    var iPinW = aPin[0].offsetWidth;// 一个块框pin的宽
    var num = Math.floor(parentW / iPinW);//每行中能容纳的pin个数【窗口宽度除以一个块框宽度】
    var pinHArr = [];//用于存储 每列中的所有块框相加的高度。

    for (var i = 0; i < aPin.length; i++) {//遍历数组aPin的每个块框元素

        var pinH = aPin[i].offsetHeight;
        var pinW = aPin[i].offsetWidth;
        aPin[i].style.cssText = '';
        aPin[i].style.zIndex = 1;
        aPin[i].style.display = "block";
        if (i < num) {
            pinHArr[i] = pinH; //第一行中的num个块框pin 先添加进数组pinHArr
            aPin[i].style.left = (pinW * i) + 'px';
        } else {
            var minH = Math.min.apply(null, pinHArr);//数组pinHArr中的最小值minH
            var minHIndex = getminHIndex(pinHArr, minH);
            //  aPin[i].style.position='absolute';//设置绝对位移
            aPin[i].style.top = minH + 'px';
            aPin[i].style.left = aPin[minHIndex].offsetLeft + 'px';
            //数组 最小高元素的高 + 添加上的aPin[i]块框高
            pinHArr[minHIndex] += aPin[i].offsetHeight;//更新添加了块框后的列高
        }
    }
    var _max = Math.max.apply(null, pinHArr);
    oParent.style.cssText = "height:" + (_max) + "px;";

    if (isCalculate) {
        var t_w = $("." + pin).width();
        parentW = Math.floor($(window).width() / t_w) * t_w;
        oParent.style.cssText = "width:" + (parentW) + "px;height:" + (_max) + "px;margin:0 auto;";
    }
}

/****
 *通过父级和子元素的class类 获取该同类子元素的数组
 */
function getClassObj(parent, className) {
    var obj = parent.getElementsByTagName('*');//获取 父级的所有子集
    var pinS = [];//创建一个数组 用于收集子元素
    for (var i = 0; i < obj.length; i++) {//遍历子元素、判断类别、压入数组
        if (obj[i].className.indexOf(className) >= 0) {
            pinS.push(obj[i]);
        }
    }
    ;
    return pinS;
}
/****
 *获取 pin高度 最小值的索引index
 */
function getminHIndex(arr, minH) {
    for (var i in arr) {
        if (arr[i] == minH) {
            return i;
        }
    }
}


