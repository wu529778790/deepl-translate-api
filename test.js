import { translate, getSession } from "./lib/main.js";

/**
 * 安全翻译函数 - 带错误处理
 */
async function safeTranslate(text, from, to, session = "", testName = "") {
  try {
    console.log(
      `🔄 ${testName}正在翻译: "${text.slice(0, 50)}${
        text.length > 50 ? "..." : ""
      }"`
    );
    const result = await translate(text, from, to, session);
    console.log(`✅ 翻译成功: "${result.data}"`);
    if (result.alternatives && result.alternatives.length > 0) {
      console.log(`💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`);
    }
    console.log(
      `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
    );
    return result;
  } catch (error) {
    console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

    if (error.message.includes("Too Many Requests")) {
      console.log("💡 建议:");
      console.log("1. 等待10-15分钟后再试");
      console.log("2. 减少请求频率");
      console.log("3. 使用会话ID\n");
    }

    return { error: error.message };
  }
}

async function runAllTests() {
  console.log("🚀 开始DeepL翻译API完整测试...\n");

  // 获取会话ID
  console.log("🔐 正在获取DeepL会话ID...");
  const session = await getSession();
  console.log("会话ID状态:", session ? "✅ 已获取" : "❌ 未获取");
  console.log();

  let passedTests = 0;
  let totalTests = 0;

  try {
    // 测试1: 基本翻译
    console.log("=".repeat(50));
    console.log("📋 测试1: 基本翻译");
    console.log("=".repeat(50));
    totalTests++;

    const result1 = await safeTranslate(
      "Hello, world!",
      "en",
      "zh",
      session,
      "测试1 - "
    );
    if (!result1.error) {
      passedTests++;
      console.log("✅ 测试1通过\n");
    } else {
      console.log("❌ 测试1失败\n");
    }

    // 测试2: 自动检测语言
    console.log("=".repeat(50));
    console.log("📋 测试2: 自动检测语言");
    console.log("=".repeat(50));
    totalTests++;

    const result2 = await safeTranslate(
      "Bonjour le monde!",
      "auto",
      "en",
      session,
      "测试2 - "
    );
    if (!result2.error) {
      passedTests++;
      console.log("✅ 测试2通过\n");
    } else {
      console.log("❌ 测试2失败\n");
    }

    // 测试3: 中文翻译英文
    console.log("=".repeat(50));
    console.log("📋 测试3: 中文翻译英文");
    console.log("=".repeat(50));
    totalTests++;

    const result3 = await safeTranslate(
      "你好世界！欢迎使用DeepL翻译。",
      "zh",
      "en",
      session,
      "测试3 - "
    );
    if (!result3.error) {
      passedTests++;
      console.log("✅ 测试3通过\n");
    } else {
      console.log("❌ 测试3失败\n");
    }

    // 测试4: 长文本翻译
    console.log("=".repeat(50));
    console.log("📋 测试4: 长文本翻译");
    console.log("=".repeat(50));
    totalTests++;

    const longText =
      "The quick brown fox jumps over the lazy dog. This is a test of a longer sentence to see how the translation API handles multiple sentences and punctuation. Artificial intelligence is transforming the way we communicate across languages.";
    const result4 = await safeTranslate(
      longText,
      "en",
      "zh",
      session,
      "测试4 - "
    );
    if (!result4.error) {
      passedTests++;
      console.log("✅ 测试4通过\n");
    } else {
      console.log("❌ 测试4失败\n");
    }

    // 测试5: 多语言翻译测试
    console.log("=".repeat(50));
    console.log("📋 测试5: 多语言翻译");
    console.log("=".repeat(50));

    const testCases = [
      { text: "Hello", from: "en", to: "ja", name: "英日翻译" },
      { text: "Guten Tag", from: "de", to: "en", name: "德英翻译" },
      { text: "Hola mundo", from: "es", to: "zh", name: "西中翻译" },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      totalTests++;

      console.log(`--- ${testCase.name} (${i + 1}/${testCases.length}) ---`);
      const result = await safeTranslate(
        testCase.text,
        testCase.from,
        testCase.to,
        session,
        `${testCase.name} - `
      );

      if (!result.error) {
        passedTests++;
        console.log(`✅ ${testCase.name}通过`);
      } else {
        console.log(`❌ ${testCase.name}失败`);
      }
    }

    // 测试总结
    console.log("\n" + "=".repeat(50));
    console.log("🎯 测试总结");
    console.log("=".repeat(50));
    console.log(`📊 总测试数: ${totalTests}`);
    console.log(`✅ 通过数: ${passedTests}`);
    console.log(`❌ 失败数: ${totalTests - passedTests}`);
    console.log(`📈 通过率: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
      console.log("\n🎉 所有测试通过！API工作正常！");
    } else if (passedTests > 0) {
      console.log("\n⚠️ 部分测试通过，可能存在速率限制，请稍后重试");
    } else {
      console.log("\n💥 所有测试失败，请检查网络连接或等待更长时间");
    }
  } catch (error) {
    console.error("\n💥 测试运行出错:", error.message);
  }
}

// 运行测试
async function main() {
  await runAllTests();
}

// 运行测试
main();

export { runAllTests, safeTranslate };
