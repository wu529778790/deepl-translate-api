/**
 * DeepL 翻译 API 类型定义（与实现保持一致）
 */

export interface TranslateResult {
  code: number;
  id: number;
  method: string;
  data: string;
  source_lang: string;
  target_lang: string;
}

export type SupportedLanguage =
  | "AR"
  | "BG"
  | "CS"
  | "DA"
  | "DE"
  | "EL"
  | "EN"
  | "EN-GB"
  | "EN-US"
  | "ES"
  | "ET"
  | "FI"
  | "FR"
  | "HE"
  | "HU"
  | "ID"
  | "IT"
  | "JA"
  | "KO"
  | "LT"
  | "LV"
  | "NB"
  | "NL"
  | "PL"
  | "PT"
  | "PT-BR"
  | "PT-PT"
  | "RO"
  | "RU"
  | "SK"
  | "SL"
  | "SV"
  | "TH"
  | "TR"
  | "UK"
  | "VI"
  | "ZH"
  | "ZH-HANS"
  | "ZH-HANT";

export declare function translate(
  text: string,
  targetLang?: SupportedLanguage
): Promise<TranslateResult>;

export declare function cleanup(): Promise<void>;
export declare function findChromePath(): string | null;
export declare function askUserToDownloadChrome(): Promise<boolean>;
export declare function launchWithPlaywrightChromium(): Promise<{
  browser: any;
  page: any;
}>;
export declare function getSupportedLanguages(): SupportedLanguage[];
