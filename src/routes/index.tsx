import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import logoImg from "@/assets/logo@localway_2KPNG.png";
import { User, ShieldCheck } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { DynamicChart } from "@/components/DynamicChart";
import { AdminAuthModal } from "@/components/AdminAuthModal";
import { AdminPanel } from "@/components/AdminPanel";
import {
  DEFAULT_REPORT_CONFIG,
  type ReportConfig,
  type ExplanationItem,
} from "@/data/default-report";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora de ROI · Espetinho no Trailer | Localway" },
      {
        name: "description",
        content:
          "Calculadora de retorno estimado da gestão do perfil no Google do Espetinho no Trailer, por Localway Soluções Digitais.",
      },
      {
        property: "og:title",
        content: "Calculadora de ROI · Espetinho no Trailer | Localway",
      },
      {
        property: "og:description",
        content:
          "Indicadores do perfil no Google e retorno estimado sobre o investimento (ROI), por Localway Soluções Digitais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculadoraApp,
});

const brl = (v: number) =>
  (Number.isFinite(v) ? v : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
const num = (v: number, d = 1) =>
  (Number.isFinite(v) ? v : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  });
const pct = (v: number) => `${num(v * 100, 1)}%`;

function MoneyInput({
  id,
  label,
  hint,
  cents,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  hint: string;
  cents: number;
  onChange: (c: number) => void;
  tooltip?: ExplanationItem;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {tooltip && <InfoTooltip explanation={tooltip} />}
      </div>
      <input
        id={id}
        inputMode="numeric"
        value={brl(cents / 100)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
        className="mt-2 w-full rounded-lg border border-input bg-card px-4 py-3 font-display text-2xl font-semibold text-navy outline-none transition focus:border-sky focus:ring-4 focus:ring-sky/15"
      />
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function Section({
  title,
  tag,
  tooltip,
  children,
}: {
  title: string;
  tag?: string;
  tooltip?: ExplanationItem;
  children: React.ReactNode;
}) {
  return (
    <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-navy sm:text-2xl">{title}</h2>
          {tooltip && <InfoTooltip explanation={tooltip} />}
        </div>
        {tag && (
          <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky">
            {tag}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function CalculadoraApp() {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_REPORT_CONFIG);
  const [ticketC, setTicketC] = useState<number>(2200);
  const [investC, setInvestC] = useState<number>(10000);

  // Estados de Administração
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // 1. Carrega dados persistidos do servidor / localStorage no carregamento
  useEffect(() => {
    // Tenta obter token salvo na sessão
    const savedToken = sessionStorage.getItem("localway_admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      // Valida token com o backend
      fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then((res) => {
          if (!res.valid) {
            sessionStorage.removeItem("localway_admin_token");
            setAdminToken(null);
          }
        })
        .catch((err) => {
          console.debug("Auth verify failed", err);
        });
    }

    // Busca dados do relatório do servidor
    fetch("/api/report-data")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setConfig(res.data);
          setTicketC(res.data.financial.ticketCents ?? 2200);
          setInvestC(res.data.financial.investCents ?? 10000);
          try {
            localStorage.setItem("localway_report_config", JSON.stringify(res.data));
          } catch (err) {
            console.debug("Local cache write failed", err);
          }
        }
      })
      .catch(() => {
        // Fallback para cache local se servidor não responder
        try {
          const cached = localStorage.getItem("localway_report_config");
          if (cached) {
            const parsed = JSON.parse(cached);
            setConfig(parsed);
            setTicketC(parsed.financial.ticketCents ?? 2200);
            setInvestC(parsed.financial.investCents ?? 10000);
          }
        } catch (err) {
          console.debug("Local cache read failed", err);
        }
      });
  }, []);

  // Lógica de cálculo reativa
  const ticket = ticketC / 100;
  const invest = investC / 100;
  const routes = config.profile.routes;
  const margin = (config.financial.marginPercent || 100) / 100;
  const conversionRate = (config.financial.conversionRatePercent || 10) / 100;

  // Receita potencial atribuída às rotas
  const receita = routes * ticket;
  const retornoLiquido = receita - invest;
  const roiPercent = invest > 0 ? ((receita - invest) / invest) * 100 : 0;

  // Ponto de equilíbrio corrigido tecnicamente
  const lucroPorVenda = ticket * margin;
  const vendasNecessarias = lucroPorVenda > 0 ? Math.ceil(invest / lucroPorVenda) : 0;
  const receitaBreakEven = vendasNecessarias * ticket;
  const rotasNecessarias = conversionRate > 0 ? Math.ceil(vendasNecessarias / conversionRate) : 0;

  // Totais do histórico financeiro
  const totalImplementacao = useMemo(
    () => config.history.implementations.reduce((acc, it) => acc + (it.amount || 0), 0),
    [config.history.implementations],
  );
  const totalRecorrencia = useMemo(
    () => config.history.recurrences.reduce((acc, it) => acc + (it.amount || 0), 0),
    [config.history.recurrences],
  );
  const totalPagoGeral = totalImplementacao + totalRecorrencia;

  // Trata clique no botão administrativo
  const handleAdminClick = () => {
    if (adminToken) {
      setAdminPanelOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleAuthenticated = (token: string) => {
    setAdminToken(token);
    setAdminPanelOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("localway_admin_token");
    setAdminToken(null);
    setAdminPanelOpen(false);
  };

  // Salvar alterações vindas do Painel Administrativo
  const handleSaveConfig = async (newConfig: ReportConfig): Promise<boolean> => {
    try {
      const res = await fetch("/api/report-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ data: newConfig }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfig(newConfig);
        setTicketC(newConfig.financial.ticketCents);
        setInvestC(newConfig.financial.investCents);
        try {
          localStorage.setItem("localway_report_config", JSON.stringify(newConfig));
        } catch (err) {
          console.debug("Local cache write failed", err);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      return false;
    }
  };

  const handleResetConfig = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/report-data/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfig(DEFAULT_REPORT_CONFIG);
        setTicketC(DEFAULT_REPORT_CONFIG.financial.ticketCents);
        setInvestC(DEFAULT_REPORT_CONFIG.financial.investCents);
        try {
          localStorage.setItem("localway_report_config", JSON.stringify(DEFAULT_REPORT_CONFIG));
        } catch (err) {
          console.debug("Local cache write failed", err);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao resetar dados:", err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <img
            src={logoImg}
            alt="Localway"
            className="h-8 w-auto sm:h-9 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo@localway_2KPNG.png";
            }}
          />

          <div className="flex items-center gap-3">
            {/* Botão Salvar PDF / Imprimir */}
            <button
              onClick={() => window.print()}
              className="no-print rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy transition hover:bg-secondary cursor-pointer"
            >
              Imprimir / salvar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-12">
        {/* Identificação do Cliente e Título */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-wider text-sky">
              {config.general.reportTag}
            </p>

            {/* Botão de Acesso Administrativo com Ícone de Usuário */}
            <button
              type="button"
              onClick={handleAdminClick}
              className="no-print inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-navy transition shadow-xs cursor-pointer"
              title="Acesso Administrativo (Localway)"
              aria-label="Acesso Administrativo"
            >
              {adminToken ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-positive" />
                  <span className="font-bold text-navy">Painel Admin</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-sky" />
                  <span>Acesso Admin</span>
                </>
              )}
            </button>
          </div>

          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-5xl">
            {config.general.clientName}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{config.general.reportPeriod}</p>
        </div>

        {/* Parâmetros Editáveis da Simulação */}
        <section className="no-print-border rounded-2xl border border-sky/30 bg-sky-soft p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Parâmetros do cálculo</h2>
            <span className="text-xs font-medium text-sky-700 bg-sky-soft/80 border border-sky/20 rounded-md px-2 py-0.5">
              Simulação interativa
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <MoneyInput
              id="ticket"
              label="Ticket médio estimado por compra"
              hint={config.financial.ticketHint}
              cents={ticketC}
              onChange={setTicketC}
              tooltip={config.explanations.ticket}
            />
            <MoneyInput
              id="invest"
              label="Valor pago pelo cliente no mês"
              hint={config.financial.investHint}
              cents={investC}
              onChange={setInvestC}
              tooltip={config.explanations.invest}
            />
          </div>
        </section>

        {/* Indicadores do Perfil */}
        <Section title="Indicadores do perfil" tag="Dados registrados">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                v: config.profile.views,
                l: "Visualizações do perfil",
                tip: config.explanations.views,
              },
              {
                v: config.profile.interactions,
                l: "Interações registradas",
                tip: config.explanations.interactions,
              },
              {
                v: config.profile.routes,
                l: "Solicitações de rota",
                tip: config.explanations.routes,
              },
              {
                v: config.profile.calls,
                l: "Ligações",
                tip: config.explanations.calls,
              },
            ].map(({ v, l, tip }) => (
              <div
                key={l}
                className="rounded-xl border border-border border-l-4 border-l-sky p-5 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-3xl font-bold text-navy sm:text-4xl">{v}</div>
                  <InfoTooltip explanation={tip} />
                </div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>

          {/* Renderização dos Gráficos Gerenciáveis */}
          <div className="mt-8 space-y-6">
            {config.charts
              .filter((c) => c.visible)
              .sort((a, b) => a.order - b.order)
              .map((chart) => (
                <div key={chart.id} className="rounded-xl border border-border bg-secondary/30 p-5">
                  <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-2.5">
                    <div>
                      <h3 className="font-display text-base font-bold text-navy">{chart.title}</h3>
                      {chart.description && (
                        <p className="text-xs text-muted-foreground">{chart.description}</p>
                      )}
                    </div>
                  </div>
                  <DynamicChart chart={chart} />
                </div>
              ))}

            {/* Métrica complementar de interação */}
            <div className="rounded-xl bg-secondary p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Taxa de interação do perfil
                </div>
                <div className="text-xs text-muted-foreground">
                  Calculada pela proporção de ações realizadas sobre as visualizações (
                  {config.profile.interactions} ÷ {config.profile.views})
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-navy">
                {config.profile.views > 0
                  ? pct(config.profile.interactions / config.profile.views)
                  : "0%"}
              </div>
            </div>
          </div>
        </Section>

        {/* Retorno sobre o Investimento (ROI) */}
        <Section
          title="Retorno sobre o Investimento (ROI)"
          tag="Desempenho"
          tooltip={config.explanations.roi}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Receita atribuída (rotas)
                </span>
                <InfoTooltip explanation={config.explanations.revenue} />
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-navy">{brl(receita)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {routes} solicitações de rota × {brl(ticket)}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Investimento mensal
                </span>
                <InfoTooltip explanation={config.explanations.invest} />
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-navy">{brl(invest)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Recorrência mensal informada</div>
            </div>

            <div className="rounded-xl border border-positive/30 bg-positive-soft p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-positive">ROI Estimado</span>
                <InfoTooltip explanation={config.explanations.roi} />
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-positive">
                {invest > 0 ? `+${num(roiPercent, 1)}%` : "—"}
              </div>
              <div className="mt-1 text-xs font-medium text-positive">
                Retorno líquido de {brl(retornoLiquido)}
              </div>
            </div>
          </div>

          {/* Fórmula e Ponto de Equilíbrio Didático */}
          <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-5 space-y-4">
            <div className="grid gap-6 md:grid-cols-2 md:items-start">
              {/* Fórmula Aplicada */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky">
                  Fórmula aplicada
                </span>
                <p className="mt-1 text-sm font-semibold text-navy font-mono">
                  ROI (%) = [(Receita − Investimento) ÷ Investimento] × 100
                </p>
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  [({brl(receita)} − {brl(invest)}) ÷ {brl(invest)}] × 100 = {num(roiPercent, 1)}%
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Compara a receita potencial diretamente associada ao trabalho no Google com a
                  mensalidade contratada.
                </p>
              </div>

              {/* Ponto de Equilíbrio Reformulado & Explicado */}
              <div className="rounded-xl bg-card p-4 border border-border shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <span>Ponto de Equilíbrio</span>
                    <span className="text-sky font-normal text-[11px]">(Break-even)</span>
                  </div>
                  <InfoTooltip explanation={config.explanations.breakeven} />
                </div>

                <div className="mt-2 font-display text-xl font-bold text-navy">
                  {vendasNecessarias} vendas ({brl(receitaBreakEven)})
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                  <p>
                    • <strong>Vendas necessárias:</strong> {vendasNecessarias} pedidos a{" "}
                    {brl(ticket)} para cobrir o investimento mensal de {brl(invest)}.
                  </p>
                  <p>
                    • <strong>Rotas estimadas necessárias:</strong> aproximadamente{" "}
                    <strong>{rotasNecessarias}</strong> das {routes} solicitações registradas,
                    considerando a taxa de conversão estimada de{" "}
                    {config.financial.conversionRatePercent}%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Histórico Financeiro Fixo / Gerenciado */}
        <Section title="Histórico financeiro" tag="Valores informados">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-foreground">Implementação e Ativos Digitais</h3>
              <dl className="mt-3 divide-y divide-border text-sm">
                {config.history.implementations.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-2 text-foreground">
                    <dt>
                      {item.description}
                      {item.dateOrPeriod && (
                        <span className="block text-xs text-muted-foreground">
                          {item.dateOrPeriod}
                        </span>
                      )}
                    </dt>
                    <dd className="shrink-0 font-medium">{brl(item.amount)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2.5 font-bold text-navy">
                  <dt>Total de implementação</dt>
                  <dd className="shrink-0">{brl(totalImplementacao)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">
                Custos de ativação inicial (não compõem o cálculo da recorrência mensal).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">Recorrência Mensal</h3>
              <dl className="mt-3 divide-y divide-border text-sm">
                {config.history.recurrences.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-2 text-foreground">
                    <dt>
                      {item.dateOrPeriod}
                      {item.note && (
                        <span className="block text-xs text-muted-foreground">{item.note}</span>
                      )}
                    </dt>
                    <dd className="shrink-0 font-medium">{brl(item.amount)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2.5 font-bold text-navy">
                  <dt>Total de recorrência</dt>
                  <dd className="shrink-0">{brl(totalRecorrencia)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-secondary p-5">
            <span className="font-semibold text-foreground">
              Total pago informado, incluindo implementação
            </span>
            <span className="font-display text-2xl font-bold text-navy">{brl(totalPagoGeral)}</span>
          </div>
        </Section>

        {/* Diagnóstico & Recomendações */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-positive flex items-center justify-between">
              <span>Pontos positivos</span>
              <InfoTooltip explanation={config.explanations.reviews} />
            </h2>
            <ul className="space-y-3">
              {config.diagnostics.positivePoints.map((item, i) => (
                <li key={i} className="flex gap-3 text-foreground text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-positive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-navy">Oportunidades de melhoria</h2>
            <ul className="space-y-3">
              {config.diagnostics.improvementPoints.map((item, i) => (
                <li key={i} className="flex gap-3 text-foreground text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {config.diagnostics.notes && (
              <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">
                {config.diagnostics.notes}
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Autenticação para Administrador */}
      <AdminAuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthenticated}
      />

      {/* Painel Administrativo Completo */}
      <AdminPanel
        config={config}
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
        onLogout={handleLogout}
      />
    </div>
  );
}
