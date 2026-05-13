"use client";

import { cn } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import {
  useSystemChecking,
  useSystemError,
  useSystemReady,
  useSystemStatus,
} from "@repo/state";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Database, RefreshCcw, ServerOff } from "lucide-react";
import type { ReactNode } from "react";

interface SystemGateProps {
  children: ReactNode;
}

export function SystemGate({ children }: SystemGateProps) {
  const queryClient = useQueryClient();
  const systemReady = useSystemReady();
  const status = useSystemStatus();
  const isChecking = useSystemChecking();
  const error = useSystemError();

  const handleRetry = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.health.status() });
  };

  if (isChecking && !status) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-2xl border border-border/40 bg-background/60 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Sistem kontrol ediliyor
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Backend ve veritabani durumu dogrulaniyor.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ServerOff className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-destructive">
            Backend ulasilamiyor
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-background px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!systemReady && status) {
    const items = [
      {
        label: "Veritabani Baglantisi",
        ok: status.databaseReady,
      },
      {
        label: "Migration",
        ok: status.migrationsReady,
      },
      {
        label: "Seed Data",
        ok: status.seedReady,
      },
    ];

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full rounded-2xl border border-warning/40 bg-warning/5 p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-foreground">
                Sistem kurulumu tamamlanmamis
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {status.message}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm",
                  item.ok
                    ? "border-emerald-200/60 bg-emerald-500/5 text-emerald-700"
                    : "border-warning/30 bg-warning/10 text-warning",
                )}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs font-semibold">
                  {item.ok ? "OK" : "Eksik"}
                </span>
              </div>
            ))}
          </div>

          {status.missingTables.length > 0 ? (
            <div className="mt-6 rounded-xl border border-warning/30 bg-background/70 p-4 text-xs text-muted-foreground">
              Eksik tablolar: {status.missingTables.join(", ")}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-warning/40 bg-background px-4 py-2 text-sm font-semibold text-warning transition hover:bg-warning/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Durumu Yenile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
