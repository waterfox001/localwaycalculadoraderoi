import { useState } from "react";
import {
  Save,
  RotateCcw,
  X,
  LogOut,
  Plus,
  Trash2,
  Building,
  BarChart3,
  DollarSign,
  HelpCircle,
  Clock,
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type {
  ReportConfig,
  ChartConfig,
  HistoryItem,
  ExplanationItem,
} from "@/data/default-report";
import { DEFAULT_REPORT_CONFIG } from "@/data/default-report";

type TabId =
  "general" | "profile" | "financial" | "charts" | "explanations" | "history" | "diagnostics";

interface AdminPanelProps {
  config: ReportConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: ReportConfig) => Promise<boolean>;
  onReset: () => Promise<boolean>;
  onLogout: () => void;
}

export function AdminPanel({
  config: initialConfig,
  isOpen,
  onClose,
  onSave,
  onReset,
  onLogout,
}: AdminPanelProps) {
  const [form, setForm] = useState<ReportConfig>(() => JSON.parse(JSON.stringify(initialConfig)));
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!isOpen) return null;

  // Handlers para atualizar campos específicos
  const updateGeneral = (field: keyof ReportConfig["general"], value: string) => {
    setForm((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const updateProfile = (field: keyof ReportConfig["profile"], value: number) => {
    setForm((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const updateFinancial = (field: keyof ReportConfig["financial"], value: number | string) => {
    setForm((prev) => ({
      ...prev,
      financial: { ...prev.financial, [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await onSave(form);
    setIsSaving(false);
    if (ok) {
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
  };

  const handleConfirmReset = async () => {
    setIsSaving(true);
    const ok = await onReset();
    setIsSaving(false);
    setConfirmResetOpen(false);
    if (ok) {
      setForm(JSON.parse(JSON.stringify(DEFAULT_REPORT_CONFIG)));
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
  };

  // Funções para gerenciar Histórico
  const addImplementation = () => {
    const newItem: HistoryItem = {
      id: `imp-${Date.now()}`,
      description: "Nova implementação",
      dateOrPeriod: "Julho de 2026",
      amount: 100,
    };
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        implementations: [...prev.history.implementations, newItem],
      },
    }));
  };

  const removeImplementation = (id: string) => {
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        implementations: prev.history.implementations.filter((it) => it.id !== id),
      },
    }));
  };

  const updateImplementation = (id: string, field: keyof HistoryItem, val: string | number) => {
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        implementations: prev.history.implementations.map((it) =>
          it.id === id ? { ...it, [field]: val } : it,
        ),
      },
    }));
  };

  const addRecurrence = () => {
    const newItem: HistoryItem = {
      id: `rec-${Date.now()}`,
      description: "Recorrência mensal",
      dateOrPeriod: "Mês de referência",
      amount: 100,
    };
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        recurrences: [...prev.history.recurrences, newItem],
      },
    }));
  };

  const removeRecurrence = (id: string) => {
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        recurrences: prev.history.recurrences.filter((it) => it.id !== id),
      },
    }));
  };

  const updateRecurrence = (id: string, field: keyof HistoryItem, val: string | number) => {
    setForm((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        recurrences: prev.history.recurrences.map((it) =>
          it.id === id ? { ...it, [field]: val } : it,
        ),
      },
    }));
  };

  // Funções para gerenciar Gráficos
  const addChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title: "Novo Gráfico",
      description: "Descrição do gráfico",
      type: "donut",
      visible: true,
      order: form.charts.length + 1,
      items: [
        { id: `it-1`, label: "Categoria A", value: 100, color: "var(--navy)" },
        { id: `it-2`, label: "Categoria B", value: 50, color: "var(--sky)" },
      ],
    };
    setForm((prev) => ({ ...prev, charts: [...prev.charts, newChart] }));
  };

  const removeChart = (id: string) => {
    setForm((prev) => ({
      ...prev,
      charts: prev.charts.filter((c) => c.id !== id),
    }));
  };

  const updateChart = (id: string, field: keyof ChartConfig, val: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      charts: prev.charts.map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    }));
  };

  const addChartItem = (chartId: string) => {
    setForm((prev) => ({
      ...prev,
      charts: prev.charts.map((c) => {
        if (c.id !== chartId) return c;
        return {
          ...c,
          items: [
            ...c.items,
            {
              id: `item-${Date.now()}`,
              label: "Nova fatia",
              value: 10,
              color: "var(--navy)",
            },
          ],
        };
      }),
    }));
  };

  const removeChartItem = (chartId: string, itemId: string) => {
    setForm((prev) => ({
      ...prev,
      charts: prev.charts.map((c) => {
        if (c.id !== chartId) return c;
        return { ...c, items: c.items.filter((it) => it.id !== itemId) };
      }),
    }));
  };

  const updateChartItem = (
    chartId: string,
    itemId: string,
    field: string,
    val: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      charts: prev.charts.map((c) => {
        if (c.id !== chartId) return c;
        return {
          ...c,
          items: c.items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)),
        };
      }),
    }));
  };

  // Funções para gerenciar Explicações (?)
  const updateExplanation = (key: string, field: keyof ExplanationItem, val: string) => {
    setForm((prev) => ({
      ...prev,
      explanations: {
        ...prev.explanations,
        [key]: {
          ...(prev.explanations[key] ?? { key, term: "", description: "" }),
          [field]: val,
        },
      },
    }));
  };

  const addExplanation = () => {
    const key = `custom-${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      explanations: {
        ...prev.explanations,
        [key]: {
          key,
          term: "Novo Termo",
          description: "Explicação clara e didática deste indicador.",
        },
      },
    }));
  };

  const removeExplanation = (key: string) => {
    setForm((prev) => {
      const nextExp = { ...prev.explanations };
      delete nextExp[key];
      return { ...prev, explanations: nextExp };
    });
  };

  // Funções para gerenciar Diagnóstico (Pontos Positivos e Melhorias)
  const addPoint = (type: "positivePoints" | "improvementPoints") => {
    setForm((prev) => ({
      ...prev,
      diagnostics: {
        ...prev.diagnostics,
        [type]: [...prev.diagnostics[type], "Novo ponto registrado"],
      },
    }));
  };

  const removePoint = (type: "positivePoints" | "improvementPoints", index: number) => {
    setForm((prev) => ({
      ...prev,
      diagnostics: {
        ...prev.diagnostics,
        [type]: prev.diagnostics[type].filter((_, i) => i !== index),
      },
    }));
  };

  const updatePoint = (
    type: "positivePoints" | "improvementPoints",
    index: number,
    val: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      diagnostics: {
        ...prev.diagnostics,
        [type]: prev.diagnostics[type].map((item, i) => (i === index ? val : item)),
      },
    }));
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden text-foreground">
      {/* Top Header do Painel */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-navy flex items-center gap-2">
              Painel Administrativo
              <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-semibold text-sky">
                Localway
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Gerencie todas as informações, gráficos, indicadores e cálculos do relatório.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-positive bg-positive-soft px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvo com sucesso!
            </span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white shadow hover:bg-navy/90 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-navy transition cursor-pointer"
            title="Restaurar valores de fábrica"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restaurar Padrão</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-alert/30 bg-alert-soft px-3 py-2 text-xs font-semibold text-alert hover:bg-alert/15 transition cursor-pointer"
            title="Sair do modo administrativo"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-navy transition cursor-pointer"
            title="Fechar painel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Navegação por Abas */}
      <div className="border-b border-border bg-card px-4 sm:px-8 overflow-x-auto">
        <nav className="flex space-x-2 py-2">
          {[
            { id: "general", label: "Dados Gerais", icon: Building },
            { id: "profile", label: "Indicadores Google", icon: BarChart3 },
            { id: "financial", label: "Financeiro & ROI", icon: DollarSign },
            { id: "charts", label: "Gráficos", icon: PieChart },
            { id: "explanations", label: "Explicações (?)", icon: HelpCircle },
            { id: "history", label: "Histórico Financeiro", icon: Clock },
            { id: "diagnostics", label: "Diagnóstico", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-navy text-white shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-navy"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* 1. ABA DADOS GERAIS */}
          {activeTab === "general" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
                <Building className="h-5 w-5 text-sky" />
                Identificação do Estabelecimento e Títulos
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nome do Estabelecimento (Cliente)
                  </label>
                  <input
                    type="text"
                    value={form.general.clientName}
                    onChange={(e) => updateGeneral("clientName", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-navy font-semibold outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Exibido no topo e em todas as referências do relatório.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Título do Relatório
                  </label>
                  <input
                    type="text"
                    value={form.general.reportTitle}
                    onChange={(e) => updateGeneral("reportTitle", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Subtítulo / Período Analisado
                  </label>
                  <input
                    type="text"
                    value={form.general.reportPeriod}
                    onChange={(e) => updateGeneral("reportPeriod", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ex: Perfil no Google · indicadores de maio a outubro de 2026.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tag Superior
                  </label>
                  <input
                    type="text"
                    value={form.general.reportTag}
                    onChange={(e) => updateGeneral("reportTag", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Consultoria Responsável
                  </label>
                  <input
                    type="text"
                    value={form.general.author}
                    onChange={(e) => updateGeneral("author", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. ABA INDICADORES GOOGLE */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
                <BarChart3 className="h-5 w-5 text-sky" />
                Métricas do Perfil da Empresa no Google
              </h2>
              <p className="text-xs text-muted-foreground">
                Estes números alimentam automaticamente os cards, gráficos e o cálculo de ROI.
              </p>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Visualizações do Perfil
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.profile.views}
                    onChange={(e) => updateProfile("views", parseInt(e.target.value, 10) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interações Registradas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.profile.interactions}
                    onChange={(e) =>
                      updateProfile("interactions", parseInt(e.target.value, 10) || 0)
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Solicitações de Rota
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.profile.routes}
                    onChange={(e) => updateProfile("routes", parseInt(e.target.value, 10) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ligações Telefônicas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.profile.calls}
                    onChange={(e) => updateProfile("calls", parseInt(e.target.value, 10) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantidade de Avaliações
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.profile.reviewsCount}
                    onChange={(e) =>
                      updateProfile("reviewsCount", parseInt(e.target.value, 10) || 0)
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nota Média das Avaliações
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.profile.reviewsRating}
                    onChange={(e) =>
                      updateProfile("reviewsRating", parseFloat(e.target.value) || 5.0)
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. ABA FINANCEIRO & PONTO DE EQUILÍBRIO */}
          {activeTab === "financial" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
                <DollarSign className="h-5 w-5 text-sky" />
                Parâmetros Financeiros, Fórmulas & Ponto de Equilíbrio
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ticket Médio Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.financial.ticketCents / 100}
                    onChange={(e) =>
                      updateFinancial(
                        "ticketCents",
                        Math.round((parseFloat(e.target.value) || 0) * 100),
                      )
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-xl font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <input
                    type="text"
                    value={form.financial.ticketHint}
                    onChange={(e) => updateFinancial("ticketHint", e.target.value)}
                    placeholder="Descrição / detalhamento do ticket médio"
                    className="mt-2 w-full rounded border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Investimento Mensal na Localway (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.financial.investCents / 100}
                    onChange={(e) =>
                      updateFinancial(
                        "investCents",
                        Math.round((parseFloat(e.target.value) || 0) * 100),
                      )
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-xl font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <input
                    type="text"
                    value={form.financial.investHint}
                    onChange={(e) => updateFinancial("investHint", e.target.value)}
                    placeholder="Descrição da recorrência mensal"
                    className="mt-2 w-full rounded border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Margem de Contribuição por Venda (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.financial.marginPercent}
                    onChange={(e) =>
                      updateFinancial("marginPercent", parseInt(e.target.value, 10) || 100)
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Parcela do ticket médio que efetivamente cobre os custos fixos da consultoria.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Taxa Estimada de Conversão de Rotas em Compras (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.financial.conversionRatePercent}
                    onChange={(e) =>
                      updateFinancial("conversionRatePercent", parseInt(e.target.value, 10) || 10)
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-lg font-bold text-navy outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Considerada para correlacionar solicitações de rota com visitas efetivas.
                  </p>
                </div>
              </div>

              {/* Pré-visualização da lógica corrigida de Break-even */}
              <div className="rounded-xl border border-sky/30 bg-sky-soft p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky">
                  Pré-visualização do Ponto de Equilíbrio
                </span>
                {(() => {
                  const t = form.financial.ticketCents / 100;
                  const inv = form.financial.investCents / 100;
                  const margin = (form.financial.marginPercent || 100) / 100;
                  const lucroPorVenda = t * margin;
                  const vendasNec = lucroPorVenda > 0 ? Math.ceil(inv / lucroPorVenda) : 0;
                  const convRate = (form.financial.conversionRatePercent || 10) / 100;
                  const rotasNec = convRate > 0 ? Math.ceil(vendasNec / convRate) : 0;

                  return (
                    <div className="mt-2 text-xs space-y-1.5 text-navy">
                      <p>
                        • <strong>Vendas necessárias:</strong> {vendasNec} vendas (R${" "}
                        {(vendasNec * t).toFixed(2)} em faturamento bruto a R$ {t.toFixed(2)} por
                        compra).
                      </p>
                      <p>
                        • <strong>Rotas estimadas necessárias:</strong> aproximadamente {rotasNec}{" "}
                        das {form.profile.routes} solicitações de rota (considerando conversão de{" "}
                        {form.financial.conversionRatePercent}%).
                      </p>
                      <p className="text-muted-foreground text-[11px] pt-1">
                        * Não trata rotas como compras diretas, atendendo rigorosamente à regra de
                        clareza técnica.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 4. ABA GRÁFICOS */}
          {activeTab === "charts" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-sky" />
                  Gerenciamento de Gráficos do Relatório
                </h2>
                <button
                  type="button"
                  onClick={addChart}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy/90 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Novo Gráfico
                </button>
              </div>

              <div className="space-y-6">
                {form.charts.map((chart, cIndex) => (
                  <div
                    key={chart.id}
                    className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">
                          {cIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={chart.title}
                          onChange={(e) => updateChart(chart.id, "title", e.target.value)}
                          className="font-display text-sm font-bold text-navy bg-transparent border-b border-dashed border-border px-1 py-0.5 outline-none focus:border-sky"
                          placeholder="Título do gráfico"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chart.visible}
                            onChange={(e) => updateChart(chart.id, "visible", e.target.checked)}
                            className="rounded border-input text-navy focus:ring-sky"
                          />
                          Visível
                        </label>

                        <select
                          value={chart.type}
                          onChange={(e) => updateChart(chart.id, "type", e.target.value)}
                          className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-semibold text-navy outline-none"
                        >
                          <option value="donut">Donut (Rosca)</option>
                          <option value="pie">Pizza (Pie)</option>
                          <option value="bar">Barras Horizontais</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => removeChart(chart.id)}
                          className="rounded p-1 text-alert hover:bg-alert-soft transition cursor-pointer"
                          title="Excluir gráfico"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={chart.description}
                        onChange={(e) => updateChart(chart.id, "description", e.target.value)}
                        className="w-full text-xs text-muted-foreground bg-transparent border-b border-border pb-1 outline-none focus:border-sky"
                        placeholder="Descrição / legenda explicativa do gráfico"
                      />
                    </div>

                    {/* Itens / Categorias do Gráfico */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Categorias e Valores
                        </span>
                        <button
                          type="button"
                          onClick={() => addChartItem(chart.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar Item
                        </button>
                      </div>

                      <div className="space-y-2">
                        {chart.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg bg-card border border-border p-2"
                          >
                            <input
                              type="color"
                              value={item.color?.startsWith("#") ? item.color : "#1e3a8a"}
                              onChange={(e) =>
                                updateChartItem(chart.id, item.id, "color", e.target.value)
                              }
                              className="h-7 w-7 rounded border-none cursor-pointer"
                              title="Cor da fatia / barra"
                            />
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) =>
                                updateChartItem(chart.id, item.id, "label", e.target.value)
                              }
                              className="flex-1 rounded border border-input bg-card px-2.5 py-1 text-xs outline-none"
                              placeholder="Nome da categoria"
                            />
                            <input
                              type="number"
                              min="0"
                              value={item.value}
                              onChange={(e) =>
                                updateChartItem(
                                  chart.id,
                                  item.id,
                                  "value",
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="w-24 rounded border border-input bg-card px-2.5 py-1 text-xs font-bold text-navy outline-none text-right"
                              placeholder="Valor"
                            />
                            <button
                              type="button"
                              onClick={() => removeChartItem(chart.id, item.id)}
                              className="text-muted-foreground hover:text-alert p-1 cursor-pointer"
                              title="Remover item"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ABA EXPLICAÇÕES (?) */}
          {activeTab === "explanations" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-sky" />
                    Textos dos Ícones de Interrogação (?)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Defina o que o cliente lê ao clicar nos pequenos ícones de dúvida ao lado de
                    cada métrica.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExplanation}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy/90 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova Explicação
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(form.explanations).map(([key, item]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.term}
                        onChange={(e) => updateExplanation(key, "term", e.target.value)}
                        className="font-display text-sm font-bold text-navy bg-transparent border-b border-border px-1 py-0.5 outline-none focus:border-sky flex-1"
                        placeholder="Nome do termo"
                      />
                      {key.startsWith("custom-") && (
                        <button
                          type="button"
                          onClick={() => removeExplanation(key)}
                          className="text-alert hover:bg-alert-soft p-1 rounded cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) => updateExplanation(key, "description", e.target.value)}
                      className="w-full rounded-lg border border-input bg-card p-2 text-xs leading-relaxed text-muted-foreground outline-none focus:border-sky"
                      placeholder="Explicação direta, didática e clara."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ABA HISTÓRICO FINANCEIRO */}
          {activeTab === "history" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
                <Clock className="h-5 w-5 text-sky" />
                Histórico de Pagamentos (Implementação & Recorrência)
              </h2>

              {/* Implementações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                    Custos de Implementação
                  </h3>
                  <button
                    type="button"
                    onClick={addImplementation}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Linha
                  </button>
                </div>

                <div className="space-y-2">
                  {form.history.implementations.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_1fr_6rem_2rem] items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2.5 text-xs"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateImplementation(item.id, "description", e.target.value)
                        }
                        className="rounded border border-input bg-card px-2 py-1 outline-none"
                        placeholder="Descrição"
                      />
                      <input
                        type="text"
                        value={item.dateOrPeriod}
                        onChange={(e) =>
                          updateImplementation(item.id, "dateOrPeriod", e.target.value)
                        }
                        className="rounded border border-input bg-card px-2 py-1 outline-none"
                        placeholder="Mês / Data"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) =>
                          updateImplementation(item.id, "amount", parseFloat(e.target.value) || 0)
                        }
                        className="rounded border border-input bg-card px-2 py-1 text-right font-bold text-navy outline-none"
                        placeholder="R$"
                      />
                      <button
                        type="button"
                        onClick={() => removeImplementation(item.id)}
                        className="text-muted-foreground hover:text-alert p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recorrência */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                    Mensalidades e Recorrência
                  </h3>
                  <button
                    type="button"
                    onClick={addRecurrence}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Linha
                  </button>
                </div>

                <div className="space-y-2">
                  {form.history.recurrences.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_6rem_2rem] items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2.5 text-xs"
                    >
                      <input
                        type="text"
                        value={item.dateOrPeriod}
                        onChange={(e) => updateRecurrence(item.id, "dateOrPeriod", e.target.value)}
                        className="rounded border border-input bg-card px-2 py-1 outline-none"
                        placeholder="Período / Detalhe"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) =>
                          updateRecurrence(item.id, "amount", parseFloat(e.target.value) || 0)
                        }
                        className="rounded border border-input bg-card px-2 py-1 text-right font-bold text-navy outline-none"
                        placeholder="R$"
                      />
                      <button
                        type="button"
                        onClick={() => removeRecurrence(item.id)}
                        className="text-muted-foreground hover:text-alert p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ABA DIAGNÓSTICO */}
          {activeTab === "diagnostics" && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="h-5 w-5 text-sky" />
                Pontos Positivos & Oportunidades de Melhoria
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Pontos Positivos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-positive uppercase tracking-wider">
                      Pontos Positivos
                    </h3>
                    <button
                      type="button"
                      onClick={() => addPoint("positivePoints")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-positive hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.diagnostics.positivePoints.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updatePoint("positivePoints", index, e.target.value)}
                          className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none focus:border-positive"
                        />
                        <button
                          type="button"
                          onClick={() => removePoint("positivePoints", index)}
                          className="text-muted-foreground hover:text-alert p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Oportunidades de Melhoria */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                      Oportunidades de Melhoria
                    </h3>
                    <button
                      type="button"
                      onClick={() => addPoint("improvementPoints")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.diagnostics.improvementPoints.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updatePoint("improvementPoints", index, e.target.value)}
                          className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none focus:border-sky"
                        />
                        <button
                          type="button"
                          onClick={() => removePoint("improvementPoints", index)}
                          className="text-muted-foreground hover:text-alert p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Observações Adicionais (ex: Instagram, canais opcionais)
                </label>
                <input
                  type="text"
                  value={form.diagnostics.notes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      diagnostics: { ...prev.diagnostics, notes: e.target.value },
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none focus:border-sky"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação para Restaurar Valores Padrão */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-alert">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold">Restaurar Valores Padrão?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta ação irá substituir todas as informações atuais pelas configurações originais de
              fábrica da Localway. Os dados salvos anteriormente serão substituídos.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-lg bg-alert px-4 py-2 text-xs font-bold text-white shadow hover:bg-alert/90 cursor-pointer"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
