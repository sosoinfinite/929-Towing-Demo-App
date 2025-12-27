"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
	useEffect(() => {
		// Unregister all service workers to prevent caching issues
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister().then((success) => {
						if (success) {
							console.log("[tow.center] Service worker unregistered");
						}
					});
				}
			});
		}
	}, []);

	return null;
}
