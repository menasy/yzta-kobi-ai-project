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
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Birim Fiyat</TableHead>
            <TableHead className="text-center">Adet</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id || item.product_id || Math.random()}>
              <TableCell className="font-medium">
                {item.product_name || `Ürün #${item.product_id}`}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.sku || "-"}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.unit_price)}
              </TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(item.total_price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
