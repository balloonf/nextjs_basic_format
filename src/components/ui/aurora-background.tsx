"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col  h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900  text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              '--white-gradient': 'repeating-linear-gradient(100deg,var(--white) 0%,var(--white) 7%,var(--transparent) 10%,var(--transparent) 12%,var(--white) 16%)',
              '--dark-gradient': 'repeating-linear-gradient(100deg,var(--black) 0%,var(--black) 7%,var(--transparent) 10%,var(--transparent) 12%,var(--black) 16%)',
              '--aurora': 'repeating-linear-gradient(100deg,var(--blue-500) 10%,var(--indigo-300) 15%,var(--blue-300) 20%,var(--violet-200) 25%,var(--blue-400) 30%)',
              backgroundImage: 'var(--white-gradient),var(--aurora)',
              backgroundSize: '300%, 200%',
              backgroundPosition: '50% 50%, 50% 50%',
              filter: 'blur(10px) invert(1)',
              maskImage: showRadialGradient ? 'radial-gradient(ellipse at 100% 0%, black 10%, var(--transparent) 70%)' : 'none'
            }}
            className={cn(
              "pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform dark:invert-0 before:absolute before:inset-0 before:bg-[image:var(--white-gradient),var(--aurora)] before:bg-[size:200%,100%] before:bg-[attachment:fixed] before:mix-blend-difference before:animate-aurora before:content-[''] dark:before:bg-[image:var(--dark-gradient),var(--aurora)]"
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
