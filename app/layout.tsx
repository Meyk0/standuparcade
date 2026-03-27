import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Standup Slots — Retro Arcade Standup Order Picker",
  description:
    "Stop deciding who goes next. Let the machine pick. A fun, real-time standup order picker for engineering teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-skin="classic-vegas">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
