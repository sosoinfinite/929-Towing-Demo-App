"use client";

import {
	IconHelp,
	IconHistory,
	IconSettings,
	IconToggleRight,
	IconTruck,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
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
}

const navMain = [
	{
		title: "Dispatch",
		url: "/dashboard",
		icon: IconToggleRight,
	},
	{
		title: "Call History",
		url: "/dashboard/calls",
		icon: IconHistory,
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
		url: "#",
		icon: IconHelp,
	},
];

export function AppSidebar({ user, ...props }: AppSidebarProps) {
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
								<IconTruck className="!size-5" />
								<span className="text-base font-semibold">TowAI</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
				<NavSecondary items={navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
