import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "แดชบอร์ดผลลัพธ์ผู้เข้าร่วมโครงการ",
  description: "ติดตามเส้นทางและผลลัพธ์ของผู้เข้าร่วมโครงการจากข้อมูล Google Sheets",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/aiat-10-logo.png",
    shortcut: "/aiat-10-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
