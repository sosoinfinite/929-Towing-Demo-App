"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
	adminClient,
	magicLinkClient,
	organizationClient,
	phoneNumberClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
	ac,
	admin,
	customer,
	dispatch,
	driver,
	member,
	owner,
} from "./permissions";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	plugins: [
		adminClient(),
		magicLinkClient(),
		organizationClient({
			ac,
			roles: {
				owner,
				admin,
				member,
				dispatch,
				driver,
				customer,
			},
		}),
		passkeyClient(),
		phoneNumberClient(),
		twoFactorClient(),
	],
});

export const { useSession, signIn, signUp, signOut } = authClient;
