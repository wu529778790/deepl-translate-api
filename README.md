# DeepL翻译API

一个非官方的DeepL翻译API库，支持自动检测语言和多语言翻译。

## 功能特点

- 🌐 支持多语言翻译
- 🔍 自动检测源语言
- 💡 提供备选翻译结果
- 🔄 自动重试机制
- 📝 支持长文本翻译
- 🎯 **统一接口 - translate函数自动识别输入类型**
- ⚡ **批量翻译 - 逐个翻译，结果准确可靠**
- 📊 **详细的批量翻译统计和进度跟踪**
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

### 批量翻译 - 统一接口设计

```javascript
import { translate, cleanup } from "./lib/main.js";

async function batchTranslateExample() {
  try {
    // 要翻译的文本数组
    const texts = [
      "Hello, how are you?",
      "The weather is beautiful today.",
      "I love programming!",
      "Technology makes life easier."
    ];

    // 使用同一个 translate 函数，自动识别数组输入
    console.log("🚀 translate函数自动识别数组输入");
    const batchResult = await translate(texts, "zh");
    console.log(`翻译完成！成功率: ${batchResult.successRate.toFixed(1)}%`);

    // 输出结果
    console.log("📋 翻译结果:");
    batchResult.results.forEach((item, index) => {
      if (item.success) {
        console.log(`${index + 1}. "${item.originalText}" -> "${item.translatedText}"`);
      } else {
        console.log(`${index + 1}. 翻译失败: ${item.error}`);
      }
    });

    // 单个翻译也是同一个函数
    console.log("\n🔧 单个翻译测试:");
    const singleResult = await translate("Hello, world!", "zh");
    console.log(`"Hello, world!" -> "${singleResult.data}"`);

  } catch (error) {
    console.error("翻译失败:", error.message);
  } finally {
    await cleanup(); // 清理浏览器资源
  }
}

batchTranslateExample();
```

## 测试

```bash
# 运行单个翻译测试
node test.js

# 运行批量翻译测试
node test-batch.js
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

### translate(text, targetLang)

单个文本翻译

- `text`: 要翻译的文本 (最大5000字符)
- `targetLang`: 目标语言代码 (默认: "zh")

**返回值**: `Promise<TranslateResult>`

```javascript
const result = await translate("Hello world", "zh");
// result.data: "你好世界"
```

### translate(text, targetLang)

单个文本翻译或批量翻译

- `text`: 要翻译的文本(字符串)或文本数组 (单个文本最大5000字符，批量翻译总长度不超过5000字符)
- `targetLang`: 目标语言代码 (默认: "zh")

**返回值**: `Promise<TranslateResult | BatchTranslateResult>`

```javascript
// 单个文本翻译
const result = await translate("Hello world", "zh");
// result.data: "你好世界"

// 批量翻译 - 真正的批量翻译！
const batchResult = await translate([
  "Hello world",
  "How are you?",
  "Nice to meet you"
], "zh");
// batchResult.results: [...翻译结果数组]
```

### translateBatch(texts, targetLang, options)

批量翻译文本 - 支持进度回调

- `texts`: 要翻译的文本数组 (最大100个元素，总长度不超过5000字符)
- `targetLang`: 目标语言代码 (默认: "zh")
- `options`: 配置选项 (可选)
  - `onProgress`: 进度回调函数

**返回值**: `Promise<BatchTranslateResult>`

```javascript
const result = await translateBatch([
  "Hello world",
  "How are you?"
], "zh", {
  delay: 1500,
  continueOnError: true,
  onProgress: (current, total, itemResult) => {
    console.log(`进度: ${current}/${total}`);
  }
});

// result.successRate: 100
// result.results: [...翻译结果]
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
2. 减少批量翻译的数量
3. 等待更长时间后重试

### Q: 批量翻译时部分文本失败怎么办？

A: 这是正常现象，建议：

1. 设置 `continueOnError: true` 让翻译继续进行
2. 增加延迟时间 (推荐2-5秒)
3. 对失败的文本单独重试

### Q: 如何优化批量翻译性能？

A: 建议配置：

```javascript
const result = await translateBatch(texts, "zh", {
  delay: 2000,            // 适中的延迟，避免被限制
  continueOnError: true,  // 遇错继续，提高整体成功率
  onProgress: (current, total, result) => {
    // 实时监控翻译进度
    if (!result.success) {
      console.log(`第${current}个翻译失败，继续下一个...`);
    }
  }
});
```

### Q: 长文本翻译总是失败？

A: 建议：

1. 将长文本分段处理 (每段不超过3000字符)
2. 使用批量翻译功能
3. 增加翻译间隔

## 许可证

MIT License
