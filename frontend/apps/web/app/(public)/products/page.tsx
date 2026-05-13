import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";
import { CustomerProductList } from "./_components/CustomerProductList";


export const metadata: Metadata = {
  title: "Ürünler | KOBİ AI",
  description: "Tüm ürünlerimizi inceleyin ve sipariş verin.",
};

export default function ProductsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="pt-10 pb-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Ürün <span className="text-primary">Kataloğumuz</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            En kaliteli ürünlerimizi keşfedin ve işletmenizin ihtiyaçlarını en uygun fiyatlarla karşılayın.
          </p>
        </div>
        
        <CustomerProductList />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
