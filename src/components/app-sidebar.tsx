"use client";

import {
	IconBriefcase,
	IconHelp,
	IconHistory,
	IconSettings,
	IconShield,
	IconToggleRight,
	IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { TowCenterIcon } from "@/components/tow-center-icon";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
	isAdmin?: boolean;
}

const navMain = [
	{
		title: "Dispatch",
		url: "/dashboard",
		icon: IconToggleRight,
	},
	{
		title: "Jobs",
		url: "/dashboard/jobs",
		icon: IconBriefcase,
	},
	{
		title: "Call History",
		url: "/dashboard/calls",
		icon: IconHistory,
	},
	{
		title: "Referrals",
		url: "/dashboard/referrals",
		icon: IconUsers,
	},
];

const navSecondary = [
	{
		title: "Settings",
		url: "/dashboard/settings",
		icon: IconSettings,
	},
	{
		title: "Help",
		url: "/dashboard/help",
		icon: IconHelp,
	},
];

const adminLink = {
	title: "Admin",
	url: "/admin",
	icon: IconShield,
};

export function AppSidebar({ user, isAdmin, ...props }: AppSidebarProps) {
	const secondaryNav = isAdmin ? [adminLink, ...navSecondary] : navSecondary;
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/dashboard">
								<TowCenterIcon className="!size-5" />
								<span className="text-base font-semibold">tow.center</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
				<NavSecondary items={secondaryNav} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
