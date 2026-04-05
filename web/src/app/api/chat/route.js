import sql from "@/app/api/utils/sql";
import { callLLM } from "@/app/api/utils/llm";

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, message } = body;

    if (!session_id || !message) {
      return Response.json({ error: "缺少必填信息" }, { status: 400 });
    }

    // Get session info with profile
    const sessionResult = await sql`
      SELECT ts.*, cp.*,
             ts.id as session_id, ts.scene, ts.feedback_mode, ts.status,
             cp.id as profile_id, cp.slug, cp.basic_info, cp.personality_tags,
             cp.message_length, cp.word_style, cp.emotion_style, cp.reply_pace,
             cp.topic_sensitivity, cp.relationship_status, cp.persona_summary
      FROM training_sessions ts
      JOIN crush_profiles cp ON cp.id = ts.profile_id
      WHERE ts.id = ${session_id}
    `;

    if (sessionResult.length === 0) {
      return Response.json({ error: "训练不存在" }, { status: 404 });
    }

    const session = sessionResult[0];

    if (session.status !== "active") {
      return Response.json({ error: "训练已结束" }, { status: 400 });
    }

    // Save user message
    await sql`
      INSERT INTO session_messages (session_id, role, content)
      VALUES (${session_id}, 'user', ${message})
    `;

    // Get chat history
    const history = await sql`
      SELECT role, content FROM session_messages
      WHERE session_id = ${session_id}
      ORDER BY created_at ASC
    `;

    // Build persona prompt
    const personaSystemPrompt = buildPersonaPrompt(session);
    const personaMessages = [
      { role: "system", content: personaSystemPrompt },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    // Get crush response
    const crushMessage = await callLLM({
      messages: personaMessages,
      temperature: 0.8,
    });

    // Save crush message
    await sql`
      INSERT INTO session_messages (session_id, role, content)
      VALUES (${session_id}, 'crush', ${crushMessage})
    `;

    // Get coach feedback if real-time mode
    let coachMessage = null;
    if (session.feedback_mode === "实时提示") {
      const coachSystemPrompt = buildCoachPrompt(session);
      const conversationForCoach = [
        ...history.map(
          (m) => `${m.role === "user" ? "用户" : session.slug}：${m.content}`,
        ),
        `${session.slug}：${crushMessage}`,
      ].join("\n");

      const coachMessages = [
        { role: "system", content: coachSystemPrompt },
        {
          role: "user",
          content: `请对用户最近的这句话进行点评（10-30字）：\n\n${conversationForCoach}\n\n用户最新消息："${message}"\n对方回复："${crushMessage}"`,
        },
      ];

      try {
        coachMessage = await callLLM({
          messages: coachMessages,
          temperature: 0.7,
        });

        if (coachMessage) {
          coachMessage = coachMessage
            .replace(/^💬\s*Coach[：:]\s*/i, "")
            .trim();
          await sql`
            INSERT INTO session_messages (session_id, role, content)
            VALUES (${session_id}, 'coach', ${coachMessage})
          `;
        }
      } catch (coachError) {
        console.error("Coach error:", coachError);
        // Coach failure is non-critical, continue without it
      }
    }

    return Response.json({
      crush: crushMessage,
      coach: coachMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: error.message || "对话出错了，请重试" },
      { status: 500 },
    );
  }
}

function buildPersonaPrompt(session) {
  return `你是用户 crush 的模拟人格。你的唯一职责是：像 ta 一样说话、像 ta 一样反应。
你不是助手，不是 AI，不是"理想恋人"。你是一个有自己性格、有自己节奏、有时候不那么配合的真实的人。

## 人格信息
花名：${session.slug}
基本信息：${session.basic_info || "未提供"}
性格标签：${(session.personality_tags || []).join("、") || "未提供"}
说话长度：${session.message_length || "中等"}
用词风格：${session.word_style || "随意"}
情绪表达：${session.emotion_style || "内敛"}
回复节奏：${session.reply_pace || "看心情"}
话题敏感度：${session.topic_sensitivity || "未提供"}
当前关系状态：${session.relationship_status || "普通朋友"}
${session.persona_summary ? `\n## AI分析的人格摘要\n${session.persona_summary}` : ""}

## 当前场景：${session.scene}

## 行为规则
- 严格遵守说话长度、用词习惯、标点风格
- 用户说了有趣的事 → 可以主动追问
- 用户说了无聊的话 → 给平淡回应
- 用户推进太猛 → 自然回避或转移话题
- 用户表现真诚 → 可以稍微温暖回应

## 硬性禁止
1. 不突然深情 2. 不违背关系现实 3. 不反转拒绝 4. 不扮演完美对象 5. 不透露自己是AI 6. 不说ta不会说的话

## 输出
直接输出 ta 会说的话。不要加角色标签或前缀。保持简短自然。`;
}

function buildCoachPrompt(session) {
  return `你是恋爱沟通教练。观察用户的每一句话，判断表达质量，给出简短改进建议。

训练场景：${session.scene}
Crush：${session.slug}，${session.relationship_status || "普通朋友"}

## 观察维度
1. 节奏感 2. 真诚度 3. 推进感 4. 情绪感知 5. 目标达成度

## 规则
- 给出简短点评（10-30字）
- 不替用户写台词
- 不给PUA建议
- 不鼓励不健康执念
- 直接输出点评，不要加任何前缀`;
}
