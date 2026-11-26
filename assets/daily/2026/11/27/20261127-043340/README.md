# 2026-11-27 每日素材

ChatGPT内置图像工具4次调用成功4张，均为1536×1024不透明原始PNG，保留工具字节。按实际北京时间归档，无重抽、修图或缩放。

| 风格 | 原图 | 用途 |
| --- | --- | --- |
| 深色金属 | [组件参考板](benchmark/ui-kit-board.png) | 固定UI对照 |
| 深色金属 | [装备图集](benchmark/equipment-atlas.png) | 固定8件装备 |
| Q版奇幻 | [机巧攻击](library/chibi-fantasy/chibi-clockwork-attacks-v1.png) | 8组攻击技能 |
| Q版奇幻 | [战地支援](library/chibi-fantasy/chibi-field-support-v1.png) | 8组支援技能 |

每张已检查可解码、4列2行数量、裁切和真实alpha。保留偏差包括格内20%留白不足、背景非严格纯色、钻头外侧能量弧偏大、担架展开状态、潜望镜外形和救援哨声弧数量。未裁成透明单图，未做小程序交互或缩小辨识验收。

两张固定对照已与2026-11-26相同提示词哈希样本并排观察；原文提示词、新扩展哈希、版本、时间、尺寸、文件校验值及观察见[manifest.json](manifest.json)。实际模型unreported，随机种子null；生成不是训练，单次差异不能证明模型升级。

本次只改素材和数据，已检查历史页分区逻辑以及HTTP索引、分类和图片，未修改页面代码或做页面回归。Drive实际同步记录另见assets/drive/sync-index.json。

[历史预览](../../../../../../demo/history.html?style=chibi-fantasy) · [Drive素材库](https://drive.google.com/drive/folders/1lT-yG4fxiEmalmqlxXAnQtMDf19R8dn2)
