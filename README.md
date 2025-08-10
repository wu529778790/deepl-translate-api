# deepl-translate-api

免费的 DeepL 网页版翻译 API（非官方）。使用 Playwright 启动本地浏览器，自动打开 DeepL 网页完成翻译。

适用于 Node.js 环境，支持自动检测源语言，仅需指定目标语言。目标语言代码完全遵循 DeepL 官方（不做映射）。

## 安装

```bash
pnpm add deepl-translate-api
# 或
npm i deepl-translate-api
# 或
yarn add deepl-translate-api
```

首次运行若未安装浏览器，工具将引导安装 Playwright 的 Chromium。

## 快速开始

```javascript
import { translate } from "deepl-translate-api";

const res = await translate("Hello world", "ZH-HANS");
console.log(res.data); // 你好，世界
```

## API

- translate(text, targetLang?) -> Promise<TranslateResult>
  - text: string，最大 5000 字符
  - targetLang: DeepL 官方目标语言代码（默认 "ZH-HANS"）
  - 返回: { code, id, method, data, source_lang, target_lang }

- cleanup() -> Promise<void>
- findChromePath() -> string | null
- askUserToDownloadChrome() -> Promise<boolean>
- launchWithPlaywrightChromium() -> Promise<{ browser, page }>
- getSupportedLanguages() -> string[]

## 支持的语言

完全使用 DeepL 官方语言代码（大写）：

```
AR, BG, CS, DA, DE, EL, EN, EN-GB, EN-US, ES, ET, FI, FR, HE, HU, ID, IT,
JA, KO, LT, LV, NB, NL, PL, PT, PT-BR, PT-PT, RO, RU, SK, SL, SV, TH, TR,
UK, VI, ZH, ZH-HANS, ZH-HANT
```

中文建议：ZH-HANS（简体）、ZH-HANT（繁体）。英语建议：EN-GB（英式）、EN-US（美式）。

## 使用建议与限制

- 仅限服务端/本地 Node.js 环境，不适用于浏览器端。
- DeepL 网页版存在速率限制，频繁请求可能被限制；遇到 Too Many Requests 请降低频率或稍后再试。
- 首次运行如未安装 Chromium，将自动执行安装；也可手动运行：`npx playwright install chromium`。

## 故障排查

- 无法找到 Chrome：将提示自动安装 Chromium，或手动安装系统 Chrome 后重试。
- 结果为空：会自动截图到当前目录 `error_screenshot_*.png` 以便排查。
- 进程未退出：调用 `cleanup()` 释放浏览器资源。

## 许可

MIT
