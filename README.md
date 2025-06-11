# DeepL翻译API

一个非官方的DeepL翻译API库，支持自动检测语言和多语言翻译。

## 功能特点

- 🌐 支持多语言翻译
- 🔍 自动检测源语言
- 💡 提供备选翻译结果
- 🔄 自动重试机制
- 📝 支持长文本翻译

## 安装

```bash
npm install
```

## 基本使用

```javascript
import { translate, getSession } from "./lib/main.js";

// 基本翻译
const result = await translate("Hello world", "en", "zh");
console.log(result.data); // 输出：你好世界

// 使用会话ID (推荐)
const session = await getSession();
const result2 = await translate("Hello world", "en", "zh", session);
```

## 测试

```bash
# 运行完整测试套件
node test.js
```

## 重要提示 ⚠️

### 速率限制

DeepL对请求频率有严格限制，建议：

1. **避免连续请求** - 请求间隔至少3-5秒
2. **处理429错误** - 本库已内置重试机制，但可能需要等待较长时间
3. **使用会话ID** - 可以减少被限制的概率
4. **分批处理** - 对于大量文本，建议分批翻译

### 使用建议

```javascript
// ✅ 推荐：带延时的批量翻译
async function batchTranslate(texts, from, to) {
  const session = await getSession();
  const results = [];
  
  for (const text of texts) {
    try {
      const result = await translate(text, from, to, session);
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

// ❌ 不推荐：连续快速请求
// 这样很容易触发429错误
async function badExample() {
  for (const text of texts) {
    await translate(text, "en", "zh"); // 没有延时，会被限制
  }
}
```

## API

### translate(text, sourceLang, targetLang, dlSession?)

翻译文本

- `text`: 要翻译的文本 (最大5000字符)
- `sourceLang`: 源语言代码 ("auto"表示自动检测)
- `targetLang`: 目标语言代码
- `dlSession`: DeepL会话ID (可选，推荐使用)

### getSession()

获取DeepL会话ID，有助于减少速率限制。

## 常见问题

### Q: 遇到"Too Many Requests"错误怎么办？

A: 这是正常的速率限制，请：

1. 等待更长时间后重试 (建议10分钟以上)
2. 使用会话ID
3. 减少请求频率

### Q: 长文本翻译总是失败？

A: 建议：

1. 将长文本分段处理
2. 每段之间增加5-10秒延时
3. 使用会话ID

## 许可证

MIT License
