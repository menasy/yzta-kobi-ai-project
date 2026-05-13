import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn/table";
import type { OrderItem } from "@repo/domain/orders";

interface OrderItemListProps {
  items: OrderItem[];
}

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function OrderItemList({ items }: OrderItemListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground border rounded-md">
        Bu siparişte ürün bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b-border/40">
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground py-4">Ürün</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground py-4">SKU</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground py-4 text-right">Birim Fiyat</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground py-4 text-center">Adet</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground py-4 text-right">Toplam</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id || item.product_id || Math.random()} className="hover:bg-muted/30 transition-colors border-b-border/40">
              <TableCell className="font-semibold text-foreground py-4">
                {item.product_name || `Ürün #${item.product_id}`}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs py-4">
                {item.sku || "-"}
              </TableCell>
              <TableCell className="text-right font-medium text-muted-foreground py-4">
                {formatCurrency(item.unit_price)}
              </TableCell>
              <TableCell className="text-center py-4">
                <span className="inline-flex items-center justify-center bg-muted/50 text-foreground font-medium rounded-md min-w-[32px] h-8 px-2 text-sm">
                  {item.quantity}
                </span>
              </TableCell>
              <TableCell className="text-right font-bold text-primary py-4">
                {formatCurrency(item.total_price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
