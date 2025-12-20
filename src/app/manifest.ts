import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "tow.center",
		short_name: "tow.center",
		description: "AI-powered dispatch for towing companies",
		start_url: "/dashboard",
		display: "standalone",
		background_color: "#09090b",
		theme_color: "#f97316",
		orientation: "portrait-primary",
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
		categories: ["business", "productivity"],
	};
}
