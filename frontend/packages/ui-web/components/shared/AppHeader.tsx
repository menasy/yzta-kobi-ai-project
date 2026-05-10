"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@repo/core";
import { AppHeaderProps, NavItem } from "@repo/ui-contracts";
import { 
  Button, 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Logo
} from "@repo/ui";

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "AI Chat", href: "/chat" },
  { label: "Özellikler", href: "/features" },
  { label: "Kargo", href: "/shipping" },
];

const AUTH_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Siparişler", href: "/orders" },
  { label: "Envanter", href: "/inventory" },
  { label: "Kargo", href: "/shipments" },
];

/**
 * AppHeader — Global, Auth-Aware Navigation
 * Framer Motion ile optimize edilmiş, yüksek performanslı animasyonlu header.
 */
export function AppHeader({
  isAuthenticated,
  user,
  activePathname,
  onLogout,
}: AppHeaderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : PUBLIC_NAV_ITEMS;
  const logoHref = isAuthenticated ? "/dashboard" : "/";

  // SVG animasyon değerleri (PathLength 100 üzerinden)
  const getDashArray = (index: number | null) => {
    if (index === null) return "0 0 10 40 10 40";
    const values = [
      "0 2 8 73.3 8 10.7",
      "0 12.6 9.5 49.3 9.5 31.6",
      "0 24.5 8.5 27.5 8.5 55.5",
      "0 34.7 6.9 10.2 6.9 76",
    ];
    return values[index] || "0 0 10 40 10 40";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        
        {/* Sol: Logo Alanı */}
        <Logo variant="header" href={logoHref} />

        {/* Orta: Animated Navigation */}
        <nav className="flex items-center justify-center flex-1 px-4 min-w-[300px]">
          <div className="relative max-w-[500px] w-full h-[44px] bg-muted/30 rounded-xl border border-border/50 p-1 flex items-center justify-around">
            {navItems.length > 0 ? navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative z-10 px-3 py-2 text-sm font-medium transition-colors duration-300",
                  activePathname === item.href ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            )) : (
              <span className="text-xs text-muted-foreground">Menü Yükleniyor...</span>
            )}

            {/* SVG Outline Animation */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              viewBox="0 0 500 44"
              preserveAspectRatio="none"
              overflow="visible"
            >
              <motion.rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="12"
                fill="transparent"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                pathLength="100"
                initial={false}
                animate={{
                  strokeDasharray: getDashArray(hoveredIndex),
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
              />
            </svg>
          </div>
        </nav>

        {/* Sağ: Auth Aksiyon Alanı */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 hover:bg-accent">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.initials || "??"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profil Ayarları</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Abonelik</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
                  onClick={onLogout}
                >
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex hover:bg-accent/50">
                <Link href="/auth/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Link href="/auth/register">Kayıt Ol</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
