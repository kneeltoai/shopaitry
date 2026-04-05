import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const landingSans = Noto_Sans_KR({
  variable: "--landing-font-body",
  subsets: ["korean"],
  weight: ["400", "500", "700", "900"],
});

const landingMono = JetBrains_Mono({
  variable: "--landing-font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Shopaitry — AI가 채워주는 나만의 쇼핑 위시보드",
  description: "URL 하나로 모든 쇼핑몰 상품을 저장. AI 에이전트가 찾고, 내가 고르고, 한 곳에서 관리.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${landingSans.variable} ${landingMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
