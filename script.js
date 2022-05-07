// 作者：程序员方丈 <programmerfz@qq.com>
// 仓库：https://github.com/programmerfz/minesweeper

// 页面加载成功后执行
window.onload = async function () {
  // 加载图片
  const images = await MineSweeper.loadImages();

  // 创建一个“扫雷游戏画布”对象
  window.msCanvas = new MineSweeperCanvas('mine-sweeper', {
    images,
    resize: MineSweeper.handleCanvasResize,
    gameOver: MineSweeper.handleGameOver,
    gameWin: MineSweeper.handleGameWin,
    flagNumChange: MineSweeper.handleFlagNumChange,
    heartbeat: MineSweeper.handleHeartbeat,
  });
};

/**
 * 扫雷游戏类
 */
class MineSweeper {
  /**
   * 加载图片
   */
  static async loadImages() {
    // 待加载的图片
    const images = {
      number0: 'imgs/numbers/0.bmp',
      number1: 'imgs/numbers/1.bmp',
      number2: 'imgs/numbers/2.bmp',
      number3: 'imgs/numbers/3.bmp',
      number4: 'imgs/numbers/4.bmp',
      number5: 'imgs/numbers/5.bmp',
      number6: 'imgs/numbers/6.bmp',
      number7: 'imgs/numbers/7.bmp',
      number8: 'imgs/numbers/8.bmp',
      mine: 'imgs/grids/mine.bmp',
      burst: 'imgs/grids/burst.bmp',
      flagError: 'imgs/grids/flag-error.bmp',
      flag: 'imgs/grids/flag.bmp',
      questionMark: 'imgs/grids/question-mark.bmp',
      closed: 'imgs/grids/closed.bmp',
      hover: 'imgs/grids/hover.bmp',
    };

    // 构造Promis
    const promiseList = [];
    Object.keys(images).forEach((key) => {
      const imageSrc = images[key];
      promiseList.push(new Promise((resolve) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
          images[key] = image;
          resolve();
        };
      }));
    });

    // 并行加载
    await Promise.all(promiseList);

    return images;
  }

  /**
   * 处理画布大小改变事件
   * @param {integer} width 改变后的宽度
   */
  static handleCanvasResize(width) {
    // 获取扫雷窗口元素
    const msWinEle = MineSweeper.getMsWindowElement();

    // 重设扫雷窗口宽度
    msWinEle.style.width = `${width + 25}px`;
  }

  /**
   * 获取扫雷窗口元素
   */
  static getMsWindowElement() {
    return document.getElementsByClassName('ms-window')[0];
  }

  /**
   * 处理游戏结束事件
   */
  static handleGameOver() {
    // 设置失败表情
    const [img] = document.querySelectorAll('.face img');
    img.src = 'imgs/faces/fail.bmp';

    alert('游戏结束');
  }

  /**
   * 处理游戏获胜事件
   */
  static handleGameWin() {
    // 设置胜利表情
    const [img] = document.querySelectorAll('.face img');
    img.src = 'imgs/faces/success.bmp';

    alert('恭喜您获胜了');
  }

  /**
   * 处理旗子数变化事件
   * @param {number} flagNum 旗子数
   * @param {number} mineNum 地雷数
   */
  static handleFlagNumChange(flagNum, mineNum) {
    // 剩余地雷数
    const remaining = flagNum > mineNum ? 0 : mineNum - flagNum;

    // 获取图片元素
    const [img1, img2, img3] = document.querySelectorAll('.remaining img');

    // 更新指示牌
    MineSweeper.updateIndicator(img1, img2, img3, remaining);
  }

  /**
   * 处理游戏心跳事件
   * @param {number} duration 游戏持续时长
   */
  static handleHeartbeat(duration) {
    // 获取图片元素
    const [img1, img2, img3] = document.querySelectorAll('.time img');

    // 更新指示牌
    MineSweeper.updateIndicator(img1, img2, img3, duration);
  }

  /**
   * 更新指示牌 对应的图片
   */
  static updateIndicator(img1, img2, img3, num) {
    // 字符长度
    const len = `${num}`.length;

    // 百位数
    const hundreds = len < 3 ? 0 : `${num}`.substring(len - 3, len - 2);

    // 十位数
    const tens = len < 2 ? 0 : `${num}`.substring(len - 2, len - 1);

    // 个位数
    const units = `${num}`.substring(len - 1);

    /* eslint-disable */
    // 更新图片
    img1.src = `imgs/liquid-crystal-numbers/${hundreds}.bmp`;
    img2.src = `imgs/liquid-crystal-numbers/${tens}.bmp`;
    img3.src = `imgs/liquid-crystal-numbers/${units}.bmp`;
    /* eslint-disable */
  }

  /**
   * 重新开始游戏
   * @param {string} level 难度等级
   */
  static restart(level) {
    const config = {};

    // 根据类型调整配置
    if (level === 1) {
      config.rowNum = 9;
      config.colNum = 9;
      config.mineNum = 10;
    } else if (level === 2) {
      config.rowNum = 16;
      config.colNum = 16;
      config.mineNum = 40;
    } else if (level === 3) {
      config.rowNum = 16;
      config.colNum = 30;
      config.mineNum = 99;
    }

    // 使用新的配置重置画布
    window.msCanvas.reset(config);

    // 重置笑脸
    const [img] = document.querySelectorAll(".face img");
    img.src = "imgs/faces/normal.bmp";
  }

  /**
   * 打开新页面
   * @param {string} href
   */
  static openPage(href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.click();
  }
}

/**
 * 扫雷游戏画布类
 */
class MineSweeperCanvas {
  id = ""; // 画布ID
  element = null; // 画布元素
  context = null; // 画布上下文
  isPlaying = false; // 游戏是否正在进行中
  timer = null; // 计时器

  // 配置项
  configs = {
    gridSize: 25, // 每个格子的边长（像素）
    rowNum: 15, // 行数（纵向格子数量）
    colNum: 20, // 列数（横向格子数量）
    mineNum: 20, // 地雷数
    images: {}, // 图像资源
    resize: null, // 画布大小改变回调函数
    gameOver: null, // 游戏结束回调函数
    gameWin: null, // 游戏获胜回调函数
    flagNumChange: null, // 旗子数变化回调函数
    heartbeat: null, // 游戏心跳回调函数
  };

  // 画布数据
  datas = {
    grids: [], // 所有格子
    duration: 0, // 游戏持续时长（秒）
  };

  /**
   * 创建一个“扫雷游戏画布”对象
   * @param {object} configs 配置项
   */
  constructor(id, configs = {}) {
    // 初始化画布
    this.init(id);

    // 重置画布
    this.reset(configs);
  }

  /**
   * 初始化画布
   * @param {string} id 画布ID
   */
  init(id) {
    // 画布ID
    this.id = id;
    if (typeof this.id !== "string" || !this.id) throw new Error("画布ID有误");

    // 获取画布元素
    this.element = document.getElementById(this.id);
    if (!this.element) throw new Error("画布不存在");

    // 取画布上下文
    this.context = this.element.getContext("2d");
    if (!this.context) throw new Error("获取画布上下文失败");

    // 阻止画布右键菜单
    this.element.oncontextmenu = function (event) {
      event.preventDefault();
    };

    // 绑定事件
    this.element.onmousemove = this.handleMousemove.bind(this);
    this.element.onmousedown = this.handleMousedown.bind(this);
    this.element.onmouseout = this.handleMouseout.bind(this);
  }

  /**
   * 重置画布
   * @param {object} configs 配置项
   */
  async reset(configs = {}) {
    // 停止游戏循环
    await this.stopGameLoop();

    // 配置画布
    this.setConfigs(configs);

    // 检查画布配置
    this.checkConfigs();

    // 刷新画布宽高
    this.refreshSize();

    // 重置画布数据
    this.resetData();

    // 启动游戏循环
    this.startGameLoop();
  }

  /**
   * 停止游戏循环
   */
  async stopGameLoop() {
    // 等待两帧
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(true);
        });
      });
    });

    // 清除计时器
    if (this.timer) clearInterval(this.timer);

    // 更新游戏状态
    this.isPlaying = false;
  }

  /**
   * 启动游戏循环
   */
  startGameLoop() {
    // 更新游戏状态
    this.isPlaying = true;

    // 启动计时器
    this.timer = setInterval(() => {
      this.durationChange();
    }, 1000);

    // 执行游戏循环
    this.gameLoop();
  }

  /**
   * 游戏循环
   */
  gameLoop() {
    if (!this.isPlaying) return;

    // 重新绘制界面
    this.repaint();

    // 设置下一帧继续处理
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * 重新绘制画布
   */
  repaint() {
    // 获取配置
    const { gridSize, images } = this.configs;

    // 遍历所有格子
    for (let rowIdx = 0; rowIdx < this.datas.grids.length; rowIdx++) {
      const row = this.datas.grids[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const {
          number,
          isOpened,
          isMine,
          isNumber,
          isBurst,
          isFlagError,
          isFlag,
          isQuestionMark,
          isHover,
        } = row[colIdx];

        // 计算绘制的像素坐标
        const X = colIdx * gridSize;
        const Y = rowIdx * gridSize;

        // 判定绘制的图像
        let image = null;
        if (isOpened) {
          if (isBurst) {
            image = images.burst;
          } else if (isMine) {
            image = images.mine;
          } else if (isFlagError) {
            image = images.flagError;
          } else if (isNumber) {
            image = images[`number${number}`];
          } else {
            image = images.number0;
          }
        } else {
          if (isFlag) {
            image = images.flag;
          } else if (isQuestionMark) {
            image = images.questionMark;
          } else if (isHover) {
            image = images.hover;
          } else {
            image = images.closed;
          }
        }

        // 绘制图像
        this.context.drawImage(image, X, Y, gridSize, gridSize);
      }
    }
  }

  /**
   * 配置画布
   * 仅设置传入的配置项
   * @param {object} configs 配置项
   */
  setConfigs(configs = {}) {
    const {
      gridSize,
      rowNum,
      colNum,
      mineNum,
      images,
      resize,
      gameOver,
      gameWin,
      flagNumChange,
      heartbeat,
    } = configs;

    // 每个格子的边长（像素）
    if (gridSize) this.configs.gridSize = gridSize;

    // 行数（纵向格子数量）
    if (rowNum) this.configs.rowNum = rowNum;

    // 列数（横向格子数量）
    if (colNum) this.configs.colNum = colNum;

    // 地雷数
    if (mineNum) this.configs.mineNum = mineNum;

    // 图像资源
    if (images) this.configs.images = images;

    // 画布大小改变回调函数
    if (resize) this.configs.resize = resize;

    // 游戏结束回调函数
    if (gameOver) this.configs.gameOver = gameOver;

    // 游戏获胜回调函数
    if (gameWin) this.configs.gameWin = gameWin;

    // 旗子数变化回调函数
    if (flagNumChange) this.configs.flagNumChange = flagNumChange;

    // 游戏心跳回调函数
    if (heartbeat) this.configs.heartbeat = heartbeat;
  }

  /**
   * 检查画布配置
   */
  checkConfigs() {
    const {
      gridSize,
      rowNum,
      colNum,
      mineNum,
      images,
      resize,
      gameOver,
      gameWin,
      flagNumChange,
      heartbeat,
    } = this.configs;

    // 图像资源键名
    const imageKeys = [
      "number0",
      "number1",
      "number2",
      "number3",
      "number4",
      "number5",
      "number6",
      "number7",
      "number8",
      "mine",
      "burst",
      "flagError",
      "flag",
      "questionMark",
      "closed",
      "hover",
    ];

    if (typeof gridSize !== "number" || gridSize <= 0) {
      throw new Error("格子边长有误");
    }

    if (typeof rowNum !== "number" || rowNum <= 0) {
      throw new Error("行数有误");
    }

    if (typeof colNum !== "number" || colNum <= 0) {
      throw new Error("列数有误");
    }

    if (typeof mineNum !== "number" || mineNum <= 0) {
      throw new Error("地雷数有误");
    }

    if (typeof images !== "object") throw new Error("图像资源有误");
    imageKeys.forEach((imgKey) => {
      if (!Object.prototype.hasOwnProperty.call(images, imgKey)) {
        throw new Error(`缺少图像资源${imgKey}`);
      }
    });

    if (resize && typeof resize !== "function") {
      throw new Error("画布大小改变回调函数有误");
    }

    if (gameOver && typeof gameOver !== "function") {
      throw new Error("游戏结束回调函数有误");
    }

    if (gameWin && typeof gameWin !== "function") {
      throw new Error("游戏获胜回调函数有误");
    }

    if (flagNumChange && typeof flagNumChange !== "function") {
      throw new Error("旗子数变化回调函数有误");
    }

    if (heartbeat && typeof heartbeat !== "function") {
      throw new Error("游戏心跳回调函数有误");
    }
  }

  /**
   * 刷新画布宽高
   */
  refreshSize() {
    const { colNum, rowNum, gridSize, resize } = this.configs;

    this.element.width = gridSize * colNum;
    this.element.height = gridSize * rowNum;

    if (resize) resize(this.element.width, this.element.height);
  }

  /**
   * 重置画布数据
   */
  resetData() {
    // 重置格子
    this.resetGrids();

    // 旗子数变化
    this.flagNumChange();

    // 随机布置地雷
    this.setMine();

    // 标记地雷数
    this.setMineNumber();

    // 重设游戏时长
    this.durationChange(0);
  }

  /**
   * 重置格子
   */
  resetGrids() {
    this.datas.grids = [];
    for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
      this.datas.grids[rowIdx] = [];
      for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
        const grid = {
          rowIdx, // 行索引（从1开始）
          colIdx, // 列索引（从1开始）
          number: 0, // 数字（周围九宫格地雷的数量）
          isOpened: false, // 是否已经打开
          isMine: false, // 是否地雷
          isNumber: false, // 是否数字
          isBurst: false, // 是否爆炸
          isFlagError: false, // 是否错误标记
          isFlag: false, // 是否旗子
          isQuestionMark: false, // 是否问号
          isHover: false, // 是否鼠标悬浮着
        };
        this.datas.grids[rowIdx][colIdx] = grid;
      }
    }
  }

  /**
   * 随机布置地雷
   */
  setMine() {
    // 生成所有格子的坐标
    const coords = [];
    for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
      for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
        coords.push({ rowIdx, colIdx });
      }
    }

    // 随机获取坐标设置为地雷
    for (let i = 0; i < this.configs.mineNum; i++) {
      const randomIdx = this.random(0, coords.length - 1);
      const { rowIdx, colIdx } = coords.splice(randomIdx, 1)[0];
      this.datas.grids[rowIdx][colIdx].isMine = true;
    }
  }

  /**
   * 生成指定范围的随机数
   * @param {integer} min 最小值（包含）
   * @param {integer} max 最大值（包含）
   * @returns {integer}
   */
  random(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  }

  /**
   * 标记地雷数
   */
  setMineNumber() {
    // 遍历所有格子
    for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
      for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
        // 跳过地雷
        if (this.datas.grids[rowIdx][colIdx].isMine) continue;

        // 遍历格子所在九宫格，累计地雷数
        let number = 0;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            // 计算的当前宫格坐标
            const rIdx = rowIdx - 1 + r;
            const cIdx = colIdx - 1 + c;

            // 跳过边界
            if (
              rIdx < 0 || // 超过上方边边界
              cIdx < 0 || // 超过左侧边界
              rIdx >= this.configs.rowNum || // 超过下方边边界
              cIdx >= this.configs.colNum // 超过右侧边界
            ) {
              continue;
            }

            // 累计地雷数
            if (this.datas.grids[rIdx][cIdx].isMine) {
              number += 1;
            }
          }
        }

        // 设置格子
        if (number > 0) {
          this.datas.grids[rowIdx][colIdx].number = number;
          this.datas.grids[rowIdx][colIdx].isNumber = true;
        }
      }
    }
  }

  /**
   * 通过事件对象获取触发事件的格子
   * @param {object} event
   * @returns {object} 触发事件的格子，没有相关格子时返回null
   */
  getGridByEvent(event) {
    const rect = document.getElementById(this.id).getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rowIdx = Math.ceil(y / this.configs.gridSize) - 1;
    const colIdx = Math.ceil(x / this.configs.gridSize) - 1;

    if (this.datas.grids[rowIdx] && this.datas.grids[rowIdx][colIdx]) {
      return this.datas.grids[rowIdx][colIdx];
    }
    return null;
  }

  /**
   * 处理画布鼠标移动事件
   * @param {object} event
   */
  handleMousemove(event) {
    if (this.isPlaying) {
      // 获取触发事件的格子
      const grid = this.getGridByEvent(event);
      if (!grid) return;

      // 设置所有格子为非鼠标悬浮状态
      for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
        for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
          this.datas.grids[rowIdx][colIdx].isHover = false;
        }
      }

      // 设置格子为鼠标悬浮状态
      grid.isHover = true;
    }
  }

  /**
   * 处理画布鼠标移出事件
   * @param {object} event
   */
  handleMouseout() {
    if (this.isPlaying) {
      // 设置所有格子为非鼠标悬浮状态
      for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
        for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
          this.datas.grids[rowIdx][colIdx].isHover = false;
        }
      }
    }
  }

  /**
   * 处理画布鼠标按下事件
   * @param {object} event
   */
  async handleMousedown(event) {
    if (this.isPlaying) {
      // 获取触发事件的格子
      const grid = this.getGridByEvent(event);
      if (!grid) return;

      // 左键点击
      if (event.button === 0) {
        // 非旗子、非问号标记、非打开时
        if (!grid.isFlag && !grid.isQuestionMark && !grid.isOpened) {
          // 打开格子
          grid.isOpened = true;

          // 是地雷，则游戏结束
          if (grid.isMine) {
            grid.isBurst = true;
            await this.gameOver();
            return;
          }

          // 是空格子，则递归打开其周围的八个格子
          if (!grid.isMine && !grid.isNumber) {
            await this.recursiveOpenEmptyGrid(grid);
          }

          // 所有没打开的格子都是雷，则胜利
          let isWin = true;
          for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
            for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
              const g = this.datas.grids[rowIdx][colIdx];
              if (!g.isOpened && !g.isMine) isWin = false;
            }
          }
          if (isWin) this.gameWin();
        }
      }

      // 右键点击
      if (event.button === 2) {
        // 已经打开则不处理
        if (grid.isOpened) return;

        // 如果是旗子，则改为问号
        if (grid.isFlag) {
          grid.isFlag = false;
          grid.isQuestionMark = true;
          this.flagNumChange();
          return;
        }

        // 如果是问号，则改为正常
        if (grid.isQuestionMark) {
          grid.isFlag = false;
          grid.isQuestionMark = false;
          return;
        }

        // 如果是正常，则插旗子
        if (!grid.isFlag && !grid.isQuestionMark) {
          grid.isFlag = true;
          this.flagNumChange();
          return;
        }
      }
    }
  }

  /**
   * 游戏结束
   */
  async gameOver() {
    // 打开所有雷
    for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
      for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
        const grid = this.datas.grids[rowIdx][colIdx];
        if (grid.isMine) grid.isOpened = true;
      }
    }

    // 停止游戏循环
    await this.stopGameLoop();

    // 触发游戏结束事件
    const { gameOver } = this.configs;
    if (gameOver) gameOver();
  }

  /**
   * 游戏胜利
   */
  async gameWin() {
    // 停止游戏循环
    await this.stopGameLoop();

    // 触发游戏胜利事件
    const { gameWin } = this.configs;
    if (gameWin) gameWin();
  }

  /**
   * 递归打开指定空格子周围的八个格子
   *
   * 空格子：没有地雷也不是数字
   * 递归：如果这八个格子中还有空格子，则继续打开其周围八个格子，以此类推
   *
   * @param {object} grid 指定的空格子
   */
  async recursiveOpenEmptyGrid(grid) {
    if (grid.isMine || grid.isNumber) return;

    // 可以继续打开的格子
    // 先收集起来，然后再一起打开
    // 为了实现连锁式的动画效果
    const targetGrids = [];

    // 遍历格子所在九宫格
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        // 计算的当前宫格坐标
        const rIdx = grid.rowIdx - 1 + r;
        const cIdx = grid.colIdx - 1 + c;

        // 跳过边界
        if (
          rIdx < 0 || // 超过上方边边界
          cIdx < 0 || // 超过左侧边界
          rIdx >= this.configs.rowNum || // 超过下方边边界
          cIdx >= this.configs.colNum // 超过右侧边界
        ) {
          continue;
        }

        // 跳过当前格子
        if (rIdx === grid.rowIdx && cIdx === grid.colIdx) {
          continue;
        }

        // 打开目标格子
        const targetGrid = this.datas.grids[rIdx][cIdx];
        if (!targetGrid.isOpened) {
          targetGrid.isOpened = true;
          // 收集可以继续打开的格子
          if (!grid.isMine && !grid.isNumber) {
            targetGrids.push(targetGrid);
          }
        }
      }
    }

    // 睡眠一小会
    await this.sleep(50);

    // 打开所有目标格子
    // 注意这里是异步执行
    for (let i = 0; i < targetGrids.length; i++) {
      this.recursiveOpenEmptyGrid(targetGrids[i]);
    }
  }

  /**
   * 睡眠指定毫秒数
   * @param {integer} timeout 毫秒数
   */
  async sleep(timeout) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  /**
   * 旗子数量变化
   */
  flagNumChange() {
    // 计算旗子数量
    let flagNum = 0;
    for (let rowIdx = 0; rowIdx < this.configs.rowNum; rowIdx++) {
      for (let colIdx = 0; colIdx < this.configs.colNum; colIdx++) {
        const g = this.datas.grids[rowIdx][colIdx];
        if (!g.isOpened && g.isFlag) flagNum += 1;
      }
    }

    // 触发插旗子事件
    const { flagNumChange } = this.configs;
    if (flagNumChange) {
      flagNumChange(flagNum, this.configs.mineNum);
    }
  }

  /**
   * 持续时间变化
   * @param {integer} duration
   */
  durationChange(duration = undefined) {
    if (duration !== undefined) {
      // 设置为目标值
      this.datas.duration = duration;
    } else {
      // 累计游戏时长
      this.datas.duration += 1;
    }

    // 触发游戏心跳事件
    const { heartbeat } = this.configs;
    if (heartbeat) heartbeat(this.datas.duration);
  }
}
