# 主界面常用图标

2026-10-28 按用户请求手动追加 **8 枚独立透明 PNG**，适用于竞技／角色养成游戏的首页入口。均使用 ChatGPT 内置图像生成功能，每项生成一次，保存原始输出。实际模型版本未返回，记录为 `unreported`，随机种子为 `null`。

打开 [主页图标预览](../demo/index.html#home-icons)，可切换 48 / 64 / 96px 和深浅底、查看用途、逐张下载。素材也已归入 [每日档案](../demo/history.html) 的“玩法入口”分类。

## 素材清单

| 入口 | 文件 | 建议用途 |
| --- | --- | --- |
| 英雄 | [home-heroes.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-heroes.png) | 角色列表、编队与养成 |
| 背包 | [home-backpack.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-backpack.png) | 物品、装备整理 |
| 任务 | [home-quests.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-quests.png) | 每日任务、委托与成就目标 |
| 商城 | [home-shop.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-shop.png) | 道具商店与礼包 |
| 邮件 | [home-mail.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-mail.png) | 系统邮件、通知和附件 |
| 好友 | [home-friends.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-friends.png) | 好友列表与邀请 |
| 排行榜 | [home-ranking.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-ranking.png) | 竞技排名、段位与赛季 |
| 设置 | [home-settings.png](../assets/daily/2026/10/28/20261028-205556-home-icons/library/home-settings.png) | 音效、画质和游戏设置 |

页面使用 [assets/home-icons.json](../assets/home-icons.json) 读取稳定 ID、中文标签、用途、路径、实际尺寸与文件校验值。完整原文提示词、提示词 SHA-256、调用时间与目视观察保存在 [本次 manifest.json](../assets/daily/2026/10/28/20261028-205556-home-icons/manifest.json)。

## 复用方式

每张原图实际为 **1254 × 1254 RGBA PNG**，均包含真实全透明像素，字节与生成工具输出一致。提示词请求 1024 × 1024，实际输出尺寸单独记录；没有改尺寸来伪装符合请求。原图约 1.0–1.6 MiB，当前页面直接用于预览，正式小程序应按显示分辨率另做导出并检查包体与加载效果。

文件内容没有烘焙文字，入口名称由页面渲染。保持等比缩放并显示中文标签，常用预览尺寸为 64–96px；48px 下背包的暗色细节、商城柜台和排行榜桂冠会减弱，排行榜整体视觉高度也小于其他图标。深浅底检查未见不透明方形底板或棋盘背景。

例如将下载的原图放到小程序 `images/home/` 后，可用以下展示结构；点击事件与实际页面路由需要由小程序接入：

```xml
<view class="home-entry">
  <image class="home-entry-icon" src="/images/home/home-heroes.png" mode="aspectFit" />
  <text>英雄</text>
</view>
```

```css
.home-entry { display: flex; flex-direction: column; align-items: center; }
.home-entry-icon { width: 128rpx; height: 128rpx; }
```

这些是静态入口图片，主页演示中的选择只用于查看素材用途。尚未在微信开发者工具或真机验证。

## 保留的生成偏差

八张均未严格满足提示词的四周 18% 留白；程序同时记录 alpha 非零边界与 alpha ≥ 16 的可见边界。外围存在少量低透明度像素，未清除或裁切原图。英雄肩甲较宽；背包前方有三条主要竖带，多于请求的两条；商城装饰比请求更丰富；排行榜为较宽的三阶底座。预览下主体完整，未见明显主体截断，建议用独立图像容器等比显示。

本次手动批次与每天的固定对照分开记录，没有更改定时频率或冻结提示词，也不据此推断模型升级。
