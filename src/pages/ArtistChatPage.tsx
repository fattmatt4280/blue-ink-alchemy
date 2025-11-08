import AppHeader from '@/components/AppHeader';
import { ArtistChatList } from '@/components/ArtistChatList';
import { MessageSquare } from 'lucide-react';

const ArtistChatPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Chat with your clients about their healing progress
          </p>
        </div>

        <ArtistChatList />
      </div>
    </div>
  );
};

export default ArtistChatPage;
