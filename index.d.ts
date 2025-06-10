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
 * 翻译函数
 * @param text 要翻译的文本（最大5000字符）
 * @param sourceLang 源语言代码，支持 'auto' 自动检测
 * @param targetLang 目标语言代码
 * @param dlSession DeepL会话ID，可选
 * @param tagHandling 标签处理方式，可选：'html' | 'xml' | false
 * @param printResult 是否打印结果到控制台，默认false
 * @returns Promise<TranslateResult | ErrorResult>
 */
export declare function translate(
  text: string,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
  dlSession?: string,
  tagHandling?: TagHandling,
  printResult?: boolean
): Promise<TranslateResult | ErrorResult>;

/**
 * 获取支持的语言列表
 * @returns 支持的语言代码映射对象
 */
export declare function getSupportedLanguages(): Record<string, string>;

/**
 * 语言代码映射类型
 */
export type LanguageMap = Record<string, string>;
