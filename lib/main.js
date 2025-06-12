import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * 处理找不到 Chrome 浏览器的情况
 * @throws {Error} 包含下载信息的错误
 */
function handleChromeNotFound() {
  const platform = process.platform;
  let downloadInfo = "";

  switch (platform) {
    case "win32":
      downloadInfo = `
❌ 未找到 Google Chrome 浏览器！

请下载并安装 Google Chrome：
📥 下载地址: https://www.google.com/chrome/
📁 安装路径建议: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

或者，您也可以安装 Chromium：
📥 下载地址: https://download-chromium.appspot.com/
      `;
      break;
    case "darwin":
      downloadInfo = `
❌ 未找到 Google Chrome 浏览器！

请通过以下方式安装 Google Chrome：

方式1 - 官网下载:
📥 下载地址: https://www.google.com/chrome/
📁 安装路径: /Applications/Google Chrome.app/

方式2 - 使用 Homebrew:
💻 执行命令: brew install --cask google-chrome

方式3 - 安装 Chromium:
💻 执行命令: brew install --cask chromium
      `;
      break;
    case "linux":
      downloadInfo = `
❌ 未找到 Google Chrome 或 Chromium 浏览器！

请通过以下方式安装：

Ubuntu/Debian 系统:
💻 sudo apt update && sudo apt install google-chrome-stable
💻 或者: sudo apt install chromium-browser

CentOS/RHEL/Fedora 系统:
💻 sudo dnf install google-chrome-stable
💻 或者: sudo dnf install chromium

Arch Linux:
💻 sudo pacman -S google-chrome
💻 或者: sudo pacman -S chromium

通用方式 (Snap):
💻 sudo snap install chromium

官网下载:
📥 下载地址: https://www.google.com/chrome/
      `;
      break;
    default:
      downloadInfo = `
❌ 未找到 Google Chrome 浏览器！

请访问官网下载并安装 Google Chrome：
📥 下载地址: https://www.google.com/chrome/
      `;
  }

  throw new Error(downloadInfo);
}

/**
 * 查找系统 Chrome 可执行文件路径
 * @returns {string|null}
 */
function findChromePath() {
  const platform = process.platform;
  let possiblePaths = [];

  switch (platform) {
    case "win32":
      possiblePaths = [
        // 标准安装路径
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        // 用户安装路径
        process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
        process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
        process.env["PROGRAMFILES(X86)"] +
          "\\Google\\Chrome\\Application\\chrome.exe",
        // 便携版可能的路径
        process.env.USERPROFILE +
          "\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
        // Chromium 路径
        "C:\\Program Files\\Chromium\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Chromium\\Application\\chrome.exe",
        process.env.LOCALAPPDATA + "\\Chromium\\Application\\chrome.exe",
        // Edge (基于 Chromium)
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      ];
      break;

    case "darwin":
      possiblePaths = [
        // Google Chrome 各版本
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
        "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
        "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev",
        // 用户安装路径
        process.env.HOME +
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        // Chromium
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        process.env.HOME + "/Applications/Chromium.app/Contents/MacOS/Chromium",
        // Brave Browser (基于 Chromium)
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        // Microsoft Edge
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ];
      break;

    case "linux":
      possiblePaths = [
        // Google Chrome
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/google-chrome-beta",
        "/usr/bin/google-chrome-unstable",
        "/opt/google/chrome/chrome",
        // Chromium
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium-browser-dev",
        "/snap/bin/chromium",
        "/var/lib/flatpak/exports/bin/org.chromium.Chromium",
        "/usr/local/bin/chrome",
        "/usr/local/bin/chromium",
        // 其他基于 Chromium 的浏览器
        "/usr/bin/brave-browser",
        "/usr/bin/microsoft-edge",
        "/usr/bin/microsoft-edge-stable",
      ];
      break;

    default:
      possiblePaths = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser"];
  }

  // 检查预定义路径
  for (const chromePath of possiblePaths) {
    if (chromePath && fs.existsSync(chromePath)) {
      console.log("✅ 找到 Chrome 路径:", chromePath);
      return chromePath;
    }
  }

  // 尝试通过命令行查找
  try {
    let result = "";
    switch (platform) {
      case "win32":
        // Windows: 尝试多个命令
        try {
          result = execSync("where chrome", { encoding: "utf8" }).trim();
        } catch {
          try {
            result = execSync("where google-chrome", {
              encoding: "utf8",
            }).trim();
          } catch {
            try {
              result = execSync("where chromium", { encoding: "utf8" }).trim();
            } catch {
              // 最后尝试 PowerShell
              result = execSync(
                'powershell "Get-Command chrome.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"',
                { encoding: "utf8" }
              ).trim();
            }
          }
        }
        break;

      case "darwin":
        // macOS: 使用 mdfind 和 which
        try {
          result = execSync("which google-chrome", { encoding: "utf8" }).trim();
        } catch {
          try {
            result = execSync(
              "mdfind \"kMDItemCFBundleIdentifier == 'com.google.Chrome'\" | head -1",
              { encoding: "utf8" }
            ).trim();
            if (result) result = result + "/Contents/MacOS/Google Chrome";
          } catch {
            result = execSync("which chromium-browser || which chromium", {
              encoding: "utf8",
            }).trim();
          }
        }
        break;

      case "linux":
        // Linux: 尝试多个命令
        try {
          result = execSync("which google-chrome", { encoding: "utf8" }).trim();
        } catch {
          try {
            result = execSync("which google-chrome-stable", {
              encoding: "utf8",
            }).trim();
          } catch {
            try {
              result = execSync("which chromium-browser", {
                encoding: "utf8",
              }).trim();
            } catch {
              result = execSync("which chromium", { encoding: "utf8" }).trim();
            }
          }
        }
        break;
    }

    if (result && fs.existsSync(result)) {
      console.log("✅ 通过命令行找到 Chrome 路径:", result);
      return result;
    }
  } catch (error) {
    console.log("⚠️ 命令行查找失败:", error.message);
  }

  console.log("❌ 未找到 Chrome 可执行文件");
  return null;
}

// 全局浏览器实例，复用以提高性能
let globalBrowser = null;
let globalPage = null;
let lastTargetLang = null; // 新增，用于跟踪上次的目标语言

/**
 * 获取或创建浏览器实例
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function getBrowserInstance() {
  if (!globalBrowser || !globalPage) {
    const chromePath = findChromePath();

    // 如果找不到 Chrome，提示用户下载
    if (!chromePath) {
      handleChromeNotFound();
    }

    console.log("找到 Chrome 路径:", chromePath);

    globalBrowser = await puppeteer.launch({
      headless: "new",
      executablePath: chromePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--lang=en",
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
 * @param {string} targetLang - 目标语言代码
 * @returns {Promise<Object>}
 */
async function translate(text, targetLang = "zh") {
  try {
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

    if (!targetLang || typeof targetLang !== "string") {
      throw new Error("目标语言参数无效: targetLang必须是字符串");
    }

    const { page } = await getBrowserInstance();

    // 优化：仅在首次加载或目标语言变更时才导航
    const currentTargetLang = targetLang.toLowerCase();
    if (lastTargetLang !== currentTargetLang) {
      console.log(
        `[INFO] 目标语言变更或首次加载，导航至: ${currentTargetLang}`
      );
      // 通过URL直接设置语言，更稳定
      const deeplUrl = `https://www.deepl.com/en/translator#auto/${currentTargetLang}`;
      await page.goto(deeplUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      lastTargetLang = currentTargetLang;

      // 等待页面加载完成，查找输入区域
      await page.waitForSelector(
        '[contenteditable="true"][data-dl-no-input-translation="true"]',
        { timeout: 15000 }
      );
      console.log("✅ 页面加载完成，找到输入区域");
    } else {
      console.log(`[INFO] 目标语言未变，复用当前页面`);
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

    // 输入文本
    await page.type(inputSelector, text, { delay: 30 });
    console.log("✅ 已输入翻译文本");

    // 等待翻译结果出现
    console.log("🔄 等待翻译结果...");
    try {
      await page.waitForFunction(
        (inputText) => {
          const possibleSelectors = [
            '[data-testid*="target"] [contenteditable="true"]',
            '[data-testid*="target"] div[contenteditable]',
            ".lmt__translations_as_text__text_btn",
            '[data-testid*="translation"] [contenteditable]',
            '[contenteditable="true"]:not([data-dl-no-input-translation])',
          ];

          for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = (
                element.textContent ||
                element.innerText ||
                element.innerHTML
              ).trim();
              if (
                text &&
                text !== "翻译结果" &&
                text !== "键入翻译。" &&
                text !== inputText
              ) {
                return true;
              }
            }
          }
          return false;
        },
        { timeout: 20000 },
        text
      );
    } catch (error) {
      console.warn("⚠️ 等待翻译结果超时，将尝试直接获取。");
    }

    // 查找翻译结果容器
    const translatedText = await page.evaluate((inputText) => {
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
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = (
              element.textContent ||
              element.innerText ||
              element.innerHTML
            ).trim();

            if (
              text &&
              text.trim() &&
              text.trim() !== "翻译结果" &&
              text.trim() !== inputText
            ) {
              console.log(`✅ 找到翻译结果 (选择器: ${selector})`);
              return text.trim();
            }
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      // 备用方法：查找任何包含翻译文本的区域
      const fallbackElements = document.querySelectorAll(
        'div[contenteditable], [role="textbox"], .lmt__translations_as_text'
      );

      for (const el of fallbackElements) {
        const text = (el.textContent || el.innerText || "").trim();
        // 过滤掉输入提示和空内容
        if (
          text &&
          text !== "键入翻译。" &&
          !text.includes("使用我们的文档翻译器") &&
          text !== "翻译结果" &&
          text.length > 0 &&
          text !== inputText
        ) {
          return text;
        }
      }
      return "";
    }, text);

    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error("翻译结果为空");
    }

    // 尝试获取检测到的源语言
    let detectedSourceLang = "AUTO";
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
    lastTargetLang = null; // 清理时重置
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

export { translate, cleanup, findChromePath, handleChromeNotFound };
