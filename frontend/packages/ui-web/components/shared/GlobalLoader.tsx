"use client";

import React from "react";
import { cn } from "@repo/core";
import styles from "./GlobalLoader.module.css";

interface GlobalLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function GlobalLoader({ className, fullScreen = false }: GlobalLoaderProps) {
  return (
    <div className={cn(
      styles.loaderContainer, 
      fullScreen && "fixed inset-0 z-[9999] bg-[#f3f4f6] backdrop-blur-md",
      className
    )}>
      <div className={styles.loader}>
        <div className={styles.loader__bar}></div>
        <div className={styles.loader__bar}></div>
        <div className={styles.loader__bar}></div>
        <div className={styles.loader__bar}></div>
        <div className={styles.loader__bar}></div>
        <div className={styles.loader__ball}></div>
      </div>
    </div>
  );
}
