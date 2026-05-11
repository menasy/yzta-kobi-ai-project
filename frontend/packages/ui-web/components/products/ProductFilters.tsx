"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 p-4 rounded-lg border">
      <div className="flex flex-1 items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Ürün adı veya SKU ara..."
            className="w-full pl-8 bg-background"
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
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
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü (Durum)</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Pasif</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2 bg-background border px-3 py-2 rounded-md h-9">
          <Checkbox 
            id="low-stock-filter" 
            checked={filters.lowStock === true}
            onCheckedChange={(checked) => onFilterChange("lowStock", checked === true)}
          />
          <label
            htmlFor="low-stock-filter"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none whitespace-nowrap"
          >
            Düşük Stok
          </label>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
