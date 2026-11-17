import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriHub",
  description: "Plataforma NutriHub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F7F7F2] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}