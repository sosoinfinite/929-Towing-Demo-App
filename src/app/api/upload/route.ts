import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const filename = searchParams.get("filename");

	if (!filename) {
		return NextResponse.json(
			{ error: "Filename is required" },
			{ status: 400 },
		);
	}

	// Validate file type from filename extension
	const ext = filename.split(".").pop()?.toLowerCase();
	const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
	if (!ext || !allowedExtensions.includes(ext)) {
		return NextResponse.json(
			{ error: "Invalid file type. Allowed: jpg, jpeg, png, webp, gif, svg" },
			{ status: 400 },
		);
	}

	const body = request.body;
	if (!body) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	try {
		const blob = await put(filename, body, {
			access: "public",
			addRandomSuffix: true, // Prevent filename collisions
		});

		return NextResponse.json(blob);
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
