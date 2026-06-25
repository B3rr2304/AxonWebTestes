import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";

import * as api from "../../lib/api";

export default function NotificationToastProvider() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState<api.NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const lastSeenIdRef = useRef<string | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const [actionLoading, setActionLoading] = useState<"read" | "accept" | "reject" | null>(null);

  const shouldCheckNotifications =
    api.isLoggedIn() &&
    !["/", "/login", "/signup", "/forgot-password", "/reset-password"].includes(
      location.pathname
    );

  useEffect(() => {
    if (!shouldCheckNotifications) return;
    let interval: number | undefined;
    let cancelled = false;

    const shownKey = "axon_shown_notification_ids";

    function getShownIds() {
      try {
        return JSON.parse(localStorage.getItem(shownKey) ?? "[]") as string[];
      } catch {
        return [];
      }
    }

    function saveShownId(id: string) {
      const shownIds = getShownIds();
      const next = [id, ...shownIds.filter((shownId) => shownId !== id)].slice(
        0,
        30
      );

      localStorage.setItem(shownKey, JSON.stringify(next));
    }

    async function checkNotifications() {
      try {
        const notifications = await api.getNotifications(5, 0);
        const latestUnread = notifications.find(
          (notification) => notification.status === "unread"
        );

        if (!latestUnread) return;

        const shownIds = getShownIds();

        if (shownIds.includes(latestUnread.id)) return;

        if (cancelled) return;

        saveShownId(latestUnread.id);

        setToast(latestUnread);
        setIsVisible(true);

        if (hideTimeoutRef.current) {
          window.clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
        }, 6000);
      } catch {
        // silencioso
      }
    }

    checkNotifications();

    interval = window.setInterval(checkNotifications, 15000);

    const handleVisibility = () => {
      if (!document.hidden) checkNotifications();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;

      if (interval) window.clearInterval(interval);
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [shouldCheckNotifications]);

  if (!toast || !isVisible) return null;

  function openNotifications() {
    setIsVisible(false);
    navigate("/dashboard?notifications=open");
  }

  async function handleMarkAsRead() {
    if (!toast) return;

    setActionLoading("read");

    try {
      await api.markNotificationRead(toast.id);
      setIsVisible(false);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAccept() {
    if (!toast) return;

    setActionLoading("accept");

    try {
      await api.acceptNotification(toast.id);
      setIsVisible(false);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!toast) return;

    setActionLoading("reject");

    try {
      await api.rejectNotification(toast.id);
      setIsVisible(false);
    } finally {
      setActionLoading(null);
    }
  }

  const isImprovement = toast.type === "improvement";

  return (
    <div className="fixed left-0 right-0 top-4 z-[200] px-4">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[1.6rem] border border-purple-300/20 bg-[#171720]/95 p-4 shadow-2xl shadow-black/45 backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={openNotifications}
              className="flex w-full min-w-0 items-start gap-3 text-left active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/25 bg-purple-500/15 text-purple-100">
                <Bell className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-purple-100/55">
                  {isImprovement ? "Nova sugestão" : "Nova notificação"}
                </p>

                <p className="mt-1 line-clamp-1 text-sm font-semibold text-white">
                  {toast.title}
                </p>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/42">
                  {toast.body}
                </p>
              </div>
            </button>

            <div className="mt-3 flex gap-2 pl-14">
              {isImprovement ? (
                <>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={actionLoading !== null}
                    className="min-h-9 flex-1 rounded-xl bg-purple-500 px-3 text-xs font-semibold text-white active:scale-[0.98] disabled:opacity-60"
                  >
                    {actionLoading === "accept" ? "Aceitando..." : "Aceitar"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="min-h-9 flex-1 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-xs font-semibold text-white/55 active:scale-[0.98] disabled:opacity-60"
                  >
                    {actionLoading === "reject" ? "Recusando..." : "Recusar"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  disabled={actionLoading !== null}
                  className="min-h-9 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-xs font-semibold text-white/55 active:scale-[0.98] disabled:opacity-60"
                >
                  {actionLoading === "read" ? "Marcando..." : "Marcar como lida"}
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/40 active:scale-[0.96]"
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}