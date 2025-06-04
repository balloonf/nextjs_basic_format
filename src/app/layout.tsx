import type { Metadata } from "next";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Basic Format",
  description: "Next.js 15 + shadcn/ui + Tailwind CSS 4 기본 템플릿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
