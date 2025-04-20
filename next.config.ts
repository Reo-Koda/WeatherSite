import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      domains: ['openweathermap.org'],
    },
    env: {
      NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY: process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY,
    },
};

export default nextConfig;
