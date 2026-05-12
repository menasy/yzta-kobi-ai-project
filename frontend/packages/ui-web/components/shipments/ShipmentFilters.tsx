"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import type { ShipmentStatus, Carrier } from "@repo/domain/shipments";

interface ShipmentFiltersProps {
  statusFilter: ShipmentStatus | "all";
  setStatusFilter: (status: ShipmentStatus | "all") => void;
  carrierFilter: Carrier | "all";
  setCarrierFilter: (carrier: Carrier | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ShipmentFilters({
  statusFilter,
  setStatusFilter,
  carrierFilter,
  setCarrierFilter,
  searchQuery,
  setSearchQuery,
}: ShipmentFiltersProps) {
  const hasFilters = statusFilter !== "all" || carrierFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setCarrierFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-background/40 p-3 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-lg">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Takip Numarası veya Sipariş ID ile ara..."
          className="pl-11 h-12 bg-background/50 border-white/5 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
          <SelectTrigger className="w-full sm:w-[160px] h-12 bg-background/50 border-white/5 rounded-2xl focus:ring-primary/20">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Durum" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl">
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="created">Oluşturuldu</SelectItem>
            <SelectItem value="in_transit">Yolda</SelectItem>
            <SelectItem value="delivered">Teslim Edildi</SelectItem>
            <SelectItem value="delayed">Gecikti</SelectItem>
            <SelectItem value="failed">Başarısız</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
 
        <Select value={carrierFilter} onValueChange={(val: any) => setCarrierFilter(val)}>
          <SelectTrigger className="w-full sm:w-[160px] h-12 bg-background/50 border-white/5 rounded-2xl focus:ring-primary/20">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Firma" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl">
            <SelectItem value="all">Tüm Firmalar</SelectItem>
            <SelectItem value="YURTICI">Yurtiçi Kargo</SelectItem>
            <SelectItem value="ARAS">Aras Kargo</SelectItem>
            <SelectItem value="MNG">MNG Kargo</SelectItem>
            <SelectItem value="SURAT">Sürat Kargo</SelectItem>
            <SelectItem value="PTT">PTT Kargo</SelectItem>
          </SelectContent>
        </Select>
 
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Filtreleri Temizle"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Local helper import because Truck is missing in the scope above
import { Truck } from "lucide-react";
