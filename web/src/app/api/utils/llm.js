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

function extractTextFromPayload(payload) {
  const choice = payload?.choices?.[0];

  const deltaContent = choice?.delta?.content;
  if (typeof deltaContent === "string") {
    return deltaContent;
  }
  if (Array.isArray(deltaContent)) {
    return deltaContent
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text || item?.content || "";
      })
      .join("");
  }

  const messageContent = choice?.message?.content;
  if (typeof messageContent === "string") {
    return messageContent;
  }
  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text || item?.content || "";
      })
      .join("");
  }

  if (typeof payload?.result === "string") return payload.result;
  if (typeof payload?.response === "string") return payload.response;
  if (typeof payload?.text === "string") return payload.text;

  return "";
}

async function parseErrorResponse(response) {
  let errorMessage = `API 调用失败 [${response.status}]`;
  try {
    const errorData = await response.json();
    const detail =
      errorData.error?.message ||
      errorData.message ||
      JSON.stringify(errorData);
    errorMessage += `：${detail}`;
  } catch {
    try {
      const detail = await response.text();
      if (detail) {
        errorMessage += `：${detail}`;
      }
    } catch {
      // ignore parse error
    }
  }
  return errorMessage;
}

function shouldFallbackToNonStream(errorMessage, responseStatus) {
  if (responseStatus >= 500) {
    return false;
  }

  const text = errorMessage.toLowerCase();
  return [
    "stream",
    "sse",
    "event-stream",
    "response_format",
    "not support",
    "unsupported",
  ].some((keyword) => text.includes(keyword));
}

async function parseSSEContent(response) {
  if (!response.body) {
    throw new Error("流式响应没有返回可读取的 body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  const processEvent = (rawEvent) => {
    const dataLines = rawEvent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    if (dataLines.length === 0) {
      return false;
    }

    const rawData = dataLines.join("\n");
    if (!rawData || rawData === "[DONE]") {
      return rawData === "[DONE]";
    }

    try {
      const payload = JSON.parse(rawData);
      const chunk = extractTextFromPayload(payload);
      if (chunk) {
        content += chunk;
      }
    } catch {
      content += rawData;
    }

    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    buffer = buffer.replace(/\r\n/g, "\n");

    let boundaryIndex;
    while ((boundaryIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      const isDone = processEvent(rawEvent);
      if (isDone) {
        return content.trim();
      }
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processEvent(buffer.trim());
  }

  return content.trim();
}

async function requestLLM({
  endpoint,
  apiKey,
  requestBody,
  preferStream,
}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: preferStream ? "text/event-stream, application/json" : "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...requestBody,
      ...(preferStream ? { stream: true } : {}),
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    const error = new Error(errorMessage);
    error.responseStatus = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  if (preferStream && contentType.includes("text/event-stream")) {
    return parseSSEContent(response);
  }

  const data = await response.json();
  return extractTextFromPayload(data);
}

function getValidatedEndpoint() {
  const rawEndpoint = process.env.LLM_API_ENDPOINT?.trim();
  const endpoint = rawEndpoint || DEFAULT_ENDPOINT;

  let parsedUrl;
  try {
    parsedUrl = new URL(endpoint);
  } catch {
    throw new Error(
      "LLM_API_ENDPOINT 配置无效。请填写完整地址，例如 https://api.openai.com/v1/chat/completions",
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(
      "LLM_API_ENDPOINT 必须是 http 或 https 地址，例如 https://api.openai.com/v1/chat/completions",
    );
  }

  if (!parsedUrl.hostname || parsedUrl.hostname === "https" || parsedUrl.hostname === "http") {
    throw new Error(
      "LLM_API_ENDPOINT 看起来填错了。当前值缺少有效域名，请检查是否只填了 `https` 或残缺 URL。",
    );
  }

  return parsedUrl.toString();
}

export async function callLLM({
  messages,
  temperature = 0.7,
  jsonMode = false,
}) {
  const endpoint = getValidatedEndpoint();
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

  try {
    return await requestLLM({
      endpoint,
      apiKey,
      requestBody,
      preferStream: true,
    });
  } catch (streamError) {
    const errorMessage = streamError.message || String(streamError);
    if (
      shouldFallbackToNonStream(errorMessage, streamError.responseStatus)
    ) {
      console.warn(`流式调用失败，回退非流式：${errorMessage}`);
      return requestLLM({
        endpoint,
        apiKey,
        requestBody,
        preferStream: false,
      });
    }

    try {
      console.error(errorMessage);
    } catch {
      // ignore console failure
    }
    throw streamError;
  }
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
