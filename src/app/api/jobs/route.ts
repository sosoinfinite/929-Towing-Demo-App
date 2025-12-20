import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import type { JobSource, JobStatus } from "@/lib/dispatch-agent";

// Get jobs list with pagination and filtering
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

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

	// Parse query params
	const searchParams = request.nextUrl.searchParams;
	const page = Number(searchParams.get("page")) || 1;
	const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
	const offset = (page - 1) * limit;
	const status = searchParams.get("status") as JobStatus | null;
	const source = searchParams.get("source") as JobSource | null;

	// Build WHERE clause
	const conditions = ["company_id = $1"];
	const params: (string | number)[] = [companyId];
	let paramIndex = 2;

	if (status) {
		conditions.push(`status = $${paramIndex}`);
		params.push(status);
		paramIndex++;
	}

	if (source) {
		conditions.push(`source = $${paramIndex}`);
		params.push(source);
		paramIndex++;
	}

	const whereClause = conditions.join(" AND ");

	// Get total count
	const countResult = await pool.query(
		`SELECT COUNT(*) as count FROM job WHERE ${whereClause}`,
		params,
	);
	const total = Number(countResult.rows[0]?.count || 0);

	// Get jobs with driver info
	const jobsResult = await pool.query(
		`SELECT j.id, j.source, j.status, j.customer_name, j.customer_phone,
		        j.service_type, j.vehicle_info, j.pickup_location, j.dropoff_location,
		        j.motor_club, j.po_number, j.notes, j.created_at, j.updated_at,
		        j.assigned_driver_id, j.assigned_at,
		        u.name as driver_name
		 FROM job j
		 LEFT JOIN "user" u ON u.id = j.assigned_driver_id
		 WHERE ${whereClause.replace(/\$(\d+)/g, (_, n) => `$${n}`)}
		 ORDER BY j.created_at DESC
		 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
		[...params, limit, offset],
	);

	return NextResponse.json({
		jobs: jobsResult.rows,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
}

// Create a new job manually
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

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
		const {
			customer_name,
			customer_phone,
			customer_email,
			service_type,
			vehicle_info,
			pickup_location,
			dropoff_location,
			motor_club,
			po_number,
			notes,
		} = body;

		if (!customer_phone || !pickup_location) {
			return NextResponse.json(
				{ error: "customer_phone and pickup_location are required" },
				{ status: 400 },
			);
		}

		const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

		await pool.query(
			`INSERT INTO job (id, company_id, source, customer_name, customer_phone, customer_email,
			                  service_type, vehicle_info, pickup_location, dropoff_location,
			                  motor_club, po_number, notes, status, created_at, updated_at)
			 VALUES ($1, $2, 'manual', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', NOW(), NOW())`,
			[
				id,
				companyId,
				customer_name || null,
				customer_phone,
				customer_email || null,
				service_type || null,
				vehicle_info || null,
				pickup_location,
				dropoff_location || null,
				motor_club || null,
				po_number || null,
				notes || null,
			],
		);

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("Failed to create job:", error);
		return NextResponse.json(
			{ error: "Failed to create job" },
			{ status: 500 },
		);
	}
}
