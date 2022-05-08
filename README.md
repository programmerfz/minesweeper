# 扫雷游戏（minesweeper）

这是一款由 JavaScript + HTML + CSS 制作的网页小游戏，请 [点击体验](https://pages.programmerfz.com/games/minesweeper/)。

![示例图](https://raw.githubusercontent.com/programmerfz/minesweeper/main/imgs/sample.png)

## 玩法说明

1. 左键点击来翻开格子，翻开有地雷的格子则游戏结束，翻开所有安全的格子则获得胜利。

2. 每个数字表示该格子周围所有格子（上、下、左、右、左上、右上、左下、右下）中一共埋藏的地雷数。

3. 当你确定某个未翻开的格子下方有地雷时，右键点击它，将会在其上方插上一把旗子作为标记。左键再次点击它时，不会将其翻开。

## 开发思路

1. Canvas 画布：游戏中间的主要画面由 JavaScript 通过 Canvas API 来绘制；其他的界面元素则由 HTML + CSS 来制作。

2. 游戏循环：Canvas 画布中涉及的数据，均会以对象属性的形式保存；当玩家操作或控制游戏时，会动态改变相关的数据；最关键的是，当你的显示屏每刷新一帧时，游戏会根据数据重新绘制画布，以实时展示最新的游戏画面。

3. 动画：针对高刷新率（FPS）的设备，可以绘制出绚丽的动画效果，比如骨牌式连锁翻开空格子效果，[点击体验](https://pages.programmerfz.com/games/minesweeper/)。
