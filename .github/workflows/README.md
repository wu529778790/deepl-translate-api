# GitHub Actions 自动发布配置

本项目配置了三个 GitHub Actions 工作流来实现自动化的构建、测试和发布流程。

## 工作流说明

### 1. CI 工作流 (`ci.yml`)

- **触发条件**: 推送到 main/master 分支或创建 Pull Request
- **功能**: 自动运行测试和构建验证
- **用途**: 确保代码质量，防止有问题的代码合并

### 2. Release 工作流 (`release.yml`)

- **触发条件**: 推送包含 `chore: release` 或 `chore(release)` 的提交到 main/master 分支
- **功能**: 自动创建 GitHub Release
- **用途**: 根据 package.json 中的版本号创建对应的 release

### 3. Publish 工作流 (`publish.yml`)

- **触发条件**: 创建 GitHub Release 时
- **功能**: 自动构建并发布包到 NPM
- **用途**: 实现自动化的包发布流程

## 使用步骤

### 首次配置

1. **获取 NPM Token**:
   - 登录 [npmjs.com](https://www.npmjs.com)
   - 进入 Account Settings > Access Tokens
   - 创建一个 "Automation" 类型的 token

2. **配置 GitHub Secrets**:
   - 进入你的 GitHub 仓库设置
   - 选择 Secrets and variables > Actions
   - 添加名为 `NPM_TOKEN` 的 secret，值为你的 NPM token

### 发布新版本

1. **更新版本号**:

   ```bash
   npm version patch  # 补丁版本 (1.0.0 -> 1.0.1)
   npm version minor  # 次要版本 (1.0.0 -> 1.1.0)
   npm version major  # 主要版本 (1.0.0 -> 2.0.0)
   ```

2. **推送到 GitHub**:

   ```bash
   git add package.json
   git commit -m "chore: release v1.0.1"
   git push origin main
   ```

3. **自动流程**:
   - Release 工作流检测到版本变更和特定提交消息
   - 自动创建 GitHub Release
   - Publish 工作流检测到新 Release
   - 自动构建并发布到 NPM

## 手动发布

如果需要手动触发发布，可以：

1. 在 GitHub 仓库的 Actions 页面
2. 选择 "Publish to NPM" 工作流
3. 点击 "Run workflow" 按钮

## 注意事项

- 确保 `package.json` 中的 `repository` 字段已正确配置
- 确保已设置 `NPM_TOKEN` secret
- 发布前会自动运行测试，确保测试通过
- 每个版本只能发布一次，重复发布会失败
