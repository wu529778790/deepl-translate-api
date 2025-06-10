# DeepL翻译API

一个免费的DeepL翻译API包装器，支持自动语言检测和多种语言互译。通过模拟DeepL浏览器扩展的请求实现免费翻译功能。

## ✨ 特性

- 🆓 **完全免费** - 无需API密钥或付费订阅
- 🌍 **多语言支持** - 支持50+种语言互译
- 🚀 **自动检测** - 智能检测源语言
- 📝 **富文本支持** - 支持HTML和XML标签处理
- 🔄 **备选翻译** - 提供多个翻译选项
- 💪 **TypeScript支持** - 完整的类型定义
- ⚡ **高性能** - 基于DeepL官方接口

## 📦 安装

```bash
npm install deepl-translate-api
```

或者使用yarn：

```bash
yarn add deepl-translate-api
```

或者使用pnpm：

```bash
pnpm add deepl-translate-api
```

## 🚀 快速开始

### 基本用法

```javascript
import { translate } from 'deepl-translate-api';

// 基本翻译
const result = await translate('Hello World!', 'en', 'zh');
console.log(result.data); // 输出: "你好世界！"

// 自动检测源语言
const result2 = await translate('Bonjour le monde!', 'auto', 'en');
console.log(result2.data); // 输出: "Hello world!"
```

### 高级用法

```javascript
// 获取备选翻译
const result = await translate('How are you?', 'en', 'zh');
console.log(result.data); // 主要翻译: "你好吗？"
console.log(result.alternatives); // 备选翻译: ["你怎么样？", "你还好吗？"]

// HTML标签处理
const htmlText = '<p>Hello <strong>world</strong>!</p>';
const result3 = await translate(htmlText, 'en', 'zh', '', 'html');
console.log(result3.data); // 保持HTML结构的翻译

// 启用调试输出
const result4 = await translate('Test', 'en', 'zh', '', false, true);
// 会在控制台输出完整的翻译结果
```

## 📋 API文档

### translate(text, sourceLang, targetLang, dlSession?, tagHandling?, printResult?)

翻译指定文本。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `text` | `string` | ✅ | - | 要翻译的文本 |
| `sourceLang` | `string` | ✅ | - | 源语言代码，支持 `'auto'` 自动检测 |
| `targetLang` | `string` | ✅ | - | 目标语言代码 |
| `dlSession` | `string` | ❌ | `''` | DeepL会话ID（可选） |
| `tagHandling` | `'html' \| 'xml' \| boolean` | ❌ | `false` | 标签处理方式 |
| `printResult` | `boolean` | ❌ | `false` | 是否在控制台打印结果 |

#### 返回值

返回 `Promise<TranslateResult | ErrorResult>`

**TranslateResult**:

```typescript
{
  id: number;           // 请求ID
  method: string;       // 翻译方法标识
  data: string;         // 翻译结果文本
  alternatives: string[]; // 备选翻译结果
  source_lang: string;  // 检测到的源语言
  target_lang: string;  // 目标语言
}
```

**ErrorResult**:

```typescript
{
  code: number;    // 错误码
  message: string; // 错误信息
}
```

## 🌍 支持的语言

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 自动检测 | `auto` | 中文(简体) | `zh` 或 `zh-cn` |
| 中文(繁体) | `zh-tw` | 英语 | `en` |
| 美式英语 | `en-us` | 英式英语 | `en-gb` |
| 日语 | `ja` | 韩语 | `ko` |
| 法语 | `fr` | 德语 | `de` |
| 西班牙语 | `es` | 意大利语 | `it` |
| 俄语 | `ru` | 葡萄牙语 | `pt` |
| 巴西葡萄牙语 | `pt-br` | 欧洲葡萄牙语 | `pt-pt` |
| 阿拉伯语 | `ar` | 荷兰语 | `nl` |
| 波兰语 | `pl` | 土耳其语 | `tr` |

...还有更多语言支持

## 🔧 开发

### 克隆项目

```bash
git clone https://github.com/your-username/deepl-translate-api.git
cd deepl-translate-api
```

### 安装依赖

```bash
pnpm install
```

### 运行测试

```bash
pnpm test
```

### 构建项目

```bash
pnpm build
```

## 📝 示例

### Node.js环境

```javascript
import { translate } from 'deepl-translate-api';

async function translateText() {
  try {
    const result = await translate('Hello, world!', 'en', 'zh');
    console.log('翻译结果:', result.data);
    console.log('检测语言:', result.source_lang);
    console.log('备选翻译:', result.alternatives);
  } catch (error) {
    console.error('翻译失败:', error.message);
  }
}

translateText();
```

### 浏览器环境

```html
<script type="module">
import { translate } from 'deepl-translate-api';

document.getElementById('translateBtn').addEventListener('click', async () => {
  const text = document.getElementById('inputText').value;
  const result = await translate(text, 'auto', 'zh');
  document.getElementById('output').textContent = result.data;
});
</script>
```

### 批量翻译

```javascript
import { translate } from 'deepl-translate-api';

async function batchTranslate(texts, sourceLang, targetLang) {
  const results = await Promise.all(
    texts.map(text => translate(text, sourceLang, targetLang))
  );
  return results.map(result => result.data);
}

// 使用示例
const texts = ['Hello', 'World', 'How are you?'];
const translations = await batchTranslate(texts, 'en', 'zh');
console.log(translations); // ['你好', '世界', '你好吗？']
```

## ⚠️ 注意事项

1. **使用限制**: 本工具通过模拟DeepL浏览器扩展请求实现，请合理使用，避免过度频繁请求
2. **稳定性**: 由于依赖DeepL的非公开接口，可能会受到接口变更影响
3. **商业使用**: 如需商业使用，建议使用DeepL官方API
4. **错误处理**: 请妥善处理网络错误和限流错误(429状态码)

## 🐛 错误处理

```javascript
import { translate } from 'deepl-translate-api';

try {
  const result = await translate('Hello', 'en', 'zh');
  
  // 检查是否为错误结果
  if (result.code === 429) {
    console.log('请求过于频繁，请稍后重试');
    return;
  }
  
  console.log('翻译成功:', result.data);
} catch (error) {
  console.error('翻译失败:', error.message);
}
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [DeepL](https://www.deepl.com/) 提供优秀的翻译服务
- 感谢所有贡献者的支持

## 📞 联系

如有问题，请通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/deepl-translate-api/issues)
- 发送邮件: <your-email@example.com>

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
