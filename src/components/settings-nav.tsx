"use client";

import {
	IconBell,
	IconBuilding,
	IconCreditCard,
	IconShieldLock,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const organizationItems = [
	{
		title: "General",
		href: "/dashboard/settings",
		icon: IconBuilding,
	},
	{
		title: "Team",
		href: "/dashboard/settings/team",
		icon: IconUsers,
	},
	{
		title: "Billing",
		href: "/dashboard/settings/billing",
		icon: IconCreditCard,
	},
];

const accountItems = [
	{
		title: "Profile",
		href: "/dashboard/settings/profile",
		icon: IconUser,
	},
	{
		title: "Security",
		href: "/dashboard/settings/security",
		icon: IconShieldLock,
	},
	{
		title: "Notifications",
		href: "/dashboard/settings/notifications",
		icon: IconBell,
	},
];

interface SettingsNavProps {
	isAdmin?: boolean;
}

export function SettingsNav({ isAdmin = true }: SettingsNavProps) {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col gap-1">
			{/* Organization Settings */}
			{isAdmin && (
				<>
					<h4 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Organization
					</h4>
					{organizationItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								pathname === item.href
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4" />
							{item.title}
						</Link>
					))}
					<div className="my-2" />
				</>
			)}

			{/* Account Settings */}
			<h4 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				Account
			</h4>
			{accountItems.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						"flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
						pathname === item.href
							? "bg-muted text-foreground"
							: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
					)}
				>
					<item.icon className="h-4 w-4" />
					{item.title}
				</Link>
			))}
		</nav>
	);
}
