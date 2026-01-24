import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Drag-to-Resize Sidebar",
  description: "Drag-to-Resize Sidebar built with shadcn-ui",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Providers>
        <AuthGuard requireAuth={true}>
          {children}
        </AuthGuard>
      </Providers>
    </div>
  );
}
