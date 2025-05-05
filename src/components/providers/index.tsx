import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import { AppSidebarInset } from "./app-sidebar-inset";
import { ClientProviders } from "./client-providers";

type ProviderProps = {
  children: React.ReactNode;
};

export async function Providers({ children }: ProviderProps) {
  const cookieStore = await cookies();

  const sidebarState = cookieStore.get("sidebar:state")?.value;
  //* get sidebar width from cookie
  const sidebarWidth = cookieStore.get("sidebar:width")?.value;

  let defaultOpen = true;

  if (sidebarState) {
    defaultOpen = sidebarState === "true";
  }

  return (
    <ThemeProvider
      enableSystem
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <ClientProviders>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar>
            <AppSidebarInset>{children}</AppSidebarInset>
          </AppSidebar>
        </SidebarProvider>
      </ClientProviders>
    </ThemeProvider>
  );
}
