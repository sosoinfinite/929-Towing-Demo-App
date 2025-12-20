import { SettingsNav } from "@/components/settings-nav";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="@container/main flex flex-1 flex-col">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Settings</h1>
						<p className="text-muted-foreground">
							Manage your organization and account preferences
						</p>
					</div>

					<div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
						{/* Sidebar Navigation */}
						<aside className="lg:w-48 shrink-0">
							<SettingsNav />
						</aside>

						{/* Content Area */}
						<div className="flex-1 min-w-0">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
