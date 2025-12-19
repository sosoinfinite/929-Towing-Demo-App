import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import ResetPasswordEmail from "../../emails/reset-password";
import VerificationEmail from "../../emails/verification";
import { pool } from "./db";
import { FROM_EMAIL, getResend } from "./email";

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

	plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
