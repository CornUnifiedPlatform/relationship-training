import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM crush_profiles WHERE id = ${id}`;
    if (result.length === 0) {
      return Response.json({ error: "档案不存在" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "获取档案失败" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const fields = [
      "slug",
      "basic_info",
      "personality_tags",
      "message_length",
      "word_style",
      "emotion_style",
      "reply_pace",
      "topic_sensitivity",
      "relationship_status",
      "raw_chat_text",
      "persona_summary",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "没有要更新的字段" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE crush_profiles SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "档案不存在" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "更新档案失败" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM crush_profiles WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return Response.json({ error: "档案不存在" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return Response.json({ error: "删除档案失败" }, { status: 500 });
  }
}
