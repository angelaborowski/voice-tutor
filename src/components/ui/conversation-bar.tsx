import * as React from "react";
import {
  useConversationControls,
  useConversationInput,
  useConversationStatus,
} from "@elevenlabs/react";
import {
  Mic,
  MicOff,
  PhoneIcon,
  XIcon,
} from "lucide-react";

import { GlassEffect } from "@/components/ui/glass-effect";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { cn } from "@/lib/utils";

type ConversationBarStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "disconnecting"
  | "error"
  | string;

export interface ConversationBarProps {
  agentId?: string;
  className?: string;
  waveformClassName?: string;
  status?: ConversationBarStatus;
  mode?: string;
  processing?: boolean;
  idleLabel?: string;
  guidance?: string;
  onStartOrEnd?: () => void | Promise<void>;
}

export const ConversationBar = React.forwardRef<
  HTMLDivElement,
  ConversationBarProps
>(
  (
    {
      agentId,
      className,
      waveformClassName,
      status: controlledStatus,
      mode,
      processing = false,
      idleLabel = "Voice ready",
      guidance,
      onStartOrEnd,
    },
    ref,
  ) => {
    const { status: contextStatus } = useConversationStatus();
    const { startSession, endSession } = useConversationControls();
    const { isMuted, setMuted } = useConversationInput();
    const mediaStreamRef = React.useRef<MediaStream | null>(null);

    const status = controlledStatus ?? contextStatus;
    const isConnected = status === "connected";
    const isConnecting = status === "connecting";
    const isBusy = isConnected || isConnecting || processing;
    const canMute = isConnected;
    const statusLabel = processing
      ? "Agent thinking"
      : isConnecting
        ? "Connecting"
        : isConnected
          ? mode === "speaking"
            ? "Speaking"
            : "Listening"
          : idleLabel;
    const helperText =
      guidance ??
      (isConnected
        ? "Talk now. Your words and the tutor reply appear here automatically."
        : "Start voice and speak out loud.");

    const getMicStream = React.useCallback(async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      return stream;
    }, []);

    const startConversation = React.useCallback(async () => {
      if (onStartOrEnd) {
        await onStartOrEnd();
        return;
      }

      if (!agentId) return;
      await getMicStream();
      startSession({
        agentId,
        connectionType: "webrtc",
      });
    }, [agentId, getMicStream, onStartOrEnd, startSession]);

    const handleEndSession = React.useCallback(async () => {
      if (onStartOrEnd) {
        await onStartOrEnd();
        return;
      }

      endSession();

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }, [endSession, onStartOrEnd]);

    const handleStartOrEnd = React.useCallback(async () => {
      if (isConnected || isConnecting) {
        await handleEndSession();
      } else {
        await startConversation();
      }
    }, [handleEndSession, isConnected, isConnecting, startConversation]);

    React.useEffect(() => {
      return () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);

    return (
      <div ref={ref} className={cn("conversation-bar", className)}>
        <div className="conversation-bar__card">
          <GlassEffect />
          <div className="conversation-bar__controls">
            <div className={cn("conversation-bar__waveform", waveformClassName)}>
              <LiveWaveform
                key={isBusy ? "active" : "idle"}
                active={isConnected && !isMuted}
                processing={isConnecting || processing}
                barWidth={3}
                barGap={1}
                barRadius={4}
                fadeEdges
                fadeWidth={24}
                height={20}
                mode="static"
                sensitivity={1.8}
                smoothingTimeConstant={0.85}
              />
              <span>{statusLabel}</span>
            </div>

            <div className="conversation-bar__buttons">
              {canMute && (
                <button
                  type="button"
                  className="conversation-bar__icon-button"
                  onClick={() => setMuted(!isMuted)}
                  aria-pressed={isMuted}
                  aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              )}
              <button
                type="button"
                className={cn(
                  "conversation-bar__call-button",
                  isConnected || isConnecting ? "is-live" : "",
                )}
                onClick={() => void handleStartOrEnd()}
                aria-label={isConnected || isConnecting ? "Stop voice" : "Start voice"}
              >
                {isConnected || isConnecting ? (
                  <XIcon size={19} />
                ) : (
                  <>
                    <PhoneIcon size={18} />
                    <span>Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="conversation-bar__hint">{helperText}</p>
      </div>
    );
  },
);

ConversationBar.displayName = "ConversationBar";
