# DeepL翻译API

一个非官方的DeepL翻译API库，支持自动检测语言和多语言翻译。

## 基本使用

```javascript
import { translate } from "./lib/main.js";

// 基本翻译
const result = await translate("Hello world", "zh");
console.log(result.data); // 输出：你好世界
```

## 目标语言

| 代码 | 语言 |
|------|------|
| ar | 阿拉伯语 |
| bg | 保加利亚语 |
| cs | 捷克语 |
| da | 丹麦语 |
| de | 德语 |
| el | 希腊语 |
| en | 英语 (未指定变体，建议使用 en-gb 或 en-us) |
| en-gb | 英式英语 |
| en-us | 美式英语 |
| es | 西班牙语 |
| et | 爱沙尼亚语 |
| fi | 芬兰语 |
| fr | 法语 |
| he | 希伯来语 |
| hu | 匈牙利语 |
| id | 印尼语 |
| it | 意大利语 |
| ja | 日语 |
| ko | 韩语 |
| lt | 立陶宛语 |
| lv | 拉脱维亚语 |
| nb | 书面挪威语 |
| nl | 荷兰语 |
| pl | 波兰语 |
| pt | 葡萄牙语 (未指定变体，建议使用 pt-br 或 pt-pt) |
| pt-br | 巴西葡萄牙语 |
| pt-pt | 欧洲葡萄牙语 |
| ro | 罗马尼亚语 |
| ru | 俄语 |
| sk | 斯洛伐克语 |
| sl | 斯洛文尼亚语 |
| sv | 瑞典语 |
| th | 泰语 |
| tr | 土耳其语 |
| uk | 乌克兰语 |
| vi | 越南语 |
| zh | 中文 (未指定变体，建议使用 zh-hans 或 zh-hant) |
| zh-hans | 简体中文 |
| zh-hant | 繁体中文 |

## 测试

```bash
# 运行单个翻译测试
node test.js
```

## 清理

清理浏览器资源，建议在程序结束时调用。

```javascript
await cleanup();
```
