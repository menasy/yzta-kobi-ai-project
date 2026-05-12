"use client";

import { useState } from "react";
import { useShipments } from "@repo/domain/shipments";
import type { ShipmentStatus, Carrier, ShipmentListParams } from "@repo/domain/shipments";
import { ShipmentSummaryCards } from "./ShipmentSummaryCards";
import { DelayedShipmentsPanel } from "./DelayedShipmentsPanel";
import { ShipmentFilters } from "./ShipmentFilters";
import { ShipmentTable } from "./ShipmentTable";
import { CreateShipmentDialog } from "./CreateShipmentDialog";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ShipmentPageContent() {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [carrierFilter, setCarrierFilter] = useState<Carrier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const params: ShipmentListParams = {
    status: statusFilter === "all" ? undefined : statusFilter,
    carrier: carrierFilter === "all" ? undefined : carrierFilter,
    // Note: Backend might not support free text search query on `getShipments` out of the box unless specified. 
    // We will do a client-side filter for tracking number/order id if search is used, or pass it to API if API supports `search`.
    // Let's assume client side filter for search query for robustness if backend doesn't support it in params yet.
  };

  const { shipments, isLoading, error } = useShipments(params);

  // Client side search filter logic if backend does not filter by search text natively
  const filteredShipments = shipments?.filter((shipment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const trackingMatch = shipment.tracking_number.toLowerCase().includes(query);
    const orderMatch = String(shipment.order_id).toLowerCase().includes(query);
    return trackingMatch || orderMatch;
  }) || [];

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <h2 className="text-4xl font-black tracking-tighter text-foreground">Kargo Yönetimi</h2>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Tüm sevkiyat ve kargo süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>
        <div>
          <CreateShipmentDialog />
        </div>
      </motion.div>

      <ShipmentSummaryCards />
      
      <DelayedShipmentsPanel />

      <ShipmentFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        carrierFilter={carrierFilter}
        setCarrierFilter={setCarrierFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {error ? (
        <div className="p-5 border border-destructive/10 bg-destructive/5 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium mt-4">
          <AlertCircle className="h-5 w-5" />
          Kargo listesi yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.
        </div>
      ) : (
        <ShipmentTable shipments={filteredShipments} isLoading={isLoading} />
      )}
    </div>
  );
}
