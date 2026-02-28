"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const transport = new DefaultChatTransport({ api: "/api/ai/chat" });

export function AiAssistant() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";
  const hasMessages = messages.length > 0;

  const suggestions = [
    "What's good for a developer gift?",
    "Show me something under $25",
    "I need a new bag for my laptop",
    "What hats do you have?",
  ];

  function handleSuggestionClick(text: string) {
    if (isLoading) return;
    sendMessage({ text });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {hasMessages && (
          <>
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <Sparkles className="size-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Shopping Assistant
              </span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                AI
              </span>
            </div>

            <div
              ref={scrollRef}
              className="flex max-h-80 flex-col gap-3 overflow-y-auto px-5 py-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <span
                            key={i}
                            className="whitespace-pre-wrap [&_a]:font-medium [&_a]:underline"
                            dangerouslySetInnerHTML={{
                              __html: part.text.replace(
                                /\[([^\]]+)\]\(([^)]+)\)/g,
                                '<a href="$2">$1</a>',
                              ),
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}

              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-secondary px-3 py-2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
            </div>
          </>
        )}

        <div className={hasMessages ? "border-t border-border" : ""}>
          {!hasMessages && (
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {suggestions.map((text) => (
                <button
                  key={text}
                  onClick={() => handleSuggestionClick(text)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-5 py-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you today? Ask about products, get recommendations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              type="submit"
              size="icon"
              className="size-8 shrink-0"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
