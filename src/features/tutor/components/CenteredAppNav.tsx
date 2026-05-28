import { Check, Trash2, X } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { GlassEffect } from "@/components/ui/glass-effect";
import type { RevisionSession } from "@/features/tutor/domain/types";

type CenteredAppNavProps = {
  activeSessionId?: string;
  hasSessionSearch: boolean;
  isCollapsed: boolean;
  sessions: RevisionSession[];
  sessionSearch: string;
  onDelete: (sessionId: string) => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onSessionSearchChange: (value: string) => void;
  onCloseNavigation: () => void;
  onToggleCollapse: () => void;
};

const formatRelativeDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";

  const now = new Date();
  const resolved = new Date(timestamp);
  const diffMs = now.getTime() - resolved.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return resolved.toLocaleDateString();
};

export const CenteredAppNav = memo(function CenteredAppNav({
  activeSessionId,
  hasSessionSearch,
  isCollapsed,
  sessions,
  sessionSearch,
  onCloseNavigation,
  onDelete,
  onNewChat,
  onSelectSession,
  onSessionSearchChange,
  onToggleCollapse,
}: CenteredAppNavProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const recentSessions = useMemo(() => sessions.slice(0, 20), [sessions]);
  const navStatus = isCollapsed ? "not-active" : "active";
  useEffect(() => {
    if (isCollapsed) {
      setConfirmDeleteId(null);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !isCollapsed &&
        !target.closest(".rr-centered-nav") &&
        !target.closest(".rr-chat-navigation__dark-bg")
      ) {
        onCloseNavigation();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, onCloseNavigation]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseNavigation();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCloseNavigation]);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleWheel = (event: WheelEvent) => {
      const list = listRef.current;
      if (!list) return;

      const canScroll = list.scrollHeight > list.clientHeight;
      if (!canScroll) return;

      list.scrollTop += event.deltaY;
      event.preventDefault();
    };

    contentEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      contentEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleCreate = () => {
    onNewChat();
    onCloseNavigation();
  };

  const handleSelect = (sessionId: string) => {
    onSelectSession(sessionId);
    onCloseNavigation();
  };

  const handleConfirmDelete = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConfirmDeleteId(null);
    onDelete(sessionId);
  };

  const handleCancelDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <nav
      data-lenis-prevent
      data-navigation-status={navStatus}
      className="rr-chat-navigation"
      aria-label="Teach Me navigation"
    >
      <button
        type="button"
        data-navigation-toggle="close"
        className="rr-chat-navigation__dark-bg"
        onClick={onCloseNavigation}
        aria-label="Close navigation"
      />

      <div className="rr-centered-nav">
        <button
          type="button"
          data-navigation-toggle="toggle"
          className="rr-centered-nav__toggle rr-osmo-glass-surface rr-osmo-glass-surface--pill"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-controls="teachme-recent-chats-list"
          aria-label={isCollapsed ? "Open navigation" : "Close navigation"}
        >
          <GlassEffect />
          <div className="rr-centered-nav__toggle-bar" />
          <div className="rr-centered-nav__toggle-bar" />
        </button>

        <div ref={contentRef} className="rr-centered-nav__content">
          <div className="rr-centered-nav__inner rr-osmo-glass-surface rr-osmo-glass-surface--menu">
            <GlassEffect />
            <div className="rr-osmo-glass-surface__content">
              <div className="rr-centered-nav__brand" aria-label="Teach Me">
                Teach Me
              </div>
              <label className="rr-centered-nav__search">
                <span>{hasSessionSearch ? "Matches" : "Find conversations"}</span>
                <input
                  type="search"
                  value={sessionSearch}
                  onChange={(event) => onSessionSearchChange(event.target.value)}
                  placeholder="Search saved conversations"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search chats"
                />
              </label>

              <ul
                id="teachme-recent-chats-list"
                ref={listRef}
                className="rr-centered-nav__section-list"
              >
                <li className="rr-centered-nav__section">
                  <div
                    className="rr-centered-nav__link"
                    style={{ transitionDelay: "0ms" }}
                  >
                    <span className="rr-centered-nav__index">00</span>
                    <button
                      type="button"
                      className="rr-centered-nav__copy"
                      onClick={handleCreate}
                    >
                      <span className="rr-centered-nav__section-title">Start conversation</span>
                      <span className="rr-centered-nav__section-subtitle">
                        Start fresh with your tutor.
                      </span>
                    </button>
                  </div>
                </li>

                {recentSessions.length > 0 ? (
                  recentSessions.map((session, idx) => {
                    const isActive = session.id === activeSessionId;
                    const delay = `${Math.min((idx + 1) * 60, 660)}ms`;
                    const isConfirmingDelete = confirmDeleteId === session.id;

                    return (
                      <li key={session.id} className="rr-centered-nav__section">
                        <div
                          className="rr-centered-nav__link group"
                          style={{ transitionDelay: delay }}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <span className="rr-centered-nav__index">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <button
                            type="button"
                            className="rr-centered-nav__copy"
                            onClick={() => handleSelect(session.id)}
                          >
                            <span className="rr-centered-nav__section-title">{session.title}</span>
                            <span className="rr-centered-nav__section-subtitle">
                              {isActive
                                ? "Current chat"
                                : `${formatRelativeDate(session.updatedAt)} · ${session.messages.length} messages`}
                            </span>
                          </button>
                          {isConfirmingDelete ? (
                            <span className="rr-centered-nav__actions is-confirming">
                              <span>Delete?</span>
                              <button
                                type="button"
                                onClick={(event) => handleConfirmDelete(session.id, event)}
                                aria-label={`Confirm delete ${session.title}`}
                              >
                                <Check size={15} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelDelete}
                                aria-label="Cancel delete"
                              >
                                <X size={15} strokeWidth={2.2} />
                              </button>
                            </span>
                          ) : (
                            <span className="rr-centered-nav__actions">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConfirmDeleteId(session.id);
                                }}
                                aria-label={`Delete ${session.title}`}
                              >
                                <Trash2 size={15} strokeWidth={2.1} />
                              </button>
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="rr-centered-nav__section">
                    <div
                      className="rr-centered-nav__link"
                      style={{ cursor: "default", transitionDelay: "60ms" }}
                    >
                      <span className="rr-centered-nav__index">01</span>
                      <span className="rr-centered-nav__copy is-static">
                        <span className="rr-centered-nav__section-title">
                          {hasSessionSearch ? "No matches" : "No chats yet"}
                        </span>
                        <span className="rr-centered-nav__section-subtitle">
                          {hasSessionSearch
                            ? `Nothing for "${sessionSearch.trim()}".`
                            : "Start a conversation to see it here."}
                        </span>
                      </span>
                    </div>
                  </li>
                )}
              </ul>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});
