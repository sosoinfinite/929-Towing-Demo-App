import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get a specific job
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	// Get job with driver info
	const jobResult = await pool.query(
		`SELECT j.*, u.name as driver_name, u.email as driver_email
		 FROM job j
		 LEFT JOIN "user" u ON u.id = j.assigned_driver_id
		 WHERE j.id = $1 AND j.company_id = $2`,
		[id, companyId],
	);

	if (jobResult.rows.length === 0) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	return NextResponse.json({ job: jobResult.rows[0] });
}

// Update a job
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	try {
		const body = await request.json();
		const allowedFields = [
			"status",
			"customer_name",
			"customer_phone",
			"customer_email",
			"service_type",
			"vehicle_info",
			"pickup_location",
			"dropoff_location",
			"motor_club",
			"po_number",
			"notes",
		];

		// Build SET clause dynamically
		const updates: string[] = [];
		const values: (string | null)[] = [];
		let paramIndex = 1;

		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				updates.push(`${field} = $${paramIndex}`);
				values.push(body[field]);
				paramIndex++;
			}
		}

		if (updates.length === 0) {
			return NextResponse.json(
				{ error: "No valid fields to update" },
				{ status: 400 },
			);
		}

		updates.push(`updated_at = NOW()`);

		const result = await pool.query(
			`UPDATE job SET ${updates.join(", ")}
			 WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
			 RETURNING *`,
			[...values, id, companyId],
		);

		if (result.rows.length === 0) {
			return NextResponse.json({ error: "Job not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, job: result.rows[0] });
	} catch (error) {
		console.error("Failed to update job:", error);
		return NextResponse.json(
			{ error: "Failed to update job" },
			{ status: 500 },
		);
	}
}

// Delete a job
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	try {
		// Delete associated messages first
		await pool.query("DELETE FROM message WHERE job_id = $1", [id]);

		const result = await pool.query(
			"DELETE FROM job WHERE id = $1 AND company_id = $2 RETURNING id",
			[id, companyId],
		);

		if (result.rows.length === 0) {
			return NextResponse.json({ error: "Job not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to delete job:", error);
		return NextResponse.json(
			{ error: "Failed to delete job" },
			{ status: 500 },
		);
	}
}
