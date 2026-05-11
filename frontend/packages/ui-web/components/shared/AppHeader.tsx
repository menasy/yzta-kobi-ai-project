"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@repo/core";
import { AppHeaderProps } from "@repo/ui-contracts";
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
  Logo,
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@repo/ui";
import { Menu } from "lucide-react";

/**
 * AppHeader — Global, Auth-Aware Navigation
 * Framer Motion ile optimize edilmiş, yüksek performanslı animasyonlu header.
 */
export function AppHeader({
  isAuthenticated,
  user,
  activePathname,
  navItems,
  logoHref,
  onLogout,
}: AppHeaderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [layout, setLayout] = useState<{ centers: number[]; widths: number[]; w: number; h: number }>({
    centers: [],
    widths: [],
    w: 45.95,
    h: 4.05,
  });

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;
      const { offsetWidth: width, offsetHeight: height } = containerRef.current;
      const total = 2 * (width + height);
      const w = (width / total) * 100;
      const h = (height / total) * 100;

      const centers: number[] = [];
      const widths: number[] = [];

      itemsRef.current.forEach((item) => {
        if (!item) {
          centers.push(0);
          widths.push(0);
          return;
        }
        // Item center relative to container width (0 to 1)
        centers.push((item.offsetLeft + item.offsetWidth / 2) / width);
        // Item width relative to total perimeter (in 0-100 units)
        widths.push((item.offsetWidth / total) * 100);
      });

      setLayout({ centers, widths, w, h });
    };

    updateLayout();
    
    // ResizeObserver for more robust tracking
    const observer = new ResizeObserver(updateLayout);
    if (containerRef.current) observer.observe(containerRef.current);
    
    window.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [navItems]);

  const activeIndex = navItems.findIndex((item) => item.href === activePathname);
  const displayIndex = hoveredIndex !== null ? hoveredIndex : (activeIndex !== -1 ? activeIndex : null);
  const currentItem = displayIndex !== null ? itemsRef.current[displayIndex] : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        
        {/* Sol: Logo Alanı & Mobil Menü */}
        <div className="flex items-center gap-2">
          {/* Mobil Menü (Hamburger) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menüyü Aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 bg-background/95 backdrop-blur-md">
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle>
                    <Logo variant="header" href={logoHref} />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-accent/50",
                        activePathname === item.href ? "text-primary bg-primary/5" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                {!isAuthenticated && (
                  <div className="mt-8 flex flex-col gap-3">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/auth/login">Giriş Yap</Link>
                    </Button>
                    <Button asChild className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20">
                      <Link href="/auth/register">Kayıt Ol</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Masaüstü Logo */}
          <div className="hidden md:flex">
            <Logo variant="header" href={logoHref} />
          </div>
          {/* Mobil ortalanmış Logo - Opsiyonel, eğer logo ortada istenirse. Şimdilik solda kalsın */}
          <div className="md:hidden flex ml-2">
             <Logo variant="header" href={logoHref} />
          </div>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1 px-4 min-w-[300px]">
          <div 
            ref={containerRef}
            className="relative max-w-[500px] w-full h-[44px] bg-muted/30 rounded-xl border border-border/50 px-4 py-1 flex items-center justify-around"
          >
            {navItems.length > 0 ? navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
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

            {/* Premium Indicator System */}
            {displayIndex !== null && currentItem && (
              <>
                {/* Background Capsule Highlight */}
                <motion.div
                  className="absolute bg-primary/5 rounded-lg z-0"
                  initial={false}
                  animate={{
                    left: currentItem.offsetLeft,
                    width: currentItem.offsetWidth,
                    height: currentItem.offsetHeight,
                    top: currentItem.offsetTop,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />

                {/* Top Dash */}
                <motion.div
                  className="absolute top-0 h-[2px] bg-primary z-20 rounded-full"
                  initial={false}
                  animate={{
                    left: currentItem.offsetLeft + 8,
                    width: currentItem.offsetWidth - 16,
                    opacity: 1,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />

                {/* Bottom Dash */}
                <motion.div
                  className="absolute bottom-0 h-[2px] bg-primary z-20 rounded-full"
                  initial={false}
                  animate={{
                    left: currentItem.offsetLeft + 8,
                    width: currentItem.offsetWidth - 16,
                    opacity: 1,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              </>
            )}
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
            <div className="hidden md:flex items-center gap-2">
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
