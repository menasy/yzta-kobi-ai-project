import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
import { MapPin, User, Phone, Home } from "lucide-react";
import type { OrderShipping } from "@repo/domain/orders";

interface OrderShippingInfoProps {
  shipping?: OrderShipping | null;
}

export function OrderShippingInfo({ shipping }: OrderShippingInfoProps) {
  if (!shipping) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teslimat Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Teslimat bilgisi bulunamadı.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden rounded-xl">
      <CardHeader className="bg-muted/10 border-b border-border/40 pb-5 p-5 sm:p-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Teslimat Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 grid gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-primary/5 rounded-md text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Alıcı</p>
            <p className="font-medium text-foreground">{shipping.full_name}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-primary/5 rounded-md text-primary">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Telefon</p>
            <p className="font-medium text-foreground">{shipping.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:col-span-2">
          <div className="mt-0.5 p-2 bg-primary/5 rounded-md text-primary">
            <Home className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Adres</p>
            <p className="font-medium text-foreground leading-relaxed">
              {shipping.address}
            </p>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {shipping.district} / {shipping.city}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
