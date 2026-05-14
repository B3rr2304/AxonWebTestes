export type ChronotypeResultKey =
  | "Matutino"
  | "Vespertino"
  | "Noturno"
  | "Misto"
  | "Bimodal";

export type ChronotypeResult = {
  label: string;
  title: string;
  subtitle?: string;
  description?: string;
  focusWindow: string;
  energyPeak: string;
  lowEnergy: string;
  recommendation: string;
  routineTips: string[];
};

export const results: Record<ChronotypeResultKey, ChronotypeResult> = {
  Matutino: {
    label: "Cronotipo Matutino",
    title: "Você rende melhor nas primeiras horas do dia.",
    focusWindow: "Manhã",
    energyPeak: "6h às 11h",
    lowEnergy: "Fim da tarde e noite",
    recommendation:
      "Reserve suas tarefas mais difíceis para a manhã. Depois das 14h, prefira tarefas leves.",
    routineTips: [
      "Acorde no mesmo horário todos os dias.",
      "Faça sua tarefa mais importante antes das 10h.",
      "Evite reuniões longas no fim da tarde.",
    ],
  },

  Vespertino: {
    label: "Cronotipo Vespertino",
    title: "Você ganha energia conforme o dia avança.",
    focusWindow: "Tarde e início da noite",
    energyPeak: "14h às 20h",
    lowEnergy: "Primeiras horas da manhã",
    recommendation:
      "Não force tarefas complexas logo cedo. Reserve a tarde para o que exige mais de você.",
    routineTips: [
      "Use a manhã para tarefas simples e automáticas.",
      "Proteja o bloco da tarde para projetos importantes.",
      "Evite dormir muito tarde — isso prejudica o ciclo.",
    ],
  },

  Noturno: {
    label: "Cronotipo Noturno",
    title: "Seu pico de clareza aparece quando o mundo desacelera.",
    focusWindow: "Noite",
    energyPeak: "20h às 01h",
    lowEnergy: "Manhã",
    recommendation:
      "Quando possível, concentre tarefas críticas no período noturno. Proteja seu sono compensando no horário certo.",
    routineTips: [
      "Use a manhã apenas para o essencial.",
      "Evite compromissos importantes muito cedo.",
      "Proteja blocos noturnos para foco profundo.",
    ],
  },

  Misto: {
    label: "Cronotipo Misto",
    title: "Seu ritmo varia — e isso é uma característica, não um problema.",
    focusWindow: "Depende do contexto",
    energyPeak: "Varia por dia",
    lowEnergy: "Sem padrão fixo",
    recommendation:
      "Seu desafio é identificar seus micro-picos. O AXON vai ajudar você a mapear seu padrão real ao longo do tempo.",
    routineTips: [
      "Observe em quais dias e horários você rende mais.",
      "Evite rotinas rígidas — prefira estruturas flexíveis.",
      "Use o chat do AXON para planejar cada dia individualmente.",
    ],
  },

  Bimodal: {
    label: "Cronotipo Bimodal",
    title: "Você tem dois picos de energia bem definidos.",
    focusWindow: "9h-12h e 20h-23h",
    energyPeak: "Manhã e noite",
    lowEnergy: "Início da tarde",
    recommendation:
      "Aproveite os dois picos para tarefas de alto esforço. Proteja a tarde para descanso ou tarefas leves.",
    routineTips: [
      "Use a manhã para o trabalho analítico.",
      "Descanse ou faça tarefas leves entre 13h e 17h.",
      "Reserve a noite para projetos criativos ou revisão.",
    ],
  },
};
