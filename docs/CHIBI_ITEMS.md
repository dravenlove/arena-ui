# Q版游戏道具包

2026-10-29 使用 **ChatGPT 内置 image_gen**，按用户额外请求新增 **8 张独立透明 PNG**。这是一次 `manual-extension`，不会修改每日排程或冻结对照。

[打开 Q 版素材预览](../demo/history.html?style=chibi-fantasy)；药水、奖励和材料在“养成与奖励”，短剑与圆盾在“武器防具”。所有道具同时带 `chibi-fantasy` 风格标签，与旧深色金属系列分开。

| 道具／原图下载 | 用途 | 实际尺寸 |
| --- | --- | --- |
| [Q版·生命药水](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-health-potion.png) | 回复生命 | 1254×1254 |
| [Q版·能量药水](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-mana-flask.png) | 补充能量 | 1254×1254 |
| [Q版·冒险宝箱](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-reward-chest.png) | 关卡宝箱奖励 | 1254×1254 |
| [Q版·金币袋](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-coin-pouch.png) | 金币奖励与商城货币 | 1254×1254 |
| [Q版·史诗成长晶石](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-epic-growth-crystal.png) | 史诗级养成材料 | 1254×1254 |
| [Q版·技能卷轴](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-skill-scroll.png) | 技能升级消耗品 | 1254×1254 |
| [Q版·逐光短剑](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-starter-sword.png) | 近战武器与装备奖励 | 1254×1254 |
| [Q版·橡木圆盾](../assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/chibi-oak-shield.png) | 防具与角色装备 | 1254×1254 |

## 复用与检查

一图一道具或紧凑组合，可分别下载，无需从图集裁切。已检查 **64px、96px，深色底与奶油浅底**：八件主体可辨，96px更适合展示细节；64px时金币纹样、玻璃气泡和木纹会减弱，建议配名称或用途标签。

八张均为 RGBA，alpha 范围 **0–255**，无不透明矩形背景；完全透明像素比例约49–77%。请求尺寸是1024×1024，工具实际返回1254×1254，原图按原始字节保存，未重采样。

主体完整，但若干图片的边距小于提示要求的15%，请使用等比适配（例如小程序图片的 `aspectFit`）并留出容器内边距，避免铺满裁切。高光比提示中的柔和哑光更强；成长晶石底座多了一颗小宝石，短剑尖端也比要求更尖，这些偏差均写入运行记录。

| 素材 | 具体观察 |
| --- | --- |
| Q版·生命药水 | 红色圆瓶与心形挂饰清楚，玻璃高光偏亮；心形实际为红色而非提示要求的奶油色。 |
| Q版·能量药水 | 青色水滴瓶与内含气泡明显，轮廓与生命药水不同；纵向占比偏大。 |
| Q版·冒险宝箱 | 木箱、金边、星形锁扣和箱内金币完整；开启角度大于稍微开启的要求，金属反光较强。 |
| Q版·金币袋 | 布袋与前方三枚金币组成紧凑图形，三枚均有星形图案；布袋绳结与折褶细节较多。 |
| Q版·史诗成长晶石 | 紫色主晶体和奶油金色底座完整，史诗配色明确；底座额外出现一颗小装饰宝石，晶体尖角比圆润要求更明显。 |
| Q版·技能卷轴 | 卷纸、棕色绑带与星形封印完整，无文字；横向占比偏大，金色封印在小图中更显眼。 |
| Q版·逐光短剑 | 短剑向右上倾斜、护手厚实、青色能量核心清晰；刀尖比钝圆要求更尖，仍保持了完整轮廓。 |
| Q版·橡木圆盾 | 四枚铆钉、橡果纹样、木芯和外圈完整；轻微透视形成椭圆轮廓，背面握带可辨。 |

## 原图与提示词

目录：`assets/daily/2026/10/29/20261029-152631-chibi-items/library/chibi-fantasy/`。

[本次 manifest：完整提示词、调用时间、PNG 尺寸、alpha 检查和 SHA-256](../assets/daily/2026/10/29/20261029-152631-chibi-items/manifest.json)。每件只调用一次，共8次，所有成功结果均保存。未报告的底层模型版本与随机种子分别记录为 `unreported` 与 `null`。
