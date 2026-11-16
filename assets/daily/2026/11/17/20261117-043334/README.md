# 2026-11-17 每日素材

ChatGPT内置图像工具：4次调用保留4张成功原图，按实际北京时间归档。

| 分区 | 原图 | 用途 |
| --- | --- | --- |
| 深色金属固定对照 | [组件视觉参考板](benchmark/ui-kit-board.png) | 界面参考 |
| 深色金属固定对照 | [装备图集](benchmark/equipment-atlas.png) | 武器防具 |
| Q版奇幻扩展 | [空置六角宝匣](library/chibi-fantasy/chibi-empty-hex-reliquary-v1.png) | 空状态插画 |
| Q版奇幻扩展 | [双环胜利奖杯](library/chibi-fantasy/chibi-twin-ring-trophy-v1.png) | 胜利结算插画 |

固定对照均为1536×1024不透明PNG。两张扩展请求1024×1024，实际1254×1254，真实alpha为0至255，奖杯把手孔两处像素抽查完全透明。部分边缘未达到15%留白；装备仍有20%安全留白不足和背景色差。原始字节保留，没有重抽、缩放或修图。

完整提示词、版本、SHA-256、实际调用时间、尺寸、alpha边界、校验值和逐张观察见[manifest.json](manifest.json)。两个冻结题目已与2026-11-16同提示词哈希样本并排比较。模型版本unreported，随机种子null；生成没有训练模型，单次输出差异不能证明模型升级。

[Q版历史预览](../../../../../../demo/history.html?style=chibi-fantasy) · [全部风格预览](../../../../../../demo/history.html)
