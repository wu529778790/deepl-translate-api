import { translateBatch, cleanup } from "./lib/main.js";

/**
 * 批量翻译示例
 */
async function testBatchTranslation() {
  try {
    // 测试文本数组
    const textsToTranslate = [
      "Hello, how are you today?",
      "The weather is beautiful.",
      "I love programming in JavaScript.",
      "This is a batch translation test.",
      "Technology makes our lives easier.",
      "Learning new languages is fun.",
      "Artificial intelligence is fascinating.",
      "The future looks bright.",
    ];

    console.log("🚀 开始批量翻译测试...\n");

    // 定义进度回调函数
    const onProgress = (current, total, result) => {
      const percentage = ((current / total) * 100).toFixed(1);
      if (result.success) {
        console.log(
          `📈 进度: ${percentage}% - 翻译成功: "${result.translatedText}"`
        );
      } else {
        console.log(`📈 进度: ${percentage}% - 翻译失败: ${result.error}`);
      }
    };

    // 执行批量翻译
    const batchResult = await translateBatch(textsToTranslate, "zh", {
      delay: 1500, // 每次翻译间隔1.5秒
      continueOnError: true, // 遇到错误继续翻译
      onProgress: onProgress, // 进度回调
    });

    // 输出结果统计
    console.log("\n" + "=".repeat(60));
    console.log("📋 批量翻译结果汇总:");
    console.log("=".repeat(60));
    console.log(`📊 总数量: ${batchResult.totalCount}`);
    console.log(`✅ 成功数: ${batchResult.successCount}`);
    console.log(`❌ 失败数: ${batchResult.errorCount}`);
    console.log(`📈 成功率: ${batchResult.successRate.toFixed(1)}%`);
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

    console.log("\n✅ 批量翻译测试完成！");
  } catch (error) {
    console.error("❌ 批量翻译测试失败:", error.message);
  } finally {
    // 清理资源
    await cleanup();
  }
}

/**
 * 批量翻译 - 自定义配置示例
 */
async function testCustomBatchTranslation() {
  try {
    const texts = [
      "Machine learning is transforming industries.",
      "Open source software drives innovation.",
      "Cloud computing enables scalability.",
    ];

    console.log("\n🔧 测试自定义配置的批量翻译...");

    const result = await translateBatch(texts, "zh", {
      delay: 1000, // 较短的延迟
      continueOnError: false, // 遇到错误就停止
      onProgress: (current, total, result) => {
        console.log(
          `[${current}/${total}] ${result.success ? "✅" : "❌"} 翻译状态`
        );
      },
    });

    console.log(
      `\n自定义配置翻译完成，成功率: ${result.successRate.toFixed(1)}%`
    );
  } catch (error) {
    console.error("自定义配置测试失败:", error.message);
  }
}

// 运行测试
async function runTests() {
  console.log("🎯 批量翻译功能测试");
  console.log("=".repeat(50));

  // 测试1：基本批量翻译
  await testBatchTranslation();

  // 等待一下
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 测试2：自定义配置
  await testCustomBatchTranslation();

  console.log("\n🎉 所有测试完成！");
}

// 执行测试
runTests().catch(console.error);
