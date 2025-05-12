import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

config.autoAddCss = false; // Prevent fontawesome from adding its CSS since we did it manually above

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Christina's Portfolio",
  description: "Personal portfolio showcasing my projects, blog, and more",
  icons: {
    icon: "/main-logo.ico",
    shortcut: "/main-logo.ico",
    apple: "/main-logo.png", // Keep PNG for Apple touch icon as it requires higher resolution
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="portfolio-theme"
        >
          <div className="min-h-screen bg-background transition-colors duration-300">
            <header className="container flex items-center justify-between h-16 py-4">
              <MainNav />
              <ModeToggle />
            </header>
            <main className="container pb-8">{children}</main>
            <footer className="border-t py-8">
              <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between text-sm text-muted-foreground">
                <p>
                  © {new Date().getFullYear()} Christina Anastasopoulou. All
                  rights reserved.
                </p>
                {/* <div className="flex items-center gap-4">
                  <Link href="https://twitter.com">Twitter</Link>
                  <Link href="https://github.com">GitHub</Link>
                  <Link href="https://linkedin.com">LinkedIn</Link>
                </div> */}
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
