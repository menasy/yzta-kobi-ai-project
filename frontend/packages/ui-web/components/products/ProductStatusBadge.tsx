import { Badge } from "../shadcn/badge";

interface ProductStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ProductStatusBadge({ isActive, className }: ProductStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge
        variant="secondary"
        className={`bg-success/10 text-success hover:bg-success/20 border-success/20 ${className || ""}`}
      >
        Aktif
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`bg-muted/10 text-muted-foreground hover:bg-muted/20 border-border ${className || ""}`}
    >
      Pasif
    </Badge>
  );
}
