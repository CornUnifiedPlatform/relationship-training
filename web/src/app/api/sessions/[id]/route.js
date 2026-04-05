import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const sessionResult = await sql`
      SELECT ts.*, cp.slug as crush_name, cp.personality_tags, cp.relationship_status,
             cp.basic_info, cp.message_length, cp.word_style, cp.emotion_style,
             cp.reply_pace, cp.topic_sensitivity, cp.persona_summary, cp.raw_chat_text
      FROM training_sessions ts
      JOIN crush_profiles cp ON cp.id = ts.profile_id
      WHERE ts.id = ${id}
    `;

    if (sessionResult.length === 0) {
      return Response.json({ error: "训练记录不存在" }, { status: 404 });
    }

    const messages = await sql`
      SELECT * FROM session_messages
      WHERE session_id = ${id}
      ORDER BY created_at ASC
    `;

    const session = sessionResult[0];
    session.messages = messages;

    return Response.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return Response.json({ error: "获取训练记录失败" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (body.status === "completed") {
      const result = await sql`
        UPDATE training_sessions
        SET status = 'completed', ended_at = NOW(), report = ${body.report ? JSON.stringify(body.report) : null}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) {
        return Response.json({ error: "训练记录不存在" }, { status: 404 });
      }
      return Response.json(result[0]);
    }

    return Response.json({ error: "无效的操作" }, { status: 400 });
  } catch (error) {
    console.error("Error updating session:", error);
    return Response.json({ error: "更新训练记录失败" }, { status: 500 });
  }
}
