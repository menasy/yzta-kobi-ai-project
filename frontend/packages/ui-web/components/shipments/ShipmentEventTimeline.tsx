import { cn } from "@repo/core";
import type { ShipmentEvent } from "@repo/domain/shipments/types/shipments.types";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";

interface ShipmentEventTimelineProps {
  events?: ShipmentEvent[];
  className?: string;
}

export function ShipmentEventTimeline({ events, className }: ShipmentEventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground italic", className)}>
        Kargo hareket geçmişi bulunamadı.
      </div>
    );
  }

  // Sort events by date descending (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={cn("relative border-l border-border/50 ml-3 space-y-6", className)}>
      {sortedEvents.map((event, index) => {
        const date = event.event_time ? new Date(event.event_time) : new Date(event.created_at);
        const isLatest = index === 0;

        return (
          <div key={event.id} className="relative pl-6">
            <span
              className={cn(
                "absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2",
                isLatest
                  ? "border-primary bg-background ring-4 ring-primary/10"
                  : "border-muted-foreground bg-muted-foreground"
              )}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <ShipmentStatusBadge status={event.status} className="scale-90 origin-left" />
                <span className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(date)}
                </span>
              </div>
              
              {event.location && (
                <span className="text-sm font-medium">{event.location}</span>
              )}
              
              {event.description && (
                <span className="text-sm text-muted-foreground">{event.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
