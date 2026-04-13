import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Personal OS",
    template: "%s | Personal OS",
  },
  description: "Workspace privado y portafolio público — todo en un solo lugar.",
  metadataBase: new URL("https://localhost:3000"),
};

// Inline script runs synchronously before React hydrates — prevents flash of wrong theme.
const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch(e){}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      {/* suppressHydrationWarning: needed because the inline script mutates the class
          attribute before React hydrates, causing a mismatch that is safe to ignore. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          richColors
          position="bottom-right"
          duration={3500}
          toastOptions={{ style: { fontFamily: "var(--font-geist-sans)" } }}
        />
      </body>
    </html>
  );
}
