import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/src/components/ui/theme-provider";
import Header from "../../components/Header";

const openSans = Open_Sans({ subsets: ["hebrew"] });

export const metadata: Metadata = {
  title: "YK-Intelligence",
  description: 'מערכת לניהול דו"חות',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={openSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}