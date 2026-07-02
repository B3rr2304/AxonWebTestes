/* ==========================================================================
 * Esta página separa conversas soltas da aba "Projetos", mantendo busca,
 * criação rápida e navegação para a conversa interna.
 * ========================================================================== */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Focus,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  X,
  MoreVertical,
  Edit3,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { results, type ChronotypeResultKey } from "../data/results";
import Sidebar from "../components/layout/Sidebar";
import * as api from "../lib/api";
import type { ConversationData } from "../lib/api";

/* ==========================================================================
 * Tipos e aliases locais
 * ========================================================================== */
type ConversationType = "general" | "planning" | "focus" | "project";
type ProjectFolder = api.ChatProjectData;
type ProjectConversation = ConversationData & { project_id?: string | null };
type ConversationWithSortDates = ConversationData & {
  updated_at?: string | null;
  last_message_at?: string | null;
};

// Centraliza a prioridade de datas usada para ordenar conversas recentes.
function getConversationSortDate(conversation: ConversationData) {
  const item = conversation as ConversationWithSortDates;

  return new Date(
    item.last_message_at ?? item.updated_at ?? item.created_at
  ).getTime();
}

// Evita mutar a lista original antes de renderizar filtros e projetos.
function sortConversationsByRecent<T extends ConversationData>(items: T[]) {
  return [...items].sort(
    (a, b) => getConversationSortDate(b) - getConversationSortDate(a)
  );
}

// Fallback usado pela Sidebar quando o cronotipo salvo ainda não existe.
const validKeys: ChronotypeResultKey[] = [
  "Matutino",
  "Vespertino",
  "Noturno",
  "Misto",
  "Bimodal",
];

export default function Chat() {
  const navigate = useNavigate();

  /* --------------------------------------------------------------------------
   * Estados da lista e layout
   * -------------------------------------------------------------------------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "projects">("all");
  const [visibleCount, setVisibleCount] = useState(8);

  /* --------------------------------------------------------------------------
   * Conversas
   * -------------------------------------------------------------------------- */
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  /* --------------------------------------------------------------------------
   * Projetos / pastas de conversa
   * -------------------------------------------------------------------------- */
  const [projects, setProjects] = useState<ProjectFolder[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createConversationProjectId, setCreateConversationProjectId] =
    useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectFolder | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectFolder | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  /* --------------------------------------------------------------------------
   * Carregamento inicial de conversas
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    api
      .getConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false));
  }, []);

  /* --------------------------------------------------------------------------
   * Carregamento sob demanda dos projetos
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    if (view !== "projects") return;

    setLoadingProjects(true);

    api
      .getChatProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [view]);

  /* --------------------------------------------------------------------------
   * Dados da Sidebar
   * -------------------------------------------------------------------------- */
  const resultKey = useMemo<ChronotypeResultKey>(() => {
    const stored = localStorage.getItem("axon_chronotype");

    if (stored && validKeys.includes(stored as ChronotypeResultKey)) {
      return stored as ChronotypeResultKey;
    }

    return "Misto";
  }, []);

  const result = results[resultKey];

  /* --------------------------------------------------------------------------
   * Filtros e ordenação
   * -------------------------------------------------------------------------- */
  const looseConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const projectId = getConversationProjectId(conversation);
      return !conversation.archived && !projectId;
    });
  }, [conversations]);

  const projectConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const projectId = getConversationProjectId(conversation);
      return !conversation.archived && Boolean(projectId);
    });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const query = search.toLowerCase();

    const filtered = looseConversations.filter((conversation) => {
      const matchesSearch =
        conversation.title.toLowerCase().includes(query) ||
        (conversation.last_message ?? "").toLowerCase().includes(query);

      return matchesSearch;
    });

    return sortConversationsByRecent(filtered);
  }, [looseConversations, search]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const filteredProjectConversations = useMemo(() => {
    const query = search.toLowerCase();

    const filtered = projectConversations.filter((conversation) => {
      const belongsToSelectedProject =
        getConversationProjectId(conversation) === selectedProjectId;

      const matchesSearch =
        conversation.title.toLowerCase().includes(query) ||
        (conversation.last_message ?? "").toLowerCase().includes(query);

      return belongsToSelectedProject && matchesSearch;
    });

    return sortConversationsByRecent(filtered);
  }, [projectConversations, search, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();

    return projects.filter((project) => {
      const conversationsInsideProject = projectConversations.filter(
        (conversation) => getConversationProjectId(conversation) === project.id
      );

      const matchesProject =
        project.name.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query);

      const matchesConversation = conversationsInsideProject.some(
        (conversation) =>
          conversation.title.toLowerCase().includes(query) ||
          (conversation.last_message ?? "").toLowerCase().includes(query)
      );

      return matchesProject || matchesConversation;
    });
  }, [projects, projectConversations, search]);

  const activeConversationList =
    view === "projects" && selectedProjectId
      ? filteredProjectConversations
      : filteredConversations;

  const visibleConversations = activeConversationList.slice(0, visibleCount);
  const hasMoreConversations = activeConversationList.length > visibleCount;

  /* --------------------------------------------------------------------------
   * Paginação simples da lista
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    setVisibleCount(8);
  }, [search, view, selectedProjectId]);

  /* --------------------------------------------------------------------------
   * Navegação entre abas
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    if (view === "all") {
      setSelectedProjectId(null);
    }
  }, [view]);

  /* --------------------------------------------------------------------------
   * Criação de conversa/projeto
   * -------------------------------------------------------------------------- */
  function openCreateConversationModal(projectId?: string | null) {
    setCreateConversationProjectId(projectId ?? null);
    setIsCreateModalOpen(true);
  }

  /* --------------------------------------------------------------------------
   * Exclusão de projeto
   * -------------------------------------------------------------------------- */
  async function confirmDeleteProject() {
    if (!projectToDelete) return;

    setIsDeletingProject(true);

    try {
      await api.deleteChatProject(projectToDelete.id);

      setProjects((prev) =>
        prev.filter((project) => project.id !== projectToDelete.id)
      );

      if (selectedProjectId === projectToDelete.id) {
        setSelectedProjectId(null);
      }

      setProjectToDelete(null);
    } catch {
      // Mantém a tela estável se a exclusão falhar; o tratamento visual pode entrar depois.
    } finally {
      setIsDeletingProject(false);
    }
  }


  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#11111a] text-white">
      <Background />

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-5">
        {/* Header fixo: retorno ao dashboard, criação rápida e menu lateral. */}
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-left active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
              <img
                src="/axon-logo.svg"
                alt="Axon"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Chat</p>
              <p className="text-xs text-white/40">Conversas com o Axon</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                openCreateConversationModal(
                  view === "projects" ? selectedProjectId : null
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-xl shadow-purple-950/35 active:scale-[0.96]"
              aria-label="Nova conversa ou projeto"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          {/* Hero contextual da página de chat. */}
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1b1b27]/82 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_48%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />

              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Memória e contexto
                </div>

                <h1 className="text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white">
                  Organize suas conversas por assunto.
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Crie chats separados para rotina, foco, projetos, estudos ou
                  qualquer área que precise de acompanhamento.
                </p>
              </div>
            </div>
          </div>

          {/* Busca e alternância entre conversas soltas e projetos. */}
          <div className="sticky top-0 z-30 -mx-1 mb-4 space-y-3 bg-transparent px-1 py-3">
            <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1b27]/90 px-4 shadow-xl shadow-black/20 backdrop-blur-2xl">
              <Search className="h-4 w-4 text-white/35" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar conversa..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </label>

            <div className="flex rounded-2xl border border-white/10 bg-[#1b1b27]/90 p-1 shadow-xl shadow-black/20 backdrop-blur-2xl">
              <button
                onClick={() => setView("all")}
                className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  view === "all"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setView("projects")}
                className={`min-h-10 flex-1 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  view === "projects"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Projetos
              </button>
            </div>
          </div>

          {/* Lista principal: muda entre conversas, projetos e conversas do projeto selecionado. */}
          <section className="space-y-3 pb-4">
            {loadingConversations || (view === "projects" && loadingProjects) ? (
              <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                <p className="text-sm text-white/35">
                  {view === "projects"
                    ? "Carregando projetos..."
                    : "Carregando conversas..."}
                </p>
              </div>
            ) : view === "projects" ? (
              selectedProjectId && selectedProject ? (
                <>

                  {selectedProject && (
                    <SelectedProjectHeader
                      project={selectedProject}
                      onBack={() => setSelectedProjectId(null)}
                    />
                  )}

                  {activeConversationList.length === 0 ? (
                    <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                      <MessageCircle className="mx-auto mb-3 h-6 w-6 text-purple-200" />

                      <p className="text-sm font-semibold text-white">
                        Nenhuma conversa neste projeto
                      </p>

                      <p className="mt-2 text-xs leading-5 text-white/42">
                        Quando conversas forem adicionadas a este projeto, elas aparecerão aqui.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProjectId) {
                            openCreateConversationModal(selectedProjectId);
                          }
                        }}
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar conversa
                      </button>
                    </div>
                  ) : (
                    <>
                      {visibleConversations.map((conversation) => (
                        <ConversationCard
                          key={conversation.id}
                          conversation={conversation}
                          onClick={() => navigate(`/chat/${conversation.id}`)}
                        />
                      ))}

                      {hasMoreConversations && (
                        <button
                          type="button"
                          onClick={() => setVisibleCount((current) => current + 8)}
                          className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
                        >
                          Ver mais conversas
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : filteredProjects.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                  <Briefcase className="mx-auto mb-3 h-6 w-6 text-purple-200" />

                  <p className="text-sm font-semibold text-white">
                    Nenhum projeto encontrado
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/42">
                    Crie projetos para reunir conversas relacionadas em um mesmo contexto.
                  </p>

                  <button
                    type="button"
                    onClick={() => openCreateConversationModal(null)}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar projeto
                  </button>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const localCount = projectConversations.filter(
                    (conversation) => getConversationProjectId(conversation) === project.id
                  ).length;

                  const count = project.conversation_count ?? localCount;

                  return (
                    <ProjectFolderCard
                      key={project.id}
                      project={project}
                      count={count}
                      onClick={() => setSelectedProjectId(project.id)}
                      onCreateConversation={() => openCreateConversationModal(project.id)}
                      onEdit={() => setProjectToEdit(project)}
                      onDelete={() => setProjectToDelete(project)}
                    />
                  );
                })
              )
            ) : activeConversationList.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 text-center shadow-xl shadow-black/20 backdrop-blur-2xl">
                <MessageCircle className="mx-auto mb-3 h-6 w-6 text-purple-200" />

                <p className="text-sm font-semibold text-white">
                  Nenhuma conversa solta encontrada
                </p>

                <p className="mt-2 text-xs leading-5 text-white/42">
                  Conversas que pertencem a projetos aparecem apenas na aba Projetos.
                </p>

                <button
                  type="button"
                  onClick={() => openCreateConversationModal(null)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar conversa
                </button>
              </div>
            ) : (
              <>
                {visibleConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => navigate(`/chat/${conversation.id}`)}
                  />
                ))}

                {hasMoreConversations && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => current + 8)}
                    className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/55 backdrop-blur-2xl transition active:scale-[0.98]"
                  >
                    Ver mais conversas
                  </button>
                )}
              </>
            )}
          </section>
        </section>
      </div>

      {/* Sidebar global reaproveitada para navegação entre páginas do app. */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chronotypeLabel={result.label}
        energyPeak={result.energyPeak}
      />

      {/* Modal único para criar conversa solta, conversa dentro de projeto ou novo projeto. */}
      <CreateConversationModal
        isOpen={isCreateModalOpen}
        defaultProjectId={createConversationProjectId}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateConversationProjectId(null);
        }}
        onCreated={(conv) => {
          const conversationWithProject = {
            ...conv,
            project_id: conv.project_id ?? createConversationProjectId,
          } as ConversationData;

          setConversations((prev) => [conversationWithProject, ...prev]);
          setIsCreateModalOpen(false);
          setCreateConversationProjectId(null);
          navigate(`/chat/${conv.id}`);
        }}
        onProjectCreated={(project) => {
          setProjects((prev) => [project, ...prev]);
          setView("projects");
          setSelectedProjectId(project.id);
          setIsCreateModalOpen(false);
          setCreateConversationProjectId(null);
        }}
      />

      {/* Edição rápida de nome/descrição do projeto. */}
      <EditProjectModal
        project={projectToEdit}
        onClose={() => setProjectToEdit(null)}
        onUpdated={(updatedProject) => {
          setProjects((prev) =>
            prev.map((project) =>
              project.id === updatedProject.id ? updatedProject : project
            )
          );

          setProjectToEdit(null);
        }}
      />

      {/* Confirmação separada para evitar exclusão acidental de projeto. */}
      <DeleteProjectModal
        project={projectToDelete}
        isDeleting={isDeletingProject}
        onClose={() => {
          if (!isDeletingProject) {
            setProjectToDelete(null);
          }
        }}
        onConfirm={confirmDeleteProject}
      />
    </main>
  );

}

/* ==========================================================================
 * Cabeçalho do projeto selecionado
 * ========================================================================== */
function SelectedProjectHeader({
  project,
  onBack,
}: {
  project: ProjectFolder;
  onBack: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-purple-300/18 bg-[#21152f]/76 p-4 shadow-xl shadow-purple-950/15 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_52%)]" />

      <div className="relative">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/45 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos projetos
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/14 text-purple-100">
            <Briefcase className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-purple-100/50">
              Projeto
            </p>

            <h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.04em] text-white">
              {project.name}
            </h2>

            <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/45">
              {project.description || "Sem descrição"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Cards de conversa
 * ========================================================================== */
function ConversationCard({
  conversation,
  isFixed = false,
  onClick,
}: {
  conversation: ConversationData;
  isFixed?: boolean;
  onClick: () => void;
}) {

  const Icon = isFixed
    ? Bell
    : getConversationIcon(conversation.type as ConversationType);

  // Formata a data para leitura rápida na lista mobile.
  const formattedDate = useMemo(() => {
    const date = new Date(conversation.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return date.toLocaleDateString("pt-BR", { weekday: "short" });
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }, [conversation.created_at]);

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[1.7rem] border p-4 text-left shadow-xl shadow-black/20 backdrop-blur-2xl active:scale-[0.99] ${
        isFixed
          ? "border-purple-300/20 bg-purple-500/10"
          : conversation.archived
            ? "border-white/10 bg-white/[0.04]"
            : "border-white/10 bg-[#1b1b27]/76"
      }`}
    >
      <div
        className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border ${
          isFixed
            ? "border-purple-300/25 bg-purple-500/20 text-purple-100"
            : "border-purple-300/15 bg-purple-500/10 text-purple-200"
        }`}
      >
        <Icon className="h-5 w-5" />

        {isFixed && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1b1b27] bg-purple-400 px-1 text-[0.58rem] font-bold text-white">
            1
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {conversation.title}
            </p>

            {isFixed && (
              <span className="shrink-0 rounded-full border border-purple-300/20 bg-purple-500/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-purple-100">
                Fixo
              </span>
            )}
          </div>

          <p className="shrink-0 text-[0.68rem] text-white/32">
            {formattedDate}
          </p>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <p className="truncate text-xs text-white/38 capitalize">
            {conversation.type === "general" ? "Geral" :
             conversation.type === "planning" ? "Planejamento" :
             conversation.type === "focus" ? "Foco" : "Projeto"}
          </p>

          {conversation.archived && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-[0.6rem] font-semibold text-white/38">
              Arquivada
            </span>
          )}
        </div>

        {conversation.last_message && (
          <p className="line-clamp-1 text-xs leading-5 text-white/50">
            {conversation.last_message}
          </p>
        )}
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-white/22" />
    </button>
  );
}

// Ícone visual usado para diferenciar contexto geral, planejamento, foco e projeto.
function getConversationIcon(type: ConversationType) {
  if (type === "planning") return CalendarDays;
  if (type === "focus") return Focus;
  if (type === "project") return Briefcase;
  return MessageCircle;
}

/* ==========================================================================
 * Modal de criação de conversa/projeto
 * ========================================================================== */
function CreateConversationModal({
  isOpen,
  defaultProjectId,
  onClose,
  onCreated,
  onProjectCreated,
}: {
  isOpen: boolean;
  defaultProjectId?: string | null;
  onClose: () => void;
  onCreated: (conv: ConversationData) => void;
  onProjectCreated: (project: api.ChatProjectData) => void;
}) {
  const [createMode, setCreateMode] = useState<"conversation" | "project">(
    "conversation"
  );
  const [selectedType, setSelectedType] =
    useState<ConversationType>("general");
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isInsideProject = Boolean(defaultProjectId);

  // Sempre reabre o modal limpo e respeitando o projeto de origem.
  useEffect(() => {
    if (!isOpen) return;

    setCreateMode("conversation");
    setSelectedType(defaultProjectId ? "project" : "general");
    setTitle("");
    setProjectName("");
    setProjectDescription("");
    setFormError(null);
    setIsLoading(false);
  }, [isOpen, defaultProjectId]);

  if (!isOpen) return null;

  // Decide entre criar projeto, conversa solta ou conversa já vinculada ao projeto.
  async function handleCreate() {
    setFormError(null);

    if (createMode === "project" && !isInsideProject) {
      if (!projectName.trim()) {
        setFormError("Dê um nome para o projeto.");
        return;
      }

      setIsLoading(true);

      try {
        const project = await api.createChatProject({
          name: projectName.trim(),
          description: projectDescription.trim() || undefined,
        });

        onProjectCreated(project);
      } catch (e) {
        setFormError(e instanceof Error ? e.message : "Erro ao criar projeto");
      } finally {
        setIsLoading(false);
      }

      return;
    }

    const finalTitle = title.trim() || "Nova conversa";
    const finalType = defaultProjectId ? "project" : selectedType;

    setIsLoading(true);

    try {
      const conv = await api.createConversation(
        finalTitle,
        finalType,
        defaultProjectId ?? undefined
      );

      onCreated(conv);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao criar conversa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/18" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Plus className="h-3.5 w-3.5" />
                {isInsideProject ? "Nova conversa" : "Novo espaço"}
              </div>

              <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                {isInsideProject
                  ? "Criar conversa no projeto"
                  : createMode === "project"
                  ? "Criar projeto"
                  : "Criar conversa"}
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                {isInsideProject
                  ? "Esta conversa será vinculada ao projeto selecionado."
                  : createMode === "project"
                  ? "Reúna conversas relacionadas em um mesmo contexto."
                  : "Separe assuntos para o Axon acompanhar cada contexto com mais clareza."}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96] disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          {/* Quando não veio de um projeto, o modal também permite criar uma nova pasta. */}
          {!isInsideProject && (
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-1">
              <button
                type="button"
                onClick={() => setCreateMode("conversation")}
                className={`min-h-11 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  createMode === "conversation"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Conversa
              </button>

              <button
                type="button"
                onClick={() => setCreateMode("project")}
                className={`min-h-11 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                  createMode === "project"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-950/25"
                    : "text-white/42"
                }`}
              >
                Projeto
              </button>
            </div>
          )}

          {createMode === "conversation" || isInsideProject ? (
            <>
              {/* Tipos de conversa solta ajudam o Axon a interpretar o contexto inicial. */}
              {!isInsideProject && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <ConversationTypeButton
                    active={selectedType === "general"}
                    icon={MessageCircle}
                    label="Geral"
                    onClick={() => setSelectedType("general")}
                  />

                  <ConversationTypeButton
                    active={selectedType === "planning"}
                    icon={CalendarDays}
                    label="Planejamento"
                    onClick={() => setSelectedType("planning")}
                  />

                  <ConversationTypeButton
                    active={selectedType === "focus"}
                    icon={Focus}
                    label="Foco"
                    onClick={() => setSelectedType("focus")}
                  />

                  <ConversationTypeButton
                    active={selectedType === "project"}
                    icon={Briefcase}
                    label="Projeto"
                    onClick={() => setSelectedType("project")}
                  />
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Nome da conversa
                </span>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  type="text"
                  placeholder="Ex: Estudos, Trabalho, Rotina..."
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>

              {isInsideProject && (
                <div className="mt-4 rounded-2xl border border-purple-300/15 bg-purple-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-200" />
                    <p className="text-sm font-semibold text-purple-100">
                      Conversa de projeto
                    </p>
                  </div>

                  <p className="text-xs leading-5 text-white/50">
                    Esta conversa será criada diretamente dentro do projeto atual.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Nome do projeto
                </span>

                <input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  type="text"
                  placeholder="Ex: AXON WebApp"
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white/42">
                  Descrição
                </span>

                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Ex: Conversas sobre telas, fluxo, backend e decisões do produto."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
                />
              </label>

              <div className="rounded-2xl border border-purple-300/15 bg-purple-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-200" />
                  <p className="text-sm font-semibold text-purple-100">
                    Como o Axon usa projetos
                  </p>
                </div>

                <p className="text-xs leading-5 text-white/50">
                  Projetos servem para reunir conversas relacionadas em um mesmo contexto.
                </p>
              </div>
            </div>
          )}

          {formError && (
            <p className="mt-3 text-xs font-medium text-rose-300">
              {formError}
            </p>
          )}
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isLoading}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-purple-500 px-6 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Criando..."
              : createMode === "project" && !isInsideProject
              ? "Criar projeto"
              : "Criar conversa"}
            {!isLoading && <Plus className="ml-2 h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-semibold text-white/55 active:scale-[0.98] disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Botão de tipo de conversa
 * ========================================================================== */
function ConversationTypeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[4.6rem] flex-col items-center justify-center gap-2 rounded-2xl border text-xs font-semibold transition active:scale-[0.98] ${
        active
          ? "border-purple-300/30 bg-purple-500/20 text-purple-100 shadow-lg shadow-purple-950/20"
          : "border-white/10 bg-white/[0.045] text-white/42"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}

/* ==========================================================================
 * Cards de projeto
 * ========================================================================== */
function ProjectFolderCard({
  project,
  count,
  onClick,
  onCreateConversation,
  onEdit,
  onDelete,
}: {
  project: ProjectFolder;
  count: number;
  onClick: () => void;
  onCreateConversation: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="group w-full rounded-[2rem] border border-white/10 bg-[#1b1b27]/76 p-5 pr-16 text-left shadow-xl shadow-black/20 backdrop-blur-2xl transition active:scale-[0.98]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/12 text-purple-200">
            <Briefcase className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white">
              {project.name}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/42">
              {project.description || "Sem descrição"}
            </p>

            <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[0.68rem] font-semibold text-white/42">
              {count} {count === 1 ? "conversa" : "conversas"}
            </div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsMenuOpen((current) => !current);
        }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/45 active:scale-[0.96]"
        aria-label="Ações do projeto"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-4 top-16 z-40 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b27]/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen(false);
              onCreateConversation();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-white/58 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nova conversa
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen(false);
              onEdit();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-white/58 active:scale-[0.98]"
          >
            <Edit3 className="h-4 w-4" />
            Editar projeto
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen(false);
              onDelete();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-200/80 active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" />
            Excluir projeto
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
 * Modal de edição de projeto
 * ========================================================================== */
function EditProjectModal({
  project,
  onClose,
  onUpdated,
}: {
  project: ProjectFolder | null;
  onClose: () => void;
  onUpdated: (project: ProjectFolder) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sincroniza o formulário sempre que um projeto diferente é escolhido.
  useEffect(() => {
    if (!project) return;

    setName(project.name ?? "");
    setDescription(project.description ?? "");
    setSubmitting(false);
    setFormError(null);
  }, [project]);

  if (!project) return null;

  // Envia apenas nome e descrição, mantendo as conversas do projeto intactas.
  async function handleSubmit() {
    if (!project) return;

    if (!name.trim()) {
      setFormError("Dê um nome para o projeto.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const updatedProject = await api.updateChatProject(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      onUpdated(updatedProject);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao atualizar projeto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[82vh] w-full max-w-[390px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#171720]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_48%)]" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
                <Edit3 className="h-3.5 w-3.5" />
                Projeto
              </div>

              <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                Editar projeto
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Atualize o nome e a descrição deste projeto.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/45 active:scale-[0.96] disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Nome
              </span>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white/42">
                Descrição
              </span>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-purple-300/35"
              />
            </label>

            {formError && (
              <p className="text-xs font-medium text-rose-300">{formError}</p>
            )}
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#171720]/95 px-5 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white shadow-xl shadow-purple-950/35 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Salvar alterações
                <Edit3 className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/55 active:scale-[0.98] disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Modal de exclusão de projeto
 * ========================================================================== */
function DeleteProjectModal({
  project,
  isDeleting,
  onClose,
  onConfirm,
}: {
  project: ProjectFolder | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#15141f]/95 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold tracking-[-0.035em] text-white">
          Excluir projeto?
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          Essa ação vai excluir o projeto{" "}
          <span className="font-semibold text-white/75">"{project.name}"</span>.
        </p>

        <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 text-left">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/28">
            Atenção
          </p>

          <p className="mt-2 text-xs leading-5 text-white/42">
            Confirme com o backend se as conversas serão mantidas fora do projeto
            ou excluídas junto com ele.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98] disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-500/90 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 active:scale-[0.98] disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo
              </>
            ) : (
              <>
                Excluir
                <Trash2 className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Helpers finais
 * ========================================================================== */

// Compatibiliza conversas antigas/novas sem exigir project_id no tipo base.
function getConversationProjectId(conversation: ConversationData) {
  return (conversation as ProjectConversation).project_id ?? null;
}

/* ==========================================================================
 * Background
 * ========================================================================== */
function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]" />

      <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[18rem] h-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]" />
    </div>
  );
}
