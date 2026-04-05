import sql from "@/app/api/utils/sql";
import { callLLMJSON } from "@/app/api/utils/llm";

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return Response.json({ error: "缺少训练ID" }, { status: 400 });
    }

    // Get session + profile
    const sessionResult = await sql`
      SELECT ts.*, cp.slug, cp.personality_tags, cp.relationship_status
      FROM training_sessions ts
      JOIN crush_profiles cp ON cp.id = ts.profile_id
      WHERE ts.id = ${session_id}
    `;

    if (sessionResult.length === 0) {
      return Response.json({ error: "训练不存在" }, { status: 404 });
    }

    const session = sessionResult[0];

    // Get messages
    const messages = await sql`
      SELECT role, content FROM session_messages
      WHERE session_id = ${session_id}
      ORDER BY created_at ASC
    `;

    if (messages.length < 2) {
      return Response.json(
        { error: "对话太短，无法生成报告" },
        { status: 400 },
      );
    }

    const conversationText = messages
      .filter((m) => m.role !== "coach")
      .map((m) => `${m.role === "user" ? "用户" : session.slug}：${m.content}`)
      .join("\n");

    const reportPrompt = `请根据以下训练对话，生成一份详细的训练复盘报告。

## 训练信息
场景：${session.scene}
Crush：${session.slug}

## 对话记录
${conversationText}

请从五个维度评分（每个维度满分20分），总分100分。
返回JSON格式，包含：total_score, dimensions (数组，每项包含name, score, max_score, comment), highlights (数组), improvements (数组), rewrite_examples (数组，每项包含original, improved, reason), coach_summary, next_suggestion`;

    const report = await callLLMJSON({
      messages: [
        {
          role: "system",
          content:
            "你是一位专业的恋爱沟通教练。请严格按JSON格式返回复盘报告。评分要客观真实，不要过于鼓励。",
        },
        { role: "user", content: reportPrompt },
      ],
      temperature: 0.7,
    });

    // Save report to session
    await sql`
      UPDATE training_sessions
      SET status = 'completed', ended_at = NOW(), report = ${JSON.stringify(report)}
      WHERE id = ${session_id}
    `;

    return Response.json(report);
  } catch (error) {
    console.error("Report error:", error);
    return Response.json(
      { error: error.message || "生成报告失败" },
      { status: 500 },
    );
  }
}
