//----------------------------监听鼠标点击事件---------------------
function clickCanvas(e) {
    if (!isLoadOver) {
        return;
    }
    isLoadOver = false;
    let x = e.layerX;
    let y = e.layerY;
    let dataIsNull = (clickData == null);
    //重置点击数据
    clickData = null;
    // 遍历点集合
    for (let dotD of dotDs) {
        let dot = dotD.geometry.coordinates;
        if (isPointInRect(x, y, dot[0], dot[1])) {
            //记录被点击到的点数据
            clickData = {
                type: "dot",
                data: {
                    "x": dot[0],
                    "y": dot[1],
                    "properties": dotD.properties
                }
            };
            // 清空数据
            clearData();
            // 根据被点击点获取填充画布必要信息
            filLInesSDMapByDot(dotD);
            //填充画布
            fillCanvas();
            showDataFloat(x, y);
            break;
        }
    }

    // 如果没并非点被点击到，遍历线集合
    if (null == clickData) {
        //遍历线集合
        over:
            for (let line of lines) {
                let aLine = line.geometry.coordinates[0];
                for (let i = 0; i < aLine.length - 1; i++) {
                    //判断是否点击到线
                    if (isPointInLine(x, y, aLine[i][0], aLine[i][1], aLine[i + 1][0], aLine[i + 1][1])) {
                        clickData = {
                            type: "line",
                            data: {
                                "line": line.geometry.coordinates,
                                "properties": line.properties
                            }
                        };
                        // 清空画布数据
                        clearData();
                        // 根据被点击线获取填充画布必要信息
                        filLInesSDMapByLine(line);
                        //填充画布
                        fillCanvas();
                        showDataFloat(x, y);
                        break over;
                    }
                }
            }
        //如果之前渲染点击效果，且当前线未被点击到，重新绘制画图
        if ((!dataIsNull && null === clickData) || selectTypeStr !== null) {
            // 清空数据
            clearData();
            //清空选项数据
            objTypeSelect.selectedIndex = 0;
            //之后再线上判断
            fillCanvas();
            dataFloat.style.display = "none";
        } else if (dataIsNull && null === clickData) {
            isLoadOver = true;
            dataFloat.style.display = "none";
        }
    }
}

//------------------
//    // 滚轮放大缩小平移参数
//     var XSkewing = 0;
//     var YSkewing = 0;--------------监听滚轮事件--------------------------
function scaleCanvas(event) {
    event.preventDefault();
    let e = window.event || event; // old IE support
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if (-1 === delta && MCount + ACount >= 60 || 1 === delta && MCount + ACount <= -40) {
        return;
    }
    fillCanvasAndChangeMagnification(e.layerX, e.layerY, getRealXY(e.layerX, "x"), getRealXY(e.layerY, "y"), delta);
}

function getRealXY(XorY, type) {
    let real;
    if ("x" === type) {
        real = (XorY - XSkewing - XMSkewing) / Math.pow(DXStep, MCount);
    } else {
        real = (XorY - YSkewing - YMSkewing) / Math.pow(DXStep, MCount);
    }
    return real;
}

//修改放大倍数，然后填充画布
//x y:当前点位
//ox oy:最初点位
function fillCanvasAndChangeMagnification(x, y, ox, oy, delta) {
    // 根据滚轮修改绘制倍数常亮值
    if (-1 === delta) {
        MCount++;
        AMagnification = AMagnification * DXStep;
    } else if (1 === delta) {
        MCount--;
        AMagnification = AMagnification / DXStep;
    }
    //清空平移数据
    XMSkewing = 0;
    YMSkewing = 0;
    XSkewing = x - ox * Math.pow(DXStep, MCount);
    YSkewing = y - oy * Math.pow(DXStep, MCount);
    clears();
    fillCanvas();
}

//-----------------------------监听拖拽事件------------------------------------
function mousedownCanvas(ev) {
    var e = ev || event;
    console.log(e.layerX, e.layerY);
    console.log("实际点", getRealXY(e.layerX, "x"));
}

function directionBtnClick(direction) {
    if (direction.keyCode !== undefined) direction = direction.keyCode;
    switch (direction) {
        case "left":
        case 37:
            XMSkewing += XMStep;
            break;
        case "right":
        case 39:
            XMSkewing -= XMStep;
            break;
        case "up":
        case 38:
            YMSkewing += XMStep;
            break;
        case "down":
        case 40:
            YMSkewing -= XMStep;
            break;
    }
    clears();
    fillCanvas();
}

document.onkeydown = directionBtnClick;