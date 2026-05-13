"use client";

import { useRouter } from "next/navigation";
import { useCreateProduct, type ProductCreateFormValues } from "@repo/domain/products";
import { useShowSuccess, useShowError } from "@repo/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  ProductForm,
} from "@repo/ui-web";
import { ArrowLeft } from "lucide-react";

export function AdminProductCreate() {
  const router = useRouter();
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const { createProductAsync, isPending } = useCreateProduct();

  const handleSubmit = async (data: ProductCreateFormValues) => {
    try {
      await createProductAsync(data);
      showSuccess("Ürün başarıyla oluşturuldu.");
      router.push("/dashboard/products");
    } catch (error: any) {
      showError("Hata", error?.message || "Ürün oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yeni Ürün Ekle</h2>
          <p className="text-muted-foreground">
            Kataloğa yeni bir ürün eklemek için aşağıdaki formu doldurun.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
          <CardDescription>
            Tüm alanları eksiksiz doldurmaya özen gösterin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm 
            onSubmit={handleSubmit} 
            isPending={isPending} 
            submitLabel="Ürünü Oluştur"
          />
        </CardContent>
      </Card>
    </div>
  );
}
