"use client";

import {
	IconBuilding,
	IconDashboard,
	IconMail,
	IconPhone,
	IconSettings,
	IconShield,
	IconUsers,
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

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}

const navMain = [
	{
		title: "Overview",
		url: "/admin",
		icon: IconDashboard,
	},
	{
		title: "Leads",
		url: "/admin/leads",
		icon: IconMail,
	},
	{
		title: "Companies",
		url: "/admin/companies",
		icon: IconBuilding,
	},
	{
		title: "Users",
		url: "/admin/users",
		icon: IconUsers,
	},
	{
		title: "All Calls",
		url: "/admin/calls",
		icon: IconPhone,
	},
];

const navSecondary = [
	{
		title: "Settings",
		url: "/admin/settings",
		icon: IconSettings,
	},
	{
		title: "User Dashboard",
		url: "/dashboard",
		icon: IconDashboard,
	},
];

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/admin">
								<IconShield className="!size-5 text-red-500" />
								<span className="text-base font-semibold">Admin</span>
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
