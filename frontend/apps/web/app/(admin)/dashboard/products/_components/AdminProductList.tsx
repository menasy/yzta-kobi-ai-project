"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts, type ProductListParams } from "@repo/domain/products";
import {
  Card,
  CardContent,
  Button,
  ProductTable,
  ProductFilters,
} from "@repo/ui-web";
import { AlertCircle, Plus, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

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
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Ürünler yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 text-primary mb-1">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Envanter Yönetimi</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Ürün Yönetimi</h2>
          <p className="text-muted-foreground text-lg">
            Sistemdeki tüm ürünleri görüntüleyin, filtreleyin ve yönetin.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button 
            size="lg"
            onClick={() => router.push("/dashboard/products/new")}
            className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" /> Yeni Ürün Ekle
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <ProductFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-3xl blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"></div>
          <Card className="relative border-none bg-background/60 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group/card">
            <CardContent className="p-0">
              <ProductTable 
                products={products}
                isLoading={isLoading}
                onRowClick={(id) => router.push(`/dashboard/products/${id}`)}
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
