import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";
import { Orb, type AgentState } from "@/components/ui/orb";
import { Response } from "@/components/ui/response";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import type { TutorMessage } from "@/features/tutor/domain/types";

export function ChatThread({
  messages,
  isTutorPending,
  tutorLabel,
  agentState,
  orbColors,
  getInputVolume,
  getOutputVolume,
}: {
  messages: TutorMessage[];
  isTutorPending: boolean;
  tutorLabel: string;
  agentState: AgentState;
  orbColors: [string, string];
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}) {
  const isFreshThread =
    messages.length <= 1 && messages.every((message) => message.role === "tutor");
  const starterMessage = messages.find((message) => message.role === "tutor");
  const welcomeText = starterMessage?.text ?? "Tell me what you’re working on.";

  const orbNode = (
    <div className={`thread__orb-state is-${agentState ?? "idle"}`}>
      <div className="thread__orb" aria-hidden="true">
        <Orb
          agentState={agentState}
          colors={orbColors}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          seed={1107}
          className="thread__orb-canvas"
        />
      </div>
    </div>
  );

  return (
    <section className={`thread-shell ${isFreshThread ? "thread-shell--fresh" : ""}`}>
      {!isFreshThread && orbNode}
      <Conversation data-lenis-prevent className="thread">
        <ConversationContent className="thread__content">
          {isFreshThread && orbNode}
          {isFreshThread ? (
            <div className="thread__welcome">
              <p>{welcomeText}</p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                className={`thread__message thread__message--${message.role}`}
                from={message.role === "student" ? "user" : "assistant"}
              >
                <MessageContent
                  className="thread__bubble"
                  variant={message.role === "student" ? "contained" : "flat"}
                >
                  <span>
                    {message.role === "student" ? "You" : "Tutor"}
                    <time>{message.at}</time>
                  </span>
                  <Response className="thread__response">{message.text}</Response>
                </MessageContent>
              </Message>
            ))
          )}
          {isTutorPending && (
            <Message
              className="thread__message thread__message--tutor thread__message--pending"
              from="assistant"
            >
              <MessageContent className="thread__bubble" variant="flat">
                <span>Tutor</span>
                <div className="thread__thinking">
                  <ShimmeringText
                    text={`${tutorLabel} is thinking...`}
                    duration={1.15}
                    repeatDelay={0.1}
                    startOnView={false}
                    spread={3}
                    color="rgba(23, 18, 17, 0.34)"
                    shimmerColor="#171211"
                  />
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton className="thread__scroll" />
      </Conversation>
    </section>
  );
}
