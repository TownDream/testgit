//-----------------------需要访问的json----------------
let jsonPathArr;

//----------------------加载数据记录-------------------
//记录是否为第一次加载
let isFirstLoad = true;
// 记录json数据
let json = null;
// 是否刷新完成
let isLoadOver = false;

//画布元素
let canvas = document.getElementById("myCanvas");
let cxt = canvas.getContext("2d");

//----------------------参数------？---------------------
// 点 线的颜色和宽度
let lineWidth = 2, dotRadii = 3.5, fuzzyRange = 5, lineColor = "#000", dotColor = "#000", selectColor = "#00f",objSColor="#ff0295";

// 坐标最小值，做偏移使用
let XMin = 999999;
let Xmax = -999999;
let YMin = 999999;
let YMax = -999999;
// 屏幕可视大小
let windowWidth = document.documentElement.clientWidth - 40;
let windowHeight = document.documentElement.clientHeight - 40;
// canvas.offsetWidth = windowWidth;
// 放大缩小倍率
let DXStep = 1.1;
let ACount = 0;
//放大缩小参数,初始倍率
let AMagnification = Math.pow(DXStep, -3);
// 放大次数记录
let MCount = 0;
// 滚轮放大缩小平移参数
let XSkewing = 0, YSkewing = 0;
// 按键平移距离记录参数      XMStep:每次平移的像素
let XMSkewing = 0, YMSkewing = 0, XMStep = 100;

//----------------------记录----------------------------
// 路线数据记录
let lines = [];
// 点数据记录
let dotDs = [];
// 线数据字典
let linesDMap = new Map();
// 点数据字典
let dotsDMap = new Map();
// 供电点数据记录
let powerDotDMap = new Map();
// 记录是否点击到点或线
let clickData = null;
// 选中obj_type
let selectTypeStr = null;

//----------------------翻译----------------------------
// 种类Map
let typeMap = new Map();
// 性能Map
let pTranslateMap = new Map();
// 电压Map
let vlTranslateMap = new Map();

// 浮动信息
let dataFloat = document.getElementById("dataFloat");

let jsonRequstCount = 0;

// 点击后的相关线以及相关点记录
// 由于要用不同颜色标记，所以用不同Map记录
let suppleLines = new Map();
let suppleDots = new Map();
let downstreamLines = new Map();
let downstreamDots = new Map();

let objTypeSelect = document.getElementsByClassName("objTypeSelect")[0];
