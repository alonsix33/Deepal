import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";

export const metadata: Metadata = {
  title: "Deepal S05 Tracker",
  description:
    "Controla consumos, costos y mantenimiento de tu Deepal S05 REEV",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deepal S05",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  themeColor: "#00D4FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
