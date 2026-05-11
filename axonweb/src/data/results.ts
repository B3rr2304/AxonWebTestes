export type ChronotypeResultKey =
  | "morning"
  | "intermediate"
  | "evening"
  | "night";

export type ChronotypeResult = {
  label: string;
  title: string;
  subtitle: string;
  description: string;
  focusWindow: string;
  energyPeak: string;
  lowEnergy: string;
  recommendation: string;
  routineTips: string[];
};

export const results: Record<ChronotypeResultKey, ChronotypeResult> = {
  morning: {
    label: "Perfil Matutino",
    title: "Você tende a render melhor nas primeiras horas do dia.",
    subtitle: "Seu ritmo natural favorece clareza, energia e foco pela manhã.",
    description:
      "Seu corpo parece responder melhor a uma rotina que começa cedo. Tarefas importantes, decisões e atividades que exigem raciocínio tendem a funcionar melhor no início do dia.",
    focusWindow: "Manhã",
    energyPeak: "Entre 7h e 11h",
    lowEnergy: "Fim da tarde e noite",
    recommendation:
      "Priorize tarefas difíceis logo cedo e deixe atividades leves, revisões e organização para o fim do dia.",
    routineTips: [
      "Comece o dia pela tarefa mais importante.",
      "Evite gastar sua melhor energia com mensagens e demandas pequenas.",
      "Reserve o fim do dia para revisão, planejamento e tarefas leves.",
    ],
  },

  intermediate: {
    label: "Perfil Intermediário",
    title: "Você tende a ter um ritmo mais equilibrado ao longo do dia.",
    subtitle:
      "Seu funcionamento é flexível e pode se adaptar bem a diferentes rotinas.",
    description:
      "Seu perfil indica uma boa capacidade de adaptação. Você pode render bem em diferentes horários, desde que tenha clareza de prioridades e pausas bem distribuídas.",
    focusWindow: "Meio do dia",
    energyPeak: "Entre 9h e 15h",
    lowEnergy: "Após longos períodos sem pausa",
    recommendation:
      "Distribua tarefas importantes entre manhã e tarde, mantendo pausas curtas para preservar energia.",
    routineTips: [
      "Planeje o dia em blocos equilibrados.",
      "Use pausas para manter constância.",
      "Evite concentrar todas as tarefas difíceis em um único período.",
    ],
  },

  evening: {
    label: "Perfil Vespertino",
    title: "Você tende a ganhar energia conforme o dia avança.",
    subtitle: "Seu foco costuma melhorar mais tarde, especialmente à tarde ou à noite.",
    description:
      "Seu corpo parece precisar de mais tempo para entrar em ritmo. Manhãs podem ser mais lentas, enquanto tarefas difíceis tendem a fluir melhor depois que o dia já começou.",
    focusWindow: "Tarde e início da noite",
    energyPeak: "Entre 14h e 20h",
    lowEnergy: "Início da manhã",
    recommendation:
      "Use a manhã para tarefas simples e reserve o período da tarde para atividades que exigem mais foco.",
    routineTips: [
      "Não force tarefas complexas logo cedo se puder evitar.",
      "Use a manhã para aquecer com tarefas menores.",
      "Reserve sua melhor energia para projetos importantes à tarde.",
    ],
  },

  night: {
    label: "Perfil Noturno",
    title: "Você tende a funcionar melhor em horários mais avançados.",
    subtitle:
      "Seu pico de clareza pode aparecer quando o ambiente está mais silencioso.",
    description:
      "Seu perfil indica maior disposição mental no fim do dia ou à noite. Rotinas muito cedo podem gerar desgaste, enquanto períodos mais tardios podem favorecer foco profundo.",
    focusWindow: "Noite",
    energyPeak: "Entre 20h e 01h",
    lowEnergy: "Manhã",
    recommendation:
      "Quando possível, evite concentrar tarefas importantes cedo demais e proteja blocos de foco em horários mais tardios.",
    routineTips: [
      "Use a manhã para tarefas leves ou automáticas.",
      "Evite compromissos muito cedo sempre que possível.",
      "Proteja blocos noturnos para tarefas de alta concentração.",
    ],
  },
};