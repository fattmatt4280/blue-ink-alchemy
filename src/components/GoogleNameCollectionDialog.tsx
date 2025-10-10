import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface GoogleNameCollectionDialogProps {
  isOpen: boolean;
  onSubmit: (firstName: string, lastName: string) => Promise<void>;
  isSubmitting: boolean;
}

export const GoogleNameCollectionDialog = ({
  isOpen,
  onSubmit,
  isSubmitting
}: GoogleNameCollectionDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    setError('');
    await onSubmit(firstName.trim(), lastName.trim());
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()} // Block click outside
        onEscapeKeyDown={(e) => e.preventDefault()} // Block ESC key
      >
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            We need your name to personalize your healing journey and analysis reports.
            This won't take long!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-firstname">First Name *</Label>
            <Input
              id="google-firstname"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError('');
              }}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-lastname">Last Name</Label>
            <Input
              id="google-lastname"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !firstName.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
