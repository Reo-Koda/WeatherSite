import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // app ディレクトリを使ってるなら experimental を有効に
    // experimental: { appDir: true },

    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "openweathermap.org",
          port: "",
          // /img/wn/ の下にあるアイコン画像をすべて許可
          pathname: "/img/wn/**",
        },
      ],
    },
    env: {
      NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY: process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_KEY,
    },
};

export default nextConfig;
