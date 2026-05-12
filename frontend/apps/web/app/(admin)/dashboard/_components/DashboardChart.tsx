import { formatCurrency } from "@repo/core";
import type { WeeklyPerformanceItem } from "@repo/domain/orders";
import { Skeleton } from "@repo/ui-web";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface DashboardChartProps {
  performance: WeeklyPerformanceItem[];
  currency: string;
  isLoading: boolean;
  error: unknown;
}

export function DashboardChart({
  performance,
  currency,
  isLoading,
  error,
}: DashboardChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 px-2">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-[2.5rem]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/10 bg-destructive/5 rounded-2xl text-destructive text-xs font-bold uppercase tracking-wider">
        Haftalık performans verisi yüklenemedi.
      </div>
    );
  }

  const data = performance.map((item) => ({
    name: item.label,
    total: item.revenue,
    orderCount: item.order_count,
  }));
  const hasData = data.some((item) => item.total > 0 || item.orderCount > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="px-2 space-y-1">
        <h3 className="text-2xl font-black tracking-tight text-foreground/90">Haftalık Performans</h3>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Gerçek Gelir Dağılımı ({currency})</p>
      </div>

      <div className="h-[360px] w-full p-8 bg-background/30 backdrop-blur-md border border-border/40 rounded-[3rem] shadow-sm relative group overflow-hidden">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Son 7 gün için performans verisi yok.
            </p>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "800" }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "800" }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: "hsl(var(--accent))", radius: 12 }}
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(var(--border))",
                borderRadius: "20px",
                boxShadow: "0 20px 40px -10px hsl(var(--foreground) / 0.1)",
                padding: "12px 16px"
              }}
              labelStyle={{ 
                color: "hsl(var(--muted-foreground))",
                fontSize: "10px", 
                fontWeight: "900", 
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px"
              }}
              itemStyle={{ 
                color: "hsl(var(--primary))",
                fontSize: "14px", 
                fontWeight: "900",
                padding: 0 
              }}
              formatter={(value) => [
                formatCurrency(Number(value), "tr-TR", currency),
                "Gelir",
              ]}
            />
            <Bar 
              dataKey="total" 
              radius={[10, 10, 10, 10]} 
              barSize={24}
              animationDuration={1500}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? "hsl(var(--chart-1))" : "hsl(var(--chart-1) / 0.2)"}
                  stroke={index === data.length - 1 ? "hsl(var(--chart-1) / 0.35)" : "transparent"}
                  strokeWidth={4}
                  className="cursor-pointer transition-all duration-500 hover:fill-primary"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
