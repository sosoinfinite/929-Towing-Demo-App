"use client";

import {
	AccountSettingsCards,
	useAuthenticate,
} from "@daveyplate/better-auth-ui";

export default function ProfileSettingsPage() {
	useAuthenticate();

	return (
		<div className="space-y-6">
			<AccountSettingsCards />
		</div>
	);
}
