import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathWaves — AI Math → Code + Graph",
  description:
    "Transform any math formula into executable code and interactive graphs using AI.",
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