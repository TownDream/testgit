// 读取所有翻译方法所需的数据
function loadAllTData() {
    let request = new XMLHttpRequest();
    request.open("get", "json/translate_all.json");
    request.send(null);
    request.onload = function () {
        if (request.status === 200) {
            const json = JSON.parse(request.responseText);
            // 获取分类字典
            for (let type of json.typeT) {
                typeMap.set(type.ID, type.NAME);
            }
            // 获取性能字段翻译字典
            for (let p of json.propertiesT) {
                pTranslateMap.set(p.ENAME, p.CNAME);
            }
            // 获取电压等级字典
            for (let vl of json.vlT) {
                vlTranslateMap.set(vl.NUM, vl.CNAME);
            }
        }
    }
}

// 翻译方法
// str 需翻译字段
// type 翻译字段类型
function translate(str, type) {
    if (type === "properties") {
        str = str.toUpperCase();
        return pTranslateMap.get(str) === undefined ? str : pTranslateMap.get(str);
    } else if (type === "vl") {
        return vlTranslateMap.get(str);
    } else if (type === "obj_type") {
        return typeMap.get(str) === undefined ? str : typeMap.get(str);
    }
}

// 画点
function drawPoint(ctx, x, y, color) {
    //设置绘制颜色
    ctx.fillStyle = color;
    //绘制成矩形
    // ctx.fillRect(getNewXY(x,"x"),getNewXY(y,"y"),dotWidth,dotWidth);
    ctx.beginPath();
    ctx.arc(getNewXY(x, "x"), getNewXY(y, "y"), dotRadii, 0, 2 * Math.PI);
    ctx.fill();
    //设置字体样式
    ctx.font = "12px bold 宋体";
    //绘制文字
    // ctx.fillText("("+x+","+y+")",getNewXY(x,"x"),getNewXY(y,"y"));
    // ctx.fill();
}

// 划线
function drawLine(ctx, line, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    let aLine = line[0];
    ctx.lineWidth = lineWidth;//边框宽度
    ctx.moveTo(getNewXY(aLine[0][0], "x"), getNewXY(aLine[0][1], "y"));
    for (let i = 1; i < aLine.length; i++) {
        ctx.lineTo(getNewXY(aLine[i][0], "x"), getNewXY(aLine[i][1], "y"));
    }
    //设置字体样式
    ctx.font = "12px bold 宋体";
    //绘制文字
    // let wb = aLine[0].length -1;
    // ctx.fillText("头 ("+aLine[0][0]+","+aLine[0][1]+")",getNewXY(aLine[0][0],"x"), getNewXY(aLine[0][1],"y"));
    // ctx.fillText("尾 ("+aLine[wb][0]+","+aLine[wb][1]+")",getNewXY(aLine[wb][0],"x"), getNewXY(aLine[wb][1],"y"));
    ctx.stroke();
}

//max 17251  min 10556
// x =17251  14614  y =11500  10556
function getNewXY(XorY, type) {
    if ("x" === type) {
        return (XorY + XMin + 200) * AMagnification + XSkewing + XMSkewing;
    }
    if ("y" === type) {
        // 同上，YMax就是地图长度
        return (YMax - (XorY + YMin) + 200) * AMagnification + YSkewing + YMSkewing;
    } else {
        return 1;
    }
}

// 信息初始化
function dataInit(json) {
    let selectType = document.getElementsByClassName("objTypeSelect")[0];
    let selectTypeOptions = new Set();
    let data = json.features;
    // 80070196
    for (let dataR of data) {
        if (dataR.geometry === undefined || dataR.geometry.coordinates === undefined) {
            continue;
        }
        // 添加选择类型
        selectTypeOptions.add(dataR.properties.obj_type);
        if ("Point" === dataR.geometry.type) {// 点
            //记录点数据
            // dotDs.push({"x": line[0], "y": line[1], "properties": dataR.properties});
            dotDs.push(dataR);
            //存储供电站点
            // if (361 === dataR.properties.obj_type) {
            //     powerDotDMap.set(dataR.properties.FNODE, dataR);
            // }
            // 更具FNODE记录点数据
            if (!dotsDMap.has(dataR.properties.FNODE)) {
                dotsDMap.set(dataR.properties.FNODE, dataR);
            }
            // 获取最小横纵坐标
            if (dataR.geometry.coordinates[0] < XMin) XMin = dataR.geometry.coordinates[0];
            if (dataR.geometry.coordinates[0] > Xmax) Xmax = dataR.geometry.coordinates[0];
            if (dataR.geometry.coordinates[1] < YMin) YMin = dataR.geometry.coordinates[1];
            if (dataR.geometry.coordinates[1] > YMax) YMax = dataR.geometry.coordinates[1];
        } else if ("MultiLineString" === dataR.geometry.type) {// 线
            //记录线数据
            lines.push(dataR);
            if (linesDMap.has(dataR.properties.TNODE)) {
                linesDMap.get(dataR.properties.TNODE).push(dataR);
            } else {
                linesDMap.set(dataR.properties.TNODE, [dataR]);
            }

            if (linesDMap.has(dataR.properties.FNODE)) {
                linesDMap.get(dataR.properties.FNODE).push(dataR);
            } else {
                linesDMap.set(dataR.properties.FNODE, [dataR]);
            }

            // 获取坐标最大最小值
            for (let line of dataR.geometry.coordinates) {
                for (let segment of line) {
                    if (segment[0] < XMin) XMin = segment[0];
                    if (segment[0] > Xmax) Xmax = segment[0];
                    if (segment[1] < YMin) YMin = segment[1];
                    if (segment[1] > YMax) YMax = segment[1];
                }
            }
        }
    }
    // 排序
    selectTypeOptions = Array.from(selectTypeOptions).sort(
        function (a, b) {
            return a - b;
        }
    );
    // 添加类型选项
    for (let type of selectTypeOptions) {
        selectType.options.add(new Option(translate(type, "obj_type"), type));
    }
    //将平移数值变为相反数
    XMin = -Math.floor(XMin);
    YMin = -Math.floor(YMin);
    Xmax = Math.floor(Xmax) + XMin;
    YMax = Math.floor(YMax) + YMin;
    // 设置搜索参数
    let selectCount = 0;
    let flag = true;
    let c;
    while (flag) {
        c = Math.pow(DXStep, ACount) * Xmax;
        if (c >= windowWidth * 0.8 && c <= windowWidth * 0.9) {
            flag = false;
        } else if (c < windowWidth * 0.8) {
            ACount++;
        } else if (c > windowWidth * 0.9) {
            ACount--;
        }
        selectCount++;
        // 查询超过50次，跳出循环
        if (selectCount > 50) {
            break;
        }
    }
    // 设置放大参数
    AMagnification = Math.pow(DXStep, ACount);
}

// 填充画布
function fillCanvas() {
    if (null == json) {
        for (let aJson of jsonPathArr) {
            let request = new XMLHttpRequest();
            request.open("get", aJson);
            request.send(null);
            request.onload = function () {
                if (json === null) {
                    json = JSON.parse(request.responseText);
                } else {
                    let aJsonData = JSON.parse(request.responseText);
                    json.features = json.features.concat(aJsonData.features);
                }
                jsonRequstCount++;
                //信息初始化
                if (jsonRequstCount === jsonPathArr.length) {
                    dataInit(json);
                    fillCanvasByJson(json);
                }
            }
        }
    } else {
        fillCanvasByJson(json);
    }
}

// json:线路数据
// 填充画布内容
function fillCanvasByJson(json) {
    if (null != clickData) {
        //清除画布
        clears();
    }
    let data = json.features;
    let selectLine = null;
    let selectTypeData = [];
    // 80070196
    for (let dataR of data) {
        if (dataR.geometry === undefined || dataR.geometry.coordinates === undefined) {
            continue;
        }
        // 收集选中点线信息
        if (dataR.properties.obj_type == selectTypeStr) { // 收集选中信息
            selectTypeData.push(dataR);
        }

        let line = dataR.geometry.coordinates;
        if ("Point" === dataR.geometry.type) {// 点
        } else if ("MultiLineString" === dataR.geometry.type) {// 线 先绘制
            if (clickData != null && clickData.type === "line" && clickData.data.line === line) {
                selectLine = line;
            } else if (!suppleLines.has(dataR.properties.ID) && dataR.properties.obj_type != selectTypeStr) { // 如果是相关线，稍后绘制
                drawLine(cxt, line, lineColor);
            }
        }
    }
    // 选中点
    let selectDot = null;
    //绘制点,点覆盖线，后渲染
    for (let dotD of dotDs) {
        let dot = dotD.geometry.coordinates;
        if (clickData != null && clickData.type === "dot" && clickData.data.x === dot[0] && clickData.data.y === dot[1]) {
            selectDot = dot;
        } else if (dotD.properties.obj_type != selectTypeStr) {
            drawPoint(cxt, dot[0], dot[1], dotColor);
        }
    }

    // 选中信息
    for (let sData of selectTypeData) {
        if ("Point" === sData.geometry.type) {// 点
            let dot = sData.geometry.coordinates;
            drawPoint(cxt, dot[0], dot[1], objSColor);
        } else if ("MultiLineString" === sData.geometry.type) {
            let line = sData.geometry.coordinates;
            drawLine(cxt, line, objSColor);
        }
    }

    suppleLines.forEach(function (value) {
        if (value.geometry.coordinates !== selectLine) {
            drawLine(cxt, value.geometry.coordinates, "#0f0");
        }
    });
    downstreamLines.forEach(function (value) {
        if (value.geometry.coordinates !== selectLine) {
            drawLine(cxt, value.geometry.coordinates, "#f00");
        }
    });
    suppleDots.forEach(function (value) {
        if (value.geometry.coordinates !== selectDot) {
            drawPoint(cxt, value.geometry.coordinates[0], value.geometry.coordinates[1], "#0f0");
        }
    });
    downstreamDots.forEach(function (value) {
        if (value.geometry.coordinates !== selectDot) {
            drawPoint(cxt, value.geometry.coordinates[0], value.geometry.coordinates[1], "#f00");
        }
    });
    // 如果有选中线，后绘制，避免被覆盖
    if (null != selectLine) {
        drawLine(cxt, selectLine, selectColor);
    }
    if (null != selectDot) {
        drawPoint(cxt, selectDot[0], selectDot[1], selectColor);
    }

    // 供电站
    // powerDotDMap.forEach(function (value) {
    //     drawPoint(cxt, value.geometry.coordinates[0], value.geometry.coordinates[1], "#00f");
    // });

    isLoadOver = true;
    isFirstLoad = false;
}

// x,y:点击坐标
// ox,oy:路线头部坐标
// tx,ty:路线尾部坐标
function isPointInLine(x, y, ox, oy, tx, ty) {
    // 将城市坐标进行转换
    ox = getNewXY(ox, "x");
    tx = getNewXY(tx, "x");
    oy = getNewXY(oy, "y");
    ty = getNewXY(ty, "y");
    let intersectX;
    let intersectY;
    let distance;
    if (ty === oy) {
        intersectX = x;
        intersectY = ty;
        distance = Math.abs(y - oy);
    } else if (tx !== ox) {
        //y = kx +b
        //計算斜率
        let k1 = (ty - oy) / (tx - ox);
        let k2 = -1 / k1;
        //計算 b值
        let b1 = oy - k1 * ox;
        let b2 = y - k2 * x;
        //计算相交点
        intersectX = (b2 - b1) / (k1 - k2);
        intersectY = (k1 * b2 - k2 * b1) / (k1 - k2);
        //计算距離
        let width = intersectX - x;
        let height = intersectY - y;
        distance = Math.sqrt(width * width + height * height);
    } else {
        intersectX = tx;
        intersectY = y;
        distance = Math.abs(x - ox);
    }

    // 判断距离是否在模糊点击距离内
    // 判断点是否能垂直映射在线段上
    if (distance > fuzzyRange
        || (intersectX < ox && intersectX < tx)
        || (intersectY < oy && intersectY < ty)
        || (intersectX > ox && intersectX > tx)
        || (intersectY > oy && intersectY > ty)) {
        return false;
    }
    return true;
}

//x,y:点击坐标
//rx,ry:圆心坐标
function isPointInRect(x, y, rx, ry) {
    let xx = getNewXY(rx, "x") - x;
    let yy = getNewXY(ry, "y") - y;
    let isMove = Math.sqrt(xx * xx + yy * yy);
    return isMove < dotRadii + fuzzyRange;
}

// 清除画布
function clears() {
    cxt.beginPath();
    cxt.clearRect(0, 0, 3000, 3000);
    cxt.closePath();
}

function filLInesSDMapByLine(line) {
    //加入当前线，作为阻断，非常重要！不可删除
    suppleLines.set(line.properties.ID, line);
    //如果TNODE为空，就不去遍历了
    if (line.properties.TNODE !== undefined) {
        fillCorrelationLDMap(line.properties.TNODE, "supple");
    }
    if (line.properties.FNODE !== undefined) {
        fillCorrelationLDMap(line.properties.FNODE, "downstream");
    }
}

function filLInesSDMapByDot(dot) {
    //加入当前线，作为阻断，非常重要！不可删除
    suppleDots.set(dot.properties.ID, dot);
    for (let line of linesDMap.get(dot.properties.FNODE)) {
        lineC = line.geometry.coordinates;
        dotC = dot.geometry.coordinates;

        if (suppleLines.size === 0) {
            suppleLines.set(line.properties.ID, line);
        } else {
            downstreamLines.set(line.properties.ID, line);
        }
    }

    // 绘制选中线
    suppleLines.forEach(function (value) {
        fillCorrelationLDMap(value.properties.TNODE, "supple");
        fillCorrelationLDMap(value.properties.FNODE, "supple");
    });

    //绘制选中点
    downstreamLines.forEach(function (value) {
        fillCorrelationLDMap(value.properties.TNODE, "downstream");
        fillCorrelationLDMap(value.properties.FNODE, "downstream");
    });
}

//填充相关线Map
function fillCorrelationLDMap(node, mapType) {
    let linesMap;
    let dotsMap;
    if ("supple" === mapType) {
        linesMap = suppleLines;
        dotsMap = suppleDots;
    } else if ("downstream" === mapType) {
        linesMap = downstreamLines;
        dotsMap = downstreamDots;
    }
    if (!dotsMap.has(node) && dotsDMap.has(node)) {
        let dot = dotsDMap.get(node);
        dotsMap.set(dot.properties.FNODE, dot);
    }
    for (let lineD of linesDMap.get(node)) {
        if (!suppleLines.has(lineD.properties.ID) && !downstreamLines.has(lineD.properties.ID)) {
            linesMap.set(lineD.properties.ID, lineD);
            fillCorrelationLDMap(lineD.properties.TNODE, mapType);
            fillCorrelationLDMap(lineD.properties.FNODE, mapType);
        }
    }
}

//清除记录数据
function clearData() {
    suppleLines.clear();
    suppleDots.clear();
    downstreamLines.clear();
    downstreamDots.clear();
    selectTypeStr = null;
}

// 信息展示在左上角
function showDataFloat(x, y) {
    dataFloat = document.getElementById("dataFloat");
    let properties = clickData.data.properties;
    if (null != properties) {
        let data = "";
        for (let propertie in properties) {
            // 如果是电压等级，还需翻译
            if ("VOLTAGE_LEVEL" === propertie) {
                data += "<div>" + translate(propertie, "properties") + ": " + translate(properties[propertie], "vl") + "</div>";
            } else if ("obj_type" === propertie) {
                data += "<div>" + translate(propertie, "properties") + ": " + translate(properties[propertie], "obj_type") + "</div>";
            } else {
                data += "<div>" + translate(propertie, "properties") + ": " + properties[propertie] + "</div>";
            }
        }
        if (x < 500) {
            dataFloat.style.left = "";
            dataFloat.style.right = "20px";
        } else {
            dataFloat.style.left = "20px";
            dataFloat.style.right = "";
        }
        //插入html语句
        dataFloat.innerHTML = data;
        dataFloat.style.display = "block";
    }
}

// 选中方法
function selectType(value) {
    if (value === -1) {
        alert("请选择其他选项");
    } else {
        loadData(value);
    }
    let c = document.getElementsByClassName("objTypeSelect")[0];
    c.style.display = false;
}

//加载选择type数据
function loadData(obj_type) {
    //如果选中相同type，则不加载
    if (selectTypeStr != obj_type && -1 != obj_type) {
        clearData();
        clickData = null;
        //清空当前标签
        selectTypeStr = obj_type;
        // 重新绘制画布
        fillCanvas();
    }
}

function init() {
    let url = location.search; //获取url中"?"符后的字串
    if (url.indexOf("?") !== -1) {
        let str = url.substr(1);
        strs = str.split("&");
        jsonData = decodeURIComponent(strs[0].replace("jsonData=", ""));
        if ("jtz" === jsonData){
            jsonPathArr = ["json/jtz-j18kg.json", "json/jtz-j22kg.json", "json/jtz-j23_j72kg.json"];
        } else if ("xn" === jsonData){
            jsonPathArr = ["json/xn_json_data.json"];
        }
    }
    // 设置画布点宽高为屏幕宽高
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    //获取所有翻译数据
    loadAllTData();
    // 填充画布
    fillCanvas();
}