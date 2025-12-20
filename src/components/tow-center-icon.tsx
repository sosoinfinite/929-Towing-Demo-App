import type { SVGProps } from "react";

export function TowCenterIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M0 13V17H14V13H8V9H3L0 13ZM2.5 12H7V10H3.5L2.5 12Z"
			/>
			<circle cx="4" cy="17" r="2.5" fill="currentColor" />
			<circle cx="12" cy="17" r="2.5" fill="currentColor" />
			<path d="M9.5 13L14.5 5H16L11 13H9.5Z" fill="currentColor" />
			<path
				d="M15.25 5V9C15.25 10.1046 16.1454 11 17.25 11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M18.5 3C19.8807 3 21 4.11929 21 5.5C21 6.88071 19.8807 8 18.5 8"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M20.5 1C22.9853 1 25 3.01472 25 5.5C25 7.98528 22.9853 10 20.5 10"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}
