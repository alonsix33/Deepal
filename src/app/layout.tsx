import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";

export const metadata: Metadata = {
  title: "Deepal S05 Tracker",
  description:
    "Track consumption, costs, and maintenance for your Deepal S05 REEV",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deepal S05",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
