import { callLLMJSON } from "@/app/api/utils/llm";

export async function POST(request) {
  try {
    const body = await request.json();
    const { chat_text } = body;

    if (!chat_text || chat_text.trim().length < 20) {
      return Response.json(
        { error: "聊天记录太短，请提供更多内容" },
        { status: 400 },
      );
    }

    const analyzePrompt = `请分析以下聊天记录，从中提取对方（不是"我"或发送者）的性格特征和沟通风格。

## 请提取以下信息：
1. 说话长度（短句/中等/长段）
2. 用词风格（正式/随意/表情包多/简洁）
3. 情绪表达（外放/内敛/靠行动/靠文字）
4. 回复节奏（秒回/慢回/看心情）
5. 话题偏好（喜欢聊什么/回避什么）
6. 性格标签（3-5个关键词）
7. 整体人格摘要（2-3句话描述这个人的沟通特点）

请以JSON格式返回，包含以下字段：message_length, word_style, emotion_style, reply_pace, topic_sensitivity, personality_tags (数组), persona_summary

## 聊天记录：
${chat_text}`;

    const analysis = await callLLMJSON({
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的聊天记录分析师。请严格按照JSON格式返回分析结果。",
        },
        { role: "user", content: analyzePrompt },
      ],
      temperature: 0.7,
    });

    return Response.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: error.message || "分析聊天记录失败" },
      { status: 500 },
    );
  }
}
