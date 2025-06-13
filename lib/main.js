import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

/**
 * 询问用户是否要下载 Chrome
 * @returns {Promise<boolean>} 用户的选择
 */
async function askUserToDownloadChrome() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const platform = process.platform;
  let message = `
❌ 未找到系统安装的 Google Chrome 浏览器！

🤖 好消息：我可以为您自动下载兼容的 Chromium 浏览器来使用。
   这个浏览器会下载到项目目录中，不会影响您的系统。
   
✨ 优势：
   - 自动下载，无需手动安装
   - 版本兼容性最佳
   - 不影响系统现有浏览器
   - 下载一次，永久使用

`;

  switch (platform) {
    case "win32":
      message += `📁 下载位置: node_modules/puppeteer/.local-chromium/
💾 大小约: ~170MB

`;
      break;
    case "darwin":
      message += `📁 下载位置: node_modules/puppeteer/.local-chromium/
💾 大小约: ~200MB

`;
      break;
    case "linux":
      message += `📁 下载位置: node_modules/puppeteer/.local-chromium/
💾 大小约: ~150MB

`;
      break;
  }

  message += `是否要下载 Chromium 浏览器？(y/n): `;

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      const normalizedAnswer = answer.toLowerCase().trim();
      resolve(
        normalizedAnswer === "y" ||
          normalizedAnswer === "yes" ||
          normalizedAnswer === "是"
      );
    });
  });
}

/**
 * 处理找不到 Chrome 浏览器的情况
 * @throws {Error} 包含安装指导的错误
 */
function throwChromeNotFoundError() {
  const platform = process.platform;
  let downloadInfo = "";

  switch (platform) {
    case "win32":
      downloadInfo = `
❌ 无法启动浏览器！

您可以选择以下方案：

方案1 - 手动安装 Google Chrome (推荐):
📥 下载地址: https://www.google.com/chrome/
📁 安装路径: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

方案2 - 重新运行此程序:
💻 程序会询问您是否要自动下载 Chromium

方案3 - 安装 Chromium:
📥 下载地址: https://download-chromium.appspot.com/
      `;
      break;
    case "darwin":
      downloadInfo = `
❌ 无法启动浏览器！

您可以选择以下方案：

方案1 - 使用 Homebrew 安装 (推荐):
💻 brew install --cask google-chrome

方案2 - 官网下载:
📥 下载地址: https://www.google.com/chrome/
📁 安装路径: /Applications/Google Chrome.app/

方案3 - 重新运行此程序:
💻 程序会询问您是否要自动下载 Chromium
      `;
      break;
    case "linux":
      downloadInfo = `
❌ 无法启动浏览器！

您可以选择以下方案：

方案1 - 包管理器安装 (推荐):
💻 sudo apt install google-chrome-stable  # Ubuntu/Debian
💻 sudo dnf install google-chrome-stable  # Fedora
💻 sudo pacman -S google-chrome          # Arch

方案2 - 重新运行此程序:
💻 程序会询问您是否要自动下载 Chromium

方案3 - 官网下载:
📥 下载地址: https://www.google.com/chrome/
      `;
      break;
    default:
      downloadInfo = `
❌ 无法启动浏览器！

请安装 Google Chrome 或重新运行程序选择自动下载 Chromium。
📥 Chrome 下载: https://www.google.com/chrome/
      `;
  }

  throw new Error(downloadInfo);
}

/**
 * 使用 Puppeteer 内置 Chrome 启动浏览器
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function launchWithPuppeteerChrome() {
  console.log("🚀 使用 Puppeteer 内置 Chromium 启动浏览器...");
  console.log("📦 如果是首次使用，Puppeteer 会自动下载 Chromium...");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      // 不指定 executablePath，让 Puppeteer 使用内置的 Chrome
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

    const page = await browser.newPage();

    console.log("✅ Puppeteer 内置 Chromium 启动成功！");
    return { browser, page };
  } catch (error) {
    console.error("❌ Puppeteer 内置 Chromium 启动失败:", error.message);
    throw new Error(
      "无法启动 Puppeteer 内置浏览器，请检查网络连接或手动安装 Chrome"
    );
  }
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
let globalPage = null; // The page we might reuse
let lastTargetLang = null; // The language of the globalPage

/**
 * 获取或创建浏览器实例
 * @returns {Promise<Browser>}
 */
async function getBrowserInstance() {
  if (!globalBrowser) {
    const chromePath = findChromePath();

    if (!chromePath) {
      console.log("⚠️ 未找到系统安装的 Chrome 浏览器");

      // 询问用户是否要下载 Chromium
      const shouldDownload = await askUserToDownloadChrome();

      if (shouldDownload) {
        console.log("👍 用户选择下载 Chromium，正在启动...");
        // 这里只创建浏览器实例，不创建页面
        globalBrowser = (await launchWithPuppeteerChrome()).browser;
        console.log("✅ 浏览器实例初始化完成 (使用 Puppeteer 内置 Chromium)");
        return globalBrowser;
      } else {
        console.log("❌ 用户拒绝下载 Chromium");
        throwChromeNotFoundError();
      }
    }

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
    console.log("✅ 浏览器实例初始化完成 (使用系统 Chrome)");
  }
  return globalBrowser;
}

/**
 * 执行翻译任务
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言代码
 * @returns {Promise<Object>}
 */
async function translate(text, targetLang = "zh") {
  const browser = await getBrowserInstance();
  let page;

  try {
    let deeplTargetLang = targetLang.toLowerCase();
    if (deeplTargetLang === "en") {
      deeplTargetLang = "en-US";
    } else if (deeplTargetLang === "zh") {
      deeplTargetLang = "zh-Hans";
    }

    // 尝试使用直接URL导航（更可靠的方法）
    const useDirectNavigation = true;

    if (
      globalPage &&
      !globalPage.isClosed() &&
      lastTargetLang === deeplTargetLang &&
      !useDirectNavigation
    ) {
      page = globalPage;
      console.log(`[INFO] 目标语言未变 (${deeplTargetLang})，复用当前页面`);

      const clearButtonSelector =
        '[data-testid="translator-source-clear-button"]';
      if (await page.$(clearButtonSelector)) {
        console.log("🖱️ 清除输入框内容...");
        await page.click(clearButtonSelector);

        // Wait for the target input to be cleared as well
        console.log("... 等待输出框同步清空");
        await page.waitForFunction(
          () => {
            const target = document.querySelector(
              '[data-testid="translator-target-input"]'
            );
            return target && target.innerText.trim() === "";
          },
          { timeout: 5000 }
        );
      }
    } else {
      console.log(
        `[INFO] 目标语言变更或首次加载，创建新页面: ${deeplTargetLang}`
      );
      if (globalPage && !globalPage.isClosed()) {
        await globalPage.close();
      }
      page = await browser.newPage();
      globalPage = page;
      lastTargetLang = deeplTargetLang;

      // Setup for the new page
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      );

      if (useDirectNavigation) {
        // 方法1: 直接导航到目标语言的URL（推荐）
        const langUrlMap = {
          "zh-hans": "zh-CN",
          "zh-cn": "zh-CN",
          "en-us": "en-US",
          en: "en-US",
          ja: "ja",
          ko: "ko",
          fr: "fr",
          de: "de",
          es: "es",
          it: "it",
          pt: "pt-PT",
          ru: "ru",
        };

        const urlLangCode =
          langUrlMap[deeplTargetLang.toLowerCase()] || deeplTargetLang;
        const targetLanguageUrl = `https://www.deepl.com/translator#auto/${urlLangCode}`;

        console.log(`🚀 直接导航到目标语言页面: ${targetLanguageUrl}`);
        await page.goto(targetLanguageUrl, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // 等待页面加载完成
        await page.waitForSelector('[data-testid="translator-source-input"]', {
          timeout: 15000,
        });
        console.log("✅ 直接导航成功，页面加载完成");
      } else {
        // 方法2: 传统的手动选择语言方法（作为备用）
        console.log("🔄 使用传统方法选择语言...");

        // 1. Navigate to the base translator page
        await page.goto("https://www.deepl.com/translator", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // 2. Click the target language button to open the language selection menu
        console.log("🖱️ 打开目标语言菜单...");
        try {
          await page.waitForSelector(
            '[data-testid="translator-target-lang-btn"]',
            {
              timeout: 15000,
            }
          );
          await page.click('[data-testid="translator-target-lang-btn"]');
          console.log("✅ 成功点击目标语言按钮");
        } catch (error) {
          console.error("❌ 无法找到或点击目标语言按钮:", error.message);
          const screenshotPath = `debug_lang_btn_${Date.now()}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`📷 已保存调试截图至: ${screenshotPath}`);
          throw new Error("无法打开语言选择菜单");
        }

        // Add a longer delay to ensure the language menu is fully rendered
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 3. Wait for the menu to appear and click the desired language
        console.log(`🔍 选择目标语言: ${deeplTargetLang}...`);
        const langOptionSelector = `[data-testid="translator-lang-option-${deeplTargetLang}"]`;

        try {
          // First, let's check what language options are actually available
          const availableLanguages = await page.evaluate(() => {
            const langOptions = document.querySelectorAll(
              '[data-testid*="translator-lang-option-"]'
            );
            return Array.from(langOptions).map((el) =>
              el.getAttribute("data-testid")
            );
          });

          console.log("🔍 可用语言选项:", availableLanguages);

          // Try to wait for the specific language option
          await page.waitForSelector(langOptionSelector, { timeout: 10000 });
          await page.click(langOptionSelector);
          console.log("✅ 目标语言已选择");
        } catch (error) {
          console.error(
            `❌ 无法找到或点击语言选项 ${deeplTargetLang}:`,
            error.message
          );

          // Take a screenshot for debugging
          const screenshotPath = `debug_lang_select_${Date.now()}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`📷 已保存调试截图至: ${screenshotPath}`);

          // Try alternative language codes
          const alternativeLanguages = {
            "zh-hans": ["zh-CN", "zh", "chinese-simplified", "ZH"],
            "en-us": ["en-US", "en", "english", "EN"],
            ja: ["ja", "japanese", "JA"],
            ko: ["ko", "korean", "KO"],
            fr: ["fr", "french", "FR"],
            de: ["de", "german", "DE"],
            es: ["es", "spanish", "ES"],
            it: ["it", "italian", "IT"],
            pt: ["pt", "portuguese", "PT"],
            ru: ["ru", "russian", "RU"],
          };

          const alternatives = alternativeLanguages[deeplTargetLang] || [];
          console.log(`🔄 尝试备用语言代码: ${alternatives.join(", ")}`);

          let success = false;
          for (const altLang of alternatives) {
            try {
              const altSelector = `[data-testid="translator-lang-option-${altLang}"]`;
              console.log(`🔍 尝试选择器: ${altSelector}`);
              await page.waitForSelector(altSelector, { timeout: 3000 });
              await page.click(altSelector);
              console.log(`✅ 成功选择备用语言: ${altLang}`);
              success = true;
              break;
            } catch (altError) {
              console.log(`⚠️ 备用语言 ${altLang} 也失败了`);
            }
          }

          if (!success) {
            throw new Error(
              `无法选择目标语言 ${deeplTargetLang}，请检查 DeepL 网站是否更新了语言选择器`
            );
          }
        }
      }
    }

    // 单个文本翻译的参数验证
    if (!text || typeof text !== "string") {
      throw new Error("文本参数无效: text必须是非空字符串");
    }

    if (text.trim().length === 0) {
      throw new Error("文本不能为空");
    }

    if (text.length > 5000) {
      throw new Error("文本长度不能超过5000个字符");
    }

    // 等待页面加载完成，找到输入区域
    await page.waitForSelector('[data-testid="translator-source-input"]', {
      timeout: 15000,
    });
    console.log("✅ 页面加载完成，找到输入区域");

    // 输入要翻译的文本
    const inputSelector = '[data-testid="translator-source-input"]';
    await page.click(inputSelector);

    await page.type(inputSelector, text, { delay: 30 });
    console.log("✅ 已输入翻译文本");

    // 等待翻译结果出现并稳定下来
    console.log("🔄 等待翻译结果...");

    // Initialize state on the window object for the polling function
    await page.evaluate(() => {
      window.__deepl_last_text = "";
      window.__deepl_stable_count = 0;
    });

    // Use waitForFunction to poll for a stable translation result
    const translatedTextHandle = await page.waitForFunction(
      (inputText) => {
        const STABLE_ITERATIONS = 3; // Number of polls the text must remain unchanged
        const selector = '[data-testid="translator-target-input"]';

        const element = document.querySelector(selector);
        const currentText = element ? element.innerText.trim() : "";

        const isMeaningful =
          currentText &&
          currentText !== "翻译结果" &&
          currentText !== inputText;

        if (isMeaningful && currentText === window.__deepl_last_text) {
          window.__deepl_stable_count++;
        } else {
          window.__deepl_stable_count = 0;
        }

        window.__deepl_last_text = currentText || ""; // Update last seen text

        if (window.__deepl_stable_count >= STABLE_ITERATIONS) {
          return currentText;
        }

        return false;
      },
      { timeout: 20000, polling: 250 }, // Poll every 250ms, timeout in 20s
      text
    );

    const translatedText = await translatedTextHandle.jsonValue();

    if (!translatedText || translatedText.trim().length === 0) {
      // 增加截图以帮助调试
      const screenshotPath = `error_screenshot_${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`📷 已保存截图至: ${screenshotPath}`);
      throw new Error("翻译结果为空");
    }

    let detectedSourceLang = "AUTO";
    try {
      const sourceLangElement = await page.$(
        '[data-testid="translator-source-lang"]'
      );
      if (sourceLangElement) {
        detectedSourceLang = (
          await page.evaluate((el) => el.textContent, sourceLangElement)
        ).toUpperCase();
      }
    } catch (error) {
      // ignore
    }

    const result = {
      code: 200,
      id: Math.floor(Math.random() * 1000000),
      method: "WebPage",
      data: translatedText,
      source_lang: detectedSourceLang,
      target_lang: targetLang.toUpperCase(),
    };

    console.log("✅ 翻译完成");
    return result;
  } catch (err) {
    console.error("[ERROR] translate:", err);

    // 增强的错误调试信息
    if (page && !page.isClosed()) {
      try {
        console.log("🔍 页面调试信息:");
        console.log("- 当前URL:", await page.url());
        console.log("- 页面标题:", await page.title());

        // 检查关键元素是否存在
        const elements = {
          源语言按钮: '[data-testid="translator-source-lang-btn"]',
          目标语言按钮: '[data-testid="translator-target-lang-btn"]',
          源输入框: '[data-testid="translator-source-input"]',
          目标输出框: '[data-testid="translator-target-input"]',
        };

        for (const [name, selector] of Object.entries(elements)) {
          const exists = (await page.$(selector)) !== null;
          console.log(`- ${name}: ${exists ? "✅ 存在" : "❌ 不存在"}`);
        }

        // 保存最终错误截图
        const screenshotPath = `final_error_screenshot_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📷 已保存最终错误截图至: ${screenshotPath}`);
      } catch (debugError) {
        console.log("⚠️ 无法获取调试信息:", debugError.message);
      }
    }

    // If an error happens, we should probably discard the page, as it might be in a bad state.
    if (globalPage) {
      await globalPage.close();
      globalPage = null;
      lastTargetLang = null;
    }
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
    lastTargetLang = null;
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

export {
  translate,
  cleanup,
  findChromePath,
  askUserToDownloadChrome,
  launchWithPuppeteerChrome,
};
