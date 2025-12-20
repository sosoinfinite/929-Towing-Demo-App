"use client";

import {
	IconLoader2,
	IconPhoto,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";
import type { PutBlobResult } from "@vercel/blob";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
	value: string;
	onChange: (url: string) => void;
	className?: string;
	aspectRatio?: "square" | "wide";
}

export function ImagePicker({
	value,
	onChange,
	className,
	aspectRatio = "square",
}: ImagePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleUpload = async (file: File) => {
		setError(null);
		setUploading(true);

		try {
			const response = await fetch(
				`/api/upload?filename=${encodeURIComponent(file.name)}`,
				{
					method: "POST",
					body: file,
				},
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Upload failed");
			}

			const blob = (await response.json()) as PutBlobResult;
			onChange(blob.url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleUpload(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);

		const file = e.dataTransfer.files[0];
		if (file?.type.startsWith("image/")) {
			handleUpload(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = () => {
		setDragOver(false);
	};

	const handleRemove = () => {
		onChange("");
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
				onChange={handleFileChange}
				className="hidden"
			/>

			{value ? (
				<div className="group relative">
					<div
						className={cn(
							"relative overflow-hidden rounded-lg border bg-muted",
							aspectRatio === "square"
								? "aspect-square w-32"
								: "aspect-video w-48",
						)}
					>
						<Image
							src={value}
							alt="Uploaded image"
							fill
							className="object-contain"
							unoptimized
						/>
					</div>
					<div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							type="button"
							variant="secondary"
							size="icon"
							onClick={() => inputRef.current?.click()}
							disabled={uploading}
						>
							<IconUpload className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="icon"
							onClick={handleRemove}
							disabled={uploading}
						>
							<IconTrash className="h-4 w-4" />
						</Button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					disabled={uploading}
					className={cn(
						"flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
						aspectRatio === "square"
							? "aspect-square w-32"
							: "aspect-video w-48",
						dragOver
							? "border-primary bg-primary/5"
							: "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
						uploading && "pointer-events-none opacity-50",
					)}
				>
					{uploading ? (
						<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					) : (
						<>
							<IconPhoto className="h-8 w-8 text-muted-foreground" />
							<span className="mt-2 text-xs text-muted-foreground">
								Click or drag
							</span>
						</>
					)}
				</button>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
