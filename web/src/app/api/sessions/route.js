import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const profileId = url.searchParams.get("profileId");

    let sessions;
    if (profileId) {
      sessions = await sql`
        SELECT ts.*, cp.slug as crush_name
        FROM training_sessions ts
        JOIN crush_profiles cp ON cp.id = ts.profile_id
        WHERE ts.profile_id = ${profileId}
        ORDER BY ts.created_at DESC
      `;
    } else {
      sessions = await sql`
        SELECT ts.*, cp.slug as crush_name
        FROM training_sessions ts
        JOIN crush_profiles cp ON cp.id = ts.profile_id
        ORDER BY ts.created_at DESC
        LIMIT 50
      `;
    }

    return Response.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return Response.json({ error: "获取训练记录失败" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile_id, scene, feedback_mode } = body;

    if (!profile_id || !scene || !feedback_mode) {
      return Response.json({ error: "缺少必填信息" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO training_sessions (profile_id, scene, feedback_mode)
      VALUES (${profile_id}, ${scene}, ${feedback_mode})
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return Response.json({ error: "创建训练失败" }, { status: 500 });
  }
}
