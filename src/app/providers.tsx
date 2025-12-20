"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<AuthUIProvider
				authClient={authClient}
				navigate={(path) => router.push(path)}
				replace={(path) => router.replace(path)}
				onSessionChange={() => router.refresh()}
				// Enable security features
				passkey
				twoFactor={["totp"]}
				// View paths
				viewPaths={{
					SIGN_IN: "sign-in",
					SIGN_UP: "sign-up",
					FORGOT_PASSWORD: "forgot-password",
					RESET_PASSWORD: "reset-password",
					TWO_FACTOR: "two-factor",
				}}
			>
				{children}
				<Toaster richColors position="top-right" />
			</AuthUIProvider>
		</QueryClientProvider>
	);
}
