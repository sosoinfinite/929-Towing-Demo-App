import { render } from "@react-email/components";
import DriverEnRouteEmail from "../../emails/driver-en-route";
import JobAssignedEmail from "../../emails/job-assigned";
import JobCompletedEmail from "../../emails/job-completed";
import JobCreatedEmail from "../../emails/job-created";
import { getPool } from "./db";
import { FROM_EMAIL_DISPATCH, getResend, REPLY_TO_DISPATCH } from "./resend";
import { sendSMS } from "./twilio";

type JobUpdatesChannel = "email" | "sms" | "both" | "none";

interface JobNotificationData {
	jobId: string;
	customerEmail?: string;
	customerPhone?: string;
	customerName?: string;
	serviceType: string;
	pickupLocation: string;
	dropoffLocation?: string;
	vehicleInfo?: string;
	driverName?: string;
	estimatedArrival?: string;
	companyName: string;
	companyPhone?: string;
}

// Type for when email is required (used by sendJobEmail)
type JobNotificationDataWithEmail = JobNotificationData & {
	customerEmail: string;
};

// Type for when phone is required (used by sendJobSms)
type JobNotificationDataWithPhone = JobNotificationData & {
	customerPhone: string;
};

interface NotificationPreferences {
	jobUpdatesChannel: JobUpdatesChannel;
}

/**
 * Get notification preferences for a user by their ID or phone number.
 * Currently only supports userId lookup. Phone-based lookup is reserved
 * for future customer preference storage.
 */
async function getNotificationPreferences(
	userId?: string,
	_phone?: string, // Reserved for future customer preferences table
): Promise<NotificationPreferences> {
	const pool = getPool();

	// Default preferences - SMS is the default for towing customers
	const defaults: NotificationPreferences = {
		jobUpdatesChannel: "sms",
	};

	if (userId) {
		const result = await pool.query(
			`SELECT job_updates_channel as "jobUpdatesChannel"
			 FROM notification_preferences
			 WHERE user_id = $1`,
			[userId],
		);
		if (result.rows[0]) {
			return {
				jobUpdatesChannel: result.rows[0].jobUpdatesChannel || "sms",
			};
		}
	}

	// TODO: When customer preferences table is added, look up by _phone
	return defaults;
}

/**
 * Get company info for email templates
 */
async function getCompanyInfo(
	companyId: string,
): Promise<{ name: string; phone?: string }> {
	const pool = getPool();
	const result = await pool.query(
		"SELECT name, phone FROM company WHERE id = $1",
		[companyId],
	);
	return result.rows[0] || { name: "Your Towing Company" };
}

/**
 * Send job created notification
 */
export async function sendJobCreatedNotification(
	companyId: string,
	data: Omit<JobNotificationData, "companyName" | "companyPhone">,
): Promise<void> {
	const company = await getCompanyInfo(companyId);
	const prefs = await getNotificationPreferences(undefined, data.customerPhone);

	const notificationData: JobNotificationData = {
		...data,
		companyName: company.name,
		companyPhone: company.phone,
	};

	await sendJobNotification(
		"created",
		prefs.jobUpdatesChannel,
		notificationData,
	);
}

/**
 * Send job assigned notification
 */
export async function sendJobAssignedNotification(
	companyId: string,
	data: Omit<JobNotificationData, "companyName" | "companyPhone">,
): Promise<void> {
	const company = await getCompanyInfo(companyId);
	const prefs = await getNotificationPreferences(undefined, data.customerPhone);

	const notificationData: JobNotificationData = {
		...data,
		companyName: company.name,
		companyPhone: company.phone,
	};

	await sendJobNotification(
		"assigned",
		prefs.jobUpdatesChannel,
		notificationData,
	);
}

/**
 * Send driver en route notification
 */
export async function sendDriverEnRouteNotification(
	companyId: string,
	data: Omit<JobNotificationData, "companyName" | "companyPhone">,
): Promise<void> {
	const company = await getCompanyInfo(companyId);
	const prefs = await getNotificationPreferences(undefined, data.customerPhone);

	const notificationData: JobNotificationData = {
		...data,
		companyName: company.name,
		companyPhone: company.phone,
	};

	await sendJobNotification(
		"en_route",
		prefs.jobUpdatesChannel,
		notificationData,
	);
}

/**
 * Send job completed notification
 */
export async function sendJobCompletedNotification(
	companyId: string,
	data: Omit<JobNotificationData, "companyName" | "companyPhone">,
): Promise<void> {
	const company = await getCompanyInfo(companyId);
	const prefs = await getNotificationPreferences(undefined, data.customerPhone);

	const notificationData: JobNotificationData = {
		...data,
		companyName: company.name,
		companyPhone: company.phone,
	};

	await sendJobNotification(
		"completed",
		prefs.jobUpdatesChannel,
		notificationData,
	);
}

/**
 * Core notification sender - respects channel preferences
 */
async function sendJobNotification(
	type: "created" | "assigned" | "en_route" | "completed",
	channel: JobUpdatesChannel,
	data: JobNotificationData,
): Promise<void> {
	if (channel === "none") {
		return;
	}

	const sendEmail = channel === "email" || channel === "both";
	const sendSms = channel === "sms" || channel === "both";

	// Send email if enabled and customer has email
	if (sendEmail && data.customerEmail) {
		try {
			// Type narrowing: we've verified customerEmail exists
			await sendJobEmail(type, data as JobNotificationDataWithEmail);
		} catch (err) {
			console.error(`[JobNotifications] Failed to send ${type} email:`, err);
		}
	}

	// Send SMS if enabled and customer has phone
	if (sendSms && data.customerPhone) {
		try {
			// Type narrowing: we've verified customerPhone exists
			await sendJobSms(type, data as JobNotificationDataWithPhone);
		} catch (err) {
			console.error(`[JobNotifications] Failed to send ${type} SMS:`, err);
		}
	}
}

/**
 * Send job notification email
 */
async function sendJobEmail(
	type: "created" | "assigned" | "en_route" | "completed",
	data: JobNotificationDataWithEmail,
): Promise<void> {
	const resend = getResend();

	let html: string;
	let subject: string;

	switch (type) {
		case "created":
			html = await render(
				JobCreatedEmail({
					customerName: data.customerName,
					serviceType: data.serviceType,
					pickupLocation: data.pickupLocation,
					vehicleInfo: data.vehicleInfo,
					companyName: data.companyName,
					companyPhone: data.companyPhone,
				}),
			);
			subject = `Service request received - ${data.companyName}`;
			break;

		case "assigned":
			html = await render(
				JobAssignedEmail({
					customerName: data.customerName,
					driverName: data.driverName || "Your driver",
					serviceType: data.serviceType,
					pickupLocation: data.pickupLocation,
					vehicleInfo: data.vehicleInfo,
					companyName: data.companyName,
					companyPhone: data.companyPhone,
				}),
			);
			subject = `Driver assigned - ${data.companyName}`;
			break;

		case "en_route":
			html = await render(
				DriverEnRouteEmail({
					customerName: data.customerName,
					driverName: data.driverName || "Your driver",
					serviceType: data.serviceType,
					pickupLocation: data.pickupLocation,
					estimatedArrival: data.estimatedArrival,
					companyName: data.companyName,
					companyPhone: data.companyPhone,
				}),
			);
			subject = `Driver on the way - ${data.companyName}`;
			break;

		case "completed":
			html = await render(
				JobCompletedEmail({
					customerName: data.customerName,
					driverName: data.driverName,
					serviceType: data.serviceType,
					pickupLocation: data.pickupLocation,
					dropoffLocation: data.dropoffLocation,
					vehicleInfo: data.vehicleInfo,
					companyName: data.companyName,
					companyPhone: data.companyPhone,
				}),
			);
			subject = `Service completed - ${data.companyName}`;
			break;
	}

	await resend.emails.send({
		from: FROM_EMAIL_DISPATCH,
		to: data.customerEmail,
		subject,
		html,
		replyTo: REPLY_TO_DISPATCH,
	});

	console.log(`[JobNotifications] Sent ${type} email to ${data.customerEmail}`);
}

/**
 * Send job notification SMS
 */
async function sendJobSms(
	type: "created" | "assigned" | "en_route" | "completed",
	data: JobNotificationDataWithPhone,
): Promise<void> {
	let message: string;

	switch (type) {
		case "created":
			message = `${data.companyName}: Your ${data.serviceType} service request has been received. We'll send updates as your service progresses.`;
			break;

		case "assigned":
			message = `${data.companyName}: ${data.driverName || "A driver"} has been assigned to your service and will be heading your way shortly.`;
			break;

		case "en_route":
			message = `${data.companyName}: ${data.driverName || "Your driver"} is on the way!${data.estimatedArrival ? ` ETA: ${data.estimatedArrival}` : ""} Please be ready.`;
			break;

		case "completed":
			message = `${data.companyName}: Your service has been completed. Thank you for choosing us!`;
			break;
	}

	await sendSMS(data.customerPhone, message);
	console.log(`[JobNotifications] Sent ${type} SMS to ${data.customerPhone}`);
}
