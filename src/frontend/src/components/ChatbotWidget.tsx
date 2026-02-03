import { useState, useRef, useEffect } from 'react';
import { useAskChatbot } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';
import { formatChatbotResponse, sanitizeBotResponse } from '../utils/chatbotFormatting';

interface Message {
  role: 'user' | 'bot';
  content: string | React.ReactNode;
}

interface ChatbotWidgetProps {
  onClose: () => void;
}

export default function ChatbotWidget({ onClose }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        "Hello! I'm your medical navigation assistant. Ask me about symptoms and I'll help you find the right doctor."
    }
  ]);
  const [input, setInput] = useState('');
  const askChatbot = useAskChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await askChatbot.mutateAsync(userMessage);
      const sanitizedResponse = sanitizeBotResponse(response);
      
      // If sanitization returned empty string, show fallback
      if (!sanitizedResponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content: "I'm sorry, I couldn't generate a proper response. Please try asking again or visit the Doctors page to browse available specialists."
          }
        ]);
      } else {
        // Format the response with proper line breaks and bullets
        const formattedContent = formatChatbotResponse(sanitizedResponse);
        setMessages((prev) => [...prev, { role: 'bot', content: formattedContent }]);
      }
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage = error.message?.includes('Actor not available')
        ? "I'm currently initializing. Please wait a moment and try again."
        : "I'm sorry, I'm having trouble connecting right now. Please try again or visit the Doctors page to browse available specialists.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: errorMessage
        }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {typeof message.content === 'string' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
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
