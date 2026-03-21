## v0.0.7

本次更新围绕通知栏图标加载稳定性与资源适配进行了优化。

### 通知栏与图标

- Android 通知栏小图标改为通过原生资源名 `notification_whitebg` 加载（`{ uri: 'notification_whitebg' }`），提升兼容性。
- 补齐 Android `mdpi` 到 `xxxhdpi` 全密度通知栏小图标资源，减少不同设备下的缩放失真。

### 文案

- 设置页中文“关于”文案从“关于 LX Music”调整为“关于”。

### 构建

- 版本号更新到 `0.0.7`（`package.json`、`package-lock.json`、iOS 工程）。
- Android `versionCode` 升级到 `78`。
