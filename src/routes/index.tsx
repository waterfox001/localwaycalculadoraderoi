import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import logoImg from "@/assets/logo@localway_2KPNG.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora de ROI · Espetinho no Trailer | Localway" },
      {
        name: "description",
        content:
          "Calculadora de retorno estimado da gestão do perfil no Google do Espetinho no Trailer, por Localway Soluções Digitais.",
      },
      { property: "og:title", content: "Calculadora de ROI · Espetinho no Trailer | Localway" },
      {
        property: "og:description",
        content:
          "Indicadores do perfil no Google e retorno estimado sobre o investimento (ROI), por Localway Soluções Digitais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Calculadora,
});

// Dados fixos do perfil
const VIEWS = 430;
const ROUTES = 194;
const CALLS = 14;
const INTERACTIONS = ROUTES + CALLS;
const REVIEWS = 2;

const brl = (v: number) =>
  (Number.isFinite(v) ? v : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, d = 1) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: d });
const pct = (v: number) => `${num(v * 100, 1)}%`;

function MoneyInput({
  id,
  label,
  hint,
  cents,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  cents: number;
  onChange: (c: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
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
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-navy sm:text-2xl">{title}</h2>
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

function Donut() {
  const r = 70;
  const C = 2 * Math.PI * r;
  const share = ROUTES / INTERACTIONS;
  return (
    <svg
      viewBox="0 0 180 180"
      className="h-44 w-44 shrink-0 -rotate-90"
      role="img"
      aria-label="Composição das interações"
    >
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--sky)" strokeWidth="28" />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--navy)"
        strokeWidth="28"
        strokeDasharray={`${share * C} ${C}`}
      />
      <g className="rotate-90" style={{ transformOrigin: "90px 90px" }}>
        <text
          x="90"
          y="92"
          textAnchor="middle"
          className="fill-navy font-display text-[26px] font-bold"
        >
          {INTERACTIONS}
        </text>
        <text x="90" y="112" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          interações
        </text>
      </g>
    </svg>
  );
}

function Calculadora() {
  const [ticketC, setTicketC] = useState(2200);
  const [investC, setInvestC] = useState(10000);
  const ticket = ticketC / 100;
  const invest = investC / 100;

  // Cálculo de receita e ROI direto
  const receita = ROUTES * ticket;
  const retornoLiquido = receita - invest;
  const roiPercent = invest > 0 ? ((receita - invest) / invest) * 100 : 0;
  const comprasEquilibrio = ticket > 0 ? Math.ceil(invest / ticket) : 0;
  const receitaEquilibrio = comprasEquilibrio * ticket;

  return (
    <div className="min-h-screen bg-background">
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
          <button
            onClick={() => window.print()}
            className="no-print rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy transition hover:bg-secondary cursor-pointer"
          >
            Imprimir / salvar PDF
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-sky">Calculadora de ROI</p>
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-5xl">Espetinho no Trailer</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Perfil no Google · indicadores de maio a outubro de 2026
          </p>
        </div>

        {/* Parâmetros Editáveis */}
        <section className="no-print-border rounded-2xl border border-sky/30 bg-sky-soft p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold text-navy">Parâmetros do cálculo</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <MoneyInput
              id="ticket"
              label="Ticket médio estimado por compra"
              hint="Dois espetinhos de R$ 9,00 + refrigerante de R$ 4,00 (estimativa padrão)."
              cents={ticketC}
              onChange={setTicketC}
            />
            <MoneyInput
              id="invest"
              label="Valor pago pelo cliente no mês"
              hint="Recorrência efetivamente paga no mês analisado."
              cents={investC}
              onChange={setInvestC}
            />
          </div>
        </section>

        {/* Indicadores do Perfil */}
        <Section title="Indicadores do perfil" tag="Dados registrados">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              [VIEWS, "Visualizações do perfil"],
              [INTERACTIONS, "Interações registradas"],
              [ROUTES, "Solicitações de rota"],
              [CALLS, "Ligações"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-border border-l-4 border-l-sky p-5">
                <div className="font-display text-3xl font-bold text-navy sm:text-4xl">{v}</div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <Donut />
            <div className="space-y-5">
              {[
                ["bg-navy", "Solicitações de rota", ROUTES],
                ["bg-sky", "Ligações", CALLS],
              ].map(([c, l, v]) => (
                <div key={l as string} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-3.5 w-3.5 rounded ${c}`} />
                  <div>
                    <div className="font-semibold text-foreground">{l}</div>
                    <div className="text-muted-foreground">
                      {v} · {pct((v as number) / INTERACTIONS)} das interações
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl bg-secondary p-4">
                <div className="font-display text-2xl font-bold text-navy">
                  {pct(INTERACTIONS / VIEWS)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Taxa de interação do perfil (interações ÷ visualizações: {INTERACTIONS} ÷ {VIEWS}
                  ).
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Retorno sobre o Investimento (ROI) */}
        <Section title="Retorno sobre o Investimento (ROI)" tag="Desempenho">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm font-medium text-muted-foreground">
                Receita atribuída (rotas)
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-navy">{brl(receita)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {ROUTES} solicitações de rota × {brl(ticket)}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm font-medium text-muted-foreground">Investimento mensal</div>
              <div className="mt-2 font-display text-3xl font-bold text-navy">{brl(invest)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Recorrência mensal informada</div>
            </div>

            <div className="rounded-xl border border-positive/30 bg-positive-soft p-5">
              <div className="text-sm font-semibold text-positive">ROI Estimado</div>
              <div className="mt-2 font-display text-3xl font-bold text-positive">
                {invest > 0 ? `+${num(roiPercent, 1)}%` : "—"}
              </div>
              <div className="mt-1 text-xs font-medium text-positive">
                Retorno líquido de {brl(retornoLiquido)}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-5">
            <div className="grid gap-4 md:grid-cols-2 md:items-center">
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
              </div>

              <div className="rounded-lg bg-card p-4 border border-border md:text-right">
                <div className="text-xs font-medium text-muted-foreground">
                  Ponto de equilíbrio (Break-even)
                </div>
                <div className="mt-0.5 font-display text-xl font-bold text-navy">
                  {comprasEquilibrio} compras ({brl(receitaEquilibrio)})
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Basta {pct(ROUTES > 0 ? comprasEquilibrio / ROUTES : 0)} das solicitações de rota
                  para cobrir a mensalidade
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Histórico Financeiro Fixo */}
        <Section title="Histórico financeiro" tag="Valores informados">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-foreground">Implementação · julho de 2026</h3>
              <dl className="mt-3 divide-y divide-border text-sm">
                <Row k="Implementação e configuração" v={1350} />
                <Row k="Implementação e configuração" v={570} />
                <Row k="Total de implementação" v={1920} strong />
              </dl>
              <p className="mt-2 text-sm text-muted-foreground">
                Não entra no cálculo mensal da recorrência.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Recorrência</h3>
              <dl className="mt-3 divide-y divide-border text-sm">
                <Row k="Julho de 2026 (início em 17/07/2026)" v={100} />
                <Row k="Agosto de 2026" v={100} />
                <Row k="Setembro de 2026" v={250} />
                <Row k="Total de recorrência" v={450} strong />
              </dl>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-secondary p-5">
            <span className="font-semibold text-foreground">
              Total pago informado, incluindo implementação
            </span>
            <span className="font-display text-2xl font-bold text-navy">{brl(2370)}</span>
          </div>
        </Section>

        {/* Diagnóstico */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-positive">Pontos positivos</h2>
            <List
              color="bg-positive"
              items={[
                "Perfil visualmente atrativo",
                `${REVIEWS} avaliações com nota máxima de 5 estrelas`,
                `${ROUTES} solicitações de rota`,
                `${CALLS} ligações registradas`,
              ]}
            />
          </section>
          <section className="print-break rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-navy">Oportunidades de melhoria</h2>
            <List
              color="bg-sky"
              items={[
                "Conseguir mais avaliações autênticas",
                "Atualizar o cardápio",
                "Produzir fotos próprias dos espetinhos e acompanhamentos",
                "Registrar como os clientes conheceram o estabelecimento",
                "Confirmar se o mini site já está publicado",
              ]}
            />
            <p className="mt-4 text-sm text-muted-foreground">Instagram: canal opcional.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: number; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 py-2.5 ${strong ? "font-bold text-navy" : "text-foreground"}`}
    >
      <dt>{k}</dt>
      <dd className="shrink-0">{brl(v)}</dd>
    </div>
  );
}

function List({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-foreground">
          <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${color}`} />
          {i}
        </li>
      ))}
    </ul>
  );
}
