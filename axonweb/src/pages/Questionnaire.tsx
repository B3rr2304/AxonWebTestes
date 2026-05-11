import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock3,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Zap,
} from "lucide-react";

type ChronotypeKey = "morning" | "intermediate" | "evening" | "night";

type Option = {
  id: string;
  label: string;
  description?: string;
  score: Partial<Record<ChronotypeKey, number>>;
};

type Question = {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ElementType;
  options: Option[];
};

const questions: Question[] = [
  {
    id: "natural_wake_time",
    category: "Sono e despertar",
    title: "Quando você acordaria naturalmente se não tivesse compromissos?",
    description:
      "Pense em um dia livre, sem alarme, sem trabalho, faculdade ou obrigações logo cedo.",
    icon: Sunrise,
    options: [
      {
        id: "before_7",
        label: "Antes das 7h",
        description: "Acordo cedo com facilidade.",
        score: { morning: 3 },
      },
      {
        id: "7_9",
        label: "Entre 7h e 9h",
        description: "Acordo bem em horários moderados.",
        score: { morning: 1, intermediate: 2 },
      },
      {
        id: "9_11",
        label: "Entre 9h e 11h",
        description: "Prefiro começar o dia mais tarde.",
        score: { evening: 2, intermediate: 1 },
      },
      {
        id: "after_11",
        label: "Depois das 11h",
        description: "Meu corpo tende a acordar bem tarde.",
        score: { night: 3, evening: 1 },
      },
    ],
  },
  {
    id: "natural_sleep_time",
    category: "Sono e descanso",
    title: "Em um dia livre, que horas você sentiria sono naturalmente?",
    description:
      "Considere o horário em que seu corpo começaria a pedir descanso, sem pressão externa.",
    icon: Moon,
    options: [
      {
        id: "before_22",
        label: "Antes das 22h",
        description: "Costumo sentir sono cedo.",
        score: { morning: 3 },
      },
      {
        id: "22_00",
        label: "Entre 22h e meia-noite",
        description: "Meu sono vem em um horário equilibrado.",
        score: { intermediate: 3, morning: 1 },
      },
      {
        id: "00_02",
        label: "Entre meia-noite e 2h",
        description: "Costumo funcionar bem até mais tarde.",
        score: { evening: 3 },
      },
      {
        id: "after_02",
        label: "Depois das 2h",
        description: "Meu corpo parece despertar mais à noite.",
        score: { night: 3, evening: 1 },
      },
    ],
  },
  {
    id: "wake_energy",
    category: "Energia",
    title: "Como costuma ser sua energia logo após acordar?",
    description:
      "Não pense apenas em sono. Pense em disposição mental e física para começar o dia.",
    icon: Zap,
    options: [
      {
        id: "high",
        label: "Alta",
        description: "Acordo relativamente pronto para fazer as coisas.",
        score: { morning: 3 },
      },
      {
        id: "medium",
        label: "Média",
        description: "Preciso de um tempo, mas logo entro no ritmo.",
        score: { intermediate: 3 },
      },
      {
        id: "low",
        label: "Baixa",
        description: "Demoro bastante para funcionar bem.",
        score: { evening: 2, night: 1 },
      },
      {
        id: "very_low",
        label: "Muito baixa",
        description: "Manhãs costumam ser difíceis para mim.",
        score: { night: 3, evening: 1 },
      },
    ],
  },
  {
    id: "best_focus_time",
    category: "Foco",
    title: "Em qual período você sente que consegue focar melhor?",
    description:
      "Pense no horário em que tarefas difíceis parecem menos pesadas.",
    icon: Brain,
    options: [
      {
        id: "morning",
        label: "Manhã",
        description: "Meu melhor foco aparece cedo.",
        score: { morning: 3 },
      },
      {
        id: "afternoon",
        label: "Tarde",
        description: "Rendo melhor depois que o dia engrena.",
        score: { intermediate: 2, evening: 1 },
      },
      {
        id: "evening",
        label: "Noite",
        description: "Minha clareza aumenta no fim do dia.",
        score: { evening: 3 },
      },
      {
        id: "late_night",
        label: "Madrugada",
        description: "Meu pico costuma vir quando tudo está mais silencioso.",
        score: { night: 3 },
      },
    ],
  },
  {
    id: "hard_tasks",
    category: "Execução",
    title: "Quando você prefere fazer tarefas que exigem muito raciocínio?",
    description:
      "Exemplos: estudar, programar, escrever, resolver problemas ou tomar decisões importantes.",
    icon: Sparkles,
    options: [
      {
        id: "early",
        label: "Logo pela manhã",
        description: "Gosto de resolver o mais importante cedo.",
        score: { morning: 3 },
      },
      {
        id: "midday",
        label: "Meio do dia",
        description: "Prefiro depois de já ter entrado no ritmo.",
        score: { intermediate: 3 },
      },
      {
        id: "night",
        label: "À noite",
        description: "Sinto mais clareza quando o dia acalma.",
        score: { evening: 3 },
      },
      {
        id: "late",
        label: "Bem tarde",
        description: "Tenho facilidade de concentração em horários avançados.",
        score: { night: 3 },
      },
    ],
  },
  {
    id: "energy_drop",
    category: "Queda de energia",
    title: "Em qual momento você mais sente queda de energia?",
    description:
      "Pense naquele horário em que parece mais difícil manter foco e disposição.",
    icon: Clock3,
    options: [
      {
        id: "early_morning",
        label: "Logo de manhã",
        description: "Demoro para acordar de verdade.",
        score: { evening: 2, night: 2 },
      },
      {
        id: "after_lunch",
        label: "Depois do almoço",
        description: "Minha energia cai no início da tarde.",
        score: { morning: 1, intermediate: 2 },
      },
      {
        id: "late_afternoon",
        label: "Fim da tarde",
        description: "Perco energia conforme o dia avança.",
        score: { morning: 2, intermediate: 1 },
      },
      {
        id: "late_night",
        label: "À noite",
        description: "Depois de certo horário, meu corpo desliga.",
        score: { morning: 3 },
      },
    ],
  },
  {
    id: "ideal_routine",
    category: "Rotina ideal",
    title: "Se pudesse escolher, como seria sua rotina ideal?",
    description:
      "Imagine uma rotina sem imposições externas, apenas seguindo seu melhor funcionamento.",
    icon: Sun,
    options: [
      {
        id: "start_early",
        label: "Começar cedo e terminar cedo",
        description: "Gosto da sensação de vencer o dia logo no início.",
        score: { morning: 3 },
      },
      {
        id: "balanced",
        label: "Começar em horário normal",
        description: "Prefiro equilíbrio, sem extremos.",
        score: { intermediate: 3 },
      },
      {
        id: "start_later",
        label: "Começar mais tarde e render à noite",
        description: "Meu dia flui melhor quando não começa cedo demais.",
        score: { evening: 3 },
      },
      {
        id: "night_flow",
        label: "Ter liberdade para produzir de madrugada",
        description: "Me sinto mais ativo quando a maioria das pessoas parou.",
        score: { night: 3 },
      },
    ],
  },
  {
    id: "early_commitments",
    category: "Compromissos cedo",
    title: "Como você reage a compromissos muito cedo?",
    description:
      "Considere reuniões, aulas, treinos ou tarefas importantes pela manhã.",
    icon: Sunrise,
    options: [
      {
        id: "fine",
        label: "Lido bem",
        description: "Consigo funcionar normalmente cedo.",
        score: { morning: 3 },
      },
      {
        id: "ok",
        label: "Consigo, mas não é meu ideal",
        description: "Faço o que precisa, mas prefiro não exagerar.",
        score: { intermediate: 2, morning: 1 },
      },
      {
        id: "hard",
        label: "Tenho dificuldade",
        description: "Sinto que meu corpo ainda não acompanhou.",
        score: { evening: 2, night: 1 },
      },
      {
        id: "very_hard",
        label: "É muito difícil",
        description: "Compromissos cedo prejudicam bastante meu rendimento.",
        score: { night: 3, evening: 1 },
      },
    ],
  },
  {
    id: "night_energy",
    category: "Energia noturna",
    title: "Como você costuma se sentir à noite?",
    description:
      "Pense especialmente no período depois das 20h.",
    icon: Moon,
    options: [
      {
        id: "tired",
        label: "Cansado",
        description: "Normalmente já estou desacelerando.",
        score: { morning: 3 },
      },
      {
        id: "normal",
        label: "Normal",
        description: "Consigo fazer coisas leves, mas sem pico de energia.",
        score: { intermediate: 3 },
      },
      {
        id: "productive",
        label: "Produtivo",
        description: "Tenho boa clareza e disposição à noite.",
        score: { evening: 3 },
      },
      {
        id: "very_active",
        label: "Muito ativo",
        description: "À noite ou madrugada parece ser meu melhor momento.",
        score: { night: 3 },
      },
    ],
  },
  {
    id: "social_jetlag",
    category: "Ritmo real",
    title: "Nos fins de semana, seu sono muda muito?",
    description:
      "Isso ajuda o Axon a entender se sua rotina atual está desalinhada com seu ritmo natural.",
    icon: Clock3,
    options: [
      {
        id: "no",
        label: "Quase não muda",
        description: "Durmo e acordo em horários parecidos.",
        score: { morning: 1, intermediate: 2 },
      },
      {
        id: "little",
        label: "Muda um pouco",
        description: "Costumo atrasar 1 ou 2 horas.",
        score: { intermediate: 2, evening: 1 },
      },
      {
        id: "much",
        label: "Muda bastante",
        description: "Durmo e acordo bem mais tarde.",
        score: { evening: 2, night: 1 },
      },
      {
        id: "very_much",
        label: "Muda completamente",
        description: "Meu ritmo livre é muito diferente da semana.",
        score: { night: 2, evening: 2 },
      },
    ],
  },
];

const chronotypeLabels: Record<
  ChronotypeKey,
  {
    title: string;
    subtitle: string;
    description: string;
  }
> = {
  morning: {
    title: "Perfil Matutino",
    subtitle: "Seu melhor funcionamento tende a acontecer mais cedo.",
    description:
      "Você provavelmente tem mais energia e clareza nas primeiras horas do dia. O Axon poderá priorizar tarefas importantes pela manhã e reservar atividades mais leves para o fim do dia.",
  },
  intermediate: {
    title: "Perfil Intermediário",
    subtitle: "Seu ritmo tende a ser mais equilibrado ao longo do dia.",
    description:
      "Você provavelmente consegue se adaptar bem a diferentes horários. O Axon poderá distribuir tarefas importantes em janelas equilibradas, respeitando seus compromissos e variações de energia.",
  },
  evening: {
    title: "Perfil Vespertino",
    subtitle: "Seu desempenho tende a melhorar ao longo do dia.",
    description:
      "Você provavelmente ganha energia e clareza mais tarde. O Axon poderá evitar sobrecarregar suas manhãs e reservar tarefas importantes para tarde ou noite.",
  },
  night: {
    title: "Perfil Noturno",
    subtitle: "Seu pico de energia tende a aparecer em horários mais avançados.",
    description:
      "Você provavelmente sente mais clareza quando o dia está mais silencioso. O Axon poderá considerar uma rotina mais flexível, com blocos relevantes no período noturno quando possível.",
  },
};

function calculateChronotype(answers: Record<string, string>) {
  const scores: Record<ChronotypeKey, number> = {
    morning: 0,
    intermediate: 0,
    evening: 0,
    night: 0,
  };

  questions.forEach((question) => {
    const selectedOptionId = answers[question.id];
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) return;

    Object.entries(selectedOption.score).forEach(([key, value]) => {
      scores[key as ChronotypeKey] += value ?? 0;
    });
  });

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    key: winner as ChronotypeKey,
    scores,
  };
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(192,132,252,0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.35 }}
      />
    </div>
  );
}

export default function Questionnaire() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id];
  const progress = finished
    ? 100
    : ((currentIndex + 1) / questions.length) * 100;

  const result = useMemo(() => calculateChronotype(answers), [answers]);
  const resultContent = chronotypeLabels[result.key];

  function selectAnswer(optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  }

  function goNext() {
    if (!selectedAnswer) return;

    if (currentIndex === questions.length - 1) {
      const finalResult = calculateChronotype({
        ...answers,
        [currentQuestion.id]: selectedAnswer,
      });

      localStorage.setItem("axon_chronotype", finalResult.key);

      navigate("/analyzing");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function goBack() {
    if (finished) {
      setFinished(false);
      setCurrentIndex(questions.length - 1);
      return;
    }

    if (currentIndex === 0) {
      navigate("/questionnaire-intro");
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  }

  if (finished) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#05050b] px-4 py-5 text-white">
        <Background />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
          <Header />

          <section className="flex flex-1 flex-col justify-center py-8">
            <div className="mb-6">
              <p className="mb-3 text-sm text-white/45">
                Configuração inicial concluída
              </p>
              <ProgressBar progress={100} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-purple-300/20 bg-purple-500/15 text-purple-100 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
                <Sparkles className="h-9 w-9" />
              </div>

              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                Resultado inicial
              </div>

              <h1 className="text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white">
                {resultContent.title}
              </h1>

              <p className="mt-4 text-base leading-7 text-white/65">
                {resultContent.subtitle}
              </p>

              <p className="mt-4 text-sm leading-7 text-white/48">
                {resultContent.description}
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs leading-5 text-white/42">
                  Esse é apenas um perfil inicial. Com o uso diário, o Axon
                  poderá ajustar sua rotina com base nos seus padrões reais.
                </p>
              </div>
            </motion.div>
          </section>

          <footer className="space-y-3 pb-2">
            <button
              onClick={() => navigate("/")}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98]"
            >
              Entrar no Axon
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <button
              onClick={goBack}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/60 backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              Revisar respostas
            </button>
          </footer>
        </div>
      </main>
    );
  }

  const Icon = currentQuestion.icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05050b] px-4 py-5 text-white">
      <Background />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
        <Header />

        <section className="flex flex-1 flex-col justify-center py-6">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-white/45">
                Pergunta {currentIndex + 1} de {questions.length}
              </p>
              <p className="text-sm text-purple-100">
                {Math.round(progress)}%
              </p>
            </div>

            <ProgressBar progress={progress} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-purple-300/20 bg-purple-500/15 text-purple-100 shadow-[0_0_50px_rgba(168,85,247,0.22)]">
                <Icon className="h-7 w-7" />
              </div>

              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                {currentQuestion.category}
              </div>

              <h1 className="text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                {currentQuestion.title}
              </h1>

              <p className="mt-4 text-sm leading-6 text-white/48">
                {currentQuestion.description}
              </p>

              <div className="mt-7 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => selectAnswer(option.id)}
                      className={`flex min-h-[76px] w-full items-center gap-3 rounded-3xl border p-4 text-left transition duration-300 active:scale-[0.99] ${
                        isSelected
                          ? "border-purple-300/40 bg-purple-500/15 shadow-[0_0_30px_rgba(168,85,247,0.16)]"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition ${
                          isSelected
                            ? "border-purple-300/30 bg-purple-500 text-white"
                            : "border-white/10 bg-white/[0.045] text-white/35"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white/30" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="mt-1 text-xs leading-5 text-white/42">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        <footer className="space-y-3 pb-2">
          <button
            onClick={goNext}
            disabled={!selectedAnswer}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
          >
            {currentIndex === questions.length - 1
              ? "Ver meu perfil inicial"
              : "Continuar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <button
            onClick={goBack}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/60 backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </button>
        </footer>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
          <Brain className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Axon</p>
          <p className="text-xs text-white/40">Mapeamento inicial</p>
        </div>
      </div>
    </header>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-14rem] top-[16rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.08),#05050b_88%)]" />
    </div>
  );
}