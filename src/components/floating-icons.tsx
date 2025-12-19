"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

interface FloatingIcon {
	id: number;
	type: "Z" | "$";
	x: number;
	duration: number;
	size: number;
}

export function FloatingIcons() {
	const [icons, setIcons] = useState<FloatingIcon[]>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			const newIcon: FloatingIcon = {
				id: Date.now(),
				type: Math.random() > 0.4 ? "Z" : "$",
				x: Math.random() * 50 + 25,
				duration: Math.random() * 2 + 2,
				size: Math.random() * 25 + 20,
			};

			setIcons((prev) => [...prev.slice(-20), newIcon]);
		}, 400);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
			{icons.map((icon) => (
				<motion.div
					key={icon.id}
					initial={{ opacity: 0, y: "60vh", x: `${icon.x}vw`, scale: 0.1 }}
					animate={{
						opacity: [0, 1, 0.8, 0],
						y: "-15vh",
						x: [`${icon.x}vw`, `${icon.x + (Math.random() * 20 - 10)}vw`],
						rotate: [0, 180],
						scale: [0.1, 1.2, 1, 0.5],
					}}
					transition={{
						duration: icon.duration,
						ease: "easeOut",
						times: [0, 0.2, 0.8, 1],
					}}
					className="absolute font-black select-none"
					style={{
						fontSize: icon.size,
						color: icon.type === "$" ? BRAND.yellow : BRAND.red,
						filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
						WebkitTextStroke: icon.type === "$" ? "1px #000" : "none",
					}}
				>
					{icon.type === "Z" ? "z" : "$"}
				</motion.div>
			))}
		</div>
	);
}
