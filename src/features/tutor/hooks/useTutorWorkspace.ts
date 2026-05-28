import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchHealth, generateStudyNote, getVoiceToken, sendTutorMessage, syncTutorPersonality } from "@/features/tutor/api/client";
import { AGENT_SETTINGS_STORAGE_KEY, STUDIO_BACKDROP_STORAGE_KEY, getPersonalityVoiceId, hasLearnerTurn, isMeaningfulSpeechText, personalityLabels, readAgentSettings, readStoredSessions, readStudioBackdrop, readStudioTheme, type AgentSettings, type StudioTheme, type StudyPackTab, type StudioBackdrop } from "@/features/tutor/domain/settings";
import { STORAGE_KEY, createId, createStarterSession, getTimeLabel, previewFromMessages, titleFromMessages } from "@/features/tutor/domain/tutorContent";
import type { HealthStatus, RevisionSession, StudyNote, TutorMessage } from "@/features/tutor/domain/types";
import type { AgentState } from "@/components/ui/orb";

type VoicePayload = {
  message: string;
  role?: "user" | "agent" | "assistant" | "ai";
  source?: "user" | "agent" | "assistant" | "ai";
};

export function useTutorWorkspace() {
  const navigate = useNavigate();
  const studyNoteRequestsRef = useRef<Map<string, Promise<StudyNote>>>(new Map());
  const [sessions, setSessions] = useState<RevisionSession[]>(() => {
    const stored = readStoredSessions();
    const starter = createStarterSession();
    return [starter, ...stored.filter(hasLearnerTurn)].slice(0, 16);
  });
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id ?? createStarterSession().id);
  const [isTutorPending, setIsTutorPending] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState("Text tutor ready");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [sessionSearch, setSessionSearch] = useState("");
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(readAgentSettings);
  const [studioBackdrop] = useState<StudioBackdrop>(readStudioBackdrop);
  const [studioTheme, setStudioTheme] = useState<StudioTheme>(readStudioTheme);
  const [isStudyPackOpen, setIsStudyPackOpen] = useState(false);
  const [isStudyPackPending, setIsStudyPackPending] = useState(false);
  const [activePackTab, setActivePackTab] = useState<StudyPackTab>("summary");
  const [textDraft, setTextDraft] = useState("");

  const closeSidebarOnMobile = useCallback(() => {
    if (window.matchMedia("(max-width: 820px)").matches) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [activeSessionId, sessions],
  );

  const updateSession = useCallback(
    (sessionId: string, updater: (session: RevisionSession) => RevisionSession) => {
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? updater(session) : session,
        ),
      );
    },
    [],
  );

  const updateActiveSession = useCallback(
    (updater: (session: RevisionSession) => RevisionSession) => {
      updateSession(activeSessionId, updater);
    },
    [activeSessionId, updateSession],
  );

  const requestStudyNote = useCallback(
    async (session: RevisionSession) => {
      const requestKey = studyNoteRequestKey(session);
      let request = studyNoteRequestsRef.current.get(requestKey);

      if (!request) {
        request = generateStudyNote(session.messages);
        studyNoteRequestsRef.current.set(requestKey, request);
      }

      try {
        const note = await request;
        updateSession(session.id, (currentSession) => {
          if (studyNoteRequestKey(currentSession) !== requestKey || currentSession.studyNote) {
            return currentSession;
          }

          return {
            ...currentSession,
            title: note.topic && note.topic !== "Study session" ? note.topic : currentSession.title,
            studyNote: note,
            updatedAt: Date.now(),
          };
        });

        return note;
      } finally {
        if (studyNoteRequestsRef.current.get(requestKey) === request) {
          studyNoteRequestsRef.current.delete(requestKey);
        }
      }
    },
    [updateSession],
  );

  const appendMessage = useCallback(
    (message: TutorMessage) => {
      updateActiveSession((session) => {
        const messages = [...session.messages, message];
        return {
          ...session,
          title: titleFromMessages(messages),
          preview: previewFromMessages(messages),
          updatedAt: Date.now(),
          messages,
        };
      });
    },
    [updateActiveSession],
  );

  const conversation = useConversation({
    onMessage: (payload: VoicePayload) => {
      if (!isMeaningfulSpeechText(payload.message)) {
        return;
      }

      const speaker = payload.role ?? payload.source;
      const role = speaker === "user" ? "student" : "tutor";
      setIsTutorPending(role === "student");
      appendMessage({
        id: createId("voice-message"),
        role,
        text: payload.message,
        at: getTimeLabel(),
      });
    },
    onError: (error) => {
      setStatusMessage(typeof error === "string" ? error : "Voice session error");
    },
    onConnect: () => {
      const voiceId = getPersonalityVoiceId(agentSettings.personality);
      setStatusMessage(
        voiceId
          ? `${personalityLabels[agentSettings.personality]} voice live`
          : "Voice live",
      );
    },
    onDisconnect: () => {
      setStatusMessage("Voice stopped");
    },
    onInterruption: () => {
      setStatusMessage("Interrupted. Your tutor is listening again.");
    },
  });

  const handleThemeToggle = useCallback(() => {
    setStudioTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.filter(hasLearnerTurn)));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(AGENT_SETTINGS_STORAGE_KEY, JSON.stringify(agentSettings));
    void syncTutorPersonality(agentSettings.personality);
  }, [agentSettings]);

  useEffect(() => {
    localStorage.setItem(STUDIO_BACKDROP_STORAGE_KEY, studioBackdrop);
  }, [studioBackdrop]);

  useEffect(() => {
    if (window.Cookies) {
      window.Cookies.set("theme", studioTheme, { expires: 365 });
      return;
    }

    document.cookie = `theme=${studioTheme}; max-age=31536000; path=/; SameSite=Lax`;
  }, [studioTheme]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();

      if (tagName === "input" || tagName === "textarea" || target?.isContentEditable) {
        return;
      }

      if (event.shiftKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        handleThemeToggle();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [handleThemeToggle]);

  useEffect(() => {
    fetchHealth()
      .then((nextHealth) => {
        setHealth(nextHealth);
        setStatusMessage(
          nextHealth.elevenLabsConfigured && nextHealth.speechEngineConfigured && nextHealth.openAiConfigured
            ? "Teach Me ready"
            : nextHealth.elevenLabsConfigured && nextHealth.openAiConfigured && !nextHealth.voiceTransportConfigured
              ? "Text tutor ready. Live voice needs a voice server."
            : "Text tutor ready",
        );
      })
      .catch(() => {
        setHealth(null);
        setStatusMessage("Text tutor ready");
      });
  }, []);

  useEffect(() => {
    const latest = activeSession?.messages.at(-1);
    if (!latest || latest.role !== "tutor" || activeSession.messages.length < 2 || activeSession.studyNote) {
      return;
    }

    void requestStudyNote(activeSession);
  }, [activeSession, requestStudyNote]);

  const handleNewChat = useCallback(() => {
    const next = createStarterSession();
    setSessions((current) => [next, ...current.filter(hasLearnerTurn)].slice(0, 16));
    setActiveSessionId(next.id);
    closeSidebarOnMobile();
    navigate("/app");
  }, [closeSidebarOnMobile, navigate]);

  const handleVoiceToggle = async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
      setStatusMessage("Voice stopped");
      return;
    }

    if (!health?.elevenLabsConfigured || !health.speechEngineConfigured || !health.openAiConfigured) {
      setStatusMessage(
        !health?.voiceTransportConfigured
          ? "Live voice needs a separate voice server outside Vercel."
          : "Live voice needs ElevenLabs, OpenAI, and a Speech Engine ID.",
      );
      return;
    }

    try {
      setStatusMessage("Connecting voice...");
      const token = await getVoiceToken();
      const voiceId = getPersonalityVoiceId(agentSettings.personality);
      void conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        ...(voiceId
          ? {
              overrides: {
                tts: {
                  voiceId,
                },
              },
            }
          : {}),
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Voice start failed");
    }
  };

  const handleTextSubmit = useCallback(async () => {
    const input = textDraft.trim();
    if (!input || isTutorPending || !activeSession) return;

    const history = activeSession.messages;
    const studentMessage: TutorMessage = {
      id: createId("typed-message"),
      role: "student",
      text: input,
      at: getTimeLabel(),
    };

    setTextDraft("");
    appendMessage(studentMessage);
    setIsTutorPending(true);
    setStatusMessage("Tutor thinking...");

    try {
      const reply = await sendTutorMessage(history, input, agentSettings.personality);
      appendMessage({
        id: createId("typed-reply"),
        role: "tutor",
        text: reply,
        at: getTimeLabel(),
      });
      setStatusMessage("Learning pack ready after a short exchange");
    } catch {
      setStatusMessage("Tutor reply failed. Try again.");
    } finally {
      setIsTutorPending(false);
    }
  }, [activeSession, agentSettings.personality, appendMessage, isTutorPending, textDraft]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    closeSidebarOnMobile();
    navigate("/app");
  }, [closeSidebarOnMobile, navigate]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((current) => {
      const remaining = current.filter((session) => session.id !== sessionId);
      const next = remaining.length > 0 ? remaining : [createStarterSession()];

      if (sessionId === activeSessionId) {
        setActiveSessionId(next.find(hasLearnerTurn)?.id ?? next[0].id);
      }

      return next;
    });
  }, [activeSessionId]);

  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed((value) => !value);
  }, []);

  const handleCloseNavigation = useCallback(() => {
    setIsSidebarCollapsed(true);
  }, []);

  const handleOpenStudyPack = async () => {
    if (!activeSession || activeSession.messages.length < 2) {
      setStatusMessage("Have a quick chat first, then I’ll build the learning pack.");
      return;
    }

    setIsStudyPackOpen(true);
    if (activeSession.studyNote) {
      return;
    }

    setIsStudyPackPending(true);
    try {
      await requestStudyNote(activeSession);
      setStatusMessage("Learning pack ready");
    } finally {
      setIsStudyPackPending(false);
    }
  };

  const agentState: AgentState = isTutorPending
    ? "thinking"
    : conversation.status === "connected"
      ? conversation.mode === "speaking"
        ? "talking"
        : "listening"
      : null;
  const visibleSessions = useMemo(() => {
    const savedSessions = sessions.filter(hasLearnerTurn);
    const query = sessionSearch.trim().toLowerCase();
    if (!query) return savedSessions;

    return savedSessions.filter((session) =>
      [session.title, session.preview, ...session.messages.map((message) => message.text)]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [sessionSearch, sessions]);

  const hasSessionSearch = Boolean(sessionSearch.trim());
  const canShowStudyPack = Boolean(activeSession && activeSession.messages.length >= 2);
  const shouldShowHeaderStatus =
    /needs|failed|error/i.test(statusMessage);

  return {
    activePackTab,
    activeSession,
    agentSettings,
    agentState,
    canShowStudyPack,
    conversation,
    handleDeleteSession,
    handleCloseNavigation,
    handleNewChat,
    handleOpenStudyPack,
    handleSelectSession,
    handleThemeToggle,
    handleToggleCollapse,
    handleVoiceToggle,
    hasSessionSearch,
    isSidebarCollapsed,
    isStudyPackOpen,
    isStudyPackPending,
    isTutorPending,
    sessionSearch,
    setActivePackTab,
    setAgentSettings,
    setIsStudyPackOpen,
    setSessionSearch,
    setTextDraft,
    shouldShowHeaderStatus,
    statusMessage,
    studioBackdrop,
    studioTheme,
    textDraft,
    visibleSessions,
    handleTextSubmit,
  };
}

function studyNoteRequestKey(session: RevisionSession) {
  return `${session.id}:${session.messages.map((message) => message.id).join("|")}`;
}
