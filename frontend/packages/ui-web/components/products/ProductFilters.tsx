"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import { Checkbox } from "../shadcn/checkbox";
import type { ProductListParams } from "@repo/domain/products";
import { cn } from "@repo/core";

interface ProductFiltersProps {
  filters: ProductListParams;
  onFilterChange: (key: keyof ProductListParams, value: any) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const hasActiveFilters = 
    Boolean(filters.search) || 
    Boolean(filters.category) || 
    filters.isActive !== undefined || 
    filters.lowStock === true;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-sm p-3 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-1 items-center gap-2 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="search"
            placeholder="Ürün adı veya SKU ara..."
            className="w-full pl-10 pr-4 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 rounded-lg transition-all"
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          {filters.search && (
            <button 
              onClick={() => onFilterChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.isActive !== undefined ? String(filters.isActive) : "all"}
          onValueChange={(val: string) => {
            if (val === "all") onFilterChange("isActive", undefined);
            else onFilterChange("isActive", val === "true");
          }}
        >
          <SelectTrigger className="w-[160px] h-11 bg-background/50 border-muted-foreground/20 rounded-lg focus:ring-primary/20">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Durum" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all">Tümü (Durum)</SelectItem>
            <SelectItem value="true">Sadece Aktif</SelectItem>
            <SelectItem value="false">Sadece Pasif</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2.5 bg-background/50 border border-muted-foreground/20 px-4 h-11 rounded-lg transition-all hover:bg-background/80">
          <Checkbox 
            id="low-stock-filter" 
            checked={filters.lowStock === true}
            onCheckedChange={(checked) => onFilterChange("lowStock", checked === true)}
            className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label
            htmlFor="low-stock-filter"
            className="text-sm font-medium leading-none cursor-pointer select-none whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors"
          >
            Düşük Stok
          </label>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
