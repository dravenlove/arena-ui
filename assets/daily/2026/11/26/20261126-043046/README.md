# 2026-11-26 每日素材

ChatGPT内置图像工具4次调用获得4张原始PNG，实际北京时间04:30后开始。均为1536×1024、不透明alpha255，保留原始字节，无重抽或修图。

| 风格 | 原图 | 用途 |
| --- | --- | --- |
| 深色金属 | [组件板](benchmark/ui-kit-board.png) | 固定UI参考 |
| 深色金属 | [装备图集](benchmark/equipment-atlas.png) | 固定8件装备 |
| Q版奇幻 | [专精兵器](library/chibi-fantasy/chibi-specialist-arms-v1.png) | 8组武器 |
| Q版奇幻 | [先锋防具](library/chibi-fantasy/chibi-vanguard-gear-v1.png) | 8组防具 |

保留偏差：格内20%留白不足、背景非严格纯色；竖琴横梁颜色、战镐刃形、双刀装饰化、头盔檐形和鳞片背心层数与提示有差异。尚未裁成透明单件或做小程序实际槽位验收。

两个固定题目均已与2026-11-25相同提示词哈希的原图并排比较。完整实际提示词、版本、时间、尺寸、文件SHA-256与逐张观察见[manifest.json](manifest.json)。模型unreported、随机种子null；生成没有训练模型，单次变化不能证明模型升级。

本次只改素材与数据，检查历史页HTML/JS分区逻辑及HTTP索引、分类与图片，未进行浏览器页面代码回归。

[Q版历史预览](../../../../../../demo/history.html?style=chibi-fantasy) · [Drive素材库](https://drive.google.com/drive/folders/1lT-yG4fxiEmalmqlxXAnQtMDf19R8dn2)

Drive实际同步文件与核对结果另见assets/drive/sync-index.json；不把同步状态混写进历史生成清单。
