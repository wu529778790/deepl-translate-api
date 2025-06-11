import { translate } from "./lib/main.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("🚀 开始DeepL翻译API测试...\n");

  try {
    // 测试1: 基本翻译
    console.log("📋 测试1: 基本翻译");
    const result1 = await translate("How are you?", "en", "zh");
    console.log("原文:", "How are you?");
    console.log("翻译:", result1.data);
    console.log("备选:", result1.alternatives);
    console.log("检测语言:", result1.source_lang);
    console.log("✅ 测试1通过\n");
    await sleep(1000);

    // 测试2: 自动检测语言
    console.log("📋 测试2: 自动检测语言");
    const result2 = await translate("Bonjour le monde!", "auto", "en");
    console.log("原文:", "Bonjour le monde!");
    console.log("翻译:", result2.data);
    console.log("检测语言:", result2.source_lang);
    console.log("✅ 测试2通过\n");
    await sleep(1000);

    // 测试3: 中文翻译英文
    console.log("📋 测试3: 中文翻译英文");
    const result3 = await translate("你好世界", "zh", "en");
    console.log("原文:", "你好世界");
    console.log("翻译:", result3.data);
    console.log("✅ 测试3通过\n");
    await sleep(1000);

    // 测试4: 长文本翻译
    console.log("📋 测试4: 长文本翻译");
    const longText =
      "The quick brown fox jumps over the lazy dog. This is a test of a longer sentence to see how the translation API handles multiple sentences and punctuation.";
    const result5 = await translate(longText, "en", "zh");
    console.log("原文:", longText);
    console.log("翻译:", result5.data);
    console.log("✅ 测试4通过\n");
    await sleep(1000);

    // 测试5: 不同语言对的翻译
    console.log("📋 测试5: 多语言翻译测试");
    const testCases = [
      { text: "Hello", from: "en", to: "ja" },
      { text: "Guten Tag", from: "de", to: "en" },
      { text: "こんにちは", from: "ja", to: "en" },
    ];

    for (const testCase of testCases) {
      const result = await translate(testCase.text, testCase.from, testCase.to);
      console.log(
        `${testCase.from}->${testCase.to}: "${testCase.text}" -> "${result.data}"`
      );
      await sleep(1000);
    }
    console.log("✅ 测试5通过\n");

    console.log("🎉 所有测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);

    // 如果是429错误，提供友好提示
    if (error.message.includes("429") || error.message.includes("频繁")) {
      console.log("\n💡 提示: 如果遇到频率限制，请稍等几分钟后重试");
    }
  }
}

// 运行所有测试
(async () => {
  await runTests();
})();
