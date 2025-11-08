import AppHeader from '@/components/AppHeader';
import { ArtistAlertsList } from '@/components/ArtistAlertsList';
import { Bell } from 'lucide-react';

const ArtistAlertsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Healing Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor healing concerns and potential issues with your clients
          </p>
        </div>

        <ArtistAlertsList />
      </div>
    </div>
  );
};

export default ArtistAlertsPage;
