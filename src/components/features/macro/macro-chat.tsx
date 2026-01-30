"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MacroChatProps {
  reportId: string;
}

export function MacroChat({ reportId }: MacroChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: question };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/macro/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          question,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that question. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isOpen}
        >
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="h-5 w-5 text-primary-500" />
            Ask Follow-up Questions
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </CardHeader>

      {isOpen && (
        <CardContent>
          {/* Message history */}
          {messages.length > 0 && (
            <div className="mb-5 max-h-[500px] overflow-y-auto space-y-4 pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-muted text-foreground/85 border border-border"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-lg leading-relaxed">
                        {msg.content.split("\n\n").map((para, j) => (
                          <p key={j} className={j > 0 ? "mt-3" : ""}>
                            {para}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-lg leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-xl px-4 py-3">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this macro report..."
              disabled={isLoading}
              className="flex-1 h-12 rounded-lg border border-border bg-card px-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
