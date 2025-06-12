import { translate, cleanup } from "./lib/main.js";

async function runAllTests() {
  console.log("🚀 开始DeepL翻译API完整测试...\n");
  console.log("ℹ️  所有测试均自动检测源语言，仅需指定目标语言。\n");

  let passedTests = 0;
  let totalTests = 0;

  try {
    // 测试1: 基本翻译 (英 -> 中)
    console.log("=".repeat(50));
    console.log("📋 测试1: 基本翻译 (英 -> 中)");
    console.log("=".repeat(50));
    totalTests++;

    let result1;
    try {
      const text = "Hello, world!";
      const targetLang = "ZH-HANS";
      const testName = "测试1 - 英译中";
      console.log(
        `🔄 ${testName}正在翻译: "${text.slice(0, 50)}${
          text.length > 50 ? "..." : ""
        }"`
      );
      const result = await translate(text, targetLang);
      console.log(`✅ 翻译成功: "${result.data}"`);
      if (result.alternatives && result.alternatives.length > 0) {
        console.log(
          `💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`
        );
      }
      console.log(
        `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
      );
      result1 = result;
    } catch (error) {
      const testName = "测试1 - 英译中";
      console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

      if (error.message.includes("Too Many Requests")) {
        console.log("💡 建议:");
        console.log("1. 等待10-15分钟后再试");
        console.log("2. 减少请求频率");
      }

      result1 = { error: error.message };
    }

    if (!result1.error) {
      passedTests++;
      console.log("✅ 测试1通过\n");
    } else {
      console.log("❌ 测试1失败\n");
    }

    // 测试2: 自动检测语言 (法 -> 英)
    console.log("=".repeat(50));
    console.log("📋 测试2: 自动检测语言 (法 -> 英)");
    console.log("=".repeat(50));
    totalTests++;

    let result2;
    try {
      const text = "Bonjour le monde!";
      const targetLang = "EN";
      const testName = "测试2 - 法译英";
      console.log(
        `🔄 ${testName}正在翻译: "${text.slice(0, 50)}${
          text.length > 50 ? "..." : ""
        }"`
      );
      const result = await translate(text, targetLang);
      console.log(`✅ 翻译成功: "${result.data}"`);
      if (result.alternatives && result.alternatives.length > 0) {
        console.log(
          `💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`
        );
      }
      console.log(
        `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
      );
      result2 = result;
    } catch (error) {
      const testName = "测试2 - 法译英";
      console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

      if (error.message.includes("Too Many Requests")) {
        console.log("💡 建议:");
        console.log("1. 等待10-15分钟后再试");
        console.log("2. 减少请求频率");
      }
      result2 = { error: error.message };
    }

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

    let result3;
    try {
      const text = "你好世界！欢迎使用DeepL翻译。";
      const targetLang = "EN";
      const testName = "测试3 - 中译英";
      console.log(
        `🔄 ${testName}正在翻译: "${text.slice(0, 50)}${
          text.length > 50 ? "..." : ""
        }"`
      );
      const result = await translate(text, targetLang);
      console.log(`✅ 翻译成功: "${result.data}"`);
      if (result.alternatives && result.alternatives.length > 0) {
        console.log(
          `💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`
        );
      }
      console.log(
        `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
      );
      result3 = result;
    } catch (error) {
      const testName = "测试3 - 中译英";
      console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

      if (error.message.includes("Too Many Requests")) {
        console.log("💡 建议:");
        console.log("1. 等待10-15分钟后再试");
        console.log("2. 减少请求频率");
      }
      result3 = { error: error.message };
    }

    if (!result3.error) {
      passedTests++;
      console.log("✅ 测试3通过\n");
    } else {
      console.log("❌ 测试3失败\n");
    }

    // 测试3.1: 相同目标语言，验证页面复用
    console.log("=".repeat(50));
    console.log("📋 测试3.1: 相同目标语言 (中 -> 英，复用页面)");
    console.log("=".repeat(50));
    totalTests++;

    let result3_1;
    try {
      const text = "这是第二个翻译请求，应该会更快。";
      const targetLang = "EN";
      const testName = "测试3.1 - 中译英 (复用)";
      console.log(
        `🔄 ${testName}正在翻译: "${text.slice(0, 50)}${
          text.length > 50 ? "..." : ""
        }"`
      );
      const result = await translate(text, targetLang);
      console.log(`✅ 翻译成功: "${result.data}"`);
      console.log(
        `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
      );
      result3_1 = result;
    } catch (error) {
      const testName = "测试3.1 - 中译英 (复用)";
      console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

      if (error.message.includes("Too Many Requests")) {
        console.log("💡 建议:");
        console.log("1. 等待10-15分钟后再试");
        console.log("2. 减少请求频率");
      }
      result3_1 = { error: error.message };
    }

    if (!result3_1.error) {
      passedTests++;
      console.log("✅ 测试3.1通过\n");
    } else {
      console.log("❌ 测试3.1失败\n");
    }

    // 测试4: 长文本翻译
    console.log("=".repeat(50));
    console.log("📋 测试4: 长文本翻译 (英 -> 中)");
    console.log("=".repeat(50));
    totalTests++;

    let result4;
    try {
      const longText =
        "The quick brown fox jumps over the lazy dog. This is a test of a longer sentence to see how the translation API handles multiple sentences and punctuation. Artificial intelligence is transforming the way we communicate across languages.";
      const targetLang = "ZH-HANS";
      const testName = "测试4 - 长文本";
      console.log(
        `🔄 ${testName}正在翻译: "${longText.slice(0, 50)}${
          longText.length > 50 ? "..." : ""
        }"`
      );
      const result = await translate(longText, targetLang);
      console.log(`✅ 翻译成功: "${result.data}"`);
      if (result.alternatives && result.alternatives.length > 0) {
        console.log(
          `💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`
        );
      }
      console.log(
        `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
      );
      result4 = result;
    } catch (error) {
      const testName = "测试4 - 长文本";
      console.error(`❌ ${testName}翻译失败: ${error.message}\n`);

      if (error.message.includes("Too Many Requests")) {
        console.log("💡 建议:");
        console.log("1. 等待10-15分钟后再试");
        console.log("2. 减少请求频率");
      }
      result4 = { error: error.message };
    }

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
      { text: "Guten Tag", to: "ja", name: "德语 -> 日语" },
      { text: "Hola mundo", to: "fr", name: "西语 -> 法语" },
      { text: "你好，世界", to: "ko", name: "中文 -> 韩语" },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      totalTests++;

      console.log(`--- ${testCase.name} (${i + 1}/${testCases.length}) ---`);
      let result;
      try {
        console.log(
          `🔄 ${testCase.name}正在翻译: "${testCase.text.slice(0, 50)}${
            testCase.text.length > 50 ? "..." : ""
          }"`
        );
        result = await translate(testCase.text, testCase.to);
        console.log(`✅ 翻译成功: "${result.data}"`);
        if (result.alternatives && result.alternatives.length > 0) {
          console.log(
            `💡 备选翻译: ${result.alternatives.slice(0, 3).join(", ")}`
          );
        }
        console.log(
          `🔍 检测语言: ${result.source_lang} -> ${result.target_lang}\n`
        );
      } catch (error) {
        console.error(`❌ ${testCase.name}翻译失败: ${error.message}\n`);

        if (error.message.includes("Too Many Requests")) {
          console.log("💡 建议:");
          console.log("1. 等待10-15分钟后再试");
          console.log("2. 减少请求频率");
        }
        result = { error: error.message };
      }

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
    if (totalTests > 0) {
      console.log(
        `📈 通过率: ${Math.round((passedTests / totalTests) * 100)}%`
      );
    }

    if (passedTests === totalTests) {
      console.log("\n🎉 所有测试通过！API工作正常！");
    } else if (passedTests > 0) {
      console.log("\n⚠️ 部分测试通过，可能存在速率限制，请稍后重试");
    } else {
      console.log("\n💥 所有测试失败，请检查网络连接或等待更长时间");
    }
  } catch (error) {
    console.error("\n💥 测试运行出错:", error.message);
  } finally {
    // 确保在所有测试完成后清理资源
    await cleanup();
  }
}

// 运行测试
runAllTests();

export { runAllTests };
