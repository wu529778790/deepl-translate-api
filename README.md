# DeepL翻译API

一个非官方的DeepL翻译API库，支持自动检测语言和多语言翻译。

## 功能特点

- 🌐 支持多语言翻译
- 🔍 自动检测源语言
- 💡 提供备选翻译结果
- 🔄 自动重试机制
- 📝 支持长文本翻译
- 🔧 **简洁架构 - 一个函数搞定所有翻译需求**

## 安装

```bash
npm install
```

## 基本使用

### 单个文本翻译

```javascript
import { translate } from "./lib/main.js";

// 基本翻译
const result = await translate("Hello world", "zh");
console.log(result.data); // 输出：你好世界
```

## 测试

```bash
# 运行单个翻译测试
node test.js
```

## 重要提示 ⚠️

### 速率限制

DeepL对请求频率有严格限制，建议：

1. **避免连续请求** - 请求间隔至少3-5秒
2. **处理429错误** - 本库已内置重试机制，但可能需要等待较长时间
3. **使用会话ID** - 可以减少被限制的概率
4. **分批处理** - 对于大量文本，建议分批翻译（需自行实现循环调用）

### 使用建议

```javascript
// ✅ 推荐：带延时的多文本翻译（需自行实现循环）
async function batchTranslate(texts, from, to) {
  const results = [];
  for (const text of texts) {
    try {
      const result = await translate(text, to);
      results.push(result);
      // 重要：请求间添加延时
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`翻译失败: ${error.message}`);
      results.push({ error: error.message });
    }
  }
  return results;
}
```

## API

### translate(text, targetLang)

单个文本翻译

- `text`: 要翻译的文本 (最大5000字符)
- `targetLang`: 目标语言代码 (默认: "zh")

**返回值**: `Promise<TranslateResult>`

```javascript
const result = await translate("Hello world", "zh");
// result.data: "你好世界"
```

### cleanup()

清理浏览器资源，建议在程序结束时调用。

```javascript
await cleanup();
```

## 常见问题

### Q: 遇到"Too Many Requests"错误怎么办？

A: 这是正常的速率限制，请：

1. 增加翻译间隔时间 (建议3-5秒以上)
2. 减少请求数量
3. 等待更长时间后重试

### Q: 长文本翻译总是失败？

A: 建议：

1. 将长文本分段处理 (每段不超过3000字符)
2. 增加翻译间隔

## 许可证

MIT License
