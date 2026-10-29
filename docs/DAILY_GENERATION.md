# 每日生成与时间档案

每天 **09:00，Asia/Shanghai（上海时间）** 使用 ChatGPT 内置图像工具生成四张图片：两张固定基准图、两张扩展素材。自动化 `arena-ui` 已启用，首次定时批次已于 **2026-10-25** 完成：四次调用获得四张可解码原图（两张固定对照、荒漠竞技场、幽林竞技场），图片与记录已归档。2026-10-24 的八张图仍是初次手动会话记录，不算作定时批次。

## 固定题目与扩展题目

`assets/daily/config.json` 保存每日数量、固定题目及七日轮换主题。两个基准分别为 `ui-kit-board-v1` 和 `equipment-atlas-v1`，提示词逐字取自首次生成记录。提示词、请求尺寸和透明背景设置冻结；每次直接复用，不改写、不额外扩充。如果需要修改，创建新的基准 ID 和版本，保留旧记录。

从用户 2026-10-29 的明确选择起，每日两张扩展统一采用 **Q版奇幻 `chibi-fantasy`**，固定对照仍为 **深色金属 `dark-metal`**。当天已完成的 scheduled 批次不重做；当天新 Q 版四张为独立 manual-extension。先读 [STYLES.md](STYLES.md)、`assets/styles.json` 和配置中的 `stylePolicy`。

每天其余两张按 `themes` 扩展组件库，依次覆盖武器防具、战斗支援技能、货币奖励、战役场景、角色头像、空状态结算插画、玩法导航插画。每个主题内有两条完整提示词模板、目标尺寸、透明背景设置及模板提示词哈希。扩展题目可根据已有素材换成尚未覆盖的物品或场景，遵循 `assets/styles.json` 的 Q 版圆润形状、玩具质感与颜色语义。`themes` 中旧模板仍保留原文作为历史来源，使用其题材、格数、用途、尺寸与透明设置，生成前必须把旧深色金属风描述改写为 Q 版；不能原样提交旧扩展模板。生成前先记录本次实际使用的完整提示词并计算其哈希，不能把模板哈希误当作改写后提示词的哈希。只有两个固定基准题目必须逐字不变。

主题用**本次运行开始时的上海日历日期 `YYYY-MM-DD`**确定，与归档日期及 09:00 排程一致。把这个上海日期交给 `Date.UTC` 计算它距 1970-01-01 的整天数，再对 7 取余；这里使用 UTC 仅为稳定计算日期差，不是读取运行时的 UTC 当天：

```js
const [year, month, day] = shanghaiDate.split('-').map(Number);
const themeIndex = Math.floor(Date.UTC(year, month - 1, day) / 86400000) % 7;
const themeId = config.rotation.order[themeIndex];
```

`shanghaiDate` 必须来自 `Asia/Shanghai` 时区，月份在调用 `Date.UTC` 时减一。主题顺序见配置的 `rotation.order`，同一上海日期始终选中同一主题；它不是按星期几重新猜测题目。一次未完成批次续跑时，继续使用该批次已记录的日期、主题和提示词，避免凌晨补跑切换到其他主题。

## 路径与记录格式

未来生成保存在以下目录，原图不覆盖，成功后读图验收：

```text
assets/daily/YYYY/MM/DD/<run-id>/manifest.json
assets/daily/YYYY/MM/DD/<run-id>/benchmark/<filename>.png
assets/daily/YYYY/MM/DD/<run-id>/library/chibi-fantasy/chibi-<filename>.png
```

`run-id` 使用上海本地 `YYYYMMDD-HHmmss`。每日运行的 `kind` 为 `scheduled`；首次会话为 `initial-session`。`date` 使用 `YYYY-MM-DD`，`time` 使用上海本地 `HH:mm:ss`。不知道具体生成时间时必须写 `null`，不能补造 09:00。

`assets/daily/index.json` 内嵌每次运行的全部素材信息，时间档案页面读取一次索引即可展示，无需逐个请求运行清单。索引结构为：

```json
{
  "schemaVersion": 1,
  "timezone": "Asia/Shanghai",
  "runs": [
    {
      "id": "20261024-initial-session",
      "date": "2026-10-24",
      "time": null,
      "manifest": "assets/daily/2026/10/24/initial-session/manifest.json",
      "kind": "initial-session",
      "status": "complete",
      "assets": []
    }
  ]
}
```

每张新素材必须记录 `styleId`：基准为 `dark-metal`，扩展为 `chibi-fantasy`。同批次包含两种风格时不能仅在 run 上指定一种风格；逐张登记。Q 版新 ID、文件名均使用 `chibi-` 前缀，扩展文件放入 `library/chibi-fantasy/`，旧文件不搬迁。

每张素材记录 `id`、`label`、`group`、仓库相对 `path`、实际完整 `prompt`、`promptSha256`、`promptVersion`、`requestedSize`、实际 `size`、`transparentBackground`、`model`、文件 `sha256` 和 `bytes`。基准图另带 `benchmarkId`。`group` 仅为 `benchmark` 或 `library`；ID 在一次运行内唯一，跨次身份由运行 ID 与素材 ID 共同确定。

`promptSha256` 是提示词原文 UTF-8 字节的 SHA-256，不做 trim、换行转换或 Unicode 归一化。文件哈希同样基于实际原图字节。目标尺寸和实际尺寸分别记录，工具输出偏离目标尺寸时保留事实，不自动重绘或缩放来掩盖差异。首次头像及透明背包实际为 1254 × 1254，目标为 1024 × 1024。

运行清单包含同一条运行数据，并可增加 `evaluation`、`notes`、`themeId`、`attemptCount` 和 `attempts`。后续定时批次需记录每次工具调用的槽位、时间、结果及错误，确保重入后仍能核对当日调用预算。首次会话没有可靠的调用次数记录，不据此推定定时批次的调用次数。

## 幂等、失败与提交

按上海日期和 `kind: scheduled` 查找已有批次。当天已有四张成功且可解码的输出时直接退出；不足四张时复用成功文件并续跑剩余槽位，不另起一批重复出图。初次会话的八张图不计入定时完成度。

每天最多调用图像工具四次，不因个人偏好反复抽样。文字错误、裁切偏差、布局未遵循或其他视觉缺陷都要照样存档并具体记录；这些是观察结果，不是丢弃样本或重新生成的理由。工具技术失败或输出不可解码才不计入成功数。续跑仍受当天累计四次调用上限约束；达到上限后即使成功数不足四张，也记录 `partial` 或 `failed` 及原因，不伪造成功。每日得到四张成功且可解码的输出并完成观察记录后，将 `status` 置为 `complete`，更新运行清单与主索引，再按本仓库既有授权提交并推送。使用临时文件写完后原子替换索引，避免留下半份 JSON。

生成仅走已授权的 ChatGPT 内置图像工具。失败时如实记录，不换其他模型，不转入付费 API，不创建替代图片冒充结果。工具不返回底层模型版本时，`model` 始终写 `unreported`，不能标记为已核实的 Image 2.5。

## 新素材的用途分类

新增素材归档时同步检查 `assets/categories.json`：已存在的 `asset.id` 复用用途分类，新 ID 按主要用途补入 `assetCategories`。分类独立于 `benchmark` / `library` 实验分组，不修改旧运行清单和冻结提示词。无法确定时保留为页面的“待分类”，不要根据整批主题误归类。仅在新增映射时将分类文件与本次素材一并提交，具体规则见 [ASSET_CATEGORIES.md](ASSET_CATEGORIES.md)。

## 如何比较

左右对照要求已登记且相同的 `styleId`，再匹配相同 `benchmarkId`，并确认 `promptSha256` 一致；若不同，显示提示词已变化，不能当作固定题目比较。日期档案应同时显示尺寸、透明背景、模型报告状态和提示词版本，便于发现输入或输出条件变化。

目视检查文字可读性、布局遵循度、轮廓细节、图集分格、裁切完整性和颜色语义；必要时在 `evaluation` 中写具体观察及限制。图像生成具有随机性，单次差异不能证明模型正在训练、已经升级或能力提升。没有工具报告的型号变化及足够可比证据，就仅描述“这次输出的可见差异”。

## 初始档案

`assets/daily/2026/10/24/initial-session/manifest.json` 引用既有八张原图。两张基准为组件视觉参考板和装备图集；六张扩展为黑曜竞技场、银面游侠头像、技能图集、奖励图集、冰霜竞技场、透明空背包。所有路径仍指向 `assets/generated/`，没有复制大图片或更改原有使用路径。透明空背包的 `transparentBackground` 为 `true`，其余为 `false`。

## 首次定时批次

[2026-10-25 运行记录](../assets/daily/2026/10/25/20261025-090655/manifest.json) 保存四张原图、逐字提示词、调用台账、文件校验和可见观察。两张固定题目已与 2026-10-24 做同提示词对照；它们的布局和物品造型存在变化，也保留了选中颜色及安全留白等偏差，不能据此判定模型升级。每日档案现在提供两个日期供并排查看。
