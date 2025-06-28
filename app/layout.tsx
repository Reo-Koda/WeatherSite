import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "静岡大学専用 天気予報サイト | 最適な服装を提案",
  description: `静岡大学の学生のために作られた天気予報サイトです。
  現在の時刻から24時間までの天気予報が三時間ごとに表示されます。体感温度、湿度、降水確率、風速、最大瞬間風速、気圧をもとにその日の最適な服装を提案します。`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        { children }
      </body>
    </html>
  );
}
