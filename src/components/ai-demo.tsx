"use client";

import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingIcons } from "./floating-icons";

interface AIDemoProps {
	agentId?: string;
}

export function AIDemo({ agentId }: AIDemoProps) {
	const [hasPermission, setHasPermission] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	const conversation = useConversation({
		onConnect: () => {
			console.log("[tow.center] Connected to AI agent");
			setConnectionError(null);
		},
		onDisconnect: () => {
			console.log("[tow.center] Disconnected from AI agent");
		},
		onError: (error) => {
			console.error("[tow.center] Connection error occurred");
			setConnectionError(
				"Unable to connect to AI demo. The demo agent may be unavailable.",
			);
		},
	});

	const { status, isSpeaking } = conversation;
	const isConnected = status === "connected";

	const requestMicPermission = useCallback(async () => {
		try {
			await navigator.mediaDevices.getUserMedia({ audio: true });
			setHasPermission(true);
			setPermissionDenied(false);
			return true;
		} catch {
			setPermissionDenied(true);
			return false;
		}
	}, []);

	const handleStartCall = useCallback(async () => {
		if (!agentId) {
			console.error("[tow.center] No agent ID configured");
			setConnectionError(
				"Demo not configured. Please contact support to set up the AI agent.",
			);
			return;
		}

		const permitted = hasPermission || (await requestMicPermission());
		if (!permitted) return;

		// Calculate time-based greeting (same logic as voice webhook)
		const hour = new Date().getHours();
		let greetingTimeBased = "";
		if (hour >= 6 && hour < 12) {
			greetingTimeBased = "Good morning! ";
		} else if (hour >= 12 && hour < 18) {
			greetingTimeBased = "Good afternoon! ";
		}

		try {
			setConnectionError(null);
			await conversation.startSession({
				agentId,
				connectionType: "webrtc",
				// Pass dynamic variables for demo (these would come from Twilio in real calls)
				dynamicVariables: {
					company_name: "929 Towing & Recovery",
					dispatcher_name: "Brian",
					company_service_area: "Brooklyn and Queens",
					greeting_time_based: greetingTimeBased,
					call_id: `demo_${Date.now()}`,
					_if_previous_customer: "false",
					last_service_type: "",
					last_vehicle_info: "",
					last_service_date: "",
				},
			});
		} catch (error) {
			console.error("[tow.center] Failed to start session");
			setConnectionError(
				error instanceof Error && error.message
					? error.message.replace(/key[=:]\s*[^\s]+/gi, "key=***")
					: "Failed to connect to AI demo. Please try again later.",
			);
		}
	}, [agentId, hasPermission, requestMicPermission, conversation]);

	const handleEndCall = useCallback(async () => {
		try {
			await conversation.endSession();
		} catch (error) {
			console.error("[tow.center] Failed to end session");
		}
	}, [conversation]);

	return (
		<div className="flex flex-col">
			{/* Status bar header */}
			<div className="flex items-center justify-between rounded-t-xl bg-muted/50 px-4 py-3 border-b border-border">
				<div className="flex items-center gap-2">
					<span className="relative flex h-2.5 w-2.5">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
					</span>
					<span className="text-xs font-medium text-muted-foreground">
						AI Dispatcher Online
					</span>
				</div>
				<Badge
					variant="outline"
					className="text-[10px] uppercase tracking-wider"
				>
					Live
				</Badge>
			</div>

			{/* Demo content */}
			<div className="relative flex flex-col items-center justify-center gap-6 p-8">
				{/* Floating icons when connected */}
				<AnimatePresence>{isConnected && <FloatingIcons />}</AnimatePresence>

				{/* Status text */}
				<div className="text-center space-y-2" aria-live="polite">
					<AnimatePresence mode="wait">
						<motion.div
							key={isConnected ? "connected" : "idle"}
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
						>
							{isConnected ? (
								<>
									<h3 className="text-xl font-bold tracking-tight text-foreground">
										{isSpeaking ? "AI Speaking..." : "Listening..."}
									</h3>
									<p className="text-sm text-muted-foreground">
										Try asking about pricing or ETAs
									</p>
								</>
							) : (
								<>
									<h3 className="text-xl font-bold tracking-tight text-foreground">
										Incoming Job Request...
									</h3>
									<p className="text-sm text-muted-foreground">
										Tap to hear how tow.center handles a customer
									</p>
								</>
							)}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Main call button */}
				<div className="relative">
					{/* Ringing/Pulsing animation */}
					{!isConnected && (
						<>
							<div className="absolute -inset-4 animate-ping rounded-full bg-primary/20 opacity-75 motion-reduce:animate-none" />
							<div className="absolute -inset-2 animate-pulse rounded-full bg-primary/10 motion-reduce:animate-none" />
						</>
					)}

					{/* Speaking pulse */}
					{isSpeaking && (
						<motion.div
							className="absolute -inset-3 rounded-full bg-destructive/20"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.5, 0.2, 0.5],
							}}
							transition={{
								duration: 1,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					)}

					{/* Call button - Primary for answer, Destructive for hangup */}
					<motion.button
						onClick={isConnected ? handleEndCall : handleStartCall}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-background shadow-xl transition-colors ${
							isConnected
								? "bg-destructive hover:bg-destructive/90"
								: "bg-primary hover:bg-primary/90"
						}`}
					>
						{isConnected ? (
							<PhoneOff className="h-8 w-8 text-destructive-foreground" />
						) : (
							<Phone className="h-8 w-8 text-primary-foreground" />
						)}
					</motion.button>
				</div>

				{/* Mic indicator when connected */}
				{isConnected && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center gap-2 rounded-full bg-muted px-4 py-2"
					>
						{isSpeaking ? (
							<MicOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Mic className="h-4 w-4 text-primary" />
						)}
						<span className="text-xs text-muted-foreground">
							{isSpeaking ? "AI speaking" : "Your turn to speak"}
						</span>
					</motion.div>
				)}

				{/* Permission denied message */}
				{permissionDenied && !connectionError && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="rounded-lg bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
					>
						<p>Microphone access required</p>
						<Button
							variant="link"
							size="sm"
							onClick={requestMicPermission}
							className="text-destructive"
						>
							Try again
						</Button>
					</motion.div>
				)}

				{/* Connection error message */}
				{connectionError && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-center text-sm"
					>
						<p className="text-destructive font-medium">Connection Error</p>
						<p className="text-destructive/80 mt-1">{connectionError}</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setConnectionError(null)}
							className="mt-3 text-destructive border-destructive/30 hover:bg-destructive/10"
						>
							Dismiss
						</Button>
					</motion.div>
				)}
			</div>
		</div>
	);
}
