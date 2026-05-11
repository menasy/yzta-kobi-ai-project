"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts, type ProductListParams } from "@repo/domain/products";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  ProductTable,
  ProductFilters,
} from "@repo/ui-web";
import { AlertCircle, Plus } from "lucide-react";

export function AdminProductList() {
  const router = useRouter();
  
  const [filters, setFilters] = useState<ProductListParams>({});

  const { products, isLoading, error } = useProducts(filters);

  const handleFilterChange = (key: keyof ProductListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Ürünler yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h2>
          <p className="text-muted-foreground">
            Sistemdeki tüm ürünleri görüntüleyin, filtreleyin ve yönetin.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/products/new")}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle
        </Button>
      </div>

      <ProductFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <Card>
        <CardContent className="p-0">
          <ProductTable 
            products={products}
            isLoading={isLoading}
            onRowClick={(id) => router.push(`/dashboard/products/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
