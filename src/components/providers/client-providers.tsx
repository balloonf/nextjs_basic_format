"use client";

import { NavigationProvider } from "./context/navigation-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
