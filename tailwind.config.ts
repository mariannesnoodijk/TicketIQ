import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 gebruikt primair CSS-first configuratie (zie `@theme` in
 * `src/app/globals.css`). Dit bestand is opgenomen conform de voorgeschreven
 * repo-structuur en voor eventuele uitbreidingen van het theme.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
};

export default config;
