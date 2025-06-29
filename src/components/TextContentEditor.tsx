
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface TextContentEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const TextContentEditor = ({ content, onContentUpdate, onSave, saving }: TextContentEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  return (
    <>
      {content.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">
              {item.key.replace(/_/g, ' ')}
            </CardTitle>
            <CardDescription>
              Edit the {item.key.replace(/_/g, ' ').toLowerCase()} content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={item.key}>Content</Label>
                {item.key.includes('description') ? (
                  <Textarea
                    id={item.key}
                    value={item.value}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <Input
                    id={item.key}
                    value={item.value}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                  />
                )}
              </div>
              <Button
                onClick={() => onSave(item.id, item.value)}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default TextContentEditor;
