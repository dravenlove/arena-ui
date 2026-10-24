# 预览页离线依赖

- React 18.3.1：`react.production.min.js`
- ReactDOM 18.3.1：`react-dom.production.min.js`

文件来自 npm 官方 `react`、`react-dom` 包的 `umd/` 目录，未经修改。
两者使用 MIT 授权，完整授权见同目录下 `LICENSE-react.txt`、`LICENSE-react-dom.txt`。

依赖版本固定在仓库根目录的 `package.json` 与 `package-lock.json`。
需要重新复制时，先执行 `npm ci`，再执行 `npm run vendor`。
演示页面不从 CDN 加载脚本，也无需联网。
