# Google Drive 素材同步

用户于2026-11-25授权把生成相关内容同时同步到Google Drive。GitHub仍保存原始项目；Drive保存可下载的素材副本，不改变图片、冻结提示词或原有风格分类。

- [素材库](https://drive.google.com/drive/folders/1lT-yG4fxiEmalmqlxXAnQtMDf19R8dn2)
- [历史批次归档](https://drive.google.com/drive/folders/1qnJT4mEbFlyL3UXvt3Wx-kZELg5rEm63)
- [每日原图](https://drive.google.com/drive/folders/1-DxZwenNqSihRwTKSx9VNtiUr-A48Ohc)
- [2026-11-25原图与生成记录](https://drive.google.com/drive/folders/1Bi2DlkAtxeJKvNTdTA8kFK8InTSTkMRt)

## 初次同步

共175张原图、42个生成批次，按日期和run-id分别打为42个ZIP。ZIP保持仓库内的原始相对路径，包含该批次原图、manifest、批次目录内其他记录、风格与用途目录快照，以及DRIVE_ARCHIVE_CHECKSUMS.json。部分完成或失败的批次如实保留，不冒充四张齐全。

今天的4张原图另外放在每日原图/日期__run-id/风格分区中，方便直接浏览；历史175张均已包含在批次ZIP中，历史图片没有逐张另传。用途分类、提示词和哈希见manifest，风格分类为dark-metal、chibi-fantasy、anime-fantasy；未知风格单列待确认。

本地完整性检查包括所有原图SHA-256、ZIP解码和包内逐文件哈希。云端核对文件ID、字节数及父文件夹；当前连接器未返回远端校验值，因此不把云端元数据检查称为远端SHA-256校验。

## 后续每日同步

1. 先读取assets/drive/config.json及assets/drive/sync-index.json。每日生成时间和次数沿用既有任务，不因同步新增图像调用。当日生成已完成也要检查未同步结果。
2. 使用连接的Google Drive工具，先按已知ID检查目标文件夹；不重新创建同名素材库，不更改共享权限。
3. 对缺少同步记录的新批次，运行 `python scripts/drive_archive.py --output <仓库外的工作目录> --run-id <run-id>`。该步骤只打包，不直接访问网络，不需要API密钥。上传ZIP到历史批次归档。
4. 每次新批次的原图另传到每日原图/日期__run-id/风格ID文件夹；逐张采用素材的styleId归类，原图不改写。上传该批次manifest.json，保持用途映射及提示词可查。
5. 上传后读取Drive元数据，至少核对字节数和父目录。保存实际文件ID、URL、原图或ZIP本地哈希、大小及实际同步时间到sync-index.json；不能把计划或未确认上传记为成功。
6. 幂等依据是run-id及源manifest的SHA-256。相同记录已成功则跳过；若同一批次从部分变成完成，保留已有归档，新建带版本或哈希后缀的ZIP，不覆盖旧归档。单张原图依据asset-id及文件哈希去重，确认远端存在后复用。
7. 根目录的每日索引、风格目录、用途目录、每日配置、同步索引和说明文件，按config中已知Drive文件ID原位更新；首次缺失时先搜索再创建，避免重名累积。
8. 只有在远端确认后才提交同步记录；正常提交推送，不含工作ZIP。Drive失败时保留本地与GitHub结果，记录失败并下次补传，不重新生图，不切付费API，也不宣称双端完成。

同步清单与目标文件ID属于运行记录，不修改过去的生成manifest。Drive链接保持现有访问范围。

