import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface HealingTrackerContentEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const HealingTrackerContentEditor = ({ content, onContentUpdate, onSave, saving }: HealingTrackerContentEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const getContentValue = (key: string): string => {
    return content.find(c => c.key === key)?.value || '';
  };

  const getContentId = (key: string): string => {
    return content.find(c => c.key === key)?.id || '';
  };

  const saveAll = async () => {
    const keys = ['tracker_title', 'tracker_description', 'tracker_signin_message', 'tracker_cta_button', 'tracker_tips_title', 'tracker_alert_message'];
    for (const key of keys) {
      const id = getContentId(key);
      const value = getContentValue(key);
      if (id) {
        await onSave(id, value);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Healing Tracker Page Content</CardTitle>
        <CardDescription>Edit content for the Healing Tracker page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Section Title</Label>
          <Input
            value={getContentValue('tracker_title')}
            onChange={(e) => handleInputChange(getContentId('tracker_title'), e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Section Description</Label>
          <Textarea
            value={getContentValue('tracker_description')}
            onChange={(e) => handleInputChange(getContentId('tracker_description'), e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Sign-In Message</Label>
          <Input
            value={getContentValue('tracker_signin_message')}
            onChange={(e) => handleInputChange(getContentId('tracker_signin_message'), e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>CTA Button Text</Label>
          <Input
            value={getContentValue('tracker_cta_button')}
            onChange={(e) => handleInputChange(getContentId('tracker_cta_button'), e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Photo Guidelines Title</Label>
          <Input
            value={getContentValue('tracker_tips_title')}
            onChange={(e) => handleInputChange(getContentId('tracker_tips_title'), e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Alert Message (Disclaimer)</Label>
          <Textarea
            value={getContentValue('tracker_alert_message')}
            onChange={(e) => handleInputChange(getContentId('tracker_alert_message'), e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={saveAll} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HealingTrackerContentEditor;