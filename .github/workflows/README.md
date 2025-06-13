# 自动化发布工作流

## 🚀 简化的一键发布流程

现在只需要一个GitHub Action就能完成所有工作！

### 工作流程

1. **推送代码** 到 `main` 或 `master` 分支
2. **自动执行**：
   - 安装依赖
   - 构建项目
   - 运行测试 (`pnpm test`)
   - 自动更新版本号 (`npm version patch`)
   - 发布到NPM
   - 创建GitHub Release

### 使用方法

```bash
# 修改代码后直接推送
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

就这么简单！其他的都会自动完成。

### 智能跳过机制

- 工作流会自动检测版本更新提交，避免无限循环
- 只有真正的代码更改才会触发新版本发布

### 配置要求

确保在GitHub仓库设置中添加了 `NPM_TOKEN` secret。

### 手动触发

如果需要，也可以在GitHub Actions页面手动触发工作流。
