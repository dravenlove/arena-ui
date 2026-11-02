# 二次元界面级素材

## 2026-10-30：背景与内容底板

通过 ChatGPT 内置 image_gen 生成4张原图；生成时间保留2026-10-30，本次于2026-11-02补齐验收记录。属于 manual-extension，独立归入 `anime-fantasy`。

[查看二次元归档](../demo/history.html?style=anime-fantasy) · [既有组件图集](ANIME_UI.md)

| 原图下载 | 用途 | 实际尺寸 | 背景 |
| --- | --- | --- | --- |
| [二次元·天空庭院主界面背景](../assets/daily/2026/10/30/20261030-143551-anime-screen-assets/library/anime-fantasy/anime-ui-lobby-sky-background.png) | 竖屏主界面背景，可叠加角色与导航 | 1024×1536 | 不透明 |
| [二次元·角色信息面板](../assets/daily/2026/10/30/20261030-143551-anime-screen-assets/library/anime-fantasy/anime-ui-character-info-panel.png) | 角色详情与属性页面底板 | 1024×1536 | 透明外部、填色内部 |
| [二次元·任务卡片](../assets/daily/2026/10/30/20261030-143551-anime-screen-assets/library/anime-fantasy/anime-ui-mission-card.png) | 任务列表单行卡片，可叠加图标、描述与奖励 | 1536×1024 | 透明外部、填色内部 |
| [二次元·奖励弹窗](../assets/daily/2026/10/30/20261030-143551-anime-screen-assets/library/anime-fantasy/anime-ui-reward-dialog.png) | 领取奖励与战斗结算弹窗底板 | 1254×1254 | 透明外部、填色内部 |

三个底板都留空文字和数值，已在深色与浅色背景上检查。角色面板和任务卡片的alpha范围0–254，奖励弹窗为0–255。背景为1024×1536不透明图；奖励弹窗请求1024×1024，实际1254×1254。原图未经裁切、缩放或修图。

角色面板包含3条属性行；奖励弹窗包含3个空奖励槽；任务卡片实际约4.8:1，比计划更扁，移动端叠加多行文字前需要检查行高。各底板有方向上的安全留白不足，边缘存在轻微杂色。背景中右侧建筑及地面反光较繁复，叠字建议使用独立底板。

这些是静态视觉素材；文字、奖励、属性、点击热区需由小程序代码实现。未验证九宫格拉伸或按钮状态，不宜直接任意拉伸。独立图片无需从图集切格，若要去除外围透明留白，请另存派生文件并保留原图。

[完整提示词、时间、alpha和哈希记录](../assets/daily/2026/10/30/20261030-143551-anime-screen-assets/manifest.json)。底层模型版本未返回，记录为 `unreported`，随机种子为 `null`。
