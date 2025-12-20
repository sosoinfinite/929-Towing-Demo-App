import type { MetadataRoute } from "next";
import { METROS } from "@/lib/metros";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://tow.center";

	// Static marketing pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/service-areas`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/terms`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/sign-in`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/sign-up`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
	];

	// Dynamic service area pages
	const serviceAreaPages: MetadataRoute.Sitemap = METROS.map((metro) => ({
		url: `${baseUrl}/service-areas/${metro.slug}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	return [...staticPages, ...serviceAreaPages];
}
