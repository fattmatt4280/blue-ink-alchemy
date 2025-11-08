import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { ArtistChatDialog } from "./ArtistChatDialog";

interface Relationship {
  id: string;
  client_user_id: string;
  artist_user_id: string;
  relationship_status: string;
  created_at: string;
  unread_count?: number;
  client_name?: string;
  artist_name?: string;
  last_message?: string;
  last_message_time?: string;
}

export const ArtistChatList = () => {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRelationships = async () => {
      const { data, error } = await supabase
        .from("client_artist_relationships" as any)
        .select("*")
        .or(`client_user_id.eq.${user.id},artist_user_id.eq.${user.id}`)
        .eq("relationship_status", "active")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching relationships:", error);
        setLoading(false);
        return;
      }

      // Fetch additional details for each relationship
      const enrichedData = await Promise.all(
        ((data || []) as any[]).map(async (rel: any) => {
          const otherUserId = rel.client_user_id === user.id ? rel.artist_user_id : rel.client_user_id;
          
          // Get other user's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", otherUserId)
            .single();

          // Get unread message count
          const { data: unreadData } = await supabase
            .rpc("get_unread_message_count" as any, {
              p_relationship_id: rel.id,
              p_user_id: user.id,
            } as any);

          // Get last message
          const { data: lastMsg } = await supabase
            .from("chat_messages" as any)
            .select("message_text, created_at")
            .eq("relationship_id", rel.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const otherUserName = profile?.first_name
            ? `${profile.first_name} ${profile.last_name || ""}`
            : profile?.email || "Unknown User";

          return {
            ...rel,
            unread_count: unreadData || 0,
            [rel.client_user_id === user.id ? "artist_name" : "client_name"]: otherUserName,
            last_message: (lastMsg as any)?.message_text,
            last_message_time: (lastMsg as any)?.created_at,
          };
        })
      );

      setRelationships(enrichedData);
      setLoading(false);
    };

    fetchRelationships();

    // Subscribe to new messages
    const channel = supabase
      .channel("chat-list-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchRelationships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleOpenChat = (relationship: Relationship) => {
    setSelectedRelationship(relationship);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {relationships.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-2">
                {relationships.map((rel) => {
                  const isClient = rel.client_user_id === user?.id;
                  const otherUserName = isClient ? rel.artist_name : rel.client_name;
                  
                  return (
                    <div
                      key={rel.id}
                      onClick={() => handleOpenChat(rel)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {otherUserName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{otherUserName}</p>
                          {rel.unread_count! > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {rel.unread_count}
                            </Badge>
                          )}
                        </div>
                        {rel.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {rel.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedRelationship && (
        <ArtistChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          relationshipId={selectedRelationship.id}
          otherUserName={
            selectedRelationship.client_user_id === user?.id
              ? selectedRelationship.artist_name || "Artist"
              : selectedRelationship.client_name || "Client"
          }
        />
      )}
    </>
  );
};
