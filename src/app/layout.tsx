import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: {
    default: "Personal OS",
    template: "%s | Personal OS",
  },
  description: "Workspace privado y portafolio público — todo en un solo lugar.",
  metadataBase: new URL("https://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          richColors
          position="bottom-right"
          duration={3500}
          toastOptions={{ style: { fontFamily: 'var(--font-geist-sans)' } }}
        />
      </body>
    </html>
  );
}
