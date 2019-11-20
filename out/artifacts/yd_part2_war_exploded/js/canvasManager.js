class CanvasManager {
    // 画布Id
    constructor(canvasBoxId) {
        CanvasManager.htmlInit(canvasBoxId);
        this.canvas = document.getElementById("myCanvas");
        this.nCanvas = document.getElementById("myNCanvas");
        this.cxt = this.canvas.getContext("2d");
        this.nCxt = this.nCanvas.getContext("2d");
        this.points = [];
        this.lines = [];
    }

    // 私有方法 画布html语句创建初始化
    static htmlInit(canvasBoxId) {
        let canvasBox = document.getElementById(canvasBoxId);
        //创建画布 以及 功能点击栏
        canvasBox.innerHTML = "" +
            "<style>\n" +
            "    #functionsBox {\n" +
            "        width: 300px;\n" +
            "        height: 50px;\n" +
            "        position: absolute;\n" +
            "        top: 40px;\n" +
            "        left: 40px;\n" +
            "        background: #fff;\n" +
            "        /* 转化元素类型 */\n" +
            "        display: grid; " +
            "        z-index: 500;\n" +
            "        /* 设置网格的间隙 */\n" +
            "        /*grid-gap: 0px;*/\n" +
            "        /* 设置每列的尺寸 */\n" +
            "        grid-template-columns: repeat(5, 1fr);\n" +
            "    }\n" +
            "    .fBtns {\n" +
            "        text-align: center;\n" +
            "        font-size: 16px;\n" +
            "        padding-top: 15px;\n" +
            "    }\n" +
            "    .selectFBtns {\n" +
            "        border-bottom: 3px solid #f00;\n" +
            "    }\n" +
            "</style>" +
            "\n" +
            "<div id=\"functionsBox\">\n" +
            "    <div class=\"fBtns\">画点</div>\n" +
            "    <div class=\"fBtns\">画线</div>\n" +
            "    <div class=\"fBtns\">挪动</div>\n" +
            "    <div class=\"fBtns\">删除</div>\n" +
            "    <div class=\"fBtns\">清屏</div>\n" +
            "</div> <canvas id=\"myCanvas\"></canvas><canvas id=\"myNCanvas\"></canvas>";
    }

    // 获取按钮元素
    static getBtns() {
        return document.getElementsByClassName("fBtns");
    }

    // 获取画布元素
    getCanvas() {
        return this.canvas;
    }

    getNCanvas() {
        return this.nCanvas;
    }

    showNCanvas() {
        this.nCanvas.style.display = "block";
    }

    hideCanvas(){
        this.nCanvas.style.display = "none";
        this.clearNCanvas();
    }

    getPoings() {
        return this.points;
    }

    setPoints(points) {
        this.points = points;
    }

    getLines() {
        return this.lines;
    }

    setLines(lines) {
        this.lines = lines;
    }

    addPoint(point) {
        this.points.push(point);
    }

    addLine(line) {
        this.lines.push(line);
    }


    init() {
        this.styleInit();
        this.setEvent();
    }

    // 样式初始化
    styleInit() {
        this.canvas.width = document.documentElement.clientWidth;
        this.canvas.height = document.documentElement.clientHeight;
        this.canvas.style.background = "#ffd887";
        this.canvas.style.zIndex = "300";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "7px";
        this.canvas.style.left = "8px";
        this.nCanvas.width = document.documentElement.clientWidth;
        this.nCanvas.height = document.documentElement.clientHeight;
        this.nCanvas.style.zIndex = "900";
        this.nCanvas.style.position = "absolute";
        this.nCanvas.style.top = "7px";
        this.nCanvas.style.left = "8px";
        this.nCanvas.style.display = "none";
        this.nCxt.fillStyle = "rgba(255,255,255,1)";
    }

    // 添加工具按钮事件监听
    setEvent() {
        let btns = CanvasManager.getBtns();
        for (let btn of btns) {
            btn.onclick = this.addEvent;
        }
    }

    // 添加事件
    addEvent(e) {
        console.log("e", e.srcElement.innerText);
        switch (e.srcElement.innerText) {
            case "画点":
                CanvasManager.drawPointBF();
                break;
            case "画线":
                CanvasManager.drawLineBF();
                break;
            case "挪动":
                CanvasManager.movePLBF();
                break;
            case "删除":
                CanvasManager.deletePLBF();
                break;
            case "清屏":
                CanvasManager.clearScreenBF();
                break;
        }
    }

    // 默认工具栏点击事件，可编辑
    static drawPointBF() {
    };

    static drawLineBF() {
    };

    static movePLBF() {
    };

    static deletePLBF() {
    };

    static clearScreenBF() {
    };

    static flashBtnsStyle(index) {
        let btns = CanvasManager.getBtns();
        for (let i = 0; i < btns.length; i++) {
            if (i === index) {
                btns[i].className = "fBtns selectFBtns";
            } else {
                btns[i].className = "fBtns";
            }
        }
    }

    // 刷新画布
    flashCanvase() {
        // 清除画布
        this.clearCanvas();
        // 画点
        for (let point of this.getPoings()) {
            if (point.show){
                cUtil.drawPoint(point.x, point.y, point.radius, "#f0f");
            }
        }
        // 画线
        for (let line of this.lines) {
            if (line.show){
                cUtil.drawBLine(line, "#f00");
            }
        }
    }

    clearCanvas() {
        this.cxt.beginPath();
        this.cxt.clearRect(0, 0, 3000, 3000);
        this.cxt.closePath();
    }

    clearNCanvas() {
        this.nCxt.beginPath();
        this.nCxt.clearRect(0, 0, 3000, 3000);
        this.nCxt.closePath();
    }

    clearData() {
        this.lines = [];
        this.points = [];
    }
}