export interface Metro {
	region: string;
	state: string;
	metro: string;
	slug: string;
	cities: string[];
	population: number;
	description?: string;
}

export const METROS: Metro[] = [
	// New York State
	{
		region: "New York State",
		state: "NY",
		metro: "Capital District",
		slug: "albany-ny",
		cities: ["Albany", "Schenectady", "Troy", "Saratoga Springs"],
		population: 1170000,
		description:
			"Serving the Capital Region with AI-powered towing dispatch across Albany County, Schenectady County, and Rensselaer County.",
	},
	{
		region: "New York State",
		state: "NY",
		metro: "New York City Metro",
		slug: "new-york-city-ny",
		cities: ["New York City", "Newark", "Jersey City", "Yonkers", "Paterson"],
		population: 19500000,
	},
	{
		region: "New York State",
		state: "NY",
		metro: "Western New York",
		slug: "buffalo-ny",
		cities: ["Buffalo", "Cheektowaga", "Niagara Falls", "Tonawanda"],
		population: 1120000,
	},
	{
		region: "New York State",
		state: "NY",
		metro: "Finger Lakes",
		slug: "rochester-ny",
		cities: ["Rochester", "Irondequoit", "Greece", "Henrietta"],
		population: 1060000,
	},
	{
		region: "New York State",
		state: "NY",
		metro: "Central New York",
		slug: "syracuse-ny",
		cities: ["Syracuse", "Cicero", "Clay", "Dewitt"],
		population: 650000,
	},
	{
		region: "New York State",
		state: "NY",
		metro: "Hudson Valley",
		slug: "poughkeepsie-ny",
		cities: ["Poughkeepsie", "Newburgh", "Middletown", "Kingston"],
		population: 670000,
	},
	// Northeast
	{
		region: "Northeast",
		state: "MA",
		metro: "Greater Boston",
		slug: "boston-ma",
		cities: ["Boston", "Cambridge", "Quincy", "Worcester", "Lowell"],
		population: 4900000,
	},
	{
		region: "Northeast",
		state: "PA",
		metro: "Delaware Valley",
		slug: "philadelphia-pa",
		cities: ["Philadelphia", "Camden", "Wilmington", "Trenton"],
		population: 6200000,
	},
	{
		region: "Northeast",
		state: "DC",
		metro: "DMV",
		slug: "washington-dc",
		cities: ["Washington", "Arlington", "Alexandria", "Bethesda"],
		population: 6300000,
	},
	{
		region: "Northeast",
		state: "PA",
		metro: "Greater Pittsburgh",
		slug: "pittsburgh-pa",
		cities: ["Pittsburgh", "Greensburg", "Bethel Park", "McKeesport"],
		population: 2300000,
	},
	{
		region: "Northeast",
		state: "MD",
		metro: "Central Maryland",
		slug: "baltimore-md",
		cities: ["Baltimore", "Columbia", "Towson", "Annapolis"],
		population: 2800000,
	},
	{
		region: "Northeast",
		state: "CT",
		metro: "Greater Hartford",
		slug: "hartford-ct",
		cities: ["Hartford", "West Hartford", "East Hartford", "Middletown"],
		population: 1200000,
	},
	// Southeast
	{
		region: "Southeast",
		state: "GA",
		metro: "Metro Atlanta",
		slug: "atlanta-ga",
		cities: ["Atlanta", "Sandy Springs", "Roswell", "Marietta"],
		population: 6100000,
	},
	{
		region: "Southeast",
		state: "FL",
		metro: "South Florida",
		slug: "miami-fl",
		cities: ["Miami", "Fort Lauderdale", "West Palm Beach", "Hialeah"],
		population: 6100000,
	},
	{
		region: "Southeast",
		state: "FL",
		metro: "Tampa Bay Area",
		slug: "tampa-fl",
		cities: ["Tampa", "St. Petersburg", "Clearwater", "Lakeland"],
		population: 3200000,
	},
	{
		region: "Southeast",
		state: "FL",
		metro: "Greater Orlando",
		slug: "orlando-fl",
		cities: ["Orlando", "Kissimmee", "Sanford", "Winter Park"],
		population: 2600000,
	},
	{
		region: "Southeast",
		state: "NC",
		metro: "Metrolina",
		slug: "charlotte-nc",
		cities: ["Charlotte", "Concord", "Gastonia", "Rock Hill"],
		population: 2700000,
	},
	{
		region: "Southeast",
		state: "TN",
		metro: "Middle Tennessee",
		slug: "nashville-tn",
		cities: ["Nashville", "Murfreesboro", "Franklin", "Hendersonville"],
		population: 2000000,
	},
	// Midwest
	{
		region: "Midwest",
		state: "IL",
		metro: "Chicagoland",
		slug: "chicago-il",
		cities: ["Chicago", "Naperville", "Elgin", "Joliet", "Aurora"],
		population: 9400000,
	},
	{
		region: "Midwest",
		state: "MI",
		metro: "Metro Detroit",
		slug: "detroit-mi",
		cities: ["Detroit", "Warren", "Dearborn", "Sterling Heights"],
		population: 4300000,
	},
	{
		region: "Midwest",
		state: "MN",
		metro: "Twin Cities",
		slug: "minneapolis-mn",
		cities: ["Minneapolis", "St. Paul", "Bloomington", "Brooklyn Park"],
		population: 3700000,
	},
	{
		region: "Midwest",
		state: "MO",
		metro: "Greater St. Louis",
		slug: "st-louis-mo",
		cities: ["St. Louis", "St. Charles", "Florissant", "Chesterfield"],
		population: 2800000,
	},
	{
		region: "Midwest",
		state: "OH",
		metro: "Central Ohio",
		slug: "columbus-oh",
		cities: ["Columbus", "Dublin", "Westerville", "Reynoldsburg"],
		population: 2100000,
	},
	{
		region: "Midwest",
		state: "IN",
		metro: "Central Indiana",
		slug: "indianapolis-in",
		cities: ["Indianapolis", "Carmel", "Fishers", "Noblesville"],
		population: 2100000,
	},
	// Southwest
	{
		region: "Southwest",
		state: "TX",
		metro: "Dallas-Fort Worth",
		slug: "dallas-tx",
		cities: ["Dallas", "Fort Worth", "Arlington", "Plano", "Irving"],
		population: 7700000,
	},
	{
		region: "Southwest",
		state: "TX",
		metro: "Greater Houston",
		slug: "houston-tx",
		cities: ["Houston", "The Woodlands", "Sugar Land", "Katy"],
		population: 7200000,
	},
	{
		region: "Southwest",
		state: "AZ",
		metro: "Valley of the Sun",
		slug: "phoenix-az",
		cities: ["Phoenix", "Mesa", "Scottsdale", "Chandler", "Glendale"],
		population: 5000000,
	},
	{
		region: "Southwest",
		state: "CO",
		metro: "Front Range",
		slug: "denver-co",
		cities: ["Denver", "Aurora", "Lakewood", "Centennial"],
		population: 2900000,
	},
	{
		region: "Southwest",
		state: "NV",
		metro: "Las Vegas Valley",
		slug: "las-vegas-nv",
		cities: ["Las Vegas", "Henderson", "North Las Vegas", "Paradise"],
		population: 2300000,
	},
	{
		region: "Southwest",
		state: "TX",
		metro: "Greater Austin",
		slug: "austin-tx",
		cities: ["Austin", "Round Rock", "Cedar Park", "Georgetown"],
		population: 2300000,
	},
	// West Coast
	{
		region: "West Coast",
		state: "CA",
		metro: "Los Angeles Metro",
		slug: "los-angeles-ca",
		cities: ["Los Angeles", "Long Beach", "Anaheim", "Santa Ana", "Irvine"],
		population: 12900000,
	},
	{
		region: "West Coast",
		state: "CA",
		metro: "Bay Area",
		slug: "san-francisco-ca",
		cities: ["San Francisco", "Oakland", "Berkeley", "Hayward"],
		population: 4600000,
	},
	{
		region: "West Coast",
		state: "CA",
		metro: "Silicon Valley",
		slug: "san-jose-ca",
		cities: ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View"],
		population: 1900000,
	},
	{
		region: "West Coast",
		state: "WA",
		metro: "Puget Sound",
		slug: "seattle-wa",
		cities: ["Seattle", "Tacoma", "Bellevue", "Everett"],
		population: 4000000,
	},
	{
		region: "West Coast",
		state: "CA",
		metro: "San Diego County",
		slug: "san-diego-ca",
		cities: ["San Diego", "Chula Vista", "Oceanside", "Escondido"],
		population: 3300000,
	},
	{
		region: "West Coast",
		state: "OR",
		metro: "Greater Portland",
		slug: "portland-or",
		cities: ["Portland", "Gresham", "Hillsboro", "Beaverton"],
		population: 2500000,
	},
];

export function getMetroBySlug(slug: string): Metro | undefined {
	return METROS.find((m) => m.slug === slug);
}

export function getMetrosByRegion(): Record<string, Metro[]> {
	return METROS.reduce(
		(acc, metro) => {
			if (!acc[metro.region]) {
				acc[metro.region] = [];
			}
			acc[metro.region].push(metro);
			return acc;
		},
		{} as Record<string, Metro[]>,
	);
}

export function formatPopulation(pop: number): string {
	if (pop >= 1000000) {
		return `${(pop / 1000000).toFixed(1)}M`;
	}
	return `${(pop / 1000).toFixed(0)}K`;
}
