"use client";

import { cn } from "@repo/core";
import type { AiInsight } from "@repo/domain/ai-actions";

import { Card, CardContent, CardHeader, CardTitle } from "../shadcn/card";
import { Badge } from "../shadcn/badge";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AiInsightCardProps {
  insight: AiInsight;
  className?: string;
}

export function AiInsightCard({ insight, className }: AiInsightCardProps) {
  const hasCandidates = insight.candidates && insight.candidates.length > 0;
  
  return (
    <Card
      className={cn(
        "border-amber-200/50 bg-amber-50/30 shadow-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/20",
        className,
      )}
    >
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1.5 px-2.5 py-1 text-[11px]">
            <Lightbulb className="h-3 w-3" />
            AI İçgörüsü
          </Badge>
          {insight.page && (
            <Badge variant="outline" className="px-2.5 py-1 text-[11px] capitalize">
              {insight.page}
            </Badge>
          )}
        </div>
        {insight.dataQualityNote && (
          <div className="text-xs text-muted-foreground italic">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insight.dataQualityNote}
            </ReactMarkdown>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {hasCandidates ? (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Önerilen Ürünler ({insight.candidates?.length})</h4>
            <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-2">
              {insight.candidates?.map((candidate, idx) => (
                <div key={idx} className="bg-background rounded-md p-2 text-xs border border-border/50 flex flex-col gap-1">
                  <div className="font-medium">{String(candidate.product_name || candidate.product_id || "Ürün")}</div>
                  <div className="text-muted-foreground flex flex-wrap gap-2">
                    {Object.entries(candidate).filter(([k]) => k !== "product_name" && k !== "product_id").map(([k, v]) => (
                      <span key={k} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
            {Object.entries(insight).filter(([k]) => k !== "dataQualityNote" && k !== "page").map(([k, v]) => (
              <div key={k} className="mb-2">
                <span className="font-medium capitalize">{k}:</span>{" "}
                <div className="text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
