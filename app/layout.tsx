import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Techy — SOC Analyst Interview Prep",
  description:
    "AI-powered interview prep for entry-level SOC Analyst roles. Real interview scenarios, instant feedback, mock interviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
