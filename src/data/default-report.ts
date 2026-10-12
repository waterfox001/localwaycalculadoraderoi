export interface ChartDataItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  description: string;
  type: "donut" | "pie" | "bar";
  visible: boolean;
  order: number;
  items: ChartDataItem[];
}

export interface HistoryItem {
  id: string;
  description: string;
  dateOrPeriod: string;
  amount: number;
  note?: string;
}

export interface ExplanationItem {
  key: string;
  term: string;
  description: string;
}

export interface ReportConfig {
  general: {
    clientName: string;
    reportTitle: string;
    reportPeriod: string;
    reportTag: string;
    author: string;
  };
  profile: {
    views: number;
    interactions: number;
    routes: number;
    calls: number;
    reviewsCount: number;
    reviewsRating: number;
  };
  financial: {
    ticketCents: number;
    investCents: number;
    ticketHint: string;
    investHint: string;
    marginPercent: number; // Margem de contribuição (padrão 100%)
    conversionRatePercent: number; // Taxa de conversão de rotas em compras (padrão 10%)
  };
  history: {
    implementations: HistoryItem[];
    recurrences: HistoryItem[];
  };
  diagnostics: {
    positivePoints: string[];
    improvementPoints: string[];
    notes: string;
  };
  explanations: Record<string, ExplanationItem>;
  charts: ChartConfig[];
}

export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  general: {
    clientName: "Espetinho no Trailer",
    reportTitle: "Calculadora de ROI",
    reportPeriod: "Perfil no Google · indicadores de maio a outubro de 2026",
    reportTag: "Calculadora de ROI",
    author: "Localway Soluções Digitais",
  },
  profile: {
    views: 430,
    interactions: 208,
    routes: 194,
    calls: 14,
    reviewsCount: 2,
    reviewsRating: 5.0,
  },
  financial: {
    ticketCents: 2200,
    investCents: 10000,
    ticketHint: "Dois espetinhos de R$ 9,00 + refrigerante de R$ 4,00 (estimativa padrão).",
    investHint: "Recorrência mensal informada para o período analisado.",
    marginPercent: 100,
    conversionRatePercent: 10,
  },
  history: {
    implementations: [
      {
        id: "imp-1",
        description: "Implementação e configuração",
        dateOrPeriod: "Julho de 2026",
        amount: 1350,
      },
      {
        id: "imp-2",
        description: "Implementação e configuração",
        dateOrPeriod: "Julho de 2026",
        amount: 570,
      },
    ],
    recurrences: [
      {
        id: "rec-1",
        description: "Recorrência mensal",
        dateOrPeriod: "Julho de 2026 (início em 17/07/2026)",
        amount: 100,
      },
      {
        id: "rec-2",
        description: "Recorrência mensal",
        dateOrPeriod: "Agosto de 2026",
        amount: 100,
      },
      {
        id: "rec-3",
        description: "Recorrência mensal",
        dateOrPeriod: "Setembro de 2026",
        amount: 250,
      },
    ],
  },
  diagnostics: {
    positivePoints: [
      "Perfil visualmente atrativo",
      "2 avaliações com nota máxima de 5 estrelas",
      "194 solicitações de rota registradas",
      "14 ligações registradas",
    ],
    improvementPoints: [
      "Conseguir mais avaliações autênticas",
      "Atualizar o cardápio e tabela de preços",
      "Produzir fotos próprias dos espetinhos e acompanhamentos",
      "Registrar como os clientes conheceram o estabelecimento",
      "Confirmar se o mini site já está publicado",
    ],
    notes: "Instagram: canal opcional.",
  },
  explanations: {
    views: {
      key: "views",
      term: "Visualizações do perfil",
      description:
        "Quantidade de vezes que o Perfil da Empresa apareceu para pessoas que pesquisaram ou encontraram o estabelecimento no Google, conforme o indicador utilizado.",
    },
    interactions: {
      key: "interactions",
      term: "Interações registradas",
      description:
        "Quantidade de ações realizadas pelas pessoas no perfil, conforme as métricas disponíveis no Google.",
    },
    routes: {
      key: "routes",
      term: "Solicitações de rota",
      description:
        "Quantidade de vezes que as pessoas solicitaram orientações para chegar ao estabelecimento pelo Google. Esse indicador mostra interesse em visitar o local.",
    },
    calls: {
      key: "calls",
      term: "Ligações",
      description:
        "Quantidade de interações de ligação registradas pelo perfil durante o período analisado.",
    },
    ticket: {
      key: "ticket",
      term: "Ticket médio",
      description:
        "Valor médio gasto por cliente em uma compra. É utilizado para estimar o valor financeiro associado à quantidade de compras informada.",
    },
    revenue: {
      key: "revenue",
      term: "Receita potencial atribuída",
      description:
        "Estimativa de receita associada às ações analisadas, calculada com base nas quantidades e nos valores definidos no painel administrativo. Uma solicitação de rota, por si só, não representa uma compra confirmada.",
    },
    invest: {
      key: "invest",
      term: "Investimento mensal",
      description:
        "Valor recorrente pago à Localway pelos serviços contratados no período analisado.",
    },
    roi: {
      key: "roi",
      term: "Retorno sobre o Investimento (ROI)",
      description:
        "Indicador que compara o resultado financeiro atribuído à ação com o investimento realizado: [(Receita − Investimento) ÷ Investimento] × 100.",
    },
    breakeven: {
      key: "breakeven",
      term: "Ponto de equilíbrio (Break-even)",
      description:
        "Quantidade de vendas necessárias no ticket médio e margem informados para cobrir o investimento mensal, considerando a taxa estimada de conversão de rotas em compras.",
    },
    reviews: {
      key: "reviews",
      term: "Avaliações no Google",
      description:
        "Quantidade e nota média de avaliações deixadas por clientes no Google Maps. Contribui decisivamente para a confiança e autoridade do negócio.",
    },
  },
  charts: [
    {
      id: "interactions-donut",
      title: "Composição das interações",
      description: "Distribuição entre solicitações de rota e ligações registradas",
      type: "donut",
      visible: true,
      order: 1,
      items: [
        {
          id: "item-routes",
          label: "Solicitações de rota",
          value: 194,
          color: "var(--navy)",
        },
        {
          id: "item-calls",
          label: "Ligações",
          value: 14,
          color: "var(--sky)",
        },
      ],
    },
  ],
};
