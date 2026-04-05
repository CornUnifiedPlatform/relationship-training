/**
 * 统一的 LLM 调用工具
 *
 * 通过环境变量配置：
 *   LLM_API_ENDPOINT  - 自定义 API 地址，例如：
 *     - OpenAI: https://api.openai.com/v1/chat/completions
 *     - 中转站: https://your-proxy.com/v1/chat/completions
 *     - Cloudflare AI: https://api.cloudflare.com/client/v4/accounts/{id}/ai/v1/chat/completions
 *     - DeepSeek: https://api.deepseek.com/v1/chat/completions
 *     - 任何兼容 OpenAI 格式的接口
 *
 *   LLM_API_KEY        - 你的 API Key
 *   LLM_MODEL_ID       - 模型 ID，例如 gpt-4o-mini、deepseek-chat、claude-3-haiku 等
 */

const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

export async function callLLM({
  messages,
  temperature = 0.7,
  jsonMode = false,
}) {
  const endpoint = process.env.LLM_API_ENDPOINT || DEFAULT_ENDPOINT;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL_ID || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("未配置 LLM_API_KEY 环境变量，请在设置中添加你的 API Key");
  }

  const requestBody = {
    model,
    messages,
    temperature,
  };

  // 只有明确支持 json_object 的 endpoint 才加 response_format
  // 大部分 OpenAI 兼容 API 都支持，但有些不支持
  if (jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = `API 调用失败 [${response.status}]`;
    try {
      const errorData = await response.json();
      const detail =
        errorData.error?.message ||
        errorData.message ||
        JSON.stringify(errorData);
      errorMessage += `：${detail}`;
    } catch {
      // ignore parse error
    }
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // 兼容不同 API 的返回格式
  const content =
    data.choices?.[0]?.message?.content || data.result || data.response || "";

  return content;
}

export async function callLLMJSON({ messages, temperature = 0.7 }) {
  // 先尝试用 json_object 模式
  try {
    const content = await callLLM({ messages, temperature, jsonMode: true });
    return JSON.parse(content);
  } catch (firstError) {
    // 如果 json_object 不支持，回退到普通模式 + 手动解析
    if (
      firstError.message.includes("response_format") ||
      firstError.message.includes("json_object")
    ) {
      const content = await callLLM({ messages, temperature, jsonMode: false });
      // 尝试从回复中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("AI 返回的内容不是有效的 JSON 格式");
    }
    throw firstError;
  }
}
