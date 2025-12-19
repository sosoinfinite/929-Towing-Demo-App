"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState, useTransition } from "react";
import { BRAND, CHA_CHING_SOUNDS } from "@/lib/brand";
import { FloatingIcons } from "./floating-icons";

interface DispatchToggleProps {
	initialActive?: boolean;
	companyId?: string;
	onToggle?: (active: boolean) => Promise<void>;
}

export function DispatchToggle({
	initialActive = false,
	onToggle,
}: DispatchToggleProps) {
	const [isActive, setIsActive] = useState(initialActive);
	const [isPending, startTransition] = useTransition();
	const audioRefs = useRef<HTMLAudioElement[]>([]);

	const playRandomChaChing = useCallback(() => {
		const randomIndex = Math.floor(Math.random() * CHA_CHING_SOUNDS.length);
		if (!audioRefs.current[randomIndex]) {
			audioRefs.current[randomIndex] = new Audio(CHA_CHING_SOUNDS[randomIndex]);
		}
		const audio = audioRefs.current[randomIndex];
		audio.playbackRate = 1.5;
		audio.currentTime = 0;
		audio.play().catch(() => {});
	}, []);

	const handleToggle = () => {
		const newState = !isActive;

		if (newState) {
			playRandomChaChing();
		}

		setIsActive(newState);

		if (onToggle) {
			startTransition(async () => {
				await onToggle(newState);
			});
		}
	};

	return (
		<div className="relative flex flex-col items-center justify-center w-full">
			<AnimatePresence>{isActive && <FloatingIcons />}</AnimatePresence>

			<div className="relative flex flex-col items-center justify-center w-full max-w-[340px]">
				<motion.button
					onClick={handleToggle}
					disabled={isPending}
					whileTap={{ scale: 0.95 }}
					className="relative w-full h-32 rounded-full border-[6px] border-[#c0c0c0] flex items-center overflow-hidden disabled:opacity-70"
					style={{
						boxShadow:
							"inset 0 10px 20px rgba(0,0,0,0.1), 0 15px 30px rgba(0,0,0,0.15)",
						background: "linear-gradient(to bottom, #f0f0f0, #dcdcdc)",
					}}
				>
					{/* Metallic Inner Frame */}
					<div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />

					{/* Label Section */}
					<div className="absolute left-10 flex flex-col items-start z-10 pointer-events-none">
						<span className="text-[#002366] text-[10px] font-black uppercase tracking-widest leading-none">
							AI DISPATCH:
						</span>
						<span className="text-[#002366] text-xl font-black uppercase tracking-tight leading-none mt-1">
							ON / OFF
						</span>
					</div>

					{/* Toggle Switch Handle */}
					<motion.div
						animate={{
							x: isActive ? 188 : 0,
						}}
						transition={{ type: "spring", stiffness: 350, damping: 25 }}
						className="absolute left-2 w-28 h-28 flex items-center justify-center z-20"
					>
						<div
							className="w-full h-full rounded-full transition-colors duration-300 flex items-center justify-center"
							style={{
								background: isActive
									? `radial-gradient(circle at 35% 35%, #FFB280, ${BRAND.red})`
									: "radial-gradient(circle at 35% 35%, #E2E8F0, #94A3B8)",
								boxShadow: isActive
									? "0 8px 25px rgba(198, 40, 40, 0.5), inset 0 4px 6px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.2)"
									: "0 8px 15px rgba(0,0,0,0.2), inset 0 4px 6px rgba(255,255,255,0.2), inset 0 -4px 6px rgba(0,0,0,0.1)",
								border: "2px solid rgba(255,255,255,0.3)",
							}}
						>
							{/* Glow for Active State */}
							{isActive && (
								<motion.div
									animate={{ opacity: [0.3, 0.6, 0.3] }}
									transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
									className="absolute inset-0 rounded-full bg-white/30 blur-sm"
								/>
							)}
						</div>
					</motion.div>
				</motion.button>

				<div className="mt-12 text-center h-8">
					<AnimatePresence mode="wait">
						<motion.p
							key={isActive ? "on" : "off"}
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px]"
						>
							{isActive ? "AI dispatch active" : "System standby"}
						</motion.p>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
