"use client";

import { SidebarInset } from "../ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "../mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useNavigation } from "./context/navigation-context";

export function AppSidebarInset({ children }: { children: React.ReactNode }) {
  const { activeMainItem, activeSubItem } = useNavigation();

  return (
    <SidebarInset className="overflow-x-hidden">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 justify-between">
        <div className="flex items-center gap-2 px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1" />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Toggle Sidebar <kbd className="ml-2">⌘+b</kbd>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {activeMainItem ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={activeMainItem.url}>
                      {activeMainItem.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  
                  {activeSubItem && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {activeSubItem.title}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="mr-2 sm:mr-4">
          <ModeToggle />
        </div>
      </header>
      {children}
    </SidebarInset>
  );
}
