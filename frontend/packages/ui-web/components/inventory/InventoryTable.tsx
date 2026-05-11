"use client";

import { useInventory } from "@repo/domain/inventory/hooks/useInventory";
import type { InventoryItem } from "@repo/domain/inventory/types/inventory.types";
import { Edit2, PackageSearch } from "lucide-react";
import * as React from "react";

import { Button } from "../shadcn/button";
import { Skeleton } from "../shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn/table";
import { InventorySeverityBadge } from "./InventorySeverityBadge";
import { UpdateStockDialog } from "./UpdateStockDialog";

export function InventoryTable() {
  const { inventory, isLoading } = useInventory();
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const getSeverity = (item: InventoryItem) => {
    if (item.available_quantity <= 0) return "critical";
    if (item.available_quantity <= item.low_stock_threshold) return "warning";
    return "info";
  };

  if (isLoading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="h-10 bg-muted/50 border-b flex items-center px-4">
          <Skeleton className="h-4 w-24 mr-auto" />
          <Skeleton className="h-4 w-16 mx-4" />
          <Skeleton className="h-4 w-16 mx-4" />
          <Skeleton className="h-4 w-24 mx-4" />
          <Skeleton className="h-4 w-20 mx-4" />
          <Skeleton className="h-4 w-10 ml-4" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b last:border-0 flex items-center px-4 gap-4">
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card/50">
        <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Stok Kaydı Bulunamadı</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Arama kriterlerinize uygun stok kaydı bulunamadı veya henüz hiç ürün eklenmedi.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Ürün</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Mevcut</TableHead>
              <TableHead className="text-right">Rezerve</TableHead>
              <TableHead className="text-right">Kullanılabilir</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id} className="group">
                <TableCell className="font-medium">{item.product_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.product_sku}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item.reserved_quantity}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {item.available_quantity}
                </TableCell>
                <TableCell className="text-center">
                  <InventorySeverityBadge severity={getSeverity(item)} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Stok Güncelle"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Stok Güncelle</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UpdateStockDialog
        item={selectedItem}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
