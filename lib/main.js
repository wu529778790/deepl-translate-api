import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * 查找系统 Chrome 可执行文件路径
 * @returns {string|null}
 */
function findChromePath() {
  const possiblePaths = [
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
    process.env["PROGRAMFILES(X86)"] +
      "\\Google\\Chrome\\Application\\chrome.exe",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];

  for (const chromePath of possiblePaths) {
    if (chromePath && fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  // 尝试通过命令行查找
  try {
    if (process.platform === "win32") {
      const result = execSync("where chrome", { encoding: "utf8" }).trim();
      if (result && fs.existsSync(result)) return result;
    } else {
      const result = execSync("which google-chrome || which chromium-browser", {
        encoding: "utf8",
      }).trim();
      if (result && fs.existsSync(result)) return result;
    }
  } catch (error) {
    // 忽略命令执行错误
  }

  return null;
}

/**
 * 延时函数
 * @param {number} ms 毫秒数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 格式化POST请求字符串
 * @param {Object} postData
 * @returns {string}
 */
function formatPostString(postData) {
  let body = JSON.stringify(postData),
    str =
      (body.id + 5) % 29 === 0 || (body.id + 3) % 13 === 0
        ? '"method" : "'
        : '"method": "';
  body = body.replace('"method":"', str);
  return body;
}

// 全局浏览器实例，复用以提高性能
let globalBrowser = null;
let globalPage = null;

/**
 * 获取或创建浏览器实例
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function getBrowserInstance() {
  if (!globalBrowser || !globalPage) {
    const chromePath = findChromePath();
    console.log("找到 Chrome 路径:", chromePath);

    globalBrowser = await puppeteer.launch({
      headless: "new",
      executablePath:
        chromePath ||
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--lang=zh-CN,zh",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor",
        "--disable-web-security",
        "--disable-features=TranslateUI",
        "--disable-extensions",
      ],
    });
    globalPage = await globalBrowser.newPage();

    // 设置视口和用户代理
    await globalPage.setViewport({ width: 1920, height: 1080 });
    await globalPage.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // 初始访问DeepL页面获取Cookie
    await globalPage.goto("https://www.deepl.com/translator", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("✅ 浏览器实例初始化完成");
  }
  return { browser: globalBrowser, page: globalPage };
}

/**
 * 使用Puppeteer发送请求到DeepL API
 * @param {Object} postData
 * @param {string} urlMethod
 * @returns {Promise<Object>}
 */
async function sendRequestWithPuppeteer(postData, urlMethod) {
  const { page } = await getBrowserInstance();

  const url = `https://www2.deepl.com/jsonrpc?method=${encodeURIComponent(
    urlMethod
  )}`;
  const formattedBody = formatPostString(postData);

  try {
    const result = await page.evaluate(
      async (url, body) => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
          body: body,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      },
      url,
      formattedBody
    );

    return result;
  } catch (err) {
    console.error(`[ERROR] sendRequestWithPuppeteer: ${err.message}`);
    if (err.message.includes("429")) {
      throw new Error("Too Many Requests - 请求过于频繁，请稍后重试");
    } else if (err.message.includes("403")) {
      throw new Error("Forbidden - 访问被拒绝");
    } else {
      throw new Error(`网络请求失败: ${err.message}`);
    }
  }
}

/**
 * 带重试的请求函数
 * @param {Object} postData
 * @param {string} urlMethod
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
async function sendRequestWithRetry(postData, urlMethod, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await sendRequestWithPuppeteer(postData, urlMethod);
    } catch (err) {
      if (err.message.includes("Too Many Requests") && i < retries) {
        const waitTime = [10000, 30000, 60000][i];
        console.log(
          `请求被限制，${waitTime / 1000}秒后重试... (${i + 1}/${retries})`
        );
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
}

/**
 * 分割文本
 * @param {string} text
 * @returns {Promise<Object>}
 */
async function splitText(text) {
  const postData = {
    jsonrpc: "2.0",
    method: "LMT_split_text",
    id: Math.floor(Math.random() * 1000000),
    params: {
      commonJobParams: { mode: "translate" },
      lang: { lang_user_selected: "auto" },
      texts: [text],
      textType: "plaintext",
    },
  };

  try {
    return await sendRequestWithRetry(postData, "LMT_split_text", 3);
  } catch (err) {
    console.error("[ERROR] splitText:", err);
    throw new Error(`文本分割失败: ${err.message}`);
  }
}

/**
 * 执行翻译任务
 * @param {string} text - 要翻译的文本
 * @param {string} sourceLang - 源语言代码
 * @param {string} targetLang - 目标语言代码
 * @param {string} dlSession - DeepL会话ID (已废弃，保持兼容性)
 * @returns {Promise<Object>}
 */
async function translate(text, sourceLang, targetLang, dlSession = "") {
  try {
    // 添加小延时避免请求过于频繁
    await sleep(1000);

    // 参数验证
    if (!text || typeof text !== "string") {
      throw new Error("文本参数无效: text必须是非空字符串");
    }

    if (text.trim().length === 0) {
      throw new Error("文本不能为空");
    }

    if (text.length > 5000) {
      throw new Error("文本长度不能超过5000个字符");
    }

    if (!sourceLang || typeof sourceLang !== "string") {
      throw new Error("源语言参数无效: sourceLang必须是字符串");
    }

    if (!targetLang || typeof targetLang !== "string") {
      throw new Error("目标语言参数无效: targetLang必须是字符串");
    }

    if (sourceLang === targetLang) {
      throw new Error("源语言和目标语言不能相同");
    }

    // 分割文本
    const splitResult = await splitText(text);

    if (!splitResult.result || !splitResult.result.texts) {
      throw new Error("文本分割返回结果无效");
    }

    // 获取检测到的语言
    if (sourceLang === "auto" || sourceLang === "") {
      sourceLang = splitResult.result.lang.detected.toLowerCase();
    }

    // 准备翻译任务
    const chunks = splitResult.result.texts[0].chunks;
    if (!chunks || chunks.length === 0) {
      throw new Error("文本块为空");
    }

    const jobs = chunks.map((chunk, index) => {
      const sentence = chunk.sentences[0];
      const contextBefore =
        index > 0 ? [chunks[index - 1].sentences[0].text] : [];
      const contextAfter =
        index < chunks.length - 1 ? [chunks[index + 1].sentences[0].text] : [];

      return {
        kind: "default",
        preferred_num_beams: 4,
        raw_en_context_before: contextBefore,
        raw_en_context_after: contextAfter,
        sentences: [
          {
            prefix: sentence.prefix,
            text: sentence.text,
            id: index + 1,
          },
        ],
      };
    });

    const hasRegionalVariant = targetLang.includes("-");
    const targetLangCode = hasRegionalVariant
      ? targetLang.split("-")[0]
      : targetLang;

    const postData = {
      jsonrpc: "2.0",
      method: "LMT_handle_jobs",
      id: Math.floor(Math.random() * 1000000),
      params: {
        commonJobParams: {
          mode: "translate",
          ...(hasRegionalVariant && { regional_variant: targetLang }),
        },
        lang: {
          source_lang_computed: sourceLang.toUpperCase(),
          target_lang: targetLangCode.toUpperCase(),
        },
        jobs: jobs,
        priority: 1,
        timestamp: Date.now(),
      },
    };

    const response = await sendRequestWithRetry(postData, "LMT_handle_jobs", 3);

    if (!response.result || !response.result.translations) {
      throw new Error("翻译API返回结果无效");
    }

    let alternatives = [];
    let translatedText = "";

    // 获取翻译结果
    const translations = response.result.translations;
    if (translations.length === 0) {
      throw new Error("翻译结果为空");
    }

    // 合并多个文本块的翻译结果
    translatedText = translations
      .map((translation) => {
        if (!translation.beams || translation.beams.length === 0) {
          throw new Error("翻译beam为空");
        }
        return translation.beams[0].sentences[0].text;
      })
      .join("");

    // 获取备选翻译 (仅第一个文本块)
    if (translations[0].beams.length > 1) {
      alternatives = translations[0].beams
        .slice(1)
        .map((beam) => beam.sentences[0].text);
    }

    if (!translatedText) {
      throw new Error("翻译结果为空");
    }

    const result = {
      code: 200,
      id: postData.id,
      method: "Puppeteer",
      data: translatedText,
      alternatives: alternatives,
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase(),
    };

    return result;
  } catch (err) {
    console.error("[ERROR] translate:", err);
    throw new Error(err.message || "翻译失败");
  }
}

/**
 * 获取DeepL会话ID (使用Puppeteer版本，实际不再需要单独获取)
 * @returns {Promise<string>}
 */
async function getSession() {
  try {
    // 确保浏览器已初始化
    await getBrowserInstance();
    console.log("✅ 浏览器会话已就绪，Cookie已自动管理");
    return "puppeteer-managed";
  } catch (err) {
    console.warn("⚠️ 初始化浏览器失败:", err.message);
    return "";
  }
}

/**
 * 清理资源
 */
async function cleanup() {
  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = null;
    globalPage = null;
    console.log("✅ 浏览器资源已清理");
  }
}

// 进程退出时清理资源
process.on("exit", cleanup);
process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});

export { translate, getSession, cleanup };
