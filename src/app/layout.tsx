import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import SocketProvider from "@/components/providers/SocketProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Distorm",
    description: "Distorm",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${font.className} antialiased bg-white dark:bg-[#313338] !pointer-events-auto`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                        storageKey="distorm-theme"
                    >
                        <SocketProvider>
                            <ModalProvider />
                            <QueryProvider>
                                <NextSSRPlugin
                                    routerConfig={extractRouterConfig(
                                        ourFileRouter
                                    )}
                                />
                                {children}
                            </QueryProvider>
                        </SocketProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
