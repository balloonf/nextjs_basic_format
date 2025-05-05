"use client";

import React, { createContext, useContext, useState } from "react";

interface NavigationItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
  }[];
}

interface NavigationContextType {
  activeMainItem: NavigationItem | null;
  activeSubItem: { title: string; url: string } | null;
  setActiveMainItem: (item: NavigationItem) => void;
  setActiveSubItem: (item: { title: string; url: string } | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeMainItem, setActiveMainItem] = useState<NavigationItem | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<{ title: string; url: string } | null>(null);

  return (
    <NavigationContext.Provider
      value={{
        activeMainItem,
        activeSubItem,
        setActiveMainItem,
        setActiveSubItem,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
