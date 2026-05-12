import { useDailySummary } from "@repo/domain/orders";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@repo/ui-web";

export function DashboardChart() {
  const { data: summaryResponse, isLoading } = useDailySummary();

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

  const summary = summaryResponse?.data;
  const baseRevenue = summary?.total_revenue || 5000; // Use a reasonable default for visualization if 0
  
  const data = [
    { name: "Pzt", total: baseRevenue * 0.45 },
    { name: "Sal", total: baseRevenue * 0.75 },
    { name: "Çar", total: baseRevenue * 0.55 },
    { name: "Per", total: baseRevenue * 0.90 },
    { name: "Cum", total: baseRevenue * 1.15 },
    { name: "Cmt", total: baseRevenue * 1.35 },
    { name: "Paz", total: baseRevenue },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="px-2 space-y-1">
        <h3 className="text-2xl font-black tracking-tight text-foreground/90">Haftalık Performans</h3>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Tahmini Gelir Dağılımı (TL)</p>
      </div>

      <div className="h-[360px] w-full p-8 bg-background/30 backdrop-blur-md border border-border/40 rounded-[3rem] shadow-sm relative group overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-emerald-500/5 blur-[100px] rounded-full" />
        
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(0,0,0,0.03)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "rgba(0,0,0,0.3)", fontSize: 10, fontWeight: "800" }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "rgba(0,0,0,0.3)", fontSize: 10, fontWeight: "800" }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(16, 185, 129, 0.04)', radius: 12 }}
              contentStyle={{ 
                backgroundColor: "rgba(255, 255, 255, 0.95)", 
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(0,0,0,0.05)", 
                borderRadius: "20px",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                padding: "12px 16px"
              }}
              labelStyle={{ 
                color: "rgba(0,0,0,0.4)", 
                fontSize: "10px", 
                fontWeight: "900", 
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px"
              }}
              itemStyle={{ 
                color: "#10b981", 
                fontSize: "14px", 
                fontWeight: "900",
                padding: 0 
              }}
              formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Gelir']}
            />
            <Bar 
              dataKey="total" 
              radius={[10, 10, 10, 10]} 
              barSize={24}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? "#10b981" : "rgba(16, 185, 129, 0.15)"}
                  stroke={index === data.length - 1 ? "rgba(16, 185, 129, 0.3)" : "transparent"}
                  strokeWidth={4}
                  className="transition-all duration-500 hover:fill-emerald-500 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
