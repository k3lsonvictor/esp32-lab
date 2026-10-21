import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ESP32 Lab — Aprenda fazendo",
  description: "Seu primeiro circuito com ESP32, uma conexão de cada vez.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
