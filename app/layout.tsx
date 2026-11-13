import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/site/Navigation";

export const metadata: Metadata = {
  title: "COSMIC LABS — Mission Architect",
  description: "Design, engineer, and launch your own space mission.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
