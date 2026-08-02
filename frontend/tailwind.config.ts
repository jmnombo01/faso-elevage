import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#16A34A", 50: "#F0FDF4", 100: "#DCFCE7", 600: "#16A34A", 700: "#15803D" },
        secondary: "#F59E0B",
      }
    },
  },
  plugins: [],
};
export default config;
