
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onSignOut: () => void;
}

const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your Blue Dream Budder content</p>
      </div>
      <Button onClick={onSignOut} variant="outline">
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default AdminHeader;
