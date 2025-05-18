"use client";

import { motion } from "framer-motion";
import React from "react";
import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TypingAnimation, MultipleTypingAnimation } from "@/components/typing-animation";

export function AuroraBackgroundDemo() {
  const router = useRouter();
  
  const handleDebugClick = () => {
    router.push("/login");
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      {/* Simple Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `
              linear-gradient(
                to right,
                rgba(125, 211, 252, 0.5),
                rgba(167, 139, 250, 0.5),
                rgba(244, 114, 182, 0.5),
                rgba(251, 146, 60, 0.5)
              )
            `,
            filter: 'blur(100px)',
            animation: 'moveGradient 15s linear infinite alternate'
          }}
        />
      </div>
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 flex flex-col gap-4 items-center justify-center min-h-screen px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center h-24">
          <TypingAnimation 
            text="Background lights are cool you know." 
            speed={80} 
          />
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 h-16 mt-6">
          <TypingAnimation 
            text="And this, is chemical burn." 
            speed={100} 
            delay={3000} 
          />
        </div>
        <InteractiveHoverButton 
          text="Debug now" 
          className="mt-5 w-48" 
          onClick={handleDebugClick}
        />
      </motion.div>
      
      <style jsx global>{`
        @keyframes moveGradient {
          0% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          50% {
            transform: translate(10%, 10%) rotate(180deg);
          }
          100% {
            transform: translate(0%, 0%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}