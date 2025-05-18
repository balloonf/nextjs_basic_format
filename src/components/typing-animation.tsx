"use client";

import React, { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  delay?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  className = "",
  onComplete,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setStartAnimation(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay]);

  useEffect(() => {
    if (!startAnimation) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, startAnimation, onComplete]);

  return <span className={className}>{displayText}</span>;
};

export const MultipleTypingAnimation: React.FC<{
  textItems: { text: string; className?: string }[];
  speed?: number;
  delay?: number;
  containerClassName?: string;
}> = ({ textItems, speed = 50, delay = 0, containerClassName = "" }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const handleCompleteTyping = () => {
    if (currentTextIndex < textItems.length - 1) {
      setTimeout(() => {
        setCurrentTextIndex((prev) => prev + 1);
      }, 500); // 500ms pause between texts
    }
  };

  return (
    <div className={containerClassName}>
      {textItems.map((item, index) => (
        <div key={index} className={index === currentTextIndex ? "block" : "hidden"}>
          <TypingAnimation
            text={item.text}
            speed={speed}
            className={item.className}
            onComplete={handleCompleteTyping}
            delay={index === 0 ? delay : 0}
          />
        </div>
      ))}
    </div>
  );
};
