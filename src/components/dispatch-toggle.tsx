"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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

	const handleToggle = (checked: boolean) => {
		setIsActive(checked);

		if (onToggle) {
			startTransition(async () => {
				await onToggle(checked);
			});
		}
	};

	return (
		<div className="flex items-center gap-3">
			<Switch
				id="dispatch-toggle"
				checked={isActive}
				onCheckedChange={handleToggle}
				disabled={isPending}
			/>
			<Label htmlFor="dispatch-toggle" className="text-sm">
				{isActive ? "AI handling calls" : "Calls go to voicemail"}
			</Label>
		</div>
	);
}
