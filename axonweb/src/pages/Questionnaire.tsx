import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
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

type Option = {
  id: string;
  label: string;
};

type Question = {
  id: string;
  category: string;
  title: string;
  icon: React.ElementType;
  options: Option[];
};

const questions: Question[] = [
  {
    id: "P1",
    category: "Sono e despertar",
    title: "Você acha fácil acordar pela manhã?",
    icon: Sunrise,
    options: [
      { id: "A", label: "Muito fácil." },
      { id: "B", label: "Moderadamente fácil." },
      { id: "C", label: "Normal." },
      { id: "D", label: "Difícil." },
      { id: "E", label: "Muito difícil." },
    ],
  },
  {
    id: "P2",
    category: "Sono e despertar",
    title: "Você se sente alerta durante a primeira meia hora depois de acordar?",
    icon: Zap,
    options: [
      { id: "A", label: "Totalmente alerta." },
      { id: "B", label: "Moderadamente alerta." },
      { id: "C", label: "Pouco alerta." },
      { id: "D", label: "Não me sinto alerta." },
    ],
  },
  {
    id: "P3",
    category: "Manhã",
    title: "Como é o seu apetite durante a primeira hora depois de acordar?",
    icon: Sun,
    options: [
      { id: "A", label: "Tenho bastante apetite." },
      { id: "B", label: "Apetite moderado." },
      { id: "C", label: "Pouco apetite." },
      { id: "D", label: "Sem apetite." },
    ],
  },
  {
    id: "P4",
    category: "Sono e despertar",
    title: "Pela manhã, você depende do despertador para acordar?",
    icon: Clock3,
    options: [
      { id: "A", label: "Não, acordo espontaneamente." },
      { id: "B", label: "Sim, mas sem dificuldades." },
      { id: "C", label: "Sim, às vezes com dificuldades." },
      { id: "D", label: "Sim, preciso de vários alarmes para conseguir acordar." },
    ],
  },
  {
    id: "P5",
    category: "Horário ideal de dormir",
    title: "Caso não tivesse compromisso na manhã seguinte, a que horas gostaria de deitar?",
    icon: Moon,
    options: [
      { id: "A", label: "Entre 21h e 22h." },
      { id: "B", label: "Entre 22h e 23h." },
      { id: "C", label: "Entre 23h e 00h30." },
      { id: "D", label: "Depois da 1h da manhã." },
    ],
  },
  {
    id: "P6",
    category: "Energia física",
    title: "Em qual horário você se sente fisicamente mais disposto e com mais energia no corpo?",
    icon: Zap,
    options: [
      { id: "A", label: "De manhã cedo, antes das 8h." },
      { id: "B", label: "No período da manhã, entre 8h e 12h." },
      { id: "C", label: "No início da tarde, entre 12h e 15h." },
      { id: "D", label: "No final da tarde, entre 15h e 20h." },
      { id: "E", label: "À noite, depois das 20h." },
    ],
  },
  {
    id: "P7",
    category: "Cansaço noturno",
    title: "À noite, entre 20h e 3h, a que horas você costuma se sentir cansado e com vontade de dormir?",
    icon: Moon,
    options: [
      { id: "A", label: "Entre 20h e 21h." },
      { id: "B", label: "Entre 21h e 22h30." },
      { id: "C", label: "Entre 22h30 e 00h30." },
      { id: "D", label: "Entre 00h30 e 3h." },
    ],
  },
  {
    id: "P8",
    category: "Horário ideal de acordar",
    title: "Se você tivesse total liberdade para planejar seu dia, a que horas preferiria acordar?",
    icon: Sunrise,
    options: [
      { id: "A", label: "Antes das 6h30." },
      { id: "B", label: "Entre 6h30 e 8h." },
      { id: "C", label: "Entre 8h e 9h30." },
      { id: "D", label: "Após 9h30." },
    ],
  },
  {
    id: "P9",
    category: "Qualidade do sono",
    title: "Como você descreveria a qualidade do seu sono atualmente?",
    icon: Moon,
    options: [
      { id: "A", label: "Durmo direto e acordo me sentindo 100% disposto." },
      { id: "B", label: "Acordo poucas vezes durante a noite, mas acordo me sentindo bem." },
      { id: "C", label: "Tenho dificuldade em pegar no sono, mas depois durmo bem." },
      { id: "D", label: "Acordo várias vezes durante a noite e tenho o sono leve." },
      { id: "E", label: "Sinto que durmo bem, mas acordo cansado e sem energia." },
      { id: "F", label: "Outro." },
    ],
  },
  {
    id: "P10",
    category: "Pico mental",
    title: "Em qual horário você estaria no máximo de sua forma para um teste de esforço mental?",
    icon: Brain,
    options: [
      { id: "A", label: "Antes das 10h." },
      { id: "B", label: "Entre 10h e 12h." },
      { id: "C", label: "Entre 13h30 e 16h." },
      { id: "D", label: "Entre 16h e 21h." },
      { id: "E", label: "Entre 21h e 00h." },
      { id: "F", label: "Depois das 00h." },
    ],
  },
  {
    id: "P11",
    category: "Produtividade",
    title: "Em qual período do dia você geralmente se sente mais produtivo para tarefas que exigem concentração?",
    icon: Brain,
    options: [
      { id: "A", label: "Nas primeiras horas da manhã (5h às 9h)." },
      { id: "B", label: "No final da manhã (9h às 12h)." },
      { id: "C", label: "No início da tarde (12h às 15h)." },
      { id: "D", label: "No final da tarde (15h às 18h)." },
      { id: "E", label: "À noite (18h às 22h)." },
      { id: "F", label: "Tarde da noite (após as 22h)." },
      { id: "G", label: "Não tenho um pico claro — cada dia é diferente." },
    ],
  },
  {
    id: "P12",
    category: "Queda de energia",
    title: "Você sente uma queda de energia em algum momento específico do dia?",
    icon: Zap,
    options: [
      { id: "A", label: "Não, sinto-me energizado o dia todo." },
      { id: "B", label: "Sim, no fim da manhã (10h às 12h)." },
      { id: "C", label: "Sim, no início da tarde (12h às 15h)." },
      { id: "D", label: "Sim, no meio da tarde (15h às 17h)." },
      { id: "E", label: "Sim, no final da tarde (17h às 20h)." },
      { id: "F", label: "Sim, no começo da noite (20h às 23h)." },
      { id: "G", label: "Sim, apenas de madrugada (após as 23h)." },
    ],
  },
  {
    id: "P13",
    category: "Criatividade",
    title: "Você consegue realizar tarefas criativas ou de resolução de problemas melhor em algum horário específico?",
    icon: Sparkles,
    options: [
      { id: "A", label: "Nas primeiras horas da manhã (antes das 09h)." },
      { id: "B", label: "No final da manhã (09h às 12h)." },
      { id: "C", label: "Durante a tarde (12h às 16h)." },
      { id: "D", label: "Final da tarde (16h às 19h)." },
      { id: "E", label: "Noite (19h às 22h)." },
      { id: "F", label: "Tarde da noite (depois das 22h)." },
      { id: "G", label: "Não tenho um pico definido." },
    ],
  },
  {
    id: "P14",
    category: "Execução",
    title: "Se tivesse que realizar uma tarefa importante e desafiadora, em qual horário você escolheria?",
    icon: Brain,
    options: [
      { id: "A", label: "Antes das 10h." },
      { id: "B", label: "Das 10h às 13h." },
      { id: "C", label: "Das 13h às 16h." },
      { id: "D", label: "Das 16h às 19h." },
      { id: "E", label: "Das 19h às 22h." },
      { id: "F", label: "Após as 22h." },
    ],
  },
  {
    id: "P15",
    category: "Turno menos produtivo",
    title: "Se você tivesse que descartar um turno do dia por considerá-lo menos produtivo, qual seria?",
    icon: Clock3,
    options: [
      { id: "A", label: "Manhã (antes das 12h)." },
      { id: "B", label: "Tarde (12h às 18h)." },
      { id: "C", label: "Noite (18h às 00h)." },
      { id: "D", label: "Madrugada (depois das 00h)." },
    ],
  },
  {
    id: "P16",
    category: "Melhor turno cognitivo",
    title: "Qual é o seu melhor turno para tarefas cognitivas exigentes?",
    icon: Brain,
    options: [
      { id: "A", label: "Manhã cedo, antes das 8h." },
      { id: "B", label: "Manhã, entre 8h e 12h." },
      { id: "C", label: "Começo da tarde, entre 12h e 16h." },
      { id: "D", label: "Final da tarde, entre 16h e 20h." },
      { id: "E", label: "Noite, entre 20h e 00h." },
      { id: "F", label: "Madrugada, depois das 00h." },
    ],
  },
  {
    id: "P17",
    category: "Ritmo de produtividade",
    title: "Como você descreveria sua produtividade ao longo do dia?",
    icon: Zap,
    options: [
      { id: "A", label: "Alta pela manhã e vai diminuindo ao longo do dia." },
      { id: "B", label: "Consistente ao longo de todo o dia, com pequenos picos." },
      { id: "C", label: "Baixa pela manhã, aumentando durante a tarde e a noite." },
      { id: "D", label: "Alta somente à noite." },
      { id: "E", label: "Tenho dois picos: um de manhã e outro à noite." },
    ],
  },
  {
    id: "P18",
    category: "Concentração",
    title: "Você sente que sua capacidade de se concentrar aumenta em algum horário específico do dia?",
    icon: Sparkles,
    options: [
      { id: "A", label: "Nas primeiras horas da manhã." },
      { id: "B", label: "No meio da manhã." },
      { id: "C", label: "No começo da tarde." },
      { id: "D", label: "No final da tarde." },
      { id: "E", label: "No início da noite." },
      { id: "F", label: "De madrugada." },
      { id: "G", label: "Em horários alternados, dependendo do dia." },
    ],
  },
];

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
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  function selectAnswer(optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  }

  async function handleFinish(finalAnswers: Record<string, string>) {
    const { P9: qualidade_sono = "F", ...respostas } = finalAnswers;

    navigate("/analyzing");

    try {
      const result = api.isLoggedIn()
        ? await api.classifyAndSave(respostas, qualidade_sono)
        : await api.classify(respostas, qualidade_sono);
      localStorage.setItem("axon_chronotype", result.cronotipo);
    } catch {
      // /result usa o valor que já estiver no localStorage
    }
  }

  function goNext() {
    if (!selectedAnswer || submitted) return;

    if (currentIndex === questions.length - 1) {
      setSubmitted(true);
      const finalAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
      handleFinish(finalAnswers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function goBack() {
    if (currentIndex === 0) {
      navigate("/questionnaire-intro");
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  }

  const Icon = currentQuestion.icon;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05050b] px-4 py-5 text-white">
      <Background />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col">
        <Header />

        <section className="flex flex-1 flex-col py-6">
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

              <h1 className="text-[1.6rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
                {currentQuestion.title}
              </h1>

              <div className="mt-7 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => selectAnswer(option.id)}
                      className={`flex min-h-[60px] w-full items-center gap-3 rounded-3xl border p-4 text-left transition duration-300 active:scale-[0.99] ${
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
                          <span className="text-xs font-semibold text-white/40">
                            {option.id}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium leading-5 text-white">
                        {option.label}
                      </p>
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
            disabled={!selectedAnswer || submitted}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:bg-purple-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
          >
            {currentIndex === questions.length - 1 ? (
              <>
                Analisar meu perfil
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <button
            onClick={goBack}
            disabled={submitted}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/60 backdrop-blur-2xl transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
