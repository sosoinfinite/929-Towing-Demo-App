"use client";

import {
	AccountSettingsCards,
	SecuritySettingsCards,
	useAuthenticate,
} from "@daveyplate/better-auth-ui";

export default function AccountPage() {
	// Redirect to sign-in if not authenticated
	useAuthenticate();

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Account</h1>
						<p className="text-muted-foreground">
							Manage your profile and security settings
						</p>
					</div>

					<div className="space-y-6">
						<AccountSettingsCards />
						<SecuritySettingsCards />
					</div>
				</div>
			</div>
		</div>
	);
}
