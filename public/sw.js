// tow.center Service Worker
// Simple PWA implementation - caches static assets, never caches external APIs

const CACHE_NAME = "tow-center-v1";
const EXTERNAL_APIS = [
	"elevenlabs.io",
	"twilio.com",
	"stripe.com",
	"api.stripe.com",
];

// Install event - activate immediately
self.addEventListener("install", (event) => {
	self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			// Clean up old caches
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			);
			// Claim all clients
			await self.clients.claim();
		})(),
	);
});

// Fetch event - network first for external APIs, cache for static assets
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never cache external APIs - always go to network
	const isExternalAPI = EXTERNAL_APIS.some((api) =>
		url.hostname.includes(api),
	);
	if (isExternalAPI) {
		event.respondWith(fetch(request));
		return;
	}

	// For everything else: network first, fallback to cache
	event.respondWith(
		(async () => {
			try {
				const response = await fetch(request);
				// Cache successful responses
				if (response.ok) {
					const cache = await caches.open(CACHE_NAME);
					cache.put(request, response.clone());
				}
				return response;
			} catch (error) {
				// Network failed, try cache
				const cached = await caches.match(request);
				if (cached) {
					return cached;
				}
				// No cache either, throw error
				throw error;
			}
		})(),
	);
});
