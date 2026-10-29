# 素材风格分类

风格目录为 [assets/styles.json](../assets/styles.json)，用途目录仍为 [assets/categories.json](../assets/categories.json)。风格决定画面语言，用途决定使用位置，固定／扩展决定实验身份；三者独立。

| 风格 | 标识与入口 | 画面语言 |
| --- | --- | --- |
| 二次元奇幻 | `anime-fantasy` · [预览](../demo/history.html?style=anime-fantasy) | 正常人物比例、清晰线稿、赛璐璐阴影、蓝白幻想服饰、青色能量与淡金装饰 |
| Q版奇幻 | `chibi-fantasy` · [预览](../demo/history.html?style=chibi-fantasy) | 奶油暖色、可可描边、圆润厚实控件、大头小身人物、玩具质感 |
| 深色金属 | `dark-metal` · [预览](../demo/history.html?style=dark-metal) | 原 Arena UI；暗色底、银钢皮革、硬朗轮廓、克制的金青点缀 |

2026-10-29 首次分类时，54 张旧原图的 12 个历史批次逐一登记在 `runStyles` 中，归深色金属。旧图片、提示词、哈希和运行清单均不改写。首批 Q 版 4 张另建运行目录，逐张记录 `styleId`。

## 分类规则

1. 优先使用 `asset.styleId`，其次为 `run.styleId`，最后查 `runStyles[run.id]`。只接受 `styles` 中已登记的 ID。
2. 明确标记了未知值的素材进入“风格待确认”，不会回退到整批风格。缺少记录时同样单列，不按日期、名字或用途猜测。
3. 新混合批次每张素材都必须写 `styleId`。每天两个固定对照写 `dark-metal`，两个扩展写 `chibi-fantasy`。不把整批统一标成一种风格。
4. Q 版新素材使用 `chibi-` ID 与文件名前缀，存入 `library/chibi-fantasy/`；二次元素材使用 `anime-` 前缀，存入 `library/anime-fantasy/`。保留按日期归档的上层结构。
5. 图集和立绘仍按主要用途登记；新风格不能复用旧风格的素材 ID。视觉瑕疵照常记录，不删除样本。

## 页面行为

主页提供三套风格的独立入口；原交互组件演示保留“深色金属”说明。每日档案即使选择“全部风格”，也按三个风格分区展示，每张卡片都有风格标签。选择风格后可叠加用途、日期与固定／扩展筛选；URL 的 `style` 参数便于分享。

风格目录加载失败时图片仍可访问，但进入“风格待确认”。无效的风格链接不会显示其他风格冒充结果。固定对照要求风格与提示词哈希一致；图库筛选不改变对照区。

Q 版与二次元系列目前是图片素材与静态 UI 参考，并未给现有 React 组件添加换肤功能。Q 版首批素材及具体限制见 [CHIBI_UI.md](CHIBI_UI.md)；后续独立主角见 [CHIBI_CHARACTERS.md](CHIBI_CHARACTERS.md)，游戏道具见 [CHIBI_ITEMS.md](CHIBI_ITEMS.md)。二次元首批四张样张见 [ANIME_ASSETS.md](ANIME_ASSETS.md)。二次元为用户手动追加的独立系列；每日扩展仍使用 Q 版，两个冻结对照仍使用深色金属。

二次元组件套件见 [ANIME_UI.md](ANIME_UI.md)，包含4张图集、28个设计项；[分类专页](../demo/anime-ui.html)与[坐标目录](../assets/anime-ui.json)分别提供逐项预览与实际像素区域。每日图库仍按原图计数。
