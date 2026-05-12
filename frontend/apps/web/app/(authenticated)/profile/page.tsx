import React from "react";
import { Metadata } from "next";
import { ProfileForm, AddressForm, PageShell, ResponsiveSection } from "@repo/ui-web";
import { Settings, Shield, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Profil Ayarları | KobiAi",
  description: "Kullanıcı profil ayarları ve varsayılan adres yönetimi.",
};

export default function ProfilePage() {
  return (
    <PageShell>
      <ResponsiveSection className="pt-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-[0.2em]">
              <Settings className="h-4 w-4" />
              Hesap Yönetimi
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Profil Ayarları
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Kişisel bilgilerinizi, güvenlik tercihlerinizi ve varsayılan teslimat adresinizi buradan tek bir yerden yönetebilirsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Sol Kolon: Profil Bilgileri */}
          <div className="space-y-10 flex flex-col">
            <div className="relative group flex-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <ProfileForm />
            </div>
            
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 mt-10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Veri Güvenliği</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Kişisel verileriniz KVKK uyumlu sunucularımızda şifrelenmiş olarak saklanır. İstediğiniz zaman verilerinizi güncelleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Adres Bilgileri */}
          <div className="flex flex-col">
            <div className="relative group h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <AddressForm />
            </div>
          </div>
        </div>
      </ResponsiveSection>
    </PageShell>
  );
}
