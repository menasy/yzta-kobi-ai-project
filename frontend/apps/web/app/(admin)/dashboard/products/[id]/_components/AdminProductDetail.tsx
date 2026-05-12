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
import { ArrowLeft, Trash2, AlertTriangle, Box, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@repo/core";

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
      <div className="space-y-6 max-w-2xl mx-auto py-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card className="border-none bg-card/40 backdrop-blur-md">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 px-4">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Ürün Bulunamadı</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          İstediğiniz ürün silinmiş olabilir veya yüklenirken bir hata oluştu.
        </p>
        <Button 
          variant="outline" 
          className="rounded-xl px-8" 
          onClick={() => router.back()}
        >
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto py-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/dashboard/products")}
            className="h-10 w-10 rounded-xl bg-background shadow-sm hover:bg-muted border border-border/40"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Box className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Katalog Yönetimi</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Ürün Düzenle</h2>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Ürünü Sil
        </Button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur opacity-25 transition duration-1000 group-hover:opacity-40"></div>
        <Card className="relative border-none bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/[0.03] py-6 px-8 border-b border-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Ürün Bilgileri</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  Güncelleme: {new Intl.DateTimeFormat("tr-TR").format(new Date(product.updated_at || product.created_at))}
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Box className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
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
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" /> Ürünü Sil
            </DialogTitle>
            <DialogDescription className="text-sm font-medium pt-2">
              <strong className="text-foreground">"{product.name}"</strong> ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              disabled={isDeleting}
              className="rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 font-bold text-xs uppercase tracking-wider px-8"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
