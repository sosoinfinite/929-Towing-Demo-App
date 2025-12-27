import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist } from "serwist";

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		// External APIs - never cache, always fetch from network
		{
			matcher: ({ url }) => url.hostname.includes("elevenlabs.io"),
			handler: new NetworkOnly(),
		},
		{
			matcher: ({ url }) => url.hostname.includes("twilio.com"),
			handler: new NetworkOnly(),
		},
		{
			matcher: ({ url }) => url.hostname.includes("stripe.com"),
			handler: new NetworkOnly(),
		},
		// Default caching strategies for everything else
		...defaultCache,
	],
});

serwist.addEventListeners();
