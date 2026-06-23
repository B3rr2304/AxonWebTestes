export const SLEEP_TAGS = [
  { slug: "revigorante", label: "Revigorante" },
  { slug: "bom", label: "Bom" },
  { slug: "normal", label: "Normal" },
  { slug: "agitado", label: "Agitado" },
  { slug: "acordei_cansado", label: "Acordei cansado" },
  { slug: "interrompido", label: "Interrompido" },
  { slug: "quase_nao_dormi", label: "Quase não dormi" },
  { slug: "acordei_cedo", label: "Acordei cedo demais" },
] as const;

export const MOOD_TAGS = [
  { slug: "animado", label: "Animado" },
  { slug: "tranquilo", label: "Tranquilo" },
  { slug: "motivado", label: "Motivado" },
  { slug: "ansioso", label: "Ansioso" },
  { slug: "estressado", label: "Estressado" },
  { slug: "desmotivado", label: "Desmotivado" },
  { slug: "irritado", label: "Irritado" },
] as const;

export const PRODUCTIVITY_TAGS = [
  { slug: "em_flow", label: "Em flow" },
  { slug: "foco_bom", label: "Foco bom" },
  { slug: "distraido", label: "Muitas distrações" },
  { slug: "interrompido", label: "Interrompido" },
  { slug: "tarefas_leves", label: "Só tarefas leves" },
  { slug: "reunioes_demais", label: "Reuniões demais" },
  { slug: "produtivo_esgotante", label: "Produtivo mas esgotante" },
] as const;

// Horários em passos de 30 min para os seletores de sono ("00:00" ... "23:30")
export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});
