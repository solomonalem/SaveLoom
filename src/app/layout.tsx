//src/app/layout.tsx
import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "~/app/_components/modal/ModalProvider";

export const metadata: Metadata = {
  title: "SaveLoom - AI Financial Coach",
  description: "Your personal AI-powered financial coach that helps you save money and invest wisely",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}