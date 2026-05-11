"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  type ProductUpdateFormValues 
} from "@repo/domain/products";
import { useShowSuccess, useShowError } from "@repo/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  ProductForm,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";

interface AdminProductDetailProps {
  productId: string;
}

export function AdminProductDetail({ productId }: AdminProductDetailProps) {
  const router = useRouter();
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  
  const { product, isLoading, error } = useProduct(productId);
  const { updateProductAsync, isPending: isUpdating } = useUpdateProduct();
  const { deleteProductAsync, isPending: isDeleting } = useDeleteProduct();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdate = async (data: ProductUpdateFormValues) => {
    try {
      await updateProductAsync({ id: productId, data });
      showSuccess("Ürün başarıyla güncellendi.");
    } catch (error: any) {
      showError("Hata", error?.message || "Ürün güncellenirken bir hata oluştu.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProductAsync(productId);
      showSuccess("Ürün başarıyla silindi.");
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/products");
    } catch (error: any) {
      showError("Hata", error?.message || "Ürün silinirken bir hata oluştu.");
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold">Ürün Bulunamadı</h3>
        <p className="text-muted-foreground mt-2">
          İstediğiniz ürün silinmiş olabilir veya yüklenirken bir hata oluştu.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/dashboard/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ürün Düzenle</h2>
            <p className="text-muted-foreground">
              {product.name} ürününün bilgilerini güncelleyin.
            </p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Ürünü Sil
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
          <CardDescription>
            Son güncelleme: {new Intl.DateTimeFormat("tr-TR").format(new Date(product.updated_at || product.created_at))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm 
            defaultValues={{
              name: product.name,
              sku: product.sku,
              price: product.price,
              category: product.category,
              description: product.description,
              image_url: product.image_url,
            }}
            onSubmit={handleUpdate} 
            isPending={isUpdating} 
            submitLabel="Değişiklikleri Kaydet"
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü Sil</DialogTitle>
            <DialogDescription>
              Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
