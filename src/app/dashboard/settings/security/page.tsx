"use client";

import {
	SecuritySettingsCards,
	useAuthenticate,
} from "@daveyplate/better-auth-ui";

export default function SecuritySettingsPage() {
	useAuthenticate();

	return (
		<div className="space-y-6">
			<SecuritySettingsCards />
		</div>
	);
}
