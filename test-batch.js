import { translate, cleanup } from "./lib/main.js";

/**
 * 简洁的批量翻译示例 - 逐个翻译模式
 */
async function testSimpleBatchTranslation() {
  try {
    // 测试文本数组
    const textsToTranslate = [
      "Hello, how are you today?",
      "The weather is beautiful.",
      "I love programming in JavaScript.",
      "This is a batch translation test.",
      "Technology makes our lives easier.",
      "Learning new languages is fun.",
    ];

    console.log("🚀 开始批量翻译测试...\n");
    console.log("💡 使用逐个翻译模式（可靠且准确）");

    // 执行批量翻译 - 直接使用translate函数
    const startTime = Date.now();
    const batchResult = await translate(textsToTranslate, "zh");
    const endTime = Date.now();

    // 输出结果统计
    console.log("\n" + "=".repeat(60));
    console.log("📋 批量翻译结果汇总:");
    console.log("=".repeat(60));
    console.log(`📊 总数量: ${batchResult.totalCount}`);
    console.log(`✅ 成功数: ${batchResult.successCount}`);
    console.log(`❌ 失败数: ${batchResult.errorCount}`);
    console.log(`📈 成功率: ${batchResult.successRate.toFixed(1)}%`);
    console.log(`⏱️ 翻译耗时: ${endTime - startTime}ms`);
    console.log(`🚀 翻译方法: ${batchResult.method}`);
    console.log(`🕐 完成时间: ${batchResult.timestamp}`);

    // 输出详细结果
    console.log("\n📝 详细翻译结果:");
    console.log("-".repeat(60));

    batchResult.results.forEach((result, index) => {
      console.log(`\n${index + 1}. 原文: "${result.originalText}"`);
      if (result.success) {
        console.log(`   译文: "${result.translatedText}"`);
        console.log(`   状态: ✅ 成功`);
      } else {
        console.log(`   错误: ${result.error}`);
        console.log(`   状态: ❌ 失败`);
      }
    });

    console.log("\n🎉 批量翻译测试完成！");
    console.log("💡 优势：逐个翻译，结果准确可靠");
  } catch (error) {
    console.error("❌ 批量翻译测试失败:", error.message);
  }
}

/**
 * 测试单个文本翻译
 */
async function testSingleTranslation() {
  try {
    console.log("🔧 测试单个文本翻译...");

    const text = "Hello, world! This is a single translation test.";
    const startTime = Date.now();
    const result = await translate(text, "zh");
    const endTime = Date.now();

    console.log(`✅ 单个翻译完成，耗时: ${endTime - startTime}ms`);
    console.log(`原文: "${text}"`);
    console.log(`译文: "${result.data}"`);
    console.log(`方法: ${result.method}`);
  } catch (error) {
    console.error("单个翻译测试失败:", error.message);
  }
}

/**
 * 测试不同语言翻译
 */
async function testMultipleLanguages() {
  try {
    console.log("\n🌐 测试不同语言翻译...");

    const testCases = [
      { text: "Hello, world!", targetLang: "zh", description: "英文→中文" },
      { text: "Bonjour le monde!", targetLang: "en", description: "法文→英文" },
      { text: "你好，世界！", targetLang: "ja", description: "中文→日文" },
    ];

    for (const testCase of testCases) {
      console.log(`\n🔄 ${testCase.description}: "${testCase.text}"`);

      const startTime = Date.now();
      const result = await translate(testCase.text, testCase.targetLang);
      const endTime = Date.now();

      console.log(`✅ 译文: "${result.data}" (耗时: ${endTime - startTime}ms)`);

      // 添加短暂延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("多语言翻译测试失败:", error.message);
  }
}

// 运行测试
async function runTests() {
  console.log("🎯 统一接口翻译功能测试");
  console.log("=".repeat(50));

  // 测试1：单个文本翻译
  await testSingleTranslation();

  // 等待一下
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 测试2：批量翻译（同一个translate函数）
  await testSimpleBatchTranslation();

  // 等待一下
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 测试3：多语言翻译
  await testMultipleLanguages();

  console.log("\n🎉 所有测试完成！");
  console.log("💡 统一接口：translate函数自动识别输入类型，简洁高效！");
}

// 执行测试
runTests()
  .then(() => {
    return cleanup();
  })
  .catch(console.error);
