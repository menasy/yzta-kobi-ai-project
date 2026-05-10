import React from 'react';
import Link from 'next/link';

export function CustomerHomeHeader() {
  return (
    <header className="flex w-full items-center justify-between py-6">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
          K
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          KOBİ <span className="text-primary">AI</span>
        </span>
      </div>
      <nav>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          İşletme girişi
        </Link>
      </nav>
    </header>
  );
}
