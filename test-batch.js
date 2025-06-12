import { translate, translateBatch, cleanup } from "./lib/main.js";

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
 * 测试translateBatch函数的进度回调功能
 */
async function testTranslateBatchWithProgress() {
  try {
    console.log("\n🔧 测试 translateBatch 函数的进度回调功能...");

    const texts = [
      "Machine learning is transforming industries.",
      "Open source software drives innovation.",
      "Cloud computing enables scalability.",
    ];

    // 定义进度回调函数
    const onProgress = (current, total, result) => {
      if (result.status) {
        console.log(`📈 状态: ${result.message}`);
      } else {
        const percentage = ((current / total) * 100).toFixed(1);
        if (result.success) {
          console.log(
            `📈 进度: ${percentage}% - "${result.originalText}" -> "${result.translatedText}"`
          );
        } else {
          console.log(`📈 进度: ${percentage}% - 翻译失败: ${result.error}`);
        }
      }
    };

    const startTime = Date.now();
    const result = await translateBatch(texts, "zh", {
      onProgress: onProgress,
    });
    const endTime = Date.now();

    console.log(
      `\n✅ translateBatch 函数测试完成，耗时: ${endTime - startTime}ms`
    );
    console.log(`📊 成功率: ${result.successRate.toFixed(1)}%`);
  } catch (error) {
    console.error("translateBatch 测试失败:", error.message);
  }
}

/**
 * 测试单个文本翻译
 */
async function testSingleTranslation() {
  try {
    console.log("\n🔧 测试单个文本翻译...");

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

// 运行测试
async function runTests() {
  console.log("🎯 简洁批量翻译功能测试");
  console.log("=".repeat(50));

  // 测试1：单个文本翻译
  await testSingleTranslation();

  // 等待一下
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 测试2：批量翻译（直接使用translate函数）
  await testSimpleBatchTranslation();

  // 等待一下
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 测试3：translateBatch函数（支持进度回调）
  await testTranslateBatchWithProgress();

  console.log("\n🎉 所有测试完成！");
  console.log("💡 新架构：一个函数，自动判断输入类型，简洁可靠！");
}

// 执行测试
runTests()
  .then(() => {
    return cleanup();
  })
  .catch(console.error);
