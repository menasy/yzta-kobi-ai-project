"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn/dialog";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import { useCreateShipment } from "@repo/domain/shipments";
import type { Carrier } from "@repo/domain/shipments";
import { Plus, Loader2 } from "lucide-react";

export function CreateShipmentDialog() {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [carrier, setCarrier] = useState<Carrier | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { createShipmentAsync, isPending } = useCreateShipment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !carrier) return;
    setErrorMessage(null);

    try {
      await createShipmentAsync({
        order_id: Number(orderId),
        carrier: carrier as Carrier,
        tracking_number: trackingNumber || undefined,
      });
      setOpen(false);
      // Reset form
      setOrderId("");
      setCarrier("");
      setTrackingNumber("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sevkiyat oluşturulamadı.";
      setErrorMessage(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Yeni Sevkiyat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Yeni Sevkiyat Oluştur</DialogTitle>
          <DialogDescription>
            Bir sipariş için yeni kargo/sevkiyat kaydı oluşturun. Sipariş ID ve kargo firması zorunludur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Sipariş ID <span className="text-destructive">*</span></Label>
              <Input
                id="orderId"
                placeholder="Örn: 1024"
                type="number"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carrier">Kargo Firması <span className="text-destructive">*</span></Label>
              <Select value={carrier} onValueChange={(val: any) => setCarrier(val)} required>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Firma seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YURTICI">Yurtiçi Kargo</SelectItem>
                  <SelectItem value="ARAS">Aras Kargo</SelectItem>
                  <SelectItem value="MNG">MNG Kargo</SelectItem>
                  <SelectItem value="SURAT">Sürat Kargo</SelectItem>
                  <SelectItem value="PTT">PTT Kargo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Takip Numarası</Label>
              <Input
                id="trackingNumber"
                placeholder="Örn: 1Z9999999999999999"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-background/50 border-white/10"
              />
              <p className="text-[10px] text-muted-foreground">İsteğe bağlı. Daha sonra da eklenebilir.</p>
            </div>
          </div>
          {errorMessage ? (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          ) : null}
          
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending || !orderId || !carrier}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
