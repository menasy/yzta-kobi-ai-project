import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Teslimat Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Alıcı</p>
          <p className="text-sm text-muted-foreground">{shipping.full_name}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Telefon</p>
          <p className="text-sm text-muted-foreground">{shipping.phone}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Adres</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {shipping.address}
            <br />
            {shipping.district} / {shipping.city}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
