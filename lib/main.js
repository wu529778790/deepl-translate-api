import axios from "axios";
import { brotliDecompress } from "zlib";

const baseURL = "https://www2.deepl.com",
  proURL = "https://api.deepl.com",
  freeURL = "https://api-free.deepl.com";

/**
 * 格式化POST请求字符串
 * @param {Object} postData
 * @returns {string}
 */
function formatPostString(postData) {
  let body = JSON.stringify(postData),
    str =
      (body.id + 5) % 29 === 0 || (body.id + 3) % 13 === 0
        ? '"method" : "'
        : '"method": "';
  body = body.replace('"method":"', str);
  // console.log(body);
  return body;
}

/**
 * 延时函数
 * @param {number} ms 毫秒数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 发送请求到DeepL API
 * @param {Object} postData
 * @param {string} urlMethod
 * @param {string} dlSession
 * @returns {Promise<Object>}
 */
async function sendRequest(postData, urlMethod, dlSession) {
  const urlFull = `${baseURL}/jsonrpc?client=chrome-extension,1.28.0&method=${encodeURIComponent(
    urlMethod
  )}`;

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "DeepLBrowserExtension/1.28.0 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Language":
      "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh-HK;q=0.6,zh;q=0.5",
    Authorization: "None",
    "Cache-Control": "no-cache",
    DNT: "1",
    Origin: "chrome-extension://cofdbpoegempjloogbagkncekinflcnj",
    Pragma: "no-cache",
    Priority: "u=1, i",
    Referer: "https://www.deepl.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "none",
    "Sec-GPC": "1",
    ...(dlSession && { Cookie: `dl_session=${dlSession}` }),
  };
  postData = formatPostString(postData);
  // console.warn(postData);

  try {
    const response = await axios.post(urlFull, postData, {
      headers: headers,
      timeout: 30000, // 30秒超时
    });

    if (response.headers["content-encoding"] === "br") {
      const decompressed = await new Promise((resolve, reject) => {
        brotliDecompress(response.data, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      return JSON.parse(decompressed.toString());
    }
    return response.data;
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error("Too Many Requests - 请求过于频繁，请稍后重试");
    } else if (err.response?.status === 403) {
      throw new Error("Forbidden - 访问被拒绝，可能需要会话ID");
    } else if (err.code === "ECONNABORTED") {
      throw new Error("Request Timeout - 请求超时");
    } else {
      console.error(`[ERROR] sendRequest: ${err.message}`);
      throw new Error(`网络请求失败: ${err.message}`);
    }
  }
}

/**
 * 带重试的请求函数
 * @param {Object} postData
 * @param {string} urlMethod
 * @param {string} dlSession
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
async function sendRequestWithRetry(
  postData,
  urlMethod,
  dlSession,
  retries = 3
) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await sendRequest(postData, urlMethod, dlSession);
    } catch (err) {
      if (err.message.includes("Too Many Requests") && i < retries) {
        // 更保守的重试策略：10s, 30s, 60s
        const waitTime = [10000, 30000, 60000][i];
        console.log(
          `请求被限制，${waitTime / 1000}秒后重试... (${i + 1}/${retries})`
        );
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
}

/**
 * 分割文本
 * @param {string} text
 * @param {string} dlSession
 * @returns {Promise<Object>}
 */
async function splitText(text, dlSession) {
  const postData = {
    jsonrpc: "2.0",
    method: "LMT_split_text",
    id: Math.floor(Math.random() * 1000000),
    params: {
      commonJobParams: { mode: "translate" },
      lang: { lang_user_selected: "auto" },
      texts: [text],
      textType: "plaintext",
    },
  };

  try {
    return await sendRequestWithRetry(postData, "LMT_split_text", dlSession, 3);
  } catch (err) {
    console.error("[ERROR] splitText:", err);
    throw new Error(`文本分割失败: ${err.message}`);
  }
}

/**
 * 执行翻译任务
 * @param {string} text - 要翻译的文本
 * @param {string} sourceLang - 源语言代码
 * @param {string} targetLang - 目标语言代码
 * @param {string} dlSession - DeepL会话ID (可选)
 * @returns {Promise<Object>}
 */
async function translate(text, sourceLang, targetLang, dlSession = "") {
  try {
    // 添加小延时避免请求过于频繁
    await sleep(500);

    // 参数验证
    if (!text || typeof text !== "string") {
      throw new Error("文本参数无效: text必须是非空字符串");
    }

    if (text.trim().length === 0) {
      throw new Error("文本不能为空");
    }

    if (text.length > 5000) {
      throw new Error("文本长度不能超过5000个字符");
    }

    if (!sourceLang || typeof sourceLang !== "string") {
      throw new Error("源语言参数无效: sourceLang必须是字符串");
    }

    if (!targetLang || typeof targetLang !== "string") {
      throw new Error("目标语言参数无效: targetLang必须是字符串");
    }

    if (sourceLang === targetLang) {
      throw new Error("源语言和目标语言不能相同");
    }

    // 分割文本
    const splitResult = await splitText(text, dlSession);

    if (!splitResult.result || !splitResult.result.texts) {
      throw new Error("文本分割返回结果无效");
    }

    // 获取检测到的语言
    if (sourceLang === "auto" || sourceLang === "") {
      sourceLang = splitResult.result.lang.detected.toLowerCase();
    }

    // 准备翻译任务
    const chunks = splitResult.result.texts[0].chunks;
    if (!chunks || chunks.length === 0) {
      throw new Error("文本块为空");
    }

    const jobs = chunks.map((chunk, index) => {
      const sentence = chunk.sentences[0];
      const contextBefore =
        index > 0 ? [chunks[index - 1].sentences[0].text] : [];
      const contextAfter =
        index < chunks.length - 1 ? [chunks[index + 1].sentences[0].text] : [];

      return {
        kind: "default",
        preferred_num_beams: 4,
        raw_en_context_before: contextBefore,
        raw_en_context_after: contextAfter,
        sentences: [
          {
            prefix: sentence.prefix,
            text: sentence.text,
            id: index + 1,
          },
        ],
      };
    });

    const hasRegionalVariant = targetLang.includes("-");
    const targetLangCode = hasRegionalVariant
      ? targetLang.split("-")[0]
      : targetLang;

    const postData = {
      jsonrpc: "2.0",
      method: "LMT_handle_jobs",
      id: Math.floor(Math.random() * 1000000),
      params: {
        commonJobParams: {
          mode: "translate",
          ...(hasRegionalVariant && { regional_variant: targetLang }),
        },
        lang: {
          source_lang_computed: sourceLang.toUpperCase(),
          target_lang: targetLangCode.toUpperCase(),
        },
        jobs: jobs,
        priority: 1,
        timestamp: Date.now(),
      },
    };

    const response = await sendRequestWithRetry(
      postData,
      "LMT_handle_jobs",
      dlSession,
      3
    );

    if (!response.result || !response.result.translations) {
      throw new Error("翻译API返回结果无效");
    }

    let alternatives = [];
    let translatedText = "";

    // 获取翻译结果
    const translations = response.result.translations;
    if (translations.length === 0) {
      throw new Error("翻译结果为空");
    }

    // 合并多个文本块的翻译结果
    translatedText = translations
      .map((translation) => {
        if (!translation.beams || translation.beams.length === 0) {
          throw new Error("翻译beam为空");
        }
        return translation.beams[0].sentences[0].text;
      })
      .join("");

    // 获取备选翻译 (仅第一个文本块)
    if (translations[0].beams.length > 1) {
      alternatives = translations[0].beams
        .slice(1)
        .map((beam) => beam.sentences[0].text);
    }

    if (!translatedText) {
      throw new Error("翻译结果为空");
    }

    const result = {
      code: 200,
      id: postData.id,
      method: "Free",
      data: translatedText,
      alternatives: alternatives,
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase(),
    };

    return result;
  } catch (err) {
    console.error("[ERROR] translate:", err);
    throw new Error(err.message || "翻译失败");
  }
}

/**
 * 获取DeepL会话ID
 * @returns {Promise<string>}
 */
async function getSession() {
  try {
    const response = await axios.get(`${baseURL}/translator`, {
      headers: {
        "User-Agent":
          "DeepLBrowserExtension/1.28.0 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language":
          "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh-HK;q=0.6,zh;q=0.5",
        "Cache-Control": "no-cache",
        DNT: "1",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-GPC": "1",
      },
      timeout: 30000,
    });

    const cookies = response.headers["set-cookie"];
    if (cookies) {
      for (const cookie of cookies) {
        const match = cookie.match(/dl_session=([^;]+)/);
        if (match) {
          console.log("✅ 成功获取DeepL会话ID");
          return match[1];
        }
      }
    }

    console.log("⚠️ 未能从响应中提取会话ID");
    return "";
  } catch (err) {
    console.warn("⚠️ 获取会话ID失败:", err.message);
    return "";
  }
}

export { translate, getSession };
