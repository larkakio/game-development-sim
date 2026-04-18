import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi/config";

const display = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "dev-placeholder";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Game Development Sim",
  description: "Neon studio merge game on Base — swipe the field, ship the build.",
  icons: { icon: "/app-icon.jpg" },
  openGraph: {
    title: "Game Development Sim",
    description: "Neon studio merge game on Base — swipe the field, ship the build.",
    images: [{ url: "/app-thumbnail.jpg", width: 1910, height: 1000 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} h-full bg-[#05060a] text-cyan-50 antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="relative min-h-full overflow-x-hidden font-mono">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05060a_75%)]"
        />
        <Providers initialState={initialState}>
          <div className="relative z-10 flex min-h-full flex-col items-center">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
