# 角色、装备与养成材料扩展包

2026-10-28 根据用户“多生成一些素材”的请求，通过 ChatGPT 内置 imagegen 追加 **6 张独立透明 PNG**：两位角色、两件装备、两种养成材料。每项生成一次，原始文件完整保留。本批为 `manual-extension`，与当天四张定时素材及稍早的夜刃刺客分别归档。

| 素材 | 建议用途 | 实际尺寸 | 原图 |
| --- | --- | --- | --- |
| 圣愈祭司 | 治疗支援职业、编队、角色养成 | 1024 × 1536 | [dawn-healer.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/dawn-healer.png) |
| 银锋枪卫 | 长柄武器职业、阵容、角色选择 | 1024 × 1536 | [silver-lancer.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/silver-lancer.png) |
| 机关手弩 | 远程武器背包格、锻造与装备详情 | 1254 × 1254 | [repeater-hand-crossbow.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/repeater-hand-crossbow.png) |
| 守护腕甲 | 防具背包格、装备强化、锻造配方 | 1254 × 1254 | [sentinel-bracer.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/sentinel-bracer.png) |
| 觉醒核心 | 角色突破、觉醒消耗品、奖励 | 1254 × 1254 | [awakening-core.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/awakening-core.png) |
| 技能秘典 | 技能升级材料、技能树消耗品 | 1254 × 1254 | [tactical-skill-tome.png](../assets/daily/2026/10/28/20261028-161334-progression-pack/library/tactical-skill-tome.png) |

## 使用与检查

六张均已验证 PNG 可解码、真实透明通道、文件校验值、提示词哈希及与工具原始文件字节一致。两位角色 alpha 范围 0–254，四件物品为 0–255。方形图的请求尺寸为 1024 × 1024，工具实际返回 1254 × 1254，未缩放掩盖差异。

已直接显示原 PNG 检查深底 `#171c24` 与浅底 `#f2f4f8`：人物按 128 × 192，物品按 128 × 128。主体、武器尖端与物件边缘完整，无实心黑色背景或宽灰晕。角色细杖杆、枪杆在深底对比较弱，细节在缩略图中会减少。

头脚和图标四周安全留白没有完全达到提示词要求，尤其枪尖上方较窄。原图中还存在极低 alpha 像素，直接按所有非零像素自动裁边会得到过大的范围；发布时应另外设置显示缩放与布局留白，保留本档案原图。

本次可见偏差也保留在记录中：祭司下摆长于要求，枪卫长枪高出头部较多；觉醒核心的背侧固定爪不可见，不能核实六爪总数；秘典出现两道箭头而非一道，书签伸出书本轮廓。这些输出均未重抽。

单张原图约 0.85–1.52 MiB。它们是静态素材，没有角色动作帧、分层骨骼或微信小程序实机验证；接入小程序时再按实际显示尺寸导出发布文件，文字、等级、数值与点击区域由界面独立处理。

[完整提示词与逐图记录](../assets/daily/2026/10/28/20261028-161334-progression-pack/manifest.json) · [按日期预览](../demo/history.html) · [其他人物立绘](CHARACTER_ASSETS.md)

实际模型版本与随机种子未由工具返回，记录为 `unreported` / `null`。本批不会改动每日 09:00 的生成计划，也不能作为模型升级或训练效果的证据。
