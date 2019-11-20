let CanvasEvents = (function (canvasManager) {
    this.canvasManager = canvasManager;
    let canvasClickType = null;
    let selectColor = "#527fff";

    // 事件初始化
    this.init = function () {
        this.canvasManager.getCanvas().onclick = this.canvasClickEvent;
        this.canvasManager.getNCanvas().onclick = this.canvasClickEvent;
        this.addClickInit();
    };

    this.addClickInit = function () {
        CanvasManager.drawPointBF = function () {
            CanvasManager.flashBtnsStyle(0);
            canvasEvents.setCanvasClickType("drawPoint");
        };
        CanvasManager.drawLineBF = function () {
            CanvasManager.flashBtnsStyle(1);
            canvasEvents.setCanvasClickType("drawLine");
        };
        CanvasManager.movePLBF = function () {
            CanvasManager.flashBtnsStyle(2);
            canvasEvents.setCanvasClickType("movePL");
        };
        CanvasManager.deletePLBF = function () {
            CanvasManager.flashBtnsStyle(3);
            canvasEvents.setCanvasClickType("deletePL");
        };
        CanvasManager.clearScreenBF = function () {
            console.log(" CanvasManager.clearScreenBF");
            CanvasManager.flashBtnsStyle(-1);
            canvasEvents.setCanvasClickType("clearScreen");
            clearScreenBtnFunction();
        };
    };

    // 画布点击事件
    this.canvasClickEvent = function (e) {
        console.log(canvasClickType);
        switch (canvasClickType) {
            case "drawPoint":
                drawPointBtnfunction(e);
                break;
            case "drawLine":
                drawLineBtnFunction(e);
                break;
            case "movePL":
                movePLBtnFunction(e);
                break;
            case "deletePL":
                deletePLBtnFunction(e);
                break;
            case "clearScreen":
                break;
        }
    };

    // 设置画布点击类型
    this.setCanvasClickType = function (type) {
        // 清空记录线数据
        lineR = null;
        // 如果当前正在挪动点或线，重置点线
        if (isClickPLFlag) {
            if (undefined !== pl.x) {// 重置点
                pl.x = oldPLXY.x;
                pl.y = oldPLXY.y;
            } else if (undefined !== pl.lineData) { // 重置线
                for (let i = 0; i < pl.lineData.length; i++) {
                    pl.lineData[i][0] = oldPLXY[i].x;
                    pl.lineData[i][1] = oldPLXY[i].y;
                }
            }
            // 重置是否点击到点和线记录
            isClickPLFlag = false;
        }

        // 刷新屏幕
        canvasEvents.canvasManager.flashCanvase();
        // 在不需要监听滚动事件时，删除点击事件
        if ("drawLine" === type || "movePL" === type) {
            console.log("添加事件");
            // canvasEvents.canvasManager.getCanvas().onmousemove = canvasEvents.canvasMousemove;
            canvasEvents.canvasManager.getNCanvas().onmousemove = canvasEvents.nCanvasMousemove;
        } else {
            canvasEvents.canvasManager.getCanvas().onmousemove = null;
            canvasEvents.canvasManager.getNCanvas().onmousemove = null;
        }
        // 修改类型
        canvasClickType = type;
    };

    this.getClickType = function () {
        return canvasClickType;
    };

    // 画点按钮方法
    function drawPointBtnfunction(e) {
        let x = e.layerX;
        let y = e.layerY;
        // 判断是否点击到点或线
        let isClick;
        over:
            for (let point of canvasEvents.canvasManager.getPoings()) {
                isClick = cUtil.isPointInRect(x, y, point);
                if (isClick) {
                    break over;
                }
            }
        if (!isClick) {
            canvasEvents.canvasManager.addPoint({"x": x, "y": y, "radius": 10, "show": true});
            canvasEvents.canvasManager.flashCanvase();
        }
    }

    // 记录当前绘制中的线信息
    let lineR = null;

    // 画线按钮方法
    function drawLineBtnFunction(e) {
        let x = e.layerX;
        let y = e.layerY;
        if (null == lineR) {
            lineR = {
                "width": 3,
                "lineData": [
                    [x, y]
                ]
            };
            canvasEvents.canvasManager.showNCanvas();
        } else if (lineR.lineData[lineR.lineData.length - 1][0] === x
            && lineR.lineData[lineR.lineData.length - 1][1] === y) {// 双击直接保存
            canvasEvents.canvasManager.addLine(lineR);
            // canvasClickType = "drawLine";
            lineR = null;
            canvasEvents.canvasManager.hideCanvas();
            canvasEvents.canvasManager.flashCanvase();
        } else {
            lineR.lineData.push([x, y]);
            canvasEvents.canvasManager.clearNCanvas();
            nUtil.drawBLine(lineR, "#f00");
        }
    }

    // 是否点击到点和线
    let isClickPLFlag = false;
    let pl = null;
    // 最初的点击地点记录
    let oldCXY = null;
    // 最初的点线位置记录
    let oldPLXY = null;

    // 挪动点线按钮方法
    function movePLBtnFunction(e) {
        let x = e.layerX;
        let y = e.layerY;
        if (!isClickPLFlag) {
            cUtil.isCLickPL(x, y,
                function (points, i) {
                    isClickPLFlag = true;
                    pl = points[i];
                    oldCXY = {"x": x, "y": y};
                    oldPLXY = {"x": pl.x, "y": pl.y};
                    pl.show = false;
                    canvasEvents.canvasManager.flashCanvase();
                    nUtil.drawPoint(oldPLXY.x, oldPLXY.y, pl.radius, selectColor);
                    // 显示隐藏画布
                    canvasEvents.canvasManager.showNCanvas();
                    // console.log("挪动 ",selectColor);
                },
                function (lines, i) {
                    isClickPLFlag = true;
                    pl = lines[i];
                    oldCXY = {"x": x, "y": y};
                    oldPLXY = [];
                    for (let lineP of pl.lineData) {
                        oldPLXY.push({"x": lineP[0], "y": lineP[1]});
                    }
                    pl.show = false;
                    canvasEvents.canvasManager.flashCanvase();
                    nUtil.drawBLine(pl, selectColor);
                    console.log("挪动 ", oldPLXY);
                    // 显示隐藏画布
                    canvasEvents.canvasManager.showNCanvas();
                }, canvasEvents.canvasManager);
        } else {
            console.log("oldPLXY ", oldPLXY);
            // 防止未挪动就放下点
            canvasEvents.nCanvasMousemove(e);
            canvasEvents.canvasManager.hideCanvas();
            if (undefined !== pl.x) {
                pl.x = mResult.x;
                pl.y = mResult.y;
            } else {
                pl.lineData = oldPLXY;
            }
            pl.show = true;
            isClickPLFlag = false;
            pl = null;
            oldCXY = null;
            oldPLXY = null;
            canvasEvents.canvasManager.flashCanvase();
        }
    }

    // 清除点线按钮方法
    function deletePLBtnFunction(e) {
        let x = e.layerX;
        let y = e.layerY;
        cUtil.isCLickPL(x, y,
            function (points, i) {
                points.splice(i, 1);
                canvasEvents.canvasManager.flashCanvase();
            },
            function (lines, i) {
                lines.splice(i, 1);
                canvasEvents.canvasManager.flashCanvase();
            }, canvasEvents.canvasManager);
    }

    // 画布鼠标移动事件监听
    // this.canvasMousemove = function (e) {
    //     let x = e.layerX;
    //     let y = e.layerY;
    //     if ("drawLine" === canvasClickType && null != lineR) {
    //         // let ld = lineR.lineData;
    //         // // [lineR[lineR.length-1][0],lineR[lineR.length-1][1]],
    //         // let lineS = [
    //         //     [ld[ld.length - 1][0], ld[ld.length - 1][1]],
    //         //     [x, y]
    //         // ];
    //         // canvasEvents.canvasManager.flashCanvase();
    //         // cUtil.drawBLine(lineR, "#f00");
    //         // cUtil.drawSLine(lineS, "#0f0");
    //     } else if ("movePL" === canvasClickType && null != pl && isClickPLFlag) {
    //         // let moveX = x - oldCXY.x;
    //         // let moveY = y - oldCXY.y;
    //         // if (undefined !== pl.x) {// 点
    //         //     pl.x = moveX + oldPLXY.x;
    //         //     pl.y = moveY + oldPLXY.y;
    //         //     canvasEvents.canvasManager.flashCanvase();
    //         // } else if (undefined !== pl.lineData) { // 线
    //         //     for (let i = 0; i < pl.lineData.length; i++) {
    //         //         pl.lineData[i][0] = moveX + oldPLXY[i].x;
    //         //         pl.lineData[i][1] = moveY + oldPLXY[i].y;
    //         //     }
    //         //     canvasEvents.canvasManager.flashCanvase();
    //         // }
    //     }
    // };

    // 记录挪动数据
    let mResult;

    this.nCanvasMousemove = function (e) {
        let x = e.layerX;
        let y = e.layerY;
        if ("drawLine" === canvasClickType && null != lineR) {
            let ld = lineR.lineData;
            lineR.show = true;
            let lineS = [
                [ld[ld.length - 1][0], ld[ld.length - 1][1]],
                [x, y]
            ];
            canvasEvents.canvasManager.clearNCanvas();
            nUtil.drawBLine(lineR, "#f00");
            nUtil.drawSLine(lineS, "#0ff");
        } else if ("movePL" === canvasClickType && null != pl && isClickPLFlag) {
            let moveX = x - oldCXY.x;
            let moveY = y - oldCXY.y;
            if (undefined !== oldPLXY.x) {// 点
                // pl.x = moveX + oldPLXY.x;
                // pl.y = moveY + oldPLXY.y;
                canvasEvents.canvasManager.flashCanvase();
                canvasEvents.canvasManager.clearNCanvas();
                mResult = {"x": moveX + oldPLXY.x, "y": moveY + oldPLXY.y};
                nUtil.drawPoint(mResult.x, mResult.y, pl.radius, selectColor);
            } else if (undefined !== oldPLXY) { // 线
                for (let i = 0; i < oldPLXY.length; i++) {
                    oldPLXY[i][0] = moveX + oldPLXY[i].x;
                    oldPLXY[i][1] = moveY + oldPLXY[i].y;
                }
                canvasEvents.canvasManager.clearNCanvas();
                nUtil.drawBLine({lineData: oldPLXY}, selectColor);
            }
        }
    };

    //清屏方法
    function clearScreenBtnFunction() {
        canvasEvents.canvasManager.clearData();
        canvasEvents.canvasManager.flashCanvase();
    }
});

