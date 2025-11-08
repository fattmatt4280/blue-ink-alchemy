import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserPlus, Users } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface ClientRelationship {
  id: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  status: string;
  created_at: string;
  tattoo_count: number;
  last_upload?: string;
}

const ArtistClientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('client_artist_relationships' as any)
      .select(`
        id,
        client_user_id,
        status,
        created_at,
        profiles!client_user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('artist_user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const clientsData = await Promise.all(
        data.map(async (rel: any) => {
          const profile = rel.profiles;
          const { count } = await supabase
            .from('healing_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', rel.client_user_id);

          const { data: lastUpload } = await supabase
            .from('healing_progress')
            .select('created_at')
            .eq('user_id', rel.client_user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: rel.id,
            client_user_id: rel.client_user_id,
            client_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown',
            client_email: profile?.email || '',
            status: rel.status,
            created_at: rel.created_at,
            tattoo_count: count || 0,
            last_upload: lastUpload?.created_at,
          };
        })
      );

      setClients(clientsData);
    }

    setLoading(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.client_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              My Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your clients' healing progress
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No clients match your search'
                : 'Add your first client to start tracking their healing journey'}
            </p>
            {!searchQuery && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/artist/clients/${client.client_user_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {client.client_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.client_name}</h3>
                      <p className="text-sm text-muted-foreground">{client.client_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{client.tattoo_count}</p>
                      <p className="text-xs text-muted-foreground">Tattoos</p>
                    </div>
                    {client.last_upload && (
                      <div className="text-right">
                        <p className="text-sm font-medium">Last upload</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(client.last_upload).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <Badge variant="secondary">{client.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistClientsPage;
