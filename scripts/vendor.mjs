import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'demo', 'vendor');
await mkdir(destination, { recursive: true });
// 固定版本由 package-lock.json 锁定，同时分发原始 MIT 授权。
for (const [source, output] of [
  ['react/umd/react.production.min.js', 'react.production.min.js'],
  ['react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js'],
  ['react/LICENSE', 'LICENSE-react.txt'],
  ['react-dom/LICENSE', 'LICENSE-react-dom.txt']
]) {
  await copyFile(path.join(root, 'node_modules', source), path.join(destination, output));
}
console.log('已更新 demo/vendor/ 的 React、ReactDOM 与授权文件。');
