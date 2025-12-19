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

	const conversation = useConversation({
		onConnect: () => {
			console.log("[TowAI] Connected to AI agent");
		},
		onDisconnect: () => {
			console.log("[TowAI] Disconnected from AI agent");
		},
		onError: (error) => {
			console.error("[TowAI] Error:", error);
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
			console.error("[TowAI] No agent ID configured");
			return;
		}

		const permitted = hasPermission || (await requestMicPermission());
		if (!permitted) return;

		try {
			await conversation.startSession({ agentId });
		} catch (error) {
			console.error("[TowAI] Failed to start session:", error);
		}
	}, [agentId, hasPermission, requestMicPermission, conversation]);

	const handleEndCall = useCallback(async () => {
		try {
			await conversation.endSession();
		} catch (error) {
			console.error("[TowAI] Failed to end session:", error);
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
										Tap to hear how TowAI handles a customer
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
				{permissionDenied && (
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
			</div>
		</div>
	);
}
