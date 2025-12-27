import { stepCountIs, ToolLoopAgent, tool } from "ai";
import { z } from "zod";
import { getPool } from "./db";
import { sendSMS } from "./twilio";

// Types for job and message operations
export type JobSource = "email" | "sms" | "phone" | "manual";
export type JobStatus =
	| "pending"
	| "assigned"
	| "en_route"
	| "arrived"
	| "completed"
	| "cancelled";
export type ServiceType =
	| "tow"
	| "jumpstart"
	| "lockout"
	| "tire"
	| "fuel"
	| "winch"
	| "other";

// Create tools with company context
function createDispatchTools(companyId: string, source: JobSource = "manual") {
	const pool = getPool();

	const createJobTool = tool({
		description:
			"Create a new towing service job from a parsed dispatch request",
		inputSchema: z.object({
			customerName: z.string().optional().describe("Customer name"),
			customerPhone: z.string().describe("Customer callback phone number"),
			serviceType: z
				.enum(["tow", "jumpstart", "lockout", "tire", "fuel", "winch", "other"])
				.describe("Type of service needed"),
			vehicleInfo: z
				.string()
				.optional()
				.describe("Vehicle year, make, model, color"),
			pickupLocation: z.string().describe("Pickup address or location"),
			dropoffLocation: z
				.string()
				.optional()
				.describe("Dropoff address if applicable"),
			motorClub: z
				.string()
				.optional()
				.describe("Motor club name (AAA, Agero, etc)"),
			poNumber: z.string().optional().describe("PO or reference number"),
			notes: z.string().optional().describe("Additional notes or instructions"),
		}),
		execute: async (params) => {
			const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			await pool.query(
				`INSERT INTO job (id, company_id, source, customer_name, customer_phone, service_type, vehicle_info, pickup_location, dropoff_location, motor_club, po_number, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')`,
				[
					id,
					companyId,
					source,
					params.customerName || null,
					params.customerPhone,
					params.serviceType,
					params.vehicleInfo || null,
					params.pickupLocation,
					params.dropoffLocation || null,
					params.motorClub || null,
					params.poNumber || null,
					params.notes || null,
				],
			);
			return { success: true, jobId: id, message: `Job ${id} created` };
		},
	});

	const updateJobStatusTool = tool({
		description: "Update the status of an existing job",
		inputSchema: z.object({
			jobId: z.string().describe("The job ID to update"),
			status: z
				.enum([
					"pending",
					"assigned",
					"en_route",
					"arrived",
					"completed",
					"cancelled",
				])
				.describe("New status"),
		}),
		execute: async ({ jobId, status }) => {
			await pool.query(
				"UPDATE job SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3",
				[status, jobId, companyId],
			);
			return { success: true, jobId, status };
		},
	});

	const sendNotificationTool = tool({
		description: "Send an SMS notification to a phone number",
		inputSchema: z.object({
			to: z.string().describe("Phone number to send SMS to"),
			message: z.string().describe("Message content"),
		}),
		execute: async ({ to, message }) => {
			const result = await sendSMS(to, message);
			return { success: result.success, sid: result.sid, error: result.error };
		},
	});

	const lookupJobTool = tool({
		description: "Find active jobs by customer phone number",
		inputSchema: z.object({
			phone: z.string().describe("Phone number to search"),
		}),
		execute: async ({ phone }) => {
			// Normalize phone for matching
			const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
			const result = await pool.query(
				`SELECT id, status, service_type, pickup_location, customer_name, created_at
         FROM job
         WHERE company_id = $1
         AND (customer_phone LIKE '%' || $2 OR customer_phone LIKE '%' || $3)
         AND status NOT IN ('completed', 'cancelled')
         ORDER BY created_at DESC
         LIMIT 5`,
				[companyId, normalizedPhone, phone],
			);
			return { jobs: result.rows, count: result.rows.length };
		},
	});

	const lookupDriverTool = tool({
		description: "Check if a phone number belongs to a driver",
		inputSchema: z.object({
			phone: z.string().describe("Phone number to check"),
		}),
		execute: async ({ phone }) => {
			const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
			const result = await pool.query(
				`SELECT dp.id, dp.user_id, dp.status, u.name
         FROM driver_profile dp
         JOIN "user" u ON u.id = dp.user_id
         WHERE dp.company_id = $1
         AND (dp.phone LIKE '%' || $2 OR dp.phone LIKE '%' || $3)`,
				[companyId, normalizedPhone, phone],
			);
			return {
				driver: result.rows[0] || null,
				isDriver: result.rows.length > 0,
			};
		},
	});

	const getJobByIdTool = tool({
		description: "Get a specific job by ID",
		inputSchema: z.object({
			jobId: z.string().describe("The job ID to retrieve"),
		}),
		execute: async ({ jobId }) => {
			const result = await pool.query(
				`SELECT * FROM job WHERE id = $1 AND company_id = $2`,
				[jobId, companyId],
			);
			return { job: result.rows[0] || null };
		},
	});

	const findDriverActiveJobTool = tool({
		description: "Find the active job assigned to a driver",
		inputSchema: z.object({
			driverUserId: z.string().describe("The driver's user ID"),
		}),
		execute: async ({ driverUserId }) => {
			const result = await pool.query(
				`SELECT * FROM job
         WHERE assigned_driver_id = $1
         AND company_id = $2
         AND status IN ('assigned', 'en_route', 'arrived')
         ORDER BY assigned_at DESC
         LIMIT 1`,
				[driverUserId, companyId],
			);
			return { job: result.rows[0] || null };
		},
	});

	return {
		createJob: createJobTool,
		updateJobStatus: updateJobStatusTool,
		sendNotification: sendNotificationTool,
		lookupJob: lookupJobTool,
		lookupDriver: lookupDriverTool,
		getJobById: getJobByIdTool,
		findDriverActiveJob: findDriverActiveJobTool,
	};
}

// Email dispatch agent - parses motor club emails and creates jobs
export function createEmailDispatchAgent(companyId: string) {
	const tools = createDispatchTools(companyId, "email");

	return new ToolLoopAgent({
		model: "google/gemini-3-flash-preview",
		instructions: `You are a dispatch assistant for a towing company.
Your job is to parse incoming dispatch emails from motor clubs (AAA, Agero, Urgently, Swoop, Honk, etc.) and create jobs.

When parsing an email:
1. Extract customer name and callback phone number
2. Identify the service type (tow, jumpstart, lockout, tire change, fuel delivery, winch)
3. Extract vehicle information (year, make, model, color, plate if available)
4. Extract pickup location (be specific with address)
5. Extract drop-off location if mentioned
6. Note the motor club name and any PO/reference numbers
7. Include any special instructions in notes

Always use the createJob tool to create the job after parsing.
Be thorough - extract ALL available information from the email.`,
		tools: {
			createJob: tools.createJob,
			sendNotification: tools.sendNotification,
		},
		stopWhen: stepCountIs(5),
	});
}

// SMS handler agent - handles inbound SMS from drivers and customers
export function createSmsHandlerAgent(companyId: string) {
	const tools = createDispatchTools(companyId, "sms");

	return new ToolLoopAgent({
		model: "google/gemini-3-flash-preview",
		instructions: `You are a dispatch assistant handling inbound SMS messages for a towing company.

Your workflow:
1. First, use lookupDriver to check if the sender is a known driver
2. If it's a driver:
   - Use findDriverActiveJob to find their current assignment
   - Parse their message for status updates:
     - "otw", "on my way", "en route", "heading" → status: en_route
     - "here", "arrived", "on scene", "on site" → status: arrived
     - "done", "complete", "finished", "delivered" → status: completed
     - Questions or other messages → just respond helpfully
   - Update job status with updateJobStatus
   - Optionally notify customer of ETA/arrival
3. If it's a customer:
   - Use lookupJob to check for existing jobs with their phone
   - If they have an active job, answer questions about it
   - If no job and they seem to need service, use createJob
   - Always be helpful and professional

After taking action, use sendNotification to reply with a brief, professional response.
Keep responses under 160 characters when possible (SMS length).`,
		tools: {
			createJob: tools.createJob,
			updateJobStatus: tools.updateJobStatus,
			sendNotification: tools.sendNotification,
			lookupJob: tools.lookupJob,
			lookupDriver: tools.lookupDriver,
			findDriverActiveJob: tools.findDriverActiveJob,
		},
		stopWhen: stepCountIs(7),
	});
}

// Helper to parse dispatch email
export async function parseDispatchEmail(
	email: { from: string; subject: string; body: string },
	companyId: string,
) {
	const agent = createEmailDispatchAgent(companyId);

	const result = await agent.generate({
		prompt: `Parse this dispatch email and create a job:

From: ${email.from}
Subject: ${email.subject}

${email.body}`,
	});

	return {
		text: result.text,
		steps: result.steps,
	};
}

// Helper to handle inbound SMS
export async function handleInboundSMS(
	message: { from: string; to: string; body: string },
	companyId: string,
) {
	const agent = createSmsHandlerAgent(companyId);

	const result = await agent.generate({
		prompt: `Handle this inbound SMS:

From: ${message.from}
Message: "${message.body}"`,
	});

	return {
		text: result.text,
		steps: result.steps,
	};
}
