import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image as ImageIcon, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_user_id: string;
  message_text: string;
  message_type: string;
  attachment_url?: string;
  read_at?: string;
  created_at: string;
}

interface ArtistChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationshipId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export const ArtistChatDialog = ({
  open,
  onOpenChange,
  relationshipId,
  otherUserName,
  otherUserAvatar,
}: ArtistChatDialogProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!relationshipId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .eq("relationship_id", relationshipId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages((data || []) as unknown as Message[]);
    };

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat:${relationshipId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `relationship_id=eq.${relationshipId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `relationship_id=eq.${relationshipId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [relationshipId]);

  // Mark messages as read
  useEffect(() => {
    if (!user || !relationshipId || messages.length === 0) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => msg.sender_user_id !== user.id && !msg.read_at
      );

      if (unreadMessages.length === 0) return;

      const { error } = await supabase
        .from("chat_messages" as any)
        .update({ read_at: new Date().toISOString() } as any)
        .in(
          "id",
          unreadMessages.map((m) => m.id)
        );

      if (error) console.error("Error marking messages as read:", error);
    };

    markAsRead();
  }, [messages, user, relationshipId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from("chat_messages" as any).insert({
        relationship_id: relationshipId,
        sender_user_id: user.id,
        message_text: newMessage.trim(),
        message_type: "text",
      } as any);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>{otherUserName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{otherUserName}</DialogTitle>
              <p className="text-sm text-muted-foreground">Artist-Client Chat</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_user_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="text-xs opacity-70">
                        {format(new Date(message.created_at), "HH:mm")}
                      </span>
                      {isOwn && message.read_at && (
                        <CheckCheck className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[60px] resize-none"
              disabled={sending}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
