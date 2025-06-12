/**
 * DeepL翻译API类型定义
 */

/**
 * 翻译结果接口
 */
export interface TranslateResult {
  /** 状态码 */
  code: number;
  /** 请求ID */
  id: number;
  /** 翻译方法标识 */
  method: string;
  /** 翻译结果文本 */
  data: string;
  /** 备选翻译结果 */
  alternatives: string[];
  /** 检测到的源语言 */
  source_lang: string;
  /** 目标语言 */
  target_lang: string;
}

/**
 * 批量翻译单个结果接口
 */
export interface BatchTranslateItemResult {
  /** 是否翻译成功 */
  success: boolean;
  /** 原始文本 */
  originalText: string;
  /** 翻译后的文本 */
  translatedText: string | null;
  /** 详细翻译结果 */
  result: TranslateResult | null;
  /** 错误信息 */
  error: string | null;
  /** 在原数组中的索引 */
  index: number;
}

/**
 * 批量翻译配置选项
 */
export interface BatchTranslateOptions {
  /** 每次翻译之间的延迟时间(毫秒)，默认2000ms */
  delay?: number;
  /** 遇到错误时是否继续翻译其他文本，默认true */
  continueOnError?: boolean;
  /** 进度回调函数，接收参数(current, total, result) */
  onProgress?: (
    current: number,
    total: number,
    result: BatchTranslateItemResult
  ) => void;
}

/**
 * 批量翻译结果接口
 */
export interface BatchTranslateResult {
  /** 状态码 */
  code: number;
  /** 总翻译数量 */
  totalCount: number;
  /** 成功翻译数量 */
  successCount: number;
  /** 失败翻译数量 */
  errorCount: number;
  /** 成功率（百分比） */
  successRate: number;
  /** 详细结果数组 */
  results: BatchTranslateItemResult[];
  /** 目标语言 */
  targetLang: string;
  /** 完成时间戳 */
  timestamp: string;
}

/**
 * 错误结果接口
 */
export interface ErrorResult {
  /** 错误码 */
  code: number;
  /** 错误信息 */
  message: string;
}

/**
 * 支持的语言代码
 */
export type SupportedLanguage =
  | "auto" // 自动检测
  | "zh" // 中文
  | "zh-cn" // 简体中文
  | "zh-tw" // 繁体中文
  | "en" // 英语
  | "en-us" // 美式英语
  | "en-gb" // 英式英语
  | "ja" // 日语
  | "ko" // 韩语
  | "fr" // 法语
  | "de" // 德语
  | "es" // 西班牙语
  | "it" // 意大利语
  | "ru" // 俄语
  | "pt" // 葡萄牙语
  | "pt-br" // 巴西葡萄牙语
  | "pt-pt" // 欧洲葡萄牙语
  | "ar" // 阿拉伯语
  | "nl" // 荷兰语
  | "pl" // 波兰语
  | "tr" // 土耳其语
  | "cs" // 捷克语
  | "da" // 丹麦语
  | "et" // 爱沙尼亚语
  | "fi" // 芬兰语
  | "el" // 希腊语
  | "hu" // 匈牙利语
  | "id" // 印尼语
  | "lv" // 拉脱维亚语
  | "lt" // 立陶宛语
  | "nb" // 挪威语
  | "ro" // 罗马尼亚语
  | "sk" // 斯洛伐克语
  | "sl" // 斯洛文尼亚语
  | "sv" // 瑞典语
  | "uk" // 乌克兰语
  | "bg"; // 保加利亚语

/**
 * 标签处理方式
 */
export type TagHandling = "html" | "xml" | boolean;

/**
 * 翻译函数 - 支持单个文本或批量翻译
 * @param text 要翻译的文本或文本数组（单个文本最大5000字符，批量翻译总长度不超过5000字符）
 * @param targetLang 目标语言代码，默认"zh"
 * @returns Promise<TranslateResult | BatchTranslateResult>
 */
export declare function translate(
  text: string | string[],
  targetLang?: SupportedLanguage
): Promise<TranslateResult | BatchTranslateResult>;

/**
 * 批量翻译函数
 * @param texts 要翻译的文本数组（每个文本最大5000字符，数组最大100个元素）
 * @param targetLang 目标语言代码
 * @param options 批量翻译配置选项
 * @returns Promise<BatchTranslateResult>
 */
export declare function translateBatch(
  texts: string[],
  targetLang?: SupportedLanguage,
  options?: BatchTranslateOptions
): Promise<BatchTranslateResult>;

/**
 * 获取支持的语言列表
 * @returns 支持的语言代码映射对象
 */
export declare function getSupportedLanguages(): Record<string, string>;

/**
 * 语言代码映射类型
 */
export type LanguageMap = Record<string, string>;
