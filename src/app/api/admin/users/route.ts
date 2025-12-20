import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// List all users (admin only)
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
			u.id,
			u.name,
			u.email,
			u.role,
			u."emailVerified" as email_verified,
			u.banned,
			u."createdAt" as created_at,
			c.name as company_name,
			c.id as company_id
		FROM "user" u
		LEFT JOIN company c ON u.company_id = c.id
		ORDER BY u."createdAt" DESC
	`);

	return NextResponse.json({ users: result.rows });
}
