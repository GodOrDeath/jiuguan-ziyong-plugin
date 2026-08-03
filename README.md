# 酒馆自用插件

SillyTavern 扩展：游玩过程中自动分析AI回复、提取角色详细信息，并写入独立世界书，支持历史快照与重roll自动回滚。

## 安装（通过 SillyTavern 扩展面板 + GitHub 仓库地址）

1. 打开 SillyTavern → 左侧 Extensions（扩展）面板
2. 点击 "Install Extension"（安装扩展）
3. 粘贴本仓库地址，例如：
   ```
   https://github.com/yourname/jiuguan-ziyong-plugin
   ```
4. 安装完成后刷新页面，在扩展设置里找到 "酒馆自用插件"

## 当前进度

- [x] 阶段1：设置面板 UI + 自定义 OpenAI 格式 API 配置（Base URL / Key / 模型 / 测试连接）
- [ ] 阶段2：正则规则导入/编辑（排除 / 提取标签）
- [ ] 阶段3：AI回复自动触发 + 世界书写入
- [ ] 阶段4：历史快照 + 重roll自动回滚

## 目录结构

```
jiuguan-ziyong-plugin/
├── manifest.json
├── index.js
├── settings.html
├── style.css
└── lib/
    └── apiConfig.js
```
