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

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL,
	plugins: [
		adminClient(),
		magicLinkClient(),
		organizationClient(),
		passkeyClient(),
		phoneNumberClient(),
		twoFactorClient(),
	],
});

export const { useSession, signIn, signUp, signOut } = authClient;
