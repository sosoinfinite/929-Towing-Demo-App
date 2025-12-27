import { createSerwistRoute } from "@serwist/turbopack";

export const { GET } = createSerwistRoute({
	swSrc: "/src/app/sw.ts",
	// Precache configuration
	precacheRules: {
		// Cache start URL and commonly accessed pages
		routes: [
			"/",
			"/dashboard",
			"/sign-in",
			"/sign-up",
		],
	},
});
