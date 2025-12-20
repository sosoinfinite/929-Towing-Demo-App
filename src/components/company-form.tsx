"use client";

import { ImagePicker } from "@/components/image-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CompanyFormData {
	name: string;
	phone: string;
	logo: string;
	serviceArea: string;
}

interface CompanyFormProps {
	data: CompanyFormData;
	onChange: (data: CompanyFormData) => void;
	disabled?: boolean;
	showHelperText?: boolean;
}

export function CompanyForm({
	data,
	onChange,
	disabled = false,
	showHelperText = true,
}: CompanyFormProps) {
	const updateField = <K extends keyof CompanyFormData>(
		field: K,
		value: CompanyFormData[K],
	) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="company-name">Company Name</Label>
				<Input
					id="company-name"
					value={data.name}
					onChange={(e) => updateField("name", e.target.value)}
					placeholder="e.g., 929 Towing"
					disabled={disabled}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">Business Phone</Label>
				<Input
					id="phone"
					type="tel"
					value={data.phone}
					onChange={(e) => updateField("phone", e.target.value)}
					placeholder="(555) 123-4567"
					disabled={disabled}
				/>
				{showHelperText && (
					<p className="text-xs text-muted-foreground">
						This is where we&apos;ll send job notifications via SMS
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label>Company Logo</Label>
				<ImagePicker
					value={data.logo}
					onChange={(url) => updateField("logo", url)}
				/>
				{showHelperText && (
					<p className="text-xs text-muted-foreground">
						Your logo will appear in the dashboard sidebar
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="service-area">Service Area</Label>
				<Textarea
					id="service-area"
					value={data.serviceArea}
					onChange={(e) => updateField("serviceArea", e.target.value)}
					placeholder="e.g., Dallas-Fort Worth metro area, 50 mile radius from downtown"
					rows={3}
					disabled={disabled}
				/>
				{showHelperText && (
					<p className="text-xs text-muted-foreground">
						Describe the areas you serve - the AI will use this to screen calls
					</p>
				)}
			</div>
		</div>
	);
}
