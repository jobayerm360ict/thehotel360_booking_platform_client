"use client";

import React, { useRef, useState, useEffect } from "react";
import { MAIN_CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

interface MainCategoryBarProps {
  activeCategory: "apartments" | "rooms" | "hotels";
  onSelectCategory: (category: "apartments" | "rooms" | "hotels") => void;
}

export function MainCategoryBar({
  activeCategory,
  onSelectCategory,
}: MainCategoryBarProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = () => {
    const activeEl = tabRefs.current[activeCategory];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeCategory]);

  return (
    <div className="sticky top-20 z-30 rounded-md sm:rounded-xl bg-white/95 my-2 w-fit mx-auto dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 px-3 py-1.5 shadow-sm">
      <div className="relative flex items-center justify-center">
        {/* Centered Main 3 Tabs */}
        <div className="relative flex items-center gap-2 sm:gap-6 pb-1">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                ref={(el) => {
                  tabRefs.current[cat.id] = el;
                }}
                onClick={() => onSelectCategory(cat.id)}
                className={cn(
                  "relative flex items-center gap-2.5 px-2 md:px-3.5  py-1.5 rounded-full cursor-pointer transition-all duration-300 text-sm font-heading font-semibold select-none group",
                  isSelected
                    ? "text-brand-primary dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
                )}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </span>
                <span className="tracking-tight transition-colors duration-300">
                  {cat.label}
                </span>
              </button>
            );
          })}

          {/* Smooth Sliding Underline Indicator */}
          <span
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
            className="absolute -bottom-2 left-0 h-[3px] bg-brand-primary rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
