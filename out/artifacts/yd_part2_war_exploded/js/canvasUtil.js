class CanvasUtil {
    constructor(canvas) {
        this.canvas = canvas;
        this.cxt = this.canvas.getContext("2d");
    }

    // 画点
    drawPoint(x, y, radius, color) {
        //设置绘制颜色
        this.cxt.fillStyle = color;
        //绘制成矩形
        // ctx.fillRect(getNewXY(x,"x"),getNewXY(y,"y"),dotWidth,dotWidth);
        this.cxt.beginPath();
        this.cxt.arc(x, y, radius, 0, 2 * Math.PI);
        this.cxt.fill();
        //设置字体样式
        this.cxt.font = "12px bold 宋体";
        //绘制文字
        // ctx.fillText("("+x+","+y+")",getNewXY(x,"x"),getNewXY(y,"y"));
        // ctx.fill();
    }

    // 划折线
    drawBLine(line, color) {
        this.cxt.save();
        // 开始绘制
        this.cxt.beginPath();
        this.cxt.strokeStyle = color;
        let aLine = line.lineData;
        this.cxt.lineWidth = line.width;//边框宽度
        this.cxt.moveTo(aLine[0][0], aLine[0][1]);
        for (let i = 1; i < aLine.length; i++) {
            this.cxt.lineTo(aLine[i][0], aLine[i][1]);
        }
        //设置字体样式
        this.cxt.font = "12px bold 宋体";
        //绘制文字
        // let wb = aLine[0].length -1;
        // ctx.fillText("头 ("+aLine[0][0]+","+aLine[0][1]+")",getNewXY(aLine[0][0],"x"), getNewXY(aLine[0][1],"y"));
        // ctx.fillText("尾 ("+aLine[wb][0]+","+aLine[wb][1]+")",getNewXY(aLine[wb][0],"x"), getNewXY(aLine[wb][1],"y"));
        this.cxt.stroke();
    }

    // 画直线
    drawSLine(sLine, color) {
        this.cxt.beginPath();
        this.cxt.strokeStyle = color;
        this.cxt.moveTo(sLine[0][0], sLine[0][1]);
        this.cxt.lineTo(sLine[1][0], sLine[1][1]);
        this.cxt.stroke();
    }

    // 判断是否点击到点
    isPointInRect(x, y, point) {
        let xx = point.x - x;
        let yy = point.y - y;
        let isMove = Math.sqrt(xx * xx + yy * yy);
        return isMove < point.radius;
    }

    // 判断是否点击到线
    // x,y:点击坐标
// ox,oy:路线头部坐标
// tx,ty:路线尾部坐标
    isPointInSLine(x, y, ox, oy, tx, ty,width) {
        // 将城市坐标进行转换
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
        if (distance > width
            || (intersectX < ox && intersectX < tx)
            || (intersectY < oy && intersectY < ty)
            || (intersectX > ox && intersectX > tx)
            || (intersectY > oy && intersectY > ty)) {
            return false;
        }
        return true;
    }

    isCLickPL(x, y, pointF, lineF,canvasManager) {
        let points = canvasManager.getPoings();
        // 判断是否点击到点或线
        pOver:
            for (let i = 0; i < points.length; i++) {
                let isClick = this.isPointInRect(x, y, points[i]);
                if (isClick) {
                    pointF(points, i);
                    break pOver;
                }
            }

        let lines = canvasManager.getLines();
        dOver:
            for (let i = 0; i < lines.length; i++) {
                let ld = lines[i].lineData;
                for (let j = 0; j < ld.length - 1; j++) {
                    if (this.isPointInSLine(x, y, ld[j][0], ld[j][1], ld[j + 1][0], ld[j + 1][1], lines[i].width)) {
                        lineF(lines, i);
                        break dOver;
                    }
                }
            }
    }
}

