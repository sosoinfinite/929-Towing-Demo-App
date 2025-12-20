import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, phoneNumber } from "better-auth/plugins";
import ResetPasswordEmail from "../../emails/reset-password";
import TeamInvitationEmail from "../../emails/team-invitation";
import VerificationEmail from "../../emails/verification";
import { pool } from "./db";
import { FROM_EMAIL, getResend } from "./email";
import { sendSMS } from "./twilio";

export const auth = betterAuth({
	database: pool,

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		sendResetPassword: async ({ user, url }) => {
			const html = await render(
				ResetPasswordEmail({
					name: user.name,
					resetUrl: url,
				}),
			);
			await getResend().emails.send({
				from: FROM_EMAIL,
				to: user.email,
				subject: "Reset your tow.center password",
				html,
			});
		},
	},

	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			const html = await render(
				VerificationEmail({
					name: user.name,
					verificationUrl: url,
				}),
			);
			await getResend().emails.send({
				from: FROM_EMAIL,
				to: user.email,
				subject: "Verify your tow.center account",
				html,
			});
		},
		sendOnSignUp: true,
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update session every 24 hours
	},

	user: {
		additionalFields: {
			companyId: {
				type: "string",
				required: false,
				fieldName: "company_id",
			},
			role: {
				type: "string",
				required: false,
				defaultValue: "member",
				input: false,
			},
		},
	},

	plugins: [
		nextCookies(),
		admin({
			adminUserIds: process.env.ADMIN_USER_ID
				? process.env.ADMIN_USER_ID.split(",").map((id) => id.trim())
				: [],
		}),
		organization({
			async sendInvitationEmail(data) {
				const html = await render(
					TeamInvitationEmail({
						inviterName: data.inviter.user.name,
						organizationName: data.organization.name,
						inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL}/invitations/${data.id}`,
						role: data.role,
					}),
				);
				await getResend().emails.send({
					from: FROM_EMAIL,
					to: data.email,
					subject: `You've been invited to join ${data.organization.name} on tow.center`,
					html,
				});
			},
		}),
		phoneNumber({
			sendOTP: async ({ phoneNumber: phone, code }) => {
				// Don't await - prevents timing attacks
				sendSMS(phone, `Your tow.center verification code is: ${code}`);
			},
			signUpOnVerification: {
				getTempEmail: (phone) => `${phone.replace(/\+/g, "")}@phone.tow.center`,
			},
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
