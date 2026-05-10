import { GlobalHeader } from "@/components/navigation/GlobalHeader";

// Minimal admin layout — sidebar ve header sonraki adımda eklenecek
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — sonraki adımda AdminSidebar bileşeni buraya gelecek */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-sidebar-background lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <span className="text-sm font-semibold text-sidebar-foreground">
            KOBİ AI
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {[
            { label: "Dashboard",  href: "/dashboard",  icon: "📊" },
            { label: "Siparişler", href: "/orders",     icon: "📦" },
            { label: "Ürünler",    href: "/products",   icon: "🏷️" },
            { label: "Stok",       href: "/inventory",  icon: "🗃️" },
            { label: "Kargo",      href: "/shipments",  icon: "🚚" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* İçerik alanı */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <GlobalHeader />

        {/* Sayfa içeriği */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
