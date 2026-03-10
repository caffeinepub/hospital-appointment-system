import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAskChatbot } from "../hooks/useQueries";
import {
  formatChatbotResponse,
  isTimeoutError,
  isUnauthorizedError,
  sanitizeBotResponse,
  sanitizeErrorDetail,
} from "../utils/chatbotFormatting";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string | React.ReactNode;
}

interface ChatbotWidgetProps {
  onClose: () => void;
}

export default function ChatbotWidget({ onClose }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      content:
        "Hello! I'm your medical navigation assistant. Ask me about symptoms and I'll help you find the right doctor.",
    },
  ]);
  const [nextId, setNextId] = useState(1);
  const [input, setInput] = useState("");
  const askChatbot = useAskChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const addMessage = (
    role: "user" | "bot",
    content: string | React.ReactNode,
  ) => {
    setMessages((prev) => [...prev, { id: nextId, role, content }]);
    setNextId((n) => n + 1);
  };

  const handleSend = async () => {
    if (!input.trim() || askChatbot.isPending) return;

    const userMessage = input.trim();
    setInput("");
    addMessage("user", userMessage);

    try {
      const response = await askChatbot.mutateAsync(userMessage);
      const sanitizedResponse = sanitizeBotResponse(response);

      if (!sanitizedResponse) {
        addMessage(
          "bot",
          "I'm sorry, I couldn't generate a proper response. Please try asking again or visit the Doctors page to browse available specialists.",
        );
      } else {
        addMessage("bot", formatChatbotResponse(sanitizedResponse));
      }
    } catch (error: unknown) {
      console.error("Chatbot error:", error);

      if (isTimeoutError(error)) {
        addMessage(
          "bot",
          "I'm sorry, the request took too long to complete. Please try asking your question again.",
        );
      } else if (isUnauthorizedError(error)) {
        const errorDetail = sanitizeErrorDetail(error);
        addMessage(
          "bot",
          `Please sign in to access the medical chatbot. You need to be logged in to use this feature.\n\nDetails: ${errorDetail}`,
        );
      } else {
        const err = error as { message?: string };
        const friendlyMessage = err.message?.includes("Actor not available")
          ? "I'm currently initializing. Please wait a moment and try again."
          : "I'm sorry, I'm having trouble connecting right now. Please try again or visit the Doctors page to browse available specialists.";

        const errorDetail = sanitizeErrorDetail(error);
        addMessage(
          "bot",
          errorDetail
            ? `${friendlyMessage}\n\nDetails: ${errorDetail}`
            : friendlyMessage,
        );
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md">
      <Card className="shadow-lg border">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Medical Assistant</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {typeof message.content === "string" ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {askChatbot.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms..."
                disabled={askChatbot.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || askChatbot.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
