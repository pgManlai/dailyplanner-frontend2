import { useState, useEffect, useRef } from "react";
import api from "@/lib/helper";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const initialLoadRef = useRef(false);
  const lastNotifiedIdRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await api.get("/ai/response");

      const data = Array.isArray(res) ? res : [];

      // Convert backend messages → separate user + assistant bubbles
      const normalized = data
        .sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .flatMap((msg) => [
          {
            id: `${msg.id}-user`,
            message: msg.message,
            response: null,
            role: "user",
            createdAt: msg.createdAt,
          },
          {
            id: `${msg.id}-assistant`,
            message: msg.message,
            response: msg.response,
            role: "assistant",
            createdAt: msg.createdAt,
          },
        ]);

      setMessages(normalized);

      // Scroll to bottom only on first load
      if (!initialLoadRef.current && bottomRef.current) {
        initialLoadRef.current = true;
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 0);
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  // Initial load + polling
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Ask for notification permission once
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Send web notification on new assistant reply
  useEffect(() => {
    if (!messages.length) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const last = messages[messages.length - 1];
    if (!last || last.response === null) return; // only assistant

    if (lastNotifiedIdRef.current === last.id) return;
    lastNotifiedIdRef.current = last.id;

    try {
      new Notification("AI туслах", {
        body: last.response,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      const res = await api.send("/ai/ask", { message: input });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-user",
          message: input,
          response: null,
          role: "user",
          createdAt: new Date().toISOString(),
        },
        {
          id: res.chat.id,
          message: res.chat.message,
          response: res.chat.response,
          role: "assistant",
          createdAt: res.chat.createdAt,
        },
      ]);

      setInput("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 0);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

  const clearChat = async () => {
    await api.senddelete("/ai/messages");
    setMessages([]);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI туслах
          </h1>

          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-2" />
            Цэвэрлэх
          </Button>
        </div>

        <div className="flex-1 flex flex-col bg-card rounded-xl border overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 mb-4 ${
                  msg.response === null ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={
                      msg.response === null
                        ? "bg-chart-2 text-white"
                        : "bg-primary text-primary-foreground"
                    }
                  >
                    {msg.response === null ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.response === null
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.response === null ? msg.message : msg.response}
                  </p>

                  <p className="text-xs mt-2 text-muted-foreground">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <p className="text-center text-sm text-muted-foreground my-2">
                AI бичиж байна...
              </p>
            )}

            <div ref={bottomRef} />
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Надаас юу ч асуугаарай..."
              disabled={loading}
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) {
                    sendMessage();
                  }
                }
              }}
            />

            <Button type="submit" disabled={!input.trim() || loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
