import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	serverExternalPackages: ["esbuild-wasm"], // Required for @serwist/turbopack
};

export default nextConfig;
