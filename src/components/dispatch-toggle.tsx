"use client";

import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface DispatchToggleProps {
	initialActive?: boolean;
	onToggle?: (active: boolean) => Promise<void>;
}

export function DispatchToggle({
	initialActive = false,
	onToggle,
}: DispatchToggleProps) {
	const [isActive, setIsActive] = useState(initialActive);
	const [isPending, startTransition] = useTransition();

	const handleToggle = () => {
		const newState = !isActive;
		setIsActive(newState);

		if (onToggle) {
			startTransition(async () => {
				await onToggle(newState);
			});
		}
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<button
				type="button"
				onClick={handleToggle}
				disabled={isPending}
				className={cn(
					"relative w-24 h-12 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
					isActive
						? "bg-green-500 focus-visible:ring-green-500"
						: "bg-muted focus-visible:ring-muted-foreground",
					isPending && "opacity-50 cursor-not-allowed",
				)}
				aria-pressed={isActive}
				aria-label={isActive ? "Disable AI dispatch" : "Enable AI dispatch"}
			>
				<motion.div
					animate={{ x: isActive ? 52 : 4 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
					className={cn(
						"absolute top-1 w-10 h-10 rounded-full shadow-md",
						isActive ? "bg-white" : "bg-background",
					)}
				/>
			</button>

			<div className="text-center">
				<p
					className={cn(
						"text-sm font-medium transition-colors",
						isActive ? "text-green-600" : "text-muted-foreground",
					)}
				>
					{isActive ? "AI Dispatch Active" : "AI Dispatch Off"}
				</p>
				<p className="text-xs text-muted-foreground mt-1">
					{isActive
						? "Incoming calls are handled by AI"
						: "Incoming calls go to voicemail"}
				</p>
			</div>
		</div>
	);
}
