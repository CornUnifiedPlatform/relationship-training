import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const profiles = await sql`
      SELECT cp.*, 
        (SELECT COUNT(*) FROM training_sessions ts WHERE ts.profile_id = cp.id) as session_count
      FROM crush_profiles cp
      ORDER BY cp.created_at DESC
    `;
    return Response.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return Response.json({ error: "获取档案失败" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      slug,
      basic_info,
      personality_tags,
      message_length,
      word_style,
      emotion_style,
      reply_pace,
      topic_sensitivity,
      relationship_status,
      raw_chat_text,
      persona_summary,
    } = body;

    if (!slug) {
      return Response.json({ error: "花名/代号是必填项" }, { status: 400 });
    }

    const result = await sql(
      `INSERT INTO crush_profiles (slug, basic_info, personality_tags, message_length, word_style, emotion_style, reply_pace, topic_sensitivity, relationship_status, raw_chat_text, persona_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        slug,
        basic_info || null,
        personality_tags || null,
        message_length || "中等",
        word_style || "随意",
        emotion_style || "内敛",
        reply_pace || "看心情",
        topic_sensitivity || null,
        relationship_status || "普通朋友",
        raw_chat_text || null,
        persona_summary || null,
      ],
    );

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return Response.json({ error: "创建档案失败" }, { status: 500 });
  }
}
