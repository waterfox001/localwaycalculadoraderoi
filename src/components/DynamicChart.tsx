import { useMemo } from "react";
import type { ChartConfig } from "@/data/default-report";

interface DynamicChartProps {
  chart: ChartConfig;
}

export function DynamicChart({ chart }: { chart: ChartConfig }) {
  const { title, description, type, items } = chart;

  const validItems = useMemo(
    () => items.filter((it) => typeof it.value === "number" && !isNaN(it.value)),
    [items],
  );

  const total = useMemo(
    () => validItems.reduce((acc, it) => acc + (it.value || 0), 0),
    [validItems],
  );

  if (!chart.visible) {
    return null;
  }

  if (validItems.length === 0 || total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-navy">{title}</p>
        <p className="mt-1 text-xs">Nenhum dado cadastrado para este gráfico no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gráfico Donut */}
      {type === "donut" && (
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <svg
              viewBox="0 0 180 180"
              className="h-44 w-44 shrink-0 -rotate-90"
              role="img"
              aria-label={title}
            >
              {(() => {
                const r = 70;
                const C = 2 * Math.PI * r;
                let accumulatedOffset = 0;

                return (
                  <>
                    <circle
                      cx="90"
                      cy="90"
                      r={r}
                      fill="none"
                      stroke="var(--sky-soft)"
                      strokeWidth="28"
                    />
                    {validItems.map((item) => {
                      const share = total > 0 ? item.value / total : 0;
                      const dashLength = share * C;
                      const strokeDashoffset = -accumulatedOffset;
                      accumulatedOffset += dashLength;

                      return (
                        <circle
                          key={item.id}
                          cx="90"
                          cy="90"
                          r={r}
                          fill="none"
                          stroke={item.color || "var(--navy)"}
                          strokeWidth="28"
                          strokeDasharray={`${dashLength} ${C}`}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                    <g className="rotate-90" style={{ transformOrigin: "90px 90px" }}>
                      <text
                        x="90"
                        y="92"
                        textAnchor="middle"
                        className="fill-navy font-display text-[26px] font-bold"
                      >
                        {total}
                      </text>
                      <text
                        x="90"
                        y="112"
                        textAnchor="middle"
                        className="fill-muted-foreground text-[11px]"
                      >
                        total
                      </text>
                    </g>
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="space-y-3">
            {validItems.map((item) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <span
                    className="mt-1 h-3.5 w-3.5 shrink-0 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="font-bold text-navy">{item.value}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{pct}% do total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico de Barras Horizontais */}
      {type === "bar" && (
        <div className="space-y-3">
          {validItems.map((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="font-bold text-navy">
                    {item.value}{" "}
                    <span className="font-normal text-xs text-muted-foreground">({pct}%)</span>
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-md bg-secondary">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color || "var(--navy)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gráfico de Pizza (Pie) */}
      {type === "pie" && (
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <svg
              viewBox="0 0 180 180"
              className="h-44 w-44 shrink-0 -rotate-90"
              role="img"
              aria-label={title}
            >
              {(() => {
                const r = 45;
                const C = 2 * Math.PI * r;
                let accumulatedOffset = 0;

                return (
                  <>
                    {validItems.map((item) => {
                      const share = total > 0 ? item.value / total : 0;
                      const dashLength = share * C;
                      const strokeDashoffset = -accumulatedOffset;
                      accumulatedOffset += dashLength;

                      return (
                        <circle
                          key={item.id}
                          cx="90"
                          cy="90"
                          r={r}
                          fill="none"
                          stroke={item.color || "var(--navy)"}
                          strokeWidth="90"
                          strokeDasharray={`${dashLength} ${C}`}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="space-y-3">
            {validItems.map((item) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <span
                    className="mt-1 h-3.5 w-3.5 shrink-0 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="font-bold text-navy">{item.value}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{pct}% do total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
