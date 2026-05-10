"use client";

import React from "react";
import { cn } from "@repo/core";
import styles from "./header-menu.module.css";

export interface HeaderMenuItem {
  label: string;
  href: string;
}

interface HeaderMenuProps {
  items?: HeaderMenuItem[];
  className?: string;
}

const DEFAULT_ITEMS: HeaderMenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

/**
 * Animated Header Menu Component
 * Features a dynamic SVG outline animation on hover.
 * Colors are derived from the global semantic token system.
 */
export const HeaderMenu: React.FC<HeaderMenuProps> = ({ 
  items = DEFAULT_ITEMS,
  className 
}) => {
  return (
    <div className={cn(styles.nav, className)}>
      <div className={styles.container}>
        {items.slice(0, 4).map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={styles.btn}
          >
            {item.label}
          </a>
        ))}

        <svg
          className={styles.outline}
          width="400"
          height="60"
          viewBox="0 0 400 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            className={styles.rect}
            pathLength="100"
            x="0"
            y="0"
            width="400"
            height="60"
            rx="8"
          ></rect>
        </svg>
      </div>
    </div>
  );
};

