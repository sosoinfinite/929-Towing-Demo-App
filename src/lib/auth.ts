import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

export const auth = betterAuth({
	database: pool,

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
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
