import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

const themeOptions: {
  value: Theme;
  label: string;
  description: string;
  icon: typeof Moon;
}[] = [
  {
    value: "dark",
    label: "Escuro",
    description: "Visual premium com fundo escuro.",
    icon: Moon,
  },
  {
    value: "light",
    label: "Claro",
    description: "Interface clara e suave.",
    icon: Sun,
  },
  {
    value: "system",
    label: "Sistema",
    description: "Segue o tema do dispositivo.",
    icon: Monitor,
  },
];

type ThemeToggleProps = {
  showHeader?: boolean;
};

export function ThemeToggle({ showHeader = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      {showHeader && (
        <div>
          <h3 className="text-base font-semibold text-primary">Aparência</h3>

          <p className="mt-1 text-sm leading-5 text-muted">
            Escolha como o AXON deve aparecer para você.
          </p>
        </div>
      )}

      <div className="grid gap-2">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`flex min-h-[4.5rem] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                isActive
                  ? "border-accent-soft bg-accent-soft text-primary shadow-card"
                  : "border-soft bg-surface-muted text-secondary hover:border-medium hover:bg-accent-muted"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${
                  isActive
                    ? "border-accent-soft bg-[var(--accent)] text-white"
                    : "border-soft bg-surface-muted text-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{option.label}</p>

                <p className="mt-0.5 text-xs leading-4 opacity-65">
                  {option.description}
                </p>
              </div>

              {isActive && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
