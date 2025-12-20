"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<AuthUIProvider
			authClient={authClient}
			navigate={(path) => router.push(path)}
			replace={(path) => router.replace(path)}
			onSessionChange={() => router.refresh()}
			viewPaths={{
				SIGN_IN: "sign-in",
				SIGN_UP: "sign-up",
				FORGOT_PASSWORD: "forgot-password",
				RESET_PASSWORD: "reset-password",
			}}
		>
			{children}
			<Toaster richColors position="top-right" />
		</AuthUIProvider>
	);
}
