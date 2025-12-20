import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// List all leads (admin only)
export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const pool = getPool();

	const result = await pool.query(`
		SELECT
			l.*,
			ie.text_body,
			ie.html_body,
			u.name as assigned_to_name
		FROM lead l
		LEFT JOIN inbound_email ie ON ie.id = l.email_id
		LEFT JOIN "user" u ON u.id = l.assigned_to
		ORDER BY l.created_at DESC
		LIMIT 100
	`);

	// Count by status
	const statsResult = await pool.query(`
		SELECT status, COUNT(*)::int as count
		FROM lead
		GROUP BY status
	`);

	const stats = statsResult.rows.reduce(
		(acc, row) => {
			acc[row.status] = row.count;
			return acc;
		},
		{} as Record<string, number>,
	);

	return NextResponse.json({
		leads: result.rows,
		stats: {
			new: stats.new || 0,
			contacted: stats.contacted || 0,
			qualified: stats.qualified || 0,
			converted: stats.converted || 0,
			rejected: stats.rejected || 0,
			total: result.rows.length,
		},
	});
}

// Update lead status (admin only)
export async function PATCH(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { id, status, notes } = body;

	if (!id) {
		return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
	}

	const pool = getPool();

	const updates: string[] = ["updated_at = NOW()"];
	const values: (string | null)[] = [];
	let paramIndex = 1;

	if (status) {
		updates.push(`status = $${paramIndex++}`);
		values.push(status);
	}

	if (notes !== undefined) {
		updates.push(`notes = $${paramIndex++}`);
		values.push(notes);
	}

	values.push(id);

	await pool.query(
		`UPDATE lead SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
		values,
	);

	return NextResponse.json({ success: true });
}
