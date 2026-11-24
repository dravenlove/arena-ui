# 2026-11-25 每日素材

ChatGPT内置图像工具4次调用成功4张，实际北京时间04:30后开始，原始PNG均为1536×1024不透明图，未重抽或修改。

| 风格 | 原图 | 用途 |
| --- | --- | --- |
| 深色金属 | [组件参考板](benchmark/ui-kit-board.png) | UI参考 |
| 深色金属 | [装备图集](benchmark/equipment-atlas.png) | 8件装备 |
| Q版奇幻 | [远征玩法](library/chibi-fantasy/chibi-expedition-modes-v1.png) | 8个玩法入口 |
| Q版奇幻 | [成长功能](library/chibi-fantasy/chibi-growth-utilities-v1.png) | 8个功能入口 |

已逐张检查4列2行数量、主体完整性与alpha。保留缺陷包括格内留白不足、背景非严格纯色、浮漂误用珊瑚红、星形招募票未呈明确镂空。未裁切成透明图标，也未做小程序接入测试。

完整实际提示词、版本、哈希、时间、尺寸、字节校验与逐张观察见[manifest.json](manifest.json)。组件板与11月24日、装备与11月23日最近同提示词哈希输出并排比较；11月24日装备调用失败。模型unreported，种子null。本次生成不是训练，单次差异不能证明模型升级。

历史页与图片、索引HTTP已检查，依据现有页面风格分区逻辑核对两种风格映射；本次浏览器连接不可用，未完成浏览器视觉验收。页面代码无修改。

[Q版历史预览](../../../../../../demo/history.html?style=chibi-fantasy)
