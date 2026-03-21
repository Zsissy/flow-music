## v0.0.5

本次更新围绕通知栏图标、播放栏进度视觉与进度计算准确性进行了优化。

### 通知栏与资源

- 系统通知栏小图标切换为新图标资源（`notification_whitebg.xhdpi.png`）。
- 修复更新应用图标后，通知栏仍显示旧图标的问题。

### 播放栏与进度

- 底部播放栏封面外圈进度效果从点阵环改为 SVG 连续圆环，进度展示更平滑。
- 修复播放进度计算分母错误导致的进度异常问题（由 `currentTime` 修正为 `totalTime`）。

### 构建与依赖

- 版本号更新到 `0.0.5`（`package.json`、`package-lock.json`、iOS 工程）。
- Android `versionCode` 升级到 `76`。
- 新增依赖 `react-native-svg`（`^13.10.0`），用于播放栏圆环渲染。
