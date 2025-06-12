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
| AR | 阿拉伯语 |
| BG | 保加利亚语 |
| CS | 捷克语 |
| DA | 丹麦语 |
| DE | 德语 |
| EL | 希腊语 |
| EN | 英语 (未指定变体，建议使用 EN-GB 或 EN-US) |
| EN-GB | 英式英语 |
| EN-US | 美式英语 |
| ES | 西班牙语 |
| ET | 爱沙尼亚语 |
| FI | 芬兰语 |
| FR | 法语 |
| HE | 希伯来语 |
| HU | 匈牙利语 |
| ID | 印尼语 |
| IT | 意大利语 |
| JA | 日语 |
| KO | 韩语 |
| LT | 立陶宛语 |
| LV | 拉脱维亚语 |
| NB | 书面挪威语 |
| NL | 荷兰语 |
| PL | 波兰语 |
| PT | 葡萄牙语 (未指定变体，建议使用 PT-BR 或 PT-PT) |
| PT-BR | 巴西葡萄牙语 |
| PT-PT | 欧洲葡萄牙语 |
| RO | 罗马尼亚语 |
| RU | 俄语 |
| SK | 斯洛伐克语 |
| SL | 斯洛文尼亚语 |
| SV | 瑞典语 |
| TH | 泰语 |
| TR | 土耳其语 |
| UK | 乌克兰语 |
| VI | 越南语 |
| ZH | 中文 (未指定变体，建议使用 ZH-HANS 或 ZH-HANT) |
| ZH-HANS | 简体中文 |
| ZH-HANT | 繁体中文 |

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
