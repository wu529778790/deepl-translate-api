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

    console.log("✅ 浏览器实例初始化完成");
  }
  return { browser: globalBrowser, page: globalPage };
}

/**
 * 执行翻译任务
 * @param {string} text - 要翻译的文本
 * @param {string} sourceLang - 源语言代码
 * @param {string} targetLang - 目标语言代码
 * @param {string} dlSession - DeepL会话ID (已废弃，保持兼容性)
 * @returns {Promise<Object>}
 */
async function translate(
  text,
  sourceLang = "auto",
  targetLang = "zh",
  dlSession = ""
) {
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

    const { page } = await getBrowserInstance();

    // 访问DeepL翻译页面
    await page.goto("https://www.deepl.com/zh/translator", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 等待页面加载完成，查找输入区域
    await page.waitForSelector(
      '[contenteditable="true"][data-dl-no-input-translation="true"]',
      { timeout: 15000 }
    );
    console.log("✅ 页面加载完成，找到输入区域");

    // 设置目标语言（如果需要）
    if (targetLang !== "zh" && targetLang !== "zh-cn") {
      try {
        // 点击目标语言区域
        await page.click('[data-testid="translator-target-lang"]');
        await sleep(1000);

        // 查找并点击对应的目标语言选项
        const targetLangButton = await page.evaluate((langCode) => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const targetButton = buttons.find(
            (btn) => btn.textContent && btn.textContent.includes(langCode)
          );
          if (targetButton) {
            targetButton.click();
            return true;
          }
          return false;
        }, targetLang);

        if (targetLangButton) {
          await sleep(500);
          console.log(`✅ 已设置目标语言: ${targetLang}`);
        }
      } catch (error) {
        console.warn(`⚠️ 设置目标语言失败，使用默认设置: ${error.message}`);
      }
    }

    // 设置源语言（如果不是自动检测）
    if (sourceLang !== "auto") {
      try {
        // 点击源语言选择按钮
        await page.click('[data-testid="translator-source-lang-btn"]');
        await sleep(1000);

        // 查找并点击对应的源语言选项
        const sourceLangButton = await page.evaluate((langCode) => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const targetButton = buttons.find(
            (btn) => btn.textContent && btn.textContent.includes(langCode)
          );
          if (targetButton) {
            targetButton.click();
            return true;
          }
          return false;
        }, sourceLang);

        if (sourceLangButton) {
          await sleep(500);
          console.log(`✅ 已设置源语言: ${sourceLang}`);
        }
      } catch (error) {
        console.warn(`⚠️ 设置源语言失败，使用自动检测: ${error.message}`);
      }
    }

    // 输入要翻译的文本
    const inputSelector =
      '[contenteditable="true"][data-dl-no-input-translation="true"]';
    await page.click(inputSelector);

    // 清空现有内容
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Delete");
    await sleep(300);

    // 输入文本
    await page.type(inputSelector, text, { delay: 30 });
    console.log("✅ 已输入翻译文本");

    // 等待翻译结果出现
    console.log("🔄 等待翻译结果...");
    await sleep(3000);

    // 查找翻译结果容器
    let translatedText = "";
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts && !translatedText) {
      try {
        // 尝试多种可能的翻译结果选择器
        const possibleSelectors = [
          '[data-testid*="target"] [contenteditable="true"]',
          '[data-testid*="target"] div[contenteditable]',
          ".lmt__translations_as_text__text_btn",
          '[data-testid*="translation"] [contenteditable]',
          '[contenteditable="true"]:not([data-dl-no-input-translation])',
        ];

        for (const selector of possibleSelectors) {
          try {
            const elements = await page.$$(selector);
            for (const element of elements) {
              const text = await page.evaluate((el) => {
                return el.textContent || el.innerText || el.innerHTML;
              }, element);

              if (text && text.trim() && text.trim() !== "翻译结果") {
                translatedText = text.trim();
                console.log(`✅ 找到翻译结果 (选择器: ${selector})`);
                break;
              }
            }
            if (translatedText) break;
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }

        if (!translatedText) {
          // 备用方法：查找任何包含翻译文本的区域
          translatedText = await page.evaluate(() => {
            // 查找所有可能包含翻译结果的元素
            const elements = document.querySelectorAll(
              'div[contenteditable], [role="textbox"], .lmt__translations_as_text'
            );

            for (const el of elements) {
              const text = (el.textContent || el.innerText || "").trim();
              // 过滤掉输入提示和空内容
              if (
                text &&
                text !== "键入翻译。" &&
                !text.includes("使用我们的文档翻译器") &&
                text !== "翻译结果" &&
                text.length > 0
              ) {
                return text;
              }
            }
            return "";
          });
        }

        if (translatedText) {
          break;
        }

        attempts++;
        await sleep(2000);
        console.log(`🔄 尝试获取翻译结果 ${attempts}/${maxAttempts}...`);
      } catch (error) {
        attempts++;
        await sleep(2000);
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error("翻译结果为空");
    }

    // 尝试获取检测到的源语言
    let detectedSourceLang = sourceLang.toUpperCase();
    if (sourceLang === "auto") {
      try {
        const sourceLangElement = await page.$(
          '[data-testid="translator-source-lang"]'
        );
        if (sourceLangElement) {
          const langText = await page.evaluate(
            (el) => el.textContent,
            sourceLangElement
          );
          if (langText && langText !== "检测源语言") {
            detectedSourceLang = langText.toUpperCase();
          }
        }
      } catch (error) {
        detectedSourceLang = "AUTO";
      }
    }

    const result = {
      code: 200,
      id: Math.floor(Math.random() * 1000000),
      method: "WebPage",
      data: translatedText,
      alternatives: [], // DeepL免费版通常不提供备选翻译
      source_lang: detectedSourceLang,
      target_lang: targetLang.toUpperCase(),
    };

    console.log("✅ 翻译完成");
    return result;
  } catch (err) {
    console.error("[ERROR] translate:", err);
    throw new Error(err.message || "翻译失败");
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

export { translate, cleanup };
