import { getPool } from "./db";

// Check if user is admin (by ID or role)
export async function isAdmin(userId: string): Promise<boolean> {
	const adminUserIds = process.env.ADMIN_USER_ID
		? [process.env.ADMIN_USER_ID]
		: [];
	if (adminUserIds.includes(userId)) {
		return true;
	}

	const pool = getPool();
	const result = await pool.query('SELECT role FROM "user" WHERE id = $1', [
		userId,
	]);
	return result.rows[0]?.role === "admin";
}
